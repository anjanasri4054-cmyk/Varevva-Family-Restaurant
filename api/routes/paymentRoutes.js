import express from 'express';
import multer from 'multer';
import { verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/verify', upload.single('screenshot'), verifyPayment);

export default router;
