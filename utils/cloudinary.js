import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload a file buffer directly to Cloudinary using their upload stream
 * @param {Buffer} fileBuffer - File buffer from request
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<string>} - Direct secure URL of the uploaded image
 */
export const uploadToCloudinary = (fileBuffer, folder = 'jai-ambe-integrator') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};
