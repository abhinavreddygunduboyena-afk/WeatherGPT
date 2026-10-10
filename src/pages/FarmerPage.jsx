import React, { useState } from 'react';
import { 
  Sprout, Bot, ShieldAlert, LayoutDashboard, Sparkles, 
  RefreshCw, Info, AlertTriangle, CheckCircle2, Mic, Volume2 
} from 'lucide-react';
import { useFarmer } from '../contexts/FarmerContext';
import { useWeather } from '../contexts/WeatherContext';
import FarmProfileCard from '../components/farmer/FarmProfileCard';
import FarmerWeatherCard from '../components/farmer/FarmerWeatherCard';
import FarmerAlertsPanel from '../components/farmer/FarmerAlertsPanel';
import FarmerRecommendations from '../components/farmer/FarmerRecommendations';
import FarmerForecastTabs from '../components/farmer/FarmerForecastTabs';
import FarmerChat from '../components/farmer/FarmerChat';
import FarmerVoiceAssistant from '../components/farmer/FarmerVoiceAssistant';
import Tabs from '../components/common/Tabs';

export default function FarmerPage() {
  const { currentLocation, isLoading } = useWeather();
  const { farmingAdvisory, isAnalyzing, analyzeFarm } = useFarmer();
  const [activeTab, setActiveTab] = useState('dashboard');

  const alertsCount = farmingAdvisory?.alerts?.length || 0;

  const FARMER_TABS = [
    { id: 'dashboard', label: 'Farm Dashboard', icon: LayoutDashboard },
    { id: 'voice', label: 'Voice AI Agent', icon: Mic, badge: 'Voice' },
    { id: 'assistant', label: 'Farmer Chat', icon: Bot },
    { 
      id: 'alerts', 
      label: 'Agro Hazards', 
      icon: ShieldAlert, 
      badge: alertsCount > 0 ? alertsCount : null 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
              Agrometeorology Core
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            Farmer Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time numerical weather prediction, soil microclimate, crop phenology, and explainable agronomic advisories for {currentLocation?.name || 'Selected Farm'}.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="w-full sm:w-auto overflow-x-auto">
          <Tabs
            tabs={FARMER_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab 1: Comprehensive Farm Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Farm Profile & Quick Status */}
          <FarmProfileCard />

          {/* Real-time Farm Telemetry & Alerts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <FarmerWeatherCard />
              <FarmerRecommendations />
            </div>

            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <FarmerAlertsPanel />
              
              {/* Voice AI Assistant Teaser */}
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-gray-900 to-gray-900 p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Mic className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Voice AI Active
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        తెలుగు • हिन्दी • English
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">
                      Talk to Your Farm Assistant
                    </h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      Speak in your local language about rain, irrigation, harvesting, or spray windows. Listen to spoken AI answers aloud.
                    </p>
                    <button
                      onClick={() => setActiveTab('voice')}
                      className="mt-3.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Start Speaking Now →</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Agricultural Forecast & Trends */}
          <FarmerForecastTabs />
        </div>
      )}

      {/* Tab 2: Multilingual Voice AI Agent */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <FarmProfileCard />
          <FarmerVoiceAssistant />
        </div>
      )}

      {/* Tab 3: Text Chat Assistant */}
      {activeTab === 'assistant' && (
        <div className="space-y-6">
          <FarmProfileCard />
          <FarmerChat />
        </div>
      )}

      {/* Tab 4: Agro Hazards & Transparent Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <FarmProfileCard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FarmerAlertsPanel />
            <FarmerRecommendations />
          </div>
        </div>
      )}
    </div>
  );
}
