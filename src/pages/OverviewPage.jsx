import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CloudSun, Zap, ArrowRight, ShieldAlert, Sparkles, PlusCircle, 
  MapPin, Clock, Calendar, CheckCircle, TrendingUp, AlertTriangle, Sprout 
} from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';
import { useEnergy } from '../contexts/EnergyContext';
import { useFarmer } from '../contexts/FarmerContext';
import { SAMPLE_ALERTS } from '../data/sampleAlerts';
import TemperatureTrendChart from '../components/charts/TemperatureTrendChart';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DemoBadge from '../components/common/DemoBadge';
import { convertTemperature } from '../utils/weatherUtils';
import { formatPowerMW } from '../utils/formatters';

export default function OverviewPage() {
  const navigate = useNavigate();
  const { weatherData, currentLocation, recentLocations, selectLocation, unit } = useWeather();
  const { projects, openCreateModal, selectProject } = useEnergy();
  const { farmProfile, farmingAdvisory } = useFarmer();

  const current = weatherData?.current || {};
  const hourly = weatherData?.hourly || [];
  const displayTemp = convertTemperature(current.temperature, unit);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const totalMW = projects.reduce((acc, p) => acc + (p.capacityMW || 0), 0);
  const latestAlert = SAMPLE_ALERTS[0];

  const handleOpenProject = (id) => {
    selectProject(id);
    navigate('/energy');
  };

  return (
    <div className="space-y-6">
      {/* Concise Greeting & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
        <div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDateStr}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {greeting}, Engineering Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time environmental decision support and utility-scale energy site intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate('/weather')}
          >
            Launch Weather Assistant
          </Button>
          <Button
            variant="energy"
            size="sm"
            icon={PlusCircle}
            onClick={openCreateModal}
          >
            New Energy Project
          </Button>
        </div>
      </div>

      {/* Three Core Pillars Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pillar 1: Weather Intelligence Summary */}
        <Card
          title="Weather Intelligence"
          subtitle={`Active Hub: ${currentLocation.name}`}
          icon={CloudSun}
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/weather')}>
              <span>Full Weather</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-navy-800">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {displayTemp}°{unit}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  ({current.condition})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Wind: {current.windSpeed != null ? `${current.windSpeed} km/h ${current.windDirectionText || ''}` : '--'} • Humidity: {current.humidity != null ? `${current.humidity}%` : '--'}
              </p>
            </div>
            <div>
              {weatherData.isLive ? (
                <Badge variant="emerald" size="sm" dot>Live Open-Meteo</Badge>
              ) : weatherData.fetchError ? (
                <Badge variant="rose" size="sm" dot>Live Unavailable</Badge>
              ) : (
                <DemoBadge label="SIMULATED DEMO" />
              )}
            </div>
          </div>

          <div className="pt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">24-Hour Diurnal Trend</span>
              <span className="text-[11px] text-slate-400">°{unit} vs Time</span>
            </div>
            <TemperatureTrendChart data={hourly.slice(0, 12)} unit={unit} />
          </div>
        </Card>

        {/* Pillar 2: Energy Intelligence Summary */}
        <Card
          title="Energy Intelligence"
          subtitle="Utility-scale renewable generation"
          icon={Zap}
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/energy')}>
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-100 dark:border-navy-800 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-navy-850">
              <div className="text-[11px] text-slate-400">Sites</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">{projects.length}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-navy-850">
              <div className="text-[11px] text-slate-400">Pipeline</div>
              <div className="text-base font-bold text-energy-600 dark:text-energy-400">{formatPowerMW(totalMW)}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-navy-850">
              <div className="text-[11px] text-slate-400">Lead Score</div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">92/100</div>
            </div>
          </div>

          <div className="pt-3 space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
              Active Feasibility Sites
            </div>
            {projects.slice(0, 2).map(proj => (
              <div
                key={proj.id}
                onClick={() => handleOpenProject(proj.id)}
                className="p-2 rounded-lg border border-slate-100 dark:border-navy-800 hover:border-energy-500/50 hover:bg-slate-50 dark:hover:bg-navy-850 flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{proj.name}</div>
                  <div className="text-[11px] text-slate-400">{proj.technologyLabel} • {proj.capacityMW} MW</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-energy-600 dark:text-energy-400">
                    {proj.metrics?.overallFeasibilityScore || 80}/100
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pillar 3: Farmer Intelligence Summary */}
        <Card
          title="Farmer Intelligence"
          subtitle="Agrometeorology & crop phenology"
          icon={Sprout}
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/farmer')}>
              <span>Farm Advisory</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-100 dark:border-navy-800 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-navy-850">
              <div className="text-[11px] text-slate-400">Crop Stage</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {farmingAdvisory?.stage?.name || 'Vegetative'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-navy-850">
              <div className="text-[11px] text-slate-400">Soil Moisture</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {farmingAdvisory?.metrics?.soilMoisturePercent != null ? `${farmingAdvisory.metrics.soilMoisturePercent}%` : '24%'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-navy-850">
              <div className="text-[11px] text-slate-400">7-Day Rain</div>
              <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                {farmingAdvisory?.metrics?.next7DaysRainMm != null ? `${farmingAdvisory.metrics.next7DaysRainMm} mm` : '0 mm'}
              </div>
            </div>
          </div>

          <div className="pt-3 space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Top Agronomic Action</span>
              <span className="text-[10px] text-emerald-500 font-bold">LIVE ADVISORY</span>
            </div>
            <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs">
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{farmingAdvisory?.advisories?.[0]?.icon || '🌱'}</span>
                <span>{farmingAdvisory?.advisories?.[0]?.title || 'Scheduled Field Monitoring'}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {farmingAdvisory?.advisories?.[0]?.advice || 'Check soil root zone moisture and assess irrigation windows.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Alerts & Recently Viewed Locations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Active Weather Alerts */}
        <div className="md:col-span-7">
          <Card
            title="Active Weather Bulletins & Notices"
            subtitle="Statutory meteorological warnings and automated environmental advisories"
            icon={ShieldAlert}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/alerts')}>
                <span>View All ({SAMPLE_ALERTS.length})</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            {latestAlert && (
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{latestAlert.title}</span>
                  </div>
                  <Badge variant="amber" size="sm">OFFICIAL WARNING</Badge>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {latestAlert.description}
                </p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between">
                  <span>Region: <strong>{latestAlert.region}</strong></span>
                  <span>Authority: {latestAlert.source}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Recently Viewed Locations */}
        <div className="md:col-span-5">
          <Card
            title="Recently Viewed Stations"
            subtitle="Quick switch between monitored geographic centroids"
            icon={MapPin}
          >
            <div className="space-y-2">
              {recentLocations.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => selectLocation(loc)}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                    loc.name === currentLocation.name
                      ? 'border-weather-500 bg-weather-50/40 dark:bg-weather-950/30 text-weather-900 dark:text-weather-200 font-semibold'
                      : 'border-slate-100 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-weather-500 shrink-0" />
                    <div>
                      <div>{loc.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{loc.region || loc.country}</div>
                    </div>
                  </div>
                  {loc.name === currentLocation.name && (
                    <span className="text-[10px] text-weather-600 dark:text-weather-400 font-bold uppercase tracking-wide">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
