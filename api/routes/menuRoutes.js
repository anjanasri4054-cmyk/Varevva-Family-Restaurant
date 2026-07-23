import express from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getMenuItems)
  .post(protect, createMenuItem);

router.route('/:id')
  .put(protect, updateMenuItem)
  .delete(protect, deleteMenuItem);

export default router;
