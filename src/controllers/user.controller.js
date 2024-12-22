import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User} from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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

export { registerUser }