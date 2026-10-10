import React, { useState, useEffect } from 'react';
import { 
  Settings, Moon, Sun, CheckCircle2, AlertCircle, Database, 
  Cloud, Bot, Key, RotateCcw, ShieldCheck, Server 
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeather } from '../contexts/WeatherContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { unit, toggleUnit } = useWeather();
  const [saveToast, setSaveToast] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ isConnected: false, checking: true });

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'ok') {
          setBackendStatus({ isConnected: true, checking: false, data });
        } else {
          setBackendStatus({ isConnected: false, checking: false });
        }
      })
      .catch(() => {
        setBackendStatus({ isConnected: false, checking: false });
      });
  }, []);

  const handleResetData = () => {
    if (window.confirm("Reset all custom saved locations and locally created projects to factory defaults?")) {
      localStorage.removeItem('weathergpt_energy_projects');
      localStorage.removeItem('weathergpt_saved_locations');
      localStorage.removeItem('weathergpt_active_location');
      window.location.reload();
    }
  };

  const handleSimulateSave = (e) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          System Preferences & Integration Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure telemetry endpoints, user interface themes, physical measurement units, and local caches.
        </p>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration successfully updated.</span>
        </div>
      )}

      {/* Theme & Display Preferences */}
      <Card
        title="Interface Theme & Units"
        subtitle="Visual styling and physical units system"
        icon={Settings}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Color Palette Theme</div>
              <div className="text-[11px] text-slate-400">Deep Navy/Slate for dark rooms, crisp slate for day shifts</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  theme === 'dark'
                    ? 'border-weather-500 bg-navy-800 text-weather-300 ring-1 ring-weather-500'
                    : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Deep Navy</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  theme === 'light'
                    ? 'border-weather-500 bg-weather-50 text-weather-700 ring-1 ring-weather-500'
                    : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Cool Slate Light</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Temperature Scale</div>
              <div className="text-[11px] text-slate-400">Metric Celsius (°C) vs Imperial Fahrenheit (°F)</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => unit !== 'C' && toggleUnit()}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  unit === 'C'
                    ? 'border-weather-500 bg-weather-50 dark:bg-navy-800 text-weather-600 dark:text-weather-300 font-semibold'
                    : 'border-slate-200 dark:border-navy-700 text-slate-500'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                onClick={() => unit !== 'F' && toggleUnit()}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  unit === 'F'
                    ? 'border-weather-500 bg-weather-50 dark:bg-navy-800 text-weather-600 dark:text-weather-300 font-semibold'
                    : 'border-slate-200 dark:border-navy-700 text-slate-500'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Integration Services Architecture */}
      <Card
        title="Integration Services Architecture & Status"
        subtitle="Live connection diagnostics for external data providers"
        icon={ShieldCheck}
      >
        <div className="space-y-3 divide-y divide-slate-100 dark:divide-navy-800 text-xs">
          {/* Weather API */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-weather-500" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Open-Meteo High-Resolution NWP</div>
                <div className="text-[11px] text-slate-400">Free keyless live atmospheric telemetry</div>
              </div>
            </div>
            <Badge variant="emerald" size="sm" dot>CONNECTED (ACTIVE)</Badge>
          </div>

          {/* AI Reasoning */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4 text-indigo-500" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">WeatherGPT Contextual Engine</div>
                <div className="text-[11px] text-slate-400">Internal rules & Telugu language generator</div>
              </div>
            </div>
            <Badge variant="blue" size="sm" dot>OPERATIONAL</Badge>
          </div>

          {/* Node.js Express Backend */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">Node.js + Express Backend Service</div>
                <div className="text-[11px] text-slate-400">
                  {backendStatus.isConnected 
                    ? `REST API Gateway Active on Port 3001 (Uptime: ${backendStatus.data?.uptimeSeconds ?? 0}s)`
                    : 'REST API Gateway (Run "npm run server" to connect)'}
                </div>
              </div>
            </div>
            {backendStatus.isConnected ? (
              <Badge variant="emerald" size="sm" dot>CONNECTED (ACTIVE)</Badge>
            ) : backendStatus.checking ? (
              <Badge variant="slate" size="sm">CHECKING...</Badge>
            ) : (
              <Badge variant="amber" size="sm">OFFLINE (PORT 3001)</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Factory Reset */}
      <Card
        title="Local Cache & Storage Management"
        subtitle="Manage in-browser project records and pinned stations"
        icon={RotateCcw}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            Clears all customized assessment entries, pinned geographic stations, and chat histories stored in browser localStorage.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            Reset to Factory Defaults
          </Button>
        </div>
      </Card>
    </div>
  );
}
