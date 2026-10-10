import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, RotateCcw, Send, Globe, 
  Sparkles, AlertCircle, CheckCircle2, ChevronDown, Bot, User, 
  Layers, Radio, HelpCircle, StopCircle, RefreshCw, AudioWaveform
} from 'lucide-react';
import { useFarmer } from '../../contexts/FarmerContext';
import { useWeather } from '../../contexts/WeatherContext';
import { INDIAN_LANGUAGES, getLanguageByCode } from '../../data/indianLanguages';
import { 
  isSpeechRecognitionSupported, 
  isSpeechSynthesisSupported, 
  startSpeechRecognition, 
  speakAnswer, 
  stopSpeaking, 
  isCurrentlySpeaking 
} from '../../services/speechService';
import { askFarmerAssistant } from '../../services/farmerAssistantService';

export default function FarmerVoiceAssistant() {
  const { farmProfile, farmingAdvisory } = useFarmer();
  const { weatherData } = useWeather();

  // Selected language (persisted in localStorage)
  const [selectedLangCode, setSelectedLangCode] = useState(() => {
    try {
      return localStorage.getItem('weathergpt_farmer_lang') || 'te';
    } catch (e) {
      return 'te';
    }
  });

  const activeLang = getLanguageByCode(selectedLangCode);

  // Voice Interaction State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [activeRecognition, setActiveRecognition] = useState(null);

  // AI Response State
  const [isThinking, setIsThinking] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);

  // Error & Status State
  const [micError, setMicError] = useState(null);
  const [engineInfo, setEngineInfo] = useState({
    sttSupported: true,
    ttsSupported: true,
    activeEngine: 'Web Speech API (Native Indian Engine)'
  });

  const recognizerRef = useRef(null);
  const answerSectionRef = useRef(null);

  // Check feature support & Bhashini status on mount
  useEffect(() => {
    const stt = isSpeechRecognitionSupported();
    const tts = isSpeechSynthesisSupported();
    setEngineInfo(prev => ({
      ...prev,
      sttSupported: stt,
      ttsSupported: tts
    }));

    // Check optional backend Bhashini configuration
    fetch('/api/bhashini/info')
      .then(r => r.json())
      .then(d => {
        if (d.isConfigured) {
          setEngineInfo(prev => ({
            ...prev,
            activeEngine: d.activeEngine || 'Bhashini AI'
          }));
        }
      })
      .catch(() => {});

    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        try { recognizerRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // Update language preference
  const handleLanguageChange = (code) => {
    setSelectedLangCode(code);
    try {
      localStorage.setItem('weathergpt_farmer_lang', code);
    } catch (e) {}
    stopSpeaking();
    setIsSpeaking(false);
    setMicError(null);
  };

  // Start Voice Recognition
  const handleStartListening = () => {
    setMicError(null);
    setInterimTranscript('');
    stopSpeaking();
    setIsSpeaking(false);

    if (!isSpeechRecognitionSupported()) {
      setMicError(activeLang.ui.notSupported);
      return;
    }

    try {
      const rec = startSpeechRecognition({
        langCode: activeLang.speechCode,
        onStart: () => {
          setIsListening(true);
        },
        onInterim: (text) => {
          setInterimTranscript(text);
        },
        onResult: (finalText) => {
          setQuestionText(finalText);
          setInterimTranscript('');
        },
        onError: (err) => {
          setIsListening(false);
          if (err.error === 'not-allowed') {
            setMicError(activeLang.ui.micDenied);
          } else if (err.error === 'no-speech') {
            setMicError(activeLang.ui.noSpeech);
          } else {
            setMicError(err.message || 'Speech recognition encountered an issue.');
          }
        },
        onEnd: (final) => {
          setIsListening(false);
          if (final) {
            setQuestionText(final);
          }
        }
      });

      recognizerRef.current = rec;
      setActiveRecognition(rec);
    } catch (e) {
      setIsListening(false);
      setMicError(e.message);
    }
  };

  // Stop Listening Manually
  const handleStopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Submit Question to AI Agent
  const handleAskQuestion = async (overrideText) => {
    const textToAsk = (overrideText || questionText || interimTranscript).trim();
    if (!textToAsk || isThinking) return;

    stopSpeaking();
    setIsSpeaking(false);
    setIsListening(false);
    if (recognizerRef.current) {
      try { recognizerRef.current.abort(); } catch (e) {}
    }

    setIsThinking(true);
    setMicError(null);

    const userEntry = {
      id: Date.now(),
      sender: 'farmer',
      text: textToAsk,
      lang: selectedLangCode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const result = await askFarmerAssistant(
        textToAsk,
        weatherData,
        farmProfile,
        farmingAdvisory,
        selectedLangCode,
        conversationHistory
      );

      const aiEntry = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: result.text,
        provider: result.provider,
        isLlm: result.isLlm,
        lang: selectedLangCode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCurrentAnswer(aiEntry);
      setConversationHistory(prev => [userEntry, aiEntry, ...prev]);

      // Automatically speak the response aloud in the selected language
      handleSpeak(result.text);

      // Scroll to answer
      setTimeout(() => {
        answerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      console.error('Farmer Voice Assistant error:', err);
      setMicError('Failed to generate response. Please check network connection and try again.');
    } finally {
      setIsThinking(false);
    }
  };

  // Audio Playback Handler
  const handleSpeak = (textToSpeak) => {
    const text = textToSpeak || currentAnswer?.text;
    if (!text) return;

    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    speakAnswer({
      text,
      langCode: activeLang.speechCode,
      rate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (err) => {
        console.warn('TTS playback error:', err);
        setIsSpeaking(false);
      }
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  // Render markdown bold and bullets nicely
  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-emerald-300">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-gray-400">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm sm:text-base text-gray-100 dark:text-gray-100 leading-relaxed my-1">
            {parts}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-sm sm:text-base leading-relaxed text-gray-100 dark:text-gray-100 my-1">
          {parts}
        </p>
      );
    });
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white shadow-2xl p-5 sm:p-7 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* 1. Header & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-800 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Voice AI Agent • {activeLang.nativeName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 flex items-center gap-2">
            {activeLang.ui.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            {activeLang.ui.subtitle}
          </p>
        </div>

        {/* Indian Language Selector Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="relative">
            <select
              value={selectedLangCode}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-800 hover:bg-gray-750 border-2 border-emerald-500/40 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer appearance-none pr-8 transition-colors shadow-inner"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-gray-900 text-white">
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Primary Voice-First Microphone Interface */}
      <div className="my-6 flex flex-col items-center justify-center relative z-10 text-center">
        {/* Pulsing concentric rings when listening */}
        <div className="relative flex items-center justify-center my-3">
          {isListening && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 animate-pulse" />
            </>
          )}

          <button
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={isThinking}
            aria-label={isListening ? activeLang.ui.stopListening : activeLang.ui.tapToSpeak}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all transform active:scale-95 border-4 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 border-rose-400 ring-8 ring-rose-500/30 animate-pulse'
                : isThinking
                ? 'bg-emerald-900/60 border-emerald-700/60 opacity-80 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300 ring-8 ring-emerald-500/20 hover:scale-105'
            }`}
          >
            {isListening ? (
              <>
                <StopCircle className="w-10 h-10 text-white" />
                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-white">
                  {activeLang.ui.stopListening}
                </span>
              </>
            ) : isThinking ? (
              <>
                <RefreshCw className="w-9 h-9 text-emerald-300 animate-spin" />
                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-emerald-200">
                  Thinking
                </span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 text-white" />
                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-white">
                  Speak
                </span>
              </>
            )}
          </button>
        </div>

        {/* State Label */}
        <div className="mt-2">
          {isListening ? (
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm sm:text-base animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>{activeLang.ui.listening}</span>
            </div>
          ) : isThinking ? (
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm sm:text-base">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Checking live weather & crop phenology...</span>
            </div>
          ) : (
            <p className="text-gray-300 text-sm font-medium">
              {activeLang.ui.tapToSpeak}
            </p>
          )}
        </div>

        {/* Engine provenance badge */}
        <div className="mt-1 text-[11px] text-gray-500 font-mono flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-emerald-400" />
          <span>STT: {engineInfo.activeEngine}</span>
        </div>
      </div>

      {/* 3. Live Speech Transcription Area & Edit Box */}
      {(isListening || interimTranscript || questionText) && (
        <div className="mb-5 rounded-xl border border-gray-700 bg-gray-950/80 p-4 relative z-10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              {isListening ? activeLang.ui.transcribing : activeLang.ui.editPrompt}
            </span>
            {questionText && (
              <button
                onClick={() => {
                  setQuestionText('');
                  setInterimTranscript('');
                }}
                className="text-[11px] text-gray-400 hover:text-gray-200 underline"
              >
                {activeLang.ui.clearButton}
              </button>
            )}
          </div>

          {/* Editable text area so farmer can fix mispronounced words */}
          <textarea
            value={questionText || interimTranscript}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={2}
            placeholder={activeLang.ui.transcribing}
            className="w-full bg-transparent text-sm sm:text-base text-white font-medium focus:outline-none resize-none placeholder-gray-500"
          />

          {/* Ask Advice Action Trigger */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-800">
            <button
              onClick={() => handleAskQuestion()}
              disabled={isThinking || !(questionText || interimTranscript).trim()}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{activeLang.ui.askButton}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Error / Permission State Banner */}
      {micError && (
        <div className="mb-5 p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/40 text-xs sm:text-sm text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-rose-300">Voice Recognition Notice</div>
            <p className="mt-0.5 text-rose-200/90 leading-relaxed">{micError}</p>
          </div>
          <button
            onClick={() => setMicError(null)}
            className="text-xs text-rose-300 hover:text-white underline shrink-0 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 5. Dynamic Sample Prompt Pills (in active Indian language) */}
      <div className="mb-6 relative z-10">
        <div className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick voice questions ({activeLang.nativeName}):</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {activeLang.sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestionText(sq.text);
                handleAskQuestion(sq.text);
              }}
              disabled={isThinking}
              className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-emerald-900/60 hover:border-emerald-500/50 border border-gray-700 text-gray-200 hover:text-emerald-200 text-xs sm:text-sm font-medium whitespace-nowrap transition-all shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <span>{sq.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Spoken AI Response Card */}
      {currentAnswer && (
        <div
          ref={answerSectionRef}
          className="rounded-2xl border-2 border-emerald-500/50 bg-gray-900/95 p-5 sm:p-6 relative z-10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Answer Card Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  Farm Assistant Advice
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                    {activeLang.nativeName}
                  </span>
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {currentAnswer.provider || (currentAnswer.isLlm ? 'Google Gemini 1.5 Flash' : 'Rule-Based Agrometeorological Engine')}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${currentAnswer.isLlm ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                    {currentAnswer.isLlm ? 'AI Model' : 'Rule-Based Telemetry'}
                  </span>
                </div>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeak()}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  isSpeaking
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>{activeLang.ui.stopSpeaking}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>{activeLang.ui.speakAnswer}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  handleSpeak();
                }}
                title={activeLang.ui.replayAnswer}
                className="p-1.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Speaking Audio Waveform Animation */}
          {isSpeaking && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-emerald-400 animate-bounce" />
                <span className="w-1 h-5 bg-emerald-400 animate-bounce delay-100" />
                <span className="w-1 h-2 bg-emerald-400 animate-bounce delay-200" />
                <span className="w-1 h-6 bg-emerald-400 animate-bounce delay-75" />
                <span className="w-1 h-4 bg-emerald-400 animate-bounce delay-150" />
              </div>
              <span className="font-semibold">Playing spoken answer in {activeLang.nativeName}...</span>
            </div>
          )}

          {/* Formatted Text Answer */}
          <div className="space-y-1.5 text-gray-100 font-normal leading-relaxed">
            {renderFormattedText(currentAnswer.text)}
          </div>
        </div>
      )}

      {/* 7. Alternative Text Input Fallback (for users who prefer typing) */}
      <div className="mt-6 pt-4 border-t border-gray-800 relative z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            disabled={isThinking}
            placeholder={activeLang.ui.typeFallbackPlaceholder}
            className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={!questionText.trim() || isThinking}
            className="px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-md"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{activeLang.ui.askButton}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
