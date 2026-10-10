/**
 * Speech-to-Text (STT) and Text-to-Speech (TTS) Service.
 * Native Web Speech API integration optimized for Indian languages (Telugu, Hindi, English, etc.)
 * with support for server-side Bhashini pipelines.
 */

// Strip markdown formatting, symbols, and emojis for smooth, natural audio synthesis
export function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove headers ###
    .replace(/#{1,6}\s+/g, '')
    // Replace bullets • or - with a natural pause
    .replace(/^[•\-\*]\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove emojis that voice synthesizers might try to spell out
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Collapse excess whitespace
    .replace(/\n+/g, '. ')
    .trim();
}

/**
 * Check if browser supports Web Speech Recognition
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Check if browser supports Web Speech Synthesis
 */
export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Load browser voices safely (handles async voice loading)
 */
export function getAvailableVoices() {
  if (!isSpeechSynthesisSupported()) return Promise.resolve([]);

  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }

    const handler = () => {
      voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(voices);
    };

    window.speechSynthesis.addEventListener('voiceschanged', handler);
    // Timeout fallback in case voiceschanged never fires
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices() || []);
    }, 1000);
  });
}

/**
 * Find the best matching browser voice for an Indian language code
 */
export async function getVoiceForLanguage(langCode = 'te-IN') {
  const voices = await getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const target = langCode.toLowerCase();
  const baseCode = target.split('-')[0];

  // 1. Exact match (e.g. 'te-IN')
  let match = voices.find(v => v.lang.toLowerCase() === target || v.lang.toLowerCase().replace('_', '-') === target);
  if (match) return match;

  // 2. Base language match (e.g. starts with 'te' or 'hi')
  match = voices.find(v => v.lang.toLowerCase().startsWith(baseCode));
  if (match) return match;

  // 3. Fallback to Indian English for general comprehension if regional voice not installed
  if (baseCode !== 'en') {
    match = voices.find(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
    if (match) return match;
  }

  // 4. Default system voice
  return voices.find(v => v.default) || voices[0] || null;
}

/**
 * Start speech recognition instance
 */
export function startSpeechRecognition({
  langCode = 'te-IN',
  onResult,
  onInterim,
  onError,
  onEnd,
  onStart
}) {
  if (!isSpeechRecognitionSupported()) {
    onError?.({ error: 'not-supported', message: 'Speech recognition is not supported in this browser.' });
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = langCode;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false; // Single utterance for clean mobile & desktop UX

  let finalTranscript = '';

  recognition.onstart = () => {
    onStart?.();
  };

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interim += transcript;
      }
    }

    if (interim) {
      onInterim?.(interim);
    }
    if (finalTranscript) {
      onResult?.(finalTranscript);
    }
  };

  recognition.onerror = (event) => {
    onError?.({
      error: event.error,
      message: getSpeechErrorMessage(event.error)
    });
  };

  recognition.onend = () => {
    onEnd?.(finalTranscript);
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    onError?.({ error: 'start-failed', message: err.message });
    return null;
  }
}

function getSpeechErrorMessage(error) {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone permission was denied. Please allow microphone access in your browser.';
    case 'no-speech':
      return 'No speech detected. Please try speaking closer to your microphone.';
    case 'network':
      return 'Network communication error during speech recognition.';
    case 'aborted':
      return 'Speech recognition was stopped.';
    default:
      return `Speech recognition error (${error}).`;
  }
}

/**
 * Text-to-Speech Synthesizer
 */
export async function speakAnswer({
  text,
  langCode = 'te-IN',
  rate = 0.95,
  pitch = 1.0,
  onStart,
  onEnd,
  onError
}) {
  if (!isSpeechSynthesisSupported()) {
    onError?.(new Error('Speech synthesis is not supported in this browser.'));
    return false;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) {
    onError?.(new Error('No readable text to speak.'));
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = langCode;
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voice = await getVoiceForLanguage(langCode);
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => {
    // Ignore canceled events (e.g. user pressed stop)
    if (e.error !== 'canceled') {
      onError?.(e);
    } else {
      onEnd?.();
    }
  };

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    onError?.(err);
    return false;
  }
}

/**
 * Stop any ongoing speech playback
 */
export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

/**
 * Check if speech is currently playing
 */
export function isCurrentlySpeaking() {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}
