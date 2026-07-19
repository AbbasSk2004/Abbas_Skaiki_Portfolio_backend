import express from 'express';
import { login, logout, checkMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, checkMe);

export default router;
