import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Try loading server/.env first
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 2. Fall back to root .env.local or root .env if running from workspace
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '',
  orsApiKey: (process.env.OPENROUTESERVICE_API_KEY || process.env.ORS_API_KEY || '').trim(),
  imdApiKey: (process.env.IMD_API_KEY || '').trim(),
  bhashiniApiKey: (process.env.BHASHINI_API_KEY || '').trim(),
  bhashiniUserId: (process.env.BHASHINI_USER_ID || '').trim(),
  bhashiniPipelineId: (process.env.BHASHINI_PIPELINE_ID || '').trim(),
  tomtomApiKey: (process.env.TOMTOM_API_KEY || '').trim()
};

/**
 * Returns a sanitized map of configured services without exposing secret strings
 */
export function getSanitizedServiceStatus() {
  return {
    geminiAi: Boolean(config.geminiApiKey && config.geminiApiKey.length > 10),
    openRouteService: Boolean(config.orsApiKey && config.orsApiKey.length > 10),
    tomtomTraffic: Boolean(config.tomtomApiKey && config.tomtomApiKey.length > 10),
    imdOfficialAlerts: Boolean(config.imdApiKey && config.imdApiKey.length > 5),
    bhashiniTranslation: Boolean(config.bhashiniApiKey && config.bhashiniApiKey.length > 5),
    openMeteoDirect: true // Public keyless weather handled directly by client
  };
}
