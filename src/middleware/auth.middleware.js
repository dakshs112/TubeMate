import {User} from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
export const verifyJWT = asyncHandler(async (req, res, next) =>
{
    try {
        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized access, token is missing");
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken) {
            throw new ApiError(401, "Unauthorized access, invalid token");
        }
        const user = await User.findById(decodedToken._id).select(' -password -refreshToken');
        if (!user) {    
            throw new ApiError(404, "User not found");
        }
        req.user = user; // Attach user to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // Fix 3: Better error handling
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Unauthorized access, invalid token");
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Token expired, please login again");
        }
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Internal server error during authentication");
    }
});
