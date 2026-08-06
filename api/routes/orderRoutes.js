import express from 'express';
import {
  createOrder,
  submitUtr,
  getOrderStatus,
  checkUtrAvailability,
  updateOrderStage,
  getAllOrders
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.post('/submit-utr', submitUtr);
router.get('/track/:orderId', getOrderStatus);
router.get('/check-utr', checkUtrAvailability);
router.get('/', getAllOrders);
router.put('/:id/stage', updateOrderStage);

export default router;
