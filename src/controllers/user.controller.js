import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User} from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";


const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const existedUser = await User.findById(userId);

        if(!existedUser) {
            throw new ApiError(404, "user not found");
        }

        const accessToken = existedUser.generateAccessToken();
        const refreshToken = existedUser.generateRefreshToken();

        existedUser.refreshToken = refreshToken;
        await existedUser.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch(error) {
        console.log("Error in token generation");
        throw new ApiError(500, "Something went wrong while generating refresh and Access Token")
    }
}

const registerUser = asyncHandler(async(req,res) =>{
 //steps to register user
 // 1. get user detials from frontend 
 // 2. validation of data like not empty
 // 3. check if user already exists 
 // 4. create user object - create entry in db
 // 5. check for user creation
 // 6. generate access and refresh tokens
 // 7. return response


 //get the result of validation from express-validator
    const  errors = validationResult(req);

    if(!errors.isEmpty()){
        return new ApiError(400, "All fields are required")
    }


 // 1.get user details from frontend 
 const { fullname, email, password, username } = req.body;
 const { firstname, lastname } = fullname || {}; // Destructure `firstname` and `lastname` safely
 
// 2. validation of data like not empty
    if( [fullname.firstname,username,email,password].some((field) => field.trim === "") ){
        throw new ApiError(400,"All fields are required")
    }

// 3. check if user already exists (check either by username or email)
    const existedUser = await User.findOne({
        $or: [{username} , {email}],
    })
    
    if(existedUser){
        throw new ApiError(409, "user with this email or username already exists");
    }

// 4. create user object - create entry in db
    const newUser = await User.create({
        fullname: {
            firstname: firstname,
            lastname: lastname,
        },
        email: email,
        password: password,
        username: username.toLowerCase()
    });

 // 5. check for user creation
    if(!newUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }    

// 6. generate access and refresh tokens
  const accessToken = newUser.generateAccessToken();
  const refreshToken = newUser.generateRefreshToken();

  newUser.refreshToken = refreshToken;

// 7. return response
    return res
    .status(201)
    .json(new ApiResponse(200, newUser, "User registered successfully"));   


});

const loginUser = asyncHandler(async(req,res) => {
  // 1. get the user's credential from the req.body
  // 2. check the username or email is empty or not
  // 3. find the user
  // 4. check the password
  // 5. access the access and refresh token
  // 6. send the cookies
  // 7. send the response all above operation is success

  //check if there is any error in the request by experss validator
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return new ApiError(400, "All fields are required");
    }

    // 1. get the user's credential from the req.body
    const {username,email, password} = req.body;  

    // 2. check the username or email is empty or not
    if( [username,email,password].some((field)=> {field.trim() === ""})){
        throw new ApiError(400, "All fields are required");
    }

    // 3. find the user
    // If you want to retrieve the password field even though it's marked as select: false, you can explicitly include it in your query:
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    }).select("+password"); 

    if(!existedUser){
        throw new ApiError(401, "invalid email or password");
    }

    // 4. check the password
    console.log(password);
    const isPasswordValid = await existedUser.isPasswordCorrect(password);

     if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials"); 
     }   

    // 5. access the access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existedUser._id);
    console.log(accessToken , refreshToken);
  
     // 6. remove password and refreshToken from the userdata
  const loggedInUser = await User.findById(User._id).select(
    "-password -refreshToken"
  );



    // 7. send the cookies
    const options = {
        httpOnly: true, // Prevent access from JavaScript (XSS protection)
        secure: true, // Ensures the cookie is sent only over HTTPS
      };


     //8. send the response
  return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "user logged in Successfully"
    )
  );
    
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $Unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );
  
   
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "user Logged out successfully"));
  });

const getUserProfile = asyncHandler(async(req,res) => { 
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetced successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; // this is the token of user's cookies

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ReFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    if (error) {
      throw new ApiError(401, error?.message || "Invalid refresh Token");
    }
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id); // req.user taken from authmiddleware line no 25

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  // Check for missing fields
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  // Typically, when a user is authenticated, middleware (like verifyJWT) decodes the JWT and attaches the authenticated user’s details (including the user ID) to the req.user object.
  // Get user ID from req.user (if it's the authenticated user)
  const userId = req.user._id;

  //here req.body._id is making the client/user to send his/her id so this is not good pracrtise cuz this will allow the user to update other account

  // Find and update the user by their ID
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true } // Return the updated user
  ).select("-password"); // Exclude password field

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

export { registerUser , loginUser ,logoutUser, getUserProfile, refreshAccessToken, changeCurrentPassword, updateAccountDetails };        