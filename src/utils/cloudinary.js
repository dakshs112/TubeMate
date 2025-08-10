import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });
        
        
        fs.unlinkSync(localFilePath);
        
        return response.secure_url;
        
    } catch (error) {
        try {
            fs.unlinkSync(localFilePath);
        } catch (deleteError) {
            console.error('Error deleting temporary file:', deleteError);
        }
        
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
};

export { UploadOnCloudinary };