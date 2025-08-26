import mongoose,{Schema} from 'mongoose';
const SubscriptionSchema = new Schema(
    {
        subscriber:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        channel:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }
    },
    {
        timestamps: true,
    }
);
export const Subscription = mongoose.model('Subscription',SubscriptionSchema)