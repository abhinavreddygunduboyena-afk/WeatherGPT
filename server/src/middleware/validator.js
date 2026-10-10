/**
 * Request validation middleware for WeatherGPT backend endpoints.
 */

export function validateFarmerChatRequest(req, res, next) {
  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid request: "prompt" field is required and must be a non-empty string.',
      code: 'VALIDATION_ERROR'
    });
  }

  if (prompt.length > 2000) {
    return res.status(400).json({
      error: 'Prompt too long: Maximum 2000 characters allowed.',
      code: 'VALIDATION_ERROR'
    });
  }

  // Sanitize language code
  if (req.body.lang && typeof req.body.lang !== 'string') {
    req.body.lang = 'te';
  }

  next();
}

export function validateRouteRequest(req, res, next) {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({
      error: 'Missing required query parameters: "start" and "end" in "lon,lat" format.',
      code: 'VALIDATION_ERROR'
    });
  }

  const [startLon, startLat] = start.split(',').map(Number);
  const [endLon, endLat] = end.split(',').map(Number);

  if (
    isNaN(startLon) || isNaN(startLat) || 
    isNaN(endLon) || isNaN(endLat) ||
    startLat < -90 || startLat > 90 ||
    endLat < -90 || endLat > 90 ||
    startLon < -180 || startLon > 180 ||
    endLon < -180 || endLon > 180
  ) {
    return res.status(400).json({
      error: 'Invalid coordinate values. Must be valid longitude (-180 to 180) and latitude (-90 to 90).',
      code: 'VALIDATION_ERROR'
    });
  }

  req.routeCoordinates = {
    start: [startLon, startLat],
    end: [endLon, endLat]
  };

  next();
}

export function validateRouteAiAdvisorRequest(req, res, next) {
  const { checkpoints } = req.body || {};

  if (!checkpoints || !Array.isArray(checkpoints) || checkpoints.length === 0) {
    return res.status(400).json({
      error: 'Invalid request: "checkpoints" array is required.',
      code: 'VALIDATION_ERROR'
    });
  }

  next();
}

export function validateRouteIncidentsRequest(req, res, next) {
  const { routeCoordinates, bbox } = req.body || {};

  if ((!routeCoordinates || !Array.isArray(routeCoordinates) || routeCoordinates.length === 0) && (!bbox || !Array.isArray(bbox) || bbox.length < 4)) {
    return res.status(400).json({
      error: 'Invalid request: Either "routeCoordinates" array or "bbox" [minLon, minLat, maxLon, maxLat] is required.',
      code: 'VALIDATION_ERROR'
    });
  }

  next();
}
