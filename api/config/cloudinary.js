import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary credentials
console.log('--- Initializing Cloudinary Configuration ---');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'UNDEFINED');
console.log('API Key Loaded:', process.env.CLOUDINARY_API_KEY ? 'true' : 'false');
console.log('API Secret Loaded:', process.env.CLOUDINARY_API_SECRET ? 'true' : 'false');

cloudinary.config({
  cloud_name: process.env.dasullah1,
  api_key: process.env.526377496749222,
  api_secret: process.env.1QjQJ6WSX1YlGSVRnnvHIv4HrZs,
});

// Setup Multer Storage Engine for Cloudinary (direct streaming, no local storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'varevva_menu',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }], // q_auto, f_auto optimization
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB file size validation
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, JPEG, PNG, and WEBP formats are supported!'));
  }
});

export { cloudinary, upload };
