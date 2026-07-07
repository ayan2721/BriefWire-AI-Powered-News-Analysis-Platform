import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getAdminMetrics, listUsers, listArticles } from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get('/metrics', getAdminMetrics);
router.get('/users', listUsers);
router.get('/articles', listArticles);

export default router;