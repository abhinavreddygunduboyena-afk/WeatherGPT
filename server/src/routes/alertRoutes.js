import { Router } from 'express';
import { handleGetImdWarnings } from '../controllers/alertController.js';

const router = Router();

// GET /api/imd/warnings - Official IMD District & Highway Hazard Bulletins
router.get('/warnings', handleGetImdWarnings);

export default router;
