import { Router } from 'express';
import { handleGetBhashiniInfo, handleBhashiniTts } from '../controllers/speechController.js';

const router = Router();

// GET /api/bhashini/info - Bhashini service configuration & language support
router.get('/info', handleGetBhashiniInfo);

// POST /api/bhashini/tts - Bhashini Text-to-Speech proxy
router.post('/tts', handleBhashiniTts);

export default router;
