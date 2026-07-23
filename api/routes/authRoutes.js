import express from 'express';
import { loginAdmin, registerInitialAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/register-initial', registerInitialAdmin);

export default router;
