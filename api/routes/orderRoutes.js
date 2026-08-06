import express from 'express';
import {
  createOrder,
  submitUtr,
  getOrderStatus,
  checkUtrAvailability,
  approvePayment,
  rejectPayment,
  updateOrderStage,
  getAllOrders
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.post('/submit-utr', submitUtr);
router.get('/track/:orderId', getOrderStatus);
router.get('/check-utr', checkUtrAvailability);
router.get('/', getAllOrders);
router.put('/:id/approve', approvePayment);
router.put('/:id/reject', rejectPayment);
router.put('/:id/stage', updateOrderStage);

export default router;
