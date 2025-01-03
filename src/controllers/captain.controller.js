import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Captain } from "../models/captain.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";

const generateAccessAndRefreshTokens = async (captainId) => {
  try {
    // fetch the user from the database by ID
    const existedCaptain = await Captain.findById(captainId);

    if (!existedCaptain) {
      throw new ApiError(404, "Captain not found");
    }

    // Generate access and refresh tokens
    const accessToken = await existedCaptain.generateAccessToken();
    const refreshToken = await existedCaptain.generateRefreshToken();

    //Assign the refreshToken to the user and save the document
    existedCaptain.refreshToken = refreshToken;
    await existedCaptain.save({ validateBeforeSave: false });

    // return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the refresh and access tokens"
    );
  }
};

const registerCaptain = asyncHandler(async (req, res) => {
  console.log("Register Captain - Start");

  // Validate request body using express-validator
  console.log("Validating request body");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract data from request body
  const { fullname, email, password, vehicle } = req.body;
  const { firstname, lastname } = fullname || {};
  const { color, plate, capacity, vehicleType } = vehicle || {};

  // Validate fields
  if (
    [firstname,lastname, email, password, color, plate, capacity, vehicleType].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if Captain already exists
  console.log("Checking if captain already exists");
  const existedUser = await Captain.findOne({ email });

  if (existedUser) {
    console.log("Captain already exists");
    throw new ApiError(409, "User with email or username already exists");
  }

  // Create new captain in the database
  const newCaptain = await Captain.create({
    fullname: {
      firstname: fullname?.firstname || "",
      lastname: fullname?.lastname || "",
    },
    email,
    password,
    vehicle: {
      color,
      plate,
      capacity,
      vehicleType,
    },
  });

  // Fetch created captain and exclude sensitive fields
  console.log("Fetching created captain");
  const createdCaptain = await Captain.findById(newCaptain._id).select(
    "-password -refreshToken"
  );

  if (!createdCaptain) {
    console.log("Error in creating captain");
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Return success response
  console.log("Returning response");
  return res
    .status(201)
    .json(new ApiResponse(201, createdCaptain, "User registered successfully"));
});

const loginCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  // Handle validation errors
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  // Destructure required fields from the request body
  const { email, password} = req.body;

  // Check if any required fields are empty
  if ([email, password].some((field) => !field.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Try to find the Captain by username or password
  const existedCaptain = await Captain.findOne({ email }).select("+password");

  // If Captain not found, return an error
  if (!existedCaptain) {
    throw new ApiError(404, "Captain not found");
  }

  console.log(existedCaptain);

  // Check if the password is correct
  const isPasswordValid = await existedCaptain.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existedCaptain._id
  );

  // Retrieve Captain details excluding password and refresh token
  const loggedInCaptain = await Captain.findById(Captain._id).select(
    "-password -refreshToken"
  );

  // Set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  // Send response with tokens and Captain details
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInCaptain,
          accessToken,
          refreshToken,
        },
        "Captain logged in successfully"
      )
    );
});

const logoutCaptain = asyncHandler(async (req, res) => {
  await Captain.findByIdAndUpdate(
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
    .json(new ApiResponse(200, {}, "Captain Logged out successfully"));
});

const getCaptainProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "current Captian fetced successfully")
    );
});

export { registerCaptain, loginCaptain, logoutCaptain, getCaptainProfile };
