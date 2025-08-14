import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            minlength: 3,
            maxlength: 20,
            match: /^[a-zA-Z0-9_]+$/,

        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        FullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        Avatar: {
            type: String,
            required: true,
            //default: 'https://example.com/default-avatar.png',
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            }
        ]
    },
    {
        timestamps: true,
    }
)
//To hash the password before saving the user 
UserSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10)
    next();
})
UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}
UserSchema.methods.generateAccessToken = function(){
    return  jwt.sign(
        {
            _id : this._id,
            username: this.username,
            email: this.email,
            FullName: this.FullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model('User', UserSchema)