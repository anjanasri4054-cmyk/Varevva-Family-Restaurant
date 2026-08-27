import express from 'express';
import {
  getPayment,
  uploadProof,
  getAllPayments,
  approvePayment,
  rejectPayment
} from '../controllers/paymentController.js';
import { uploadPayment } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/upload-proof', uploadPayment.single('screenshot'), uploadProof);
router.get('/:id', getPayment);

// Admin-only protected routes
router.get('/admin/all', protect, getAllPayments);
router.put('/:id/approve', protect, approvePayment);
router.put('/:id/reject', protect, rejectPayment);

export default router;
