import express from 'express';
import translateProxy from '../controllers/translateController.js';

const router = express.Router();

// POST /api/translate
router.post('/', translateProxy);

export default router;