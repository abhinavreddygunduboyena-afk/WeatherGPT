import { Router } from 'express';
import { getSanitizedServiceStatus } from '../config/env.js';

const router = Router();
const startTime = Date.now();

// GET /api/health - Server health & service status
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WeatherGPT backend is running successfully.',
    service: 'WeatherGPT Express Backend',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    services: getSanitizedServiceStatus()
  });
});

export default router;
