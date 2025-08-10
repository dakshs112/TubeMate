import { describe, it, expect, vi, beforeEach } from 'vitest';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { UploadOnCloudinary } from '../src/utils/cloudinary.js';

vi.mock('cloudinary');
vi.mock('fs');

describe('UploadOnCloudinary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('test_successful_file_upload_returns_secure_url', async () => {
        const mockResponse = { secure_url: 'https://cloudinary.com/secure-url' };
        cloudinary.uploader.upload.mockResolvedValue(mockResponse);
        fs.unlinkSync.mockImplementation(() => {});

        const result = await UploadOnCloudinary('/path/to/file.jpg');

        expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/path/to/file.jpg', {
            resource_type: 'auto'
        });
        expect(result).toBe('https://cloudinary.com/secure-url');
    });

    it('test_local_file_deleted_after_successful_upload', async () => {
        const mockResponse = { secure_url: 'https://cloudinary.com/secure-url' };
        cloudinary.uploader.upload.mockResolvedValue(mockResponse);
        fs.unlinkSync.mockImplementation(() => {});

        await UploadOnCloudinary('/path/to/file.jpg');

        expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/file.jpg');
    });

    it('test_auto_resource_type_detection_works', async () => {
        const mockResponse = { secure_url: 'https://cloudinary.com/secure-url' };
        cloudinary.uploader.upload.mockResolvedValue(mockResponse);
        fs.unlinkSync.mockImplementation(() => {});

        await UploadOnCloudinary('/path/to/video.mp4');

        expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/path/to/video.mp4', {
            resource_type: 'auto'
        });
    });

    it('test_returns_null_when_no_file_path_provided', async () => {
        const result = await UploadOnCloudinary(null);

        expect(result).toBeNull();
        expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
        expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('test_cleanup_and_null_return_on_upload_failure', async () => {
        cloudinary.uploader.upload.mockRejectedValue(new Error('Upload failed'));
        fs.unlinkSync.mockImplementation(() => {});

        const result = await UploadOnCloudinary('/path/to/file.jpg');

        expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/file.jpg');
        expect(console.error).toHaveBeenCalledWith('Error uploading to Cloudinary:', expect.any(Error));
        expect(result).toBeNull();
    });

    it('test_handles_file_deletion_errors_gracefully', async () => {
        cloudinary.uploader.upload.mockRejectedValue(new Error('Upload failed'));
        fs.unlinkSync.mockImplementation(() => {
            throw new Error('File deletion failed');
        });

        const result = await UploadOnCloudinary('/path/to/file.jpg');

        expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/file.jpg');
        expect(result).toBeNull();
    });
});