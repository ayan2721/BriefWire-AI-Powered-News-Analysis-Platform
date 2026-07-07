import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAnalysisHistory, reanalyzeArticle, getAnalysisById } from '../controllers/analysisController.js';

const router = express.Router();

router.get('/history', authenticate, getAnalysisHistory);
router.get('/:id', authenticate, getAnalysisById);
router.post('/reanalyze', authenticate, reanalyzeArticle);

export default router;