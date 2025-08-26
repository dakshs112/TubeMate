import mongoose, { Schema } from 'mongoose';
const PlaylistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        Videos: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        Owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },

    {
        timestamps: true,
    }
);
export const Playlist = mongoose.model('Playlist', PlaylistSchema)