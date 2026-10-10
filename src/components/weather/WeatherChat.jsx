import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { askWeatherAssistant } from '../../services/aiAssistantService';
import { SAMPLE_ALERTS } from '../../data/sampleAlerts';
import Badge from '../common/Badge';

const SUGGESTIONS = [
  "Will it rain during my college event tomorrow?",
  "Is the morning or evening better for travelling?",
  "What weather precautions should I take?",
  "Explain this weather warning in simple English.",
  "Explain the forecast in Telugu."
];

export default function WeatherChat() {
  const { weatherData } = useWeather();
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am **WeatherGPT Decision Support**, synchronized with the environmental observations for **${weatherData.location.name}**.\n\nYou can ask me about scheduling outdoor events, travel windows, safety precautions, or request forecasts in other languages like Telugu. How can I assist you today?`,
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

  const handleSend = async (queryText) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isTyping) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await askWeatherAssistant(textToSend, weatherData, SAMPLE_ALERTS);
      const assistantMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: response.language
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to analyze atmospheric query at this moment. Please retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. Currently contextualized for **${weatherData.location.name}**. What would you like to evaluate?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex flex-col h-[560px] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-850/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-weather-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                WeatherGPT Assistant
              </h3>
              <Badge variant="blue" size="sm">Context-Aware</Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active Context: <strong className="text-weather-600 dark:text-weather-400 font-medium">{weatherData.location.name}</strong> ({weatherData.current.temperature}°C, {weatherData.current.condition})
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800 bg-slate-50/30 dark:bg-navy-900/60 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-weather-500" /> Prompts:
          </span>
          {SUGGESTIONS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-navy-700 whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-weather-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-weather-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-navy-800/80 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-navy-700 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line prose-xs">
                  {m.text}
                </div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? 'text-weather-100' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-navy-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-7 h-7 rounded-lg bg-weather-600 text-white flex items-center justify-center shrink-0 text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-100 dark:bg-navy-800/80 border border-slate-200/60 dark:border-navy-700 rounded-xl rounded-bl-none px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-weather-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-weather-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-weather-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">Evaluating weather parameters...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${weatherData.location.name} weather, event risks, or Telugu summary...`}
            className="flex-1 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-weather-500/20 focus:border-weather-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-weather-600 hover:bg-weather-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
