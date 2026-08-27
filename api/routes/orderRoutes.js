import express from 'express';
import {
  createOrder,
  submitUtr,
  getOrderStatus,
  checkUtrAvailability,
  updateOrderStage,
  getAllOrders
} from '../controllers/orderController.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/', createOrder);
router.post('/submit-utr', upload.single('screenshot'), submitUtr);
router.get('/track/:orderId', getOrderStatus);
router.get('/check-utr', checkUtrAvailability);
router.get('/', getAllOrders);
router.put('/:id/stage', updateOrderStage);

export default router;
