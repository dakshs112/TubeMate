import moongoose,{Schema} from 'moongoose';
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const VideoSchema = new Schema({
    videoFile:{
        type: String,
        required:true,
        unique: true,
    },
    thumbnail:{
        type: String,
        required: true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type: String,
        required:true,
    },
    duration:{
        type: Number,
        required: true,
    },
    views:{
        type: Number,
        default: 0,
    },
    isPublished:{
        type: Boolean,
        default: true,
    },
    Owner:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    },
},{
    timestamps: true,
    collection: 'videos',
})
VideoSchema.plugin(aggregatePaginate);
export const Video = moongoose.model('Video',VideoSchema) 