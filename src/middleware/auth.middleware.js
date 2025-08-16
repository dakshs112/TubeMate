import {User} from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
export const verifyJWT = asyncHandler(async (req, res, next) =>
{
    try {
        const token = req.cookies?.accessToken || req.headers("authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized access, token is missing");
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken) {
            throw new ApiError(401, "Unauthorized access, invalid token");
        }
        const user = await User.findById(decodedToken.id).select(' -password -refreshToken');
        if (!user) {    
            throw new ApiError(404, "User not found");
        }
        req.user = user; // Attach user to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json(new ApiError(401, "Unauthorized access, invalid token"));
        }
        return res.status(500).json(new ApiError(500, "Internal server error"));
        
    }
})