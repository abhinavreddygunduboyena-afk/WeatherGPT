import express from 'express';
import cors from 'cors';
import { config, getSanitizedServiceStatus } from './config/env.js';
import farmerRoutes from './routes/farmerRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import speechRoutes from './routes/speechRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// 1. CORS Configuration
const allowedOrigins = [
  config.corsOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server) or matched origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
  },
  credentials: true
}));

// 2. Request Parsers & Security Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Simple concise request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl !== '/api/health') {
      console.log(`[Backend] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// 3. API Route Registration
app.use('/api/health', healthRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/imd', alertRoutes);
app.use('/api/bhashini', speechRoutes);

// Root Index route
app.get('/', (req, res) => {
  res.json({
    message: 'WeatherGPT Node.js + Express Backend Service is running.',
    documentation: 'See /api/health for system and provider status.',
    frontendOrigin: config.corsOrigin,
    services: getSanitizedServiceStatus()
  });
});

// 4. Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// 5. Start Server
const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`  WeatherGPT Express Backend running on port ${config.port}`);
  console.log(`  Health Check: http://localhost:${config.port}/api/health`);
  console.log(`  CORS Allowed Origin: ${config.corsOrigin}`);
  console.log(`====================================================`);
});

// Handle graceful termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => process.exit(0));
});

export default app;
