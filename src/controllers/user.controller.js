import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { UploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiRes.js";

const RegisterUser = asyncHandler(async (req, res) => {
    const { username, email, password, FullName } = req.body;

    console.log("Request body:", { username, email, password, FullName });

    if ([username, email, password, FullName].some(field => !field || field.trim() === '')) {
        throw new ApiError(400, "All fields are required");
    }

    if (!email.includes('@') || !email.includes('.')) {
        throw new ApiError(400, "Invalid email format");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(400, "User with this email or username already exists");
    }

    //console.log("Files received:", req.files);

    if (!req.files?.Avatar?.[0]) {
        throw new ApiError(400, "Avatar file is required");
    }


    const AvatarLocalPath = req.files.Avatar[0].path;
    //let coverImageLocalPath = req.files.coverImage[0].path;
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!AvatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const Avatar = await UploadOnCloudinary(AvatarLocalPath);
    const coverImage = await UploadOnCloudinary(coverImageLocalPath);

    if (!Avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    // if (!coverImage) {
    //     throw new ApiError(500, "Failed to upload cover image");
    // }

    // Create user object
    const user = await User.create({
        username: username.toLowerCase(),
        Avatar: Avatar,
        coverImage: coverImage,
        email,
        password,
        FullName,
    }); 

    const CreatedUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    if (!CreatedUser) {
        throw new ApiError(500, 'Something went wrong while creating user');
    }

    return res.status(201).json(
        new ApiResponse(201, CreatedUser, "User created successfully") // Fixed parameter order
    );
});

export { RegisterUser };