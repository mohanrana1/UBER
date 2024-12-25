import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Captain } from '../models/captain.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import { validationResult } from "express-validator";



const generateAccessAndRefreshTokens =  async (captainId) => {
    try {
        // fetch the user from the database by ID
        const existedCaptain = await Captain.findById(captainId)

        if(!existedCaptain){
            throw new ApiError(404, "Captain not found")
        }

        // Generate access and refresh tokens
        const accessToken = await existedCaptain.generateAccessToken();
        const refreshToken = await existedCaptain.generateRefreshToken();

        //Assign the refreshToken to the user and save the document
        existedCaptain.refreshToken = refreshToken ;
        await existedCaptain.save({validateBeforeSave: false})

        // return the generated tokens
        return {accessToken, refreshToken}

    } catch(error){
        throw new ApiError (500, "Something went wrong while generating the refresh and access tokens")
    }
}

const registerCaptain = asyncHandler(async(req,res) => {
    // step to register user
  // 1. get user details from frontend ✅
  // 2. validation of data like not empty ✅
  // 3. check if user already exists (check either by username or email) ✅
  // 4. create user object - create entry in db ✅
  // 5. remove user password and refresh token field from response ✅
  // 6. check for user creation ✅
  // 7. return response ✅

  //get the result of validation from express-validator
      


  // 1. get user details from frontend ✅
    const { fullName , email, username, password, color, plate, capacity, vechileType } = req.body;

// 2. validation of data like not empty ✅
 const  errors = validationResult(req);
  
 if(!errors.isEmpty()){
     return new ApiError(400, "All fields are required")
 }

    // 3. check if Captain already exists (check either by username or email) ✅
        const existedUser = await Captain.findOne({
            $or : [{username} , {email}] ,
        });

        if(!existedUser){
            throw new ApiError(409, "User with email or username already exist")
        }

    // 4. create user object - create entry in db ✅
    const newCaptain = await Captain.create({
        fullName: {
            firstname,
            lastname
        },
        email,
        password,
        username,
        vechile: {
            color,
            plate,
            capacity,
            vechileType
        }
    })

      // 5. remove user password and refresh token field from response ✅
        const createdCaptain = await Captain.findById(newCaptain._id).select("-password -refreshToken")

        if(!createdCaptain){
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        // 6. return response
        return res
        .status(201)
        .json(new ApiResponse(200, createdCaptain, "User registered successfully"));
    });


export { registerCaptain }
