import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {UploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiRes.js";
//Tasks to do in this Controller
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

const RegisterUser = asyncHandler(async (req, res) => {
    const { username, email, password, FullName } = req.body;

    console.log(username, email, password, FullName);

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

    const AvatarLocalPath = req.files?.Avatar[0].path
    const coverImageLocalPath = req.files?.coverImage[0].path

    if (!AvatarLocalPath || !coverImageLocalPath) {
        throw new ApiError(400, "Avatar and cover image are required");
        
    }

    const Avatar = await UploadOnCloudinary(AvatarLocalPath);
    const coverImage = await UploadOnCloudinary(coverImageLocalPath);

    if (!Avatar || !coverImage) {
        throw new ApiError(500, "Failed to upload images");
    }

    const user = await User.create({
        username:username.toLowerCase(),
        Avatar: Avatar.url,
        coverImage: coverImage.url,
        email,
        password,
        FullName,
    })

    const CreatedUser = await User.findbyId(User._id).select(
        '-password -refreshToken'
    );

    if(!CreatedUser){
        throw new ApiError(500,'Something Went Wrong while creating user');
    }
    return res.status(201).json(
        new ApiResponse(200, "User created successfully", CreatedUser)
    )
});

export { RegisterUser };
