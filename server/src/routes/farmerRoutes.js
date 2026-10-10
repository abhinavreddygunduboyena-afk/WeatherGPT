import { Router } from 'express';
import { handleFarmerAiChat } from '../controllers/farmerController.js';
import { validateFarmerChatRequest } from '../middleware/validator.js';

const router = Router();

// POST /api/farmer/ai-chat - Multilingual Farmer Intelligence AI Assistant
router.post('/ai-chat', validateFarmerChatRequest, handleFarmerAiChat);

export default router;
