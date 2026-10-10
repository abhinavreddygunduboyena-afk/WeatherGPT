import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, MessageSquare, Volume2, VolumeX, Mic } from 'lucide-react';
import { useFarmer } from '../../contexts/FarmerContext';
import { useWeather } from '../../contexts/WeatherContext';
import { askFarmerAssistant } from '../../services/farmerAssistantService';
import { speakAnswer, stopSpeaking, isCurrentlySpeaking } from '../../services/speechService';

const QUICK_PROMPTS = [
  { label: '🌧️ Rain forecast this week?', query: 'Is rain forecast for my farm this week?' },
  { label: '💧 Should I irrigate today?', query: 'Should I irrigate my crops today?' },
  { label: '🌱 Safe to spray foliar inputs?', query: 'Is it safe to spray pesticides or foliar nutrition today?' },
  { label: '🌾 Suitable for harvesting?', query: 'Is the upcoming weather suitable for harvesting operations?' },
  { label: '🌸 Risks during flowering stage?', query: 'What weather risks exist for my crop during its current stage?' },
  { label: 'తెలుగు సలహా (Telugu)', query: 'ఈ వారం నా పంటకు తెలుగులో వాతావరణ సలహా ఇవ్వండి' }
];

export default function FarmerChat({ onOpenVoiceMode }) {
  const { farmProfile, advisory } = useFarmer();
  const { weatherData } = useWeather();
  const [playingMessageId, setPlayingMessageId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello! I am your **WeatherGPT Farmer Assistant** for **${farmProfile?.cropId ? farmProfile.cropId.toUpperCase() : 'your farm'}** in **${weatherData?.location?.name || 'your region'}**.\n\nAsk me about upcoming rain, irrigation timing, pesticide spraying windows, soil moisture status, or tap one of the quick prompts below. Telugu queries (తెలుగు) and Hindi queries (हिन्दी) are supported!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await askFarmerAssistant(query, weatherData, farmProfile, advisory);
      const text = typeof response === 'object' ? response.text : response;
      const botMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: text || 'Advisory retrieved.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Farmer Assistant error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: 'Unable to analyze farm query at the moment. Please verify your connection or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: `Conversation reset. Ready with live field data for **${farmProfile?.cropId ? farmProfile.cropId.toUpperCase() : 'your crop'}** at **${weatherData?.location?.name || 'Selected Farm'}**. How can I help your farm today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to render bold markdown and bullet items
  const renderMessageContent = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold replacer: **bold**
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-emerald-300 dark:text-emerald-300">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-gray-400">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (line.startsWith('• ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-gray-200 dark:text-gray-200">
            {parts.slice(1)}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-sm leading-relaxed text-gray-200 dark:text-gray-200">
          {parts}
        </p>
      );
    });
  };

  return (
    <div className="bg-gray-800/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-700/60 rounded-xl overflow-hidden flex flex-col h-[600px] shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700/60 flex items-center justify-between bg-gray-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-sm sm:text-base">
              Ask Farmer Assistant
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Agro AI
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Field intelligence powered by Open-Meteo & agronomic models
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          title="Reset conversation"
          className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompt Pills */}
      <div className="px-4 py-2 bg-gray-900/40 border-b border-gray-700/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold shrink-0 mr-1">
          Quick Qs:
        </span>
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.query)}
            disabled={isTyping}
            className="text-xs px-2.5 py-1 rounded-full bg-gray-800 hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-500/40 border border-gray-700 text-gray-300 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-gray-900/90 border border-gray-700/60 text-gray-200 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="space-y-1">
                {msg.sender === 'user' ? (
                  <p className="text-sm">{msg.text}</p>
                ) : (
                  renderMessageContent(msg.text)
                )}
              </div>
              {msg.sender === 'assistant' ? (
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-800 text-[11px]">
                  <button
                    onClick={() => {
                      if (playingMessageId === msg.id) {
                        stopSpeaking();
                        setPlayingMessageId(null);
                      } else {
                        speakAnswer({
                          text: msg.text,
                          langCode: 'te-IN',
                          onStart: () => setPlayingMessageId(msg.id),
                          onEnd: () => setPlayingMessageId(null)
                        });
                      }
                    }}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    {playingMessageId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop Speech</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Read aloud</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                </div>
              ) : (
                <div className="text-[10px] mt-2 text-right text-emerald-200">
                  {msg.timestamp}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-900/90 border border-gray-700/60 rounded-2xl px-4 py-3 text-gray-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-200"></span>
              <span>Analyzing soil, crop phenology & weather models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-gray-800/80 border-t border-gray-700/60 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${farmProfile?.cropId || 'crops'}, rain, soil, sprays, or type in Telugu...`}
          disabled={isTyping}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}
