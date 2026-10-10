import React, { useState } from 'react';
import { 
  CloudSun, Bot, Activity, Navigation, ShieldAlert, 
  MapPin, RefreshCw, Sparkles 
} from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';
import CurrentWeatherCard from '../components/weather/CurrentWeatherCard';
import ForecastTabs from '../components/weather/ForecastTabs';
import WeatherChat from '../components/weather/WeatherChat';
import ImpactSimulator from '../components/weather/ImpactSimulator';
import TravelAdvisor from '../components/weather/TravelAdvisor';
import WeatherAlertsList from '../components/weather/WeatherAlertsList';
import Tabs from '../components/common/Tabs';

export default function WeatherPage() {
  const { currentLocation } = useWeather();
  const [activeTab, setActiveTab] = useState('overview');

  const WEATHER_TABS = [
    { id: 'overview', label: 'Atmospheric Overview', icon: CloudSun },
    { id: 'assistant', label: 'WeatherGPT Assistant', icon: Bot, badge: 'AI' },
    { id: 'simulator', label: 'Impact Simulator', icon: Activity },
    { id: 'travel', label: 'Travel Advisor', icon: Navigation },
    { id: 'alerts', label: 'Hazard Alerts', icon: ShieldAlert, badge: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Weather Intelligence Engine
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time numerical weather prediction, diurnal forecasting, and decision support for {currentLocation.name}.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="w-full sm:w-auto overflow-x-auto">
          <Tabs
            tabs={WEATHER_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab 1: Overview & Forecasting */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <CurrentWeatherCard />
          <ForecastTabs />
        </div>
      )}

      {/* Tab 2: Conversational Assistant */}
      {activeTab === 'assistant' && (
        <div className="space-y-4">
          <WeatherChat />
        </div>
      )}

      {/* Tab 3: Impact Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-4">
          <ImpactSimulator />
        </div>
      )}

      {/* Tab 4: Travel Advisor */}
      {activeTab === 'travel' && (
        <div className="space-y-4">
          <TravelAdvisor />
        </div>
      )}

      {/* Tab 5: Hazard Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <WeatherAlertsList />
        </div>
      )}
    </div>
  );
}
