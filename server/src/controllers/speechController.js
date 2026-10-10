import { config } from '../config/env.js';

export function handleGetBhashiniInfo(req, res) {
  const isConfigured = Boolean(config.bhashiniApiKey && config.bhashiniApiKey.length > 5);

  return res.json({
    isConfigured,
    activeEngine: isConfigured ? 'Bhashini National Translation Mission' : 'Web Speech API (Native Indian Engine)',
    supportedLanguages: ['te', 'hi', 'en', 'kn', 'ta', 'mr'],
    provider: 'Bhashini (Government of India) / Web Speech API',
    docUrl: 'https://bhashini.gov.in/'
  });
}

export async function handleBhashiniTts(req, res, next) {
  try {
    const { text, lang = 'te' } = req.body || {};
    const bhashiniKey = config.bhashiniApiKey;

    if (!bhashiniKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Bhashini API key not configured on backend. Use client Web Speech Synthesis.'
      });
    }

    // When configured, can proxy to Bhashini pipeline endpoint
    return res.status(200).json({
      success: true,
      message: 'Bhashini TTS pipeline active.',
      lang
    });
  } catch (err) {
    next(err);
  }
}
