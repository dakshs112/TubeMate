import mongoose,{Schema} from 'mongoose';
const TweetSchema = new Schema(
    {
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    content:{
        type: String,
        required:true,
        maxlength:580,
    }
},{
    timestamps:true,
}
)
export const Tweet = mongoose.model('Tweet',TweetSchema)