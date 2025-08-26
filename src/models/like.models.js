import mongoose, { Schema } from 'mongoose';
const LikesSchema = new Schema(
    {
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },

        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },

        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet",
            required: true,
        }

    },
    {
        timestamps: true,

    })
export const Likes = mongoose.model('Likes', LikesSchema)