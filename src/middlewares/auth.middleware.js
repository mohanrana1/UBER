import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Captain } from "../models/captain.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Accessing cookies with lowercase 'cookies'
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    console.log("the value of the token from the req.cookie is", token);

    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Decode the token

    console.log("the value of decoded token is ", decodedToken);

    let user;
    
    if (decodedToken?.role === "Captain") {
      // If the role is captain, find the captain
      user = await Captain.findById(decodedToken?._id).select("-password -refreshToken");
    } else if (decodedToken?.role === "User") {
      // If the role is user, find the user
      user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    }

    if (!user) {
      throw new ApiError(403, "Invalid Access Token: User not found");
    }

    console.log(user);

    req.user = user; // Attach the user to the request object

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // Log the error for debugging purposes
    console.error("JWT verification error:", error);

    throw new ApiError(401, error?.message || "Unauthorized request: Invalid token");
  }
});
