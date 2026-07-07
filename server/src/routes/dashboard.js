import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDashboardSummary, getBookmarks, getArchive } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', authenticate, getDashboardSummary);
router.get('/bookmarks', authenticate, getBookmarks);
router.get('/archive', authenticate, getArchive);

export default router;