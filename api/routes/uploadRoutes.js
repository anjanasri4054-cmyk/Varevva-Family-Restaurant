import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route POST /api/upload
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    // Multer-storage-cloudinary populates req.file.path with secure url and req.file.filename with public_id
    res.status(200).json({
      image: req.file.path,
      imagePublicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
