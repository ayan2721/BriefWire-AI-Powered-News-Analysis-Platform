import express from 'express';
import { register, login, refreshProfile, forgotPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/profile', authenticate, refreshProfile);

export default router;