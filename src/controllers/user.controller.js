import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { UploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiRes.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens =async(userid) =>{
    const user = await User.findById(userid)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    return { accessToken, refreshToken };
}
// RegisterUser function
// This function handles user registration
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

    //console.log("Request body:", { username, email, password, FullName });

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
    let coverImageLocalPath;
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
//FOr USer login
// This function handles user login
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

const LoginUser = asyncHandler(async (req, res) => {
    const{email,password,username} = await req.body;
    console.log(email, password, username);
    

    if(! (email || username) ){
        throw new ApiError(400,"Email or Username is required");
    }

    if(!password){
        throw new ApiError(400,"Password is required");
    }

    const user = await User.findOne({
        $or :[{email},{username}]

    })

    if(!user){
        throw new ApiError(404,"User not found");
 
    }

    const isPasswordValid= await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password");
    }

    const {refreshToken,accessToken} = await generateAccessAndRefreshTokens(user._id);

    const LoggedInUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    const options ={
        httpOnly: true,
        secure:true,
    }

    return res.
    status(200).
    cookie('accessToken', accessToken, options).
    cookie('refreshToken', refreshToken, options).
    json(
        new ApiResponse(200
            ,{ 
                LoggedInUser, accessToken,refreshToken
            }
            , "User logged in successfully")
    )


})
 const LogoutUser = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        throw new ApiError(401, "User not authenticated");
    }

    await User.findByIdAndUpdate(req.user._id
        , { $unset: {refreshToken: 1} }
        , { new: true })
        const options ={
        httpOnly: true,
        secure:true,
    }

        return res
        .status(200).clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));

const refreshedAccessToken = asyncHandler(async (req, res) => {
    const IncomingRefreshToken= req.cookie.refreshToken || req.body.refreshToken

    if(!IncomingRefreshToken){
        throw new ApiError(401,'No Refresh Token Found,Session loggedout')
    }

    try {
        const decodedToken = jwt.verify(
            IncomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken._id)

        if(!user){
            throw new ApiError(404,'Invalid Refresh Token, User not found')
        }

        if(user.refreshToken != IncomingRefreshToken){
            throw new ApiError(401,'Invalid Refresh Token, Session logged out')
        }

        options = {
            httpOnly: true,
            secure: true,
        };

        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', newRefreshToken, options)
        .status(200)
        .json(
            new ApiResponse(200, { accessToken, newRefreshToken }, "Tokens refreshed successfully")
        );


} catch (error) {
    
}


});
 })
export {
    RegisterUser,
    LoginUser,
    LogoutUser,
    refreshedAccessToken
};