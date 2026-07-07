// server/src/routes/news.js

import express from 'express';
import {
    fetchPublicNews,
    analyzeArticle,
    readArticle,
    compareArticle,
    searchArticles,
    getTrendingTopics,
    getArticleById,
    batchFetchArticles
} from '../controllers/newsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes are already under /api/news in app.js
// So we don't need to add /news prefix here again

// Public routes
router.get('/feed', fetchPublicNews);
router.get('/article', readArticle);
router.get('/search', searchArticles);
router.get('/trending', getTrendingTopics);
router.get('/:id', getArticleById);

// Protected routes
router.post('/analyze', authenticate, analyzeArticle);
router.post('/compare', authenticate, compareArticle);
router.post('/batch', authenticate, batchFetchArticles);

export default router;