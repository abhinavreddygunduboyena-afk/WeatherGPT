import { Router } from 'express';
import { handleGetDrivingRoute, handleRouteAiAdvisor, handleGetRouteIncidents } from '../controllers/routeController.js';
import { validateRouteRequest, validateRouteAiAdvisorRequest, validateRouteIncidentsRequest } from '../middleware/validator.js';

const router = Router();

// GET /api/route?start=lon,lat&end=lon,lat - Driving directions & route geometry
router.get('/', validateRouteRequest, handleGetDrivingRoute);

// POST /api/route/ai-advisor - Weather-Based Corridor Travel Advisory & LLM Explanation
router.post('/ai-advisor', validateRouteAiAdvisorRequest, handleRouteAiAdvisor);

// POST /api/route/incidents - Live TomTom Road Closures, Roadworks & Traffic Incidents
router.post('/incidents', validateRouteIncidentsRequest, handleGetRouteIncidents);

export default router;
