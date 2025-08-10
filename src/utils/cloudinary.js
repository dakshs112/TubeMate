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
        
        // Delete the temporary file after successful upload
        fs.unlinkSync(localFilePath);
        
        // Return the secure_url directly (since controller expects a string)
        return response.secure_url;
        
    } catch (error) {
        // Delete the temporary file even if upload fails
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