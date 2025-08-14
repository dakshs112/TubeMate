import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { UploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiRes.js";

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

    if(!email || !username){
        throw new ApiError(400,"Email or Username is required");
    }

    if(!password){
        throw new ApiError(400,"Password is required");
    }

    const user = User.findOne({
        $or :[{email},{username}]

    })

    if(!user){
        throw new ApiError(404,"User not found");
 
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
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
    await User.findByIdAndUpdate(req.user._id
        , { $unset: {refreshToken: 1} }
        , { new: true })
        const options ={
        httpOnly: true,
        secure:true,
    }
        return res
        .status(200).clearcookie(accessToken, options)
        .clearcookie(refreshToken, options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
 })
export {
    RegisterUser,
    LoginUser,
    logoutUser,
};