import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route POST /api/upload
router.post('/', protect, (req, res, next) => {
  console.log('--- POST /api/upload route hit ---');
  console.log('Checking Cloudinary credentials in process.env...');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'MISSING');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Configured' : 'MISSING');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Configured' : 'MISSING');

  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('========== MULTER / CLOUDINARY UPLOAD ERROR ==========');
      console.error(err);
      console.error('======================================================');
      return res.status(500).json({ message: `Multer/Cloudinary error: ${err.message}` });
    }

    console.log('Multer successfully processed file.');
    if (!req.file) {
      console.error('Upload Error: req.file is missing after Multer execution');
      return res.status(400).json({ message: 'No image file uploaded or format not supported' });
    }

    console.log('Cloudinary uploaded file details:', {
      path: req.file.path,
      filename: req.file.filename
    });

    res.status(200).json({
      image: req.file.path,
      imagePublicId: req.file.filename
    });
  });
});

export default router;
