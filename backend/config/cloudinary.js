import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary API
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Multer memory storage
const storage = multer.memoryStorage();

// Validate file types and size (images only, max 2MB)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif) are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
});

/**
 * Upload Buffer to Cloudinary via Stream
 * @param {Buffer} fileBuffer File buffer from multer
 * @param {String} folder Destination folder in Cloudinary
 * @returns {Promise} Resolves with Cloudinary upload result
 */
export const uploadToCloudinary = (fileBuffer, folder = 'cjp_profiles', customTransformations = null) => {
  return new Promise((resolve, reject) => {
    const transformation = customTransformations || [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Autocrop face, standard size
      { quality: 'auto' }, // Compression optimization
      { fetch_format: 'webp' } // Optimize format
    ];

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Stream Upload Error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    // Write buffer into the upload stream
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Delete asset from Cloudinary
 * @param {String} publicId Public ID of the asset
 * @returns {Promise} Cloudinary delete result
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`🗑 Asset ${publicId} deleted from Cloudinary:`, result);
    return result;
  } catch (error) {
    console.error(`✖ Failed to delete resource ${publicId} from Cloudinary:`, error);
    return null;
  }
};
