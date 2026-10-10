import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, Clock, MapPin, ArrowRight, ShieldAlert, CloudRain, Car, 
  RefreshCw, AlertTriangle, ExternalLink, ShieldCheck, CheckCircle2, 
  HelpCircle, Compass, Wind, Info, Search, AlertCircle, Calendar,
  Thermometer, Sparkles, Shield, Cpu, Gauge, AlertOctagon, Split
} from 'lucide-react';
import { 
  generateTravelCorridorWithLiveWeather, 
  fetchOfficialWarnings 
} from '../../services/geoService';
import { fetchTravelRecommendations } from '../../services/travelAdvisorService';
import { getRouteRoadIncidents, evaluateAlternativeRoute, INCIDENT_STATUS } from '../../services/roadIncidentService';
import { searchLocations } from '../../services/weatherService';
import LeafletMap from '../maps/LeafletMap';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function TravelAdvisor() {
  // Route selection inputs
  const [originInput, setOriginInput] = useState('Hyderabad, Telangana');
  const [originCoords, setOriginCoords] = useState({ lat: 17.3850, lon: 78.4867 });
  const [destInput, setDestInput] = useState('Vijayawada, Andhra Pradesh');
  const [destCoords, setDestCoords] = useState({ lat: 16.5062, lon: 80.6480 });
  const [departureDate, setDepartureDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [departureTime, setDepartureTime] = useState('07:30');

  // Autocomplete states
  const [originResults, setOriginResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Computation states
  const [isLoading, setIsLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [travelRecommendations, setTravelRecommendations] = useState(null);
  const [officialWarnings, setOfficialWarnings] = useState(null);
  const [roadIncidents, setRoadIncidents] = useState(null);
  const [showAlternativeRoute, setShowAlternativeRoute] = useState(false);
  const [activeIncidentTab, setActiveIncidentTab] = useState('all'); // 'all', 'closures', 'roadworks'

  const originRef = useRef(null);
  const destRef = useRef(null);

  // Compute route on initial mount
  useEffect(() => {
    executeRouteAnalysis(originInput, originCoords, destInput, destCoords, departureTime, departureDate);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (originRef.current && !originRef.current.contains(e.target)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Search Origin
  const handleOriginSearch = async (val) => {
    setOriginInput(val);
    if (val.trim().length >= 2) {
      setIsSearchingOrigin(true);
      setShowOriginDropdown(true);
      const res = await searchLocations(val);
      setOriginResults(res);
      setIsSearchingOrigin(false);
    } else {
      setOriginResults([]);
    }
  };

  // Search Destination
  const handleDestSearch = async (val) => {
    setDestInput(val);
    if (val.trim().length >= 2) {
      setIsSearchingDest(true);
      setShowDestDropdown(true);
      const res = await searchLocations(val);
      setDestResults(res);
      setIsSearchingDest(false);
    } else {
      setDestResults([]);
    }
  };

  const selectOrigin = (item) => {
    const name = `${item.name}${item.region ? `, ${item.region}` : ''}`;
    setOriginInput(name);
    setOriginCoords({ lat: item.lat, lon: item.lon });
    setShowOriginDropdown(false);
  };

  const selectDest = (item) => {
    const name = `${item.name}${item.region ? `, ${item.region}` : ''}`;
    setDestInput(name);
    setDestCoords({ lat: item.lat, lon: item.lon });
    setShowDestDropdown(false);
  };

  const executeRouteAnalysis = async (origName, origC, destN, destC, depTime, depDate) => {
    setIsLoading(true);
    setRouteError(null);

    try {
      const activeDate = depDate || departureDate;
      // 1. Fetch Driving Route & Live Weather along corridor with exact ETA hourly forecast matching
      const corridorResult = await generateTravelCorridorWithLiveWeather(
        origName,
        origC,
        destN,
        destC,
        depTime,
        activeDate
      );
      setRouteData(corridorResult);

      // 2. Fetch Live Road Closures & Roadworks (TomTom Traffic Incidents v5 backend proxy)
      const incidentsResult = await getRouteRoadIncidents(corridorResult.polyline, `${origName} to ${destN}`);
      setRoadIncidents(incidentsResult);

      // 3. Fetch Weather-Based Travel Recommendations
      const recommendations = await fetchTravelRecommendations(
        corridorResult,
        activeDate,
        depTime
      );
      setTravelRecommendations(recommendations);

      // 4. Fetch Official Meteorological & Highway Warnings (IMD)
      const warningsResult = await fetchOfficialWarnings();
      setOfficialWarnings(warningsResult);

    } catch (err) {
      console.error('[TravelAdvisor] Computation error:', err);
      setRouteError(err.message || 'Unable to compute driving corridor. Please check connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    executeRouteAnalysis(originInput, originCoords, destInput, destCoords, departureTime, departureDate);
  };

  const setPreset = (origName, origC, destN, destC) => {
    setOriginInput(origName);
    setOriginCoords(origC);
    setDestInput(destN);
    setDestCoords(destC);
    executeRouteAnalysis(origName, origC, destN, destC, departureTime, departureDate);
  };

  // Alternative route detour evaluation
  const alternativeEvaluation = (routeData?.alternativeRoute && roadIncidents)
    ? evaluateAlternativeRoute(routeData, routeData.alternativeRoute, roadIncidents.closures)
    : null;

  // Build Leaflet map markers
  const mapMarkers = [];
  if (routeData?.checkpoints) {
    routeData.checkpoints.forEach((cp, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === routeData.checkpoints.length - 1;
      mapMarkers.push({
        id: `cp-${idx}`,
        name: cp.name,
        lat: cp.lat,
        lon: cp.lon,
        color: isStart ? '#10b981' : isEnd ? '#ef4444' : '#0284c7',
        isHighlighted: isStart || isEnd,
        temp: cp.temp != null ? `${cp.temp}°C` : '--',
        condition: cp.condition,
        eta: cp.eta,
        details: `${cp.rainProb != null ? `${cp.rainProb}% rain prob` : 'No data'} | ${cp.roadCondition}`
      });
    });
  }

  // Include Road Incidents & Closures as distinct markers on the map
  if (roadIncidents?.incidents && roadIncidents.incidents.length > 0) {
    roadIncidents.incidents.forEach((inc, idx) => {
      mapMarkers.push({
        id: `inc-${idx}`,
        name: `${inc.typeLabel}: ${inc.roadName}`,
        lat: inc.lat,
        lon: inc.lon,
        iconType: inc.isClosure ? 'closure' : inc.isRoadWorks ? 'roadworks' : 'hazard',
        typeBadge: inc.typeLabel,
        typeBadgeColor: inc.isClosure ? '#fee2e2' : inc.isRoadWorks ? '#fef3c7' : '#e0f2fe',
        typeBadgeTextColor: inc.isClosure ? '#991b1b' : inc.isRoadWorks ? '#92400e' : '#0369a1',
        details: inc.description,
        timing: inc.startTime 
          ? `From: ${new Date(inc.startTime).toLocaleDateString()} ${new Date(inc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${inc.endTime ? ` • Until: ${new Date(inc.endTime).toLocaleDateString()} ${new Date(inc.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' • Until: Not specified'}` 
          : null
      });
    });
  }

  // Filtered incidents for list display
  const displayedIncidents = (roadIncidents?.incidents || []).filter(inc => {
    if (activeIncidentTab === 'closures') return inc.isClosure;
    if (activeIncidentTab === 'roadworks') return inc.isRoadWorks;
    return true;
  });

  return (
    <Card
      title="Travel Corridor Weather & Traffic Advisor"
      subtitle="Evaluates driving geometry, ETA microclimates, road closures, roadworks, and alternative detours"
      icon={Navigation}
    >
      {/* Search & Configuration Form */}
      <form onSubmit={handleFormSubmit} className="mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {/* Origin Input */}
        <div ref={originRef} className="lg:col-span-3 relative">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Origin Location
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={originInput}
              onChange={(e) => handleOriginSearch(e.target.value)}
              onFocus={() => setShowOriginDropdown(true)}
              className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-weather-500"
              placeholder="Search origin city..."
            />
            {isSearchingOrigin && (
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 animate-spin">⏳</span>
            )}
          </div>

          {showOriginDropdown && originResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
              {originResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectOrigin(r)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center justify-between text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-navy-800 last:border-none"
                >
                  <span className="font-semibold">{r.name} <span className="text-slate-400 font-normal">({r.region || r.country})</span></span>
                  <span className="text-[10px] text-slate-400 font-mono">{r.lat.toFixed(2)}°, {r.lon.toFixed(2)}°</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div ref={destRef} className="lg:col-span-3 relative">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Destination Location
          </label>
          <div className="relative">
            <Navigation className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={destInput}
              onChange={(e) => handleDestSearch(e.target.value)}
              onFocus={() => setShowDestDropdown(true)}
              className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-weather-500"
              placeholder="Search destination city..."
            />
            {isSearchingDest && (
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 animate-spin">⏳</span>
            )}
          </div>

          {showDestDropdown && destResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
              {destResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDest(r)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center justify-between text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-navy-800 last:border-none"
                >
                  <span className="font-semibold">{r.name} <span className="text-slate-400 font-normal">({r.region || r.country})</span></span>
                  <span className="text-[10px] text-slate-400 font-mono">{r.lat.toFixed(2)}°, {r.lon.toFixed(2)}°</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Departure Date */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-weather-500" />
            Departure Date
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-weather-500"
          />
        </div>

        {/* Departure Time */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-weather-500" />
            Departure Time
          </label>
          <input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-weather-500"
          />
        </div>

        {/* Submit Button */}
        <div className="lg:col-span-2">
          <Button 
            type="submit" 
            size="md" 
            className="w-full" 
            loading={isLoading}
            disabled={isLoading}
          >
            Calculate Route
          </Button>
        </div>
      </form>

      {/* Quick Corridor Presets */}
      <div className="flex items-center gap-2 mb-5 text-xs text-slate-500 overflow-x-auto pb-1">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Presets:</span>
        <button
          type="button"
          onClick={() => setPreset('Hyderabad, Telangana', { lat: 17.3850, lon: 78.4867 }, 'Vijayawada, Andhra Pradesh', { lat: 16.5062, lon: 80.6480 })}
          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-navy-700 whitespace-nowrap transition-colors"
        >
          Hyderabad → Vijayawada (NH-65)
        </button>
        <button
          type="button"
          onClick={() => setPreset('Hyderabad, Telangana', { lat: 17.3850, lon: 78.4867 }, 'Bangalore, Karnataka', { lat: 12.9716, lon: 77.5946 })}
          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-navy-700 whitespace-nowrap transition-colors"
        >
          Hyderabad → Bangalore (NH-44)
        </button>
        <button
          type="button"
          onClick={() => setPreset('Mumbai, Maharashtra', { lat: 19.0760, lon: 72.8777 }, 'Pune, Maharashtra', { lat: 18.5204, lon: 73.8567 })}
          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-navy-700 whitespace-nowrap transition-colors"
        >
          Mumbai → Pune (Expressway)
        </button>
        <button
          type="button"
          onClick={() => setPreset('London, UK', { lat: 51.5074, lon: -0.1278 }, 'Oxford, UK', { lat: 51.7520, lon: -1.2577 })}
          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-navy-700 whitespace-nowrap transition-colors"
        >
          London → Oxford (M40)
        </button>
      </div>

      {/* Error State with Retry Button */}
      {routeError && (
        <div className="p-4 mb-5 rounded-xl border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 text-xs flex items-start justify-between gap-3 text-red-800 dark:text-red-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Driving Route Computation Failed</p>
              <p className="mt-0.5">{routeError}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleFormSubmit}
            className="text-red-900 dark:text-red-100 border-red-300 dark:border-red-800"
          >
            Retry Request
          </Button>
        </div>
      )}

      {/* SECTION A: ROUTE SUMMARY & INTERACTIVE MAP */}
      {routeData && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/60 dark:bg-navy-850/60 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-weather-600 dark:text-weather-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  Total Driving Distance: <strong>{routeData.totalDistanceKm} km</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-weather-600 dark:text-weather-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  Estimated Transit Time: <strong>~{routeData.estimatedDriveTimeHours} hours</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {routeData.alternativeRoute && (
                <button
                  type="button"
                  onClick={() => setShowAlternativeRoute(!showAlternativeRoute)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border flex items-center gap-1.5 transition-colors ${
                    showAlternativeRoute
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-navy-800 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700 hover:bg-teal-50'
                  }`}
                >
                  <Split className="w-3 h-3" />
                  {showAlternativeRoute ? 'Hide Detour on Map' : 'View Detour (+Alternative Route)'}
                </button>
              )}

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Routing Provider:</span>
                <Badge variant={routeData.isOrsKeyConfigured ? 'teal' : 'blue'} size="sm">
                  {routeData.provider}
                </Badge>
              </div>
            </div>
          </div>

          {/* Interactive Leaflet Route Map */}
          <div>
            <div className="flex flex-wrap items-center justify-between mb-2 text-xs gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-weather-500" />
                Driving Route Geometry, Weather Waypoints & Road Incidents
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Green = Origin • Red = Destination • Blue = Checkpoints</span>
                <span className="text-red-500 font-bold">⛔ Road Closed</span>
                <span className="text-amber-500 font-bold">🚧 Roadworks</span>
                {showAlternativeRoute && <span className="text-teal-500 font-bold">--- Detour</span>}
              </div>
            </div>

            <LeafletMap
              center={[originCoords.lat, originCoords.lon]}
              zoom={8}
              polyline={routeData.polyline}
              polylineColor="#0284c7"
              alternativePolyline={showAlternativeRoute && routeData?.alternativeRoute?.coordinates ? routeData.alternativeRoute.coordinates : null}
              alternativePolylineColor="#0d9488"
              markers={mapMarkers}
              className="h-84 w-full"
            />
          </div>

          {/* SECTION B: WEATHER ALONG THE ROUTE */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-weather-500" />
                Representative Corridor Atmospheric Observations
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Model: Open-Meteo High-Resolution NWP</span>
                <span className="text-slate-500 font-mono">({departureDate})</span>
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-navy-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-850 uppercase text-[10px] text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-800">
                  <tr>
                    <th className="px-3.5 py-3">Corridor Checkpoint</th>
                    <th className="px-3 py-3">Est. Arrival & Timezone</th>
                    <th className="px-3 py-3">Temperature</th>
                    <th className="px-3 py-3">Condition</th>
                    <th className="px-3 py-3">Rain Probability</th>
                    <th className="px-3 py-3">Wind Speed</th>
                    <th className="px-3.5 py-3">Road Surface Status</th>
                    <th className="px-3 py-3">Data Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80">
                  {routeData.checkpoints.map((pt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors">
                      <td className="px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        {pt.name}
                        <div className="text-[10px] text-slate-400">+{pt.distanceFromOrigin} km mark</div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 font-mono font-medium">
                        {pt.eta} <span className="text-[10px] text-slate-400 font-sans">({pt.timezoneAbbr || pt.timezone || 'Local'})</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-800 dark:text-slate-200 font-bold">
                        {pt.temp != null ? `${pt.temp}°C` : '--'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                        {pt.condition}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`font-semibold ${pt.rainProb > 40 ? 'text-blue-500' : 'text-slate-500'}`}>
                          {pt.rainProb != null ? `${pt.rainProb}%` : '--'} {pt.precipitationMm > 0 ? `(${pt.precipitationMm} mm)` : ''}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {pt.windSpeed != null ? `${pt.windSpeed} km/h` : '--'} {pt.windDirectionText}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          pt.roadCondition.includes('Wet') || pt.roadCondition.includes('Damp')
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : pt.roadCondition.includes('Thermal')
                              ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                              : pt.roadCondition.includes('Unavailable')
                                ? 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400 border border-slate-300 dark:border-navy-700'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {pt.roadCondition}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={pt.isLive ? 'teal' : pt.isStale ? 'amber' : 'rose'} size="sm">
                          {pt.isLive ? 'Live NWP' : pt.isStale ? 'Cached' : 'Unavailable'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION C: ROAD CLOSURES, ROADWORKS & INCIDENTS (TOMTOM TELEMATICS) */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Live Road Closures, Roadworks & Traffic Incidents
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    roadIncidents?.status === INCIDENT_STATUS.CONFIRMED_CLOSURE
                      ? 'rose'
                      : roadIncidents?.isConfigured
                        ? 'teal'
                        : 'amber'
                  } 
                  size="sm"
                >
                  {roadIncidents?.statusLabel || 'Feed Unconfigured'}
                </Badge>
                <span className="text-[11px] text-slate-400">
                  Source: TomTom Traffic Services (v5)
                </span>
              </div>
            </div>

            {/* UNCONFIGURED FEED STATE WITH CLEAR SETUP INSTRUCTIONS */}
            {!roadIncidents?.isConfigured ? (
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-900 dark:text-amber-200">
                      TomTom Traffic Incidents Feed Not Configured (Live Data Unavailable)
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      To display verified live road closures, active lane restrictions, and scheduled roadworks along Indian corridors, configure the free TomTom Traffic Incidents API in your backend.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/70 dark:bg-navy-900/70 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    How to enable live telematics in 4 simple steps:
                  </span>
                  <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Register a free developer account at <a href="https://developer.tomtom.com/" target="_blank" rel="noopener noreferrer" className="text-weather-600 dark:text-weather-400 underline font-medium">developer.tomtom.com</a> (includes 2,500 free daily requests with India highway coverage).</li>
                    <li>Create an application in your dashboard to generate your API key.</li>
                    <li>Add <code className="bg-slate-100 dark:bg-navy-800 px-1 py-0.5 rounded font-mono text-slate-800 dark:text-slate-200">TOMTOM_API_KEY=your_key_here</code> to your <code className="font-mono">server/.env</code> file.</li>
                    <li>Restart the backend server (<code className="font-mono">cmd /c "node server/src/index.js"</code>).</li>
                  </ol>
                </div>

                <div className="text-[11px] text-amber-800/80 dark:text-amber-400/80 italic flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    <strong>Strict Safety Integrity Mandate:</strong> Because live telematics credentials are unconfigured, WeatherGPT strictly does not invent road closures or construction schedules. Absence of data must NOT be interpreted as proof that every road is unobstructed.
                  </span>
                </div>
              </div>
            ) : roadIncidents?.incidents?.length === 0 ? (
              /* CONFIG CONNECTED BUT 0 INCIDENTS REPORTED */
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No Road Closures or Roadworks Currently Reported by TomTom</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  The TomTom Traffic Incidents engine analyzed a 1 km buffer along the route corridor and returned 0 active closures or major roadworks at this time (checked: {new Date(roadIncidents.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                  Note: Zero reported incidents does not guarantee that every municipal road is free from sudden uncatalogued police diversions or localized obstructions. Drive vigilantly.
                </p>
              </div>
            ) : (
              /* LIVE INCIDENTS REPORTED */
              <div className="space-y-3">
                {/* Category Filter Pills */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveIncidentTab('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                      activeIncidentTab === 'all'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent'
                        : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-700'
                    }`}
                  >
                    All Incidents ({roadIncidents.incidents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIncidentTab('closures')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                      activeIncidentTab === 'closures'
                        ? 'bg-red-600 text-white border-transparent'
                        : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-700'
                    }`}
                  >
                    Road Closures ({roadIncidents.closures.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIncidentTab('roadworks')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                      activeIncidentTab === 'roadworks'
                        ? 'bg-amber-600 text-white border-transparent'
                        : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-700'
                    }`}
                  >
                    Roadworks ({roadIncidents.roadWorks.length})
                  </button>
                </div>

                {/* List of matched incidents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayedIncidents.map((inc, iIdx) => (
                    <div
                      key={iIdx}
                      className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                        inc.isClosure
                          ? 'border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20'
                          : inc.isRoadWorks
                            ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20'
                            : 'border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {inc.isClosure ? '⛔' : inc.isRoadWorks ? '🚧' : '⚠️'} {inc.roadName}
                        </span>
                        <Badge variant={inc.isClosure ? 'rose' : inc.isRoadWorks ? 'amber' : 'slate'} size="sm">
                          {inc.typeLabel}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {inc.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-navy-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Severity: <strong>{inc.severity}</strong></span>
                        {inc.startTime && (
                          <span>
                            From: {new Date(inc.startTime).toLocaleDateString()} {new Date(inc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {inc.endTime ? ` • Until: ${new Date(inc.endTime).toLocaleDateString()}` : ' • Until: Not specified'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ALTERNATIVE ROUTE COMPARISON (REQUIREMENT 4) */}
            {alternativeEvaluation && (
              <div className="mt-3 p-3.5 rounded-lg border border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-teal-950 dark:text-teal-200">
                    <Split className="w-4 h-4 text-teal-600" />
                    <span>Alternative Route Geometry & Detour Comparison</span>
                  </div>
                  <Badge variant={alternativeEvaluation.avoidsClosures ? 'teal' : 'amber'} size="sm">
                    {alternativeEvaluation.avoidsClosures ? 'Closure Bypassed' : 'Detour Also Affected'}
                  </Badge>
                </div>

                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {alternativeEvaluation.message}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-white dark:bg-navy-850 border border-slate-200/70 dark:border-navy-700">
                    <span className="text-[10px] text-slate-400 block">Main Route Distance</span>
                    <strong className="text-slate-800 dark:text-slate-200">{alternativeEvaluation.primaryDistanceKm} km</strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-navy-850 border border-slate-200/70 dark:border-navy-700">
                    <span className="text-[10px] text-slate-400 block">Detour Distance</span>
                    <strong className="text-slate-800 dark:text-slate-200">{alternativeEvaluation.altDistanceKm} km</strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-navy-850 border border-slate-200/70 dark:border-navy-700">
                    <span className="text-[10px] text-slate-400 block">Distance Delta</span>
                    <strong className={alternativeEvaluation.distanceDiffKm > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                      {alternativeEvaluation.distanceDiffKm > 0 ? `+${alternativeEvaluation.distanceDiffKm}` : alternativeEvaluation.distanceDiffKm} km
                    </strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-navy-850 border border-slate-200/70 dark:border-navy-700">
                    <span className="text-[10px] text-slate-400 block">Duration Delta</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {alternativeEvaluation.durationDiffHours > 0 ? `+${alternativeEvaluation.durationDiffHours}` : alternativeEvaluation.durationDiffHours} h
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowAlternativeRoute(!showAlternativeRoute)}
                    className="text-teal-700 dark:text-teal-300 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    {showAlternativeRoute ? 'Hide Detour Polyline on Map' : 'Show Detour Polyline on Map'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] text-slate-400">Calculated via OSRM / ORS alternative geometry</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION D: OFFICIAL METEOROLOGICAL WARNINGS (IMD) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Official Highway Warnings (IMD)
                  </h4>
                </div>
                <Badge variant={officialWarnings?.isConfigured ? 'teal' : 'amber'} size="sm">
                  {officialWarnings?.isConfigured ? 'Connected' : 'Auth Required'}
                </Badge>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 mt-2 leading-relaxed">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/60">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Issuing Authority:</span>
                    <span className="text-[11px] text-slate-500">Ministry of Earth Sciences</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {officialWarnings?.authority || 'India Meteorological Department (IMD)'}
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {officialWarnings?.message || 'Official IMD National Highway and District nowcasts require government authentication credentials registered with the Ministry of Earth Sciences Data Portal.'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Provenance: api.imd.gov.in</span>
              <a
                href="https://api.imd.gov.in/public/api_reference.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-weather-600 dark:text-weather-400 hover:underline flex items-center gap-1 font-semibold"
              >
                IMD API Specs
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* SECTION E: WEATHER-BASED TRAVEL RECOMMENDATIONS */}
          {travelRecommendations && (
            <div className="p-5 rounded-xl border border-weather-500/25 dark:border-weather-500/25 bg-white dark:bg-navy-900 shadow-sm space-y-5">
              {/* Header with Attribution Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-weather-600 dark:text-weather-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Weather-Based Travel Recommendations
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      travelRecommendations.feasibility === 'FAVORABLE' 
                        ? 'teal' 
                        : travelRecommendations.feasibility === 'CAUTION_ADVISED' 
                          ? 'amber' 
                          : 'rose'
                    }
                    size="sm"
                  >
                    {travelRecommendations.feasibilityLabel || travelRecommendations.feasibility}
                  </Badge>

                  <Badge variant={travelRecommendations.isLlm ? 'teal' : 'blue'} size="sm">
                    {travelRecommendations.isLlm ? (
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Explanation (Google Gemini)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        Rule-Based Advisory Engine (Open-Meteo NWP)
                      </span>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Overall Summary */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/60">
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {travelRecommendations.summaryText}
                </p>
              </div>

              {/* Section Caution Highlights (if any) */}
              {travelRecommendations.cautionSections && travelRecommendations.cautionSections.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Route Segments Requiring Extra Caution:
                  </h4>
                  <div className="space-y-2">
                    {travelRecommendations.cautionSections.map((sec, sIdx) => (
                      <div key={sIdx} className="p-3 rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                          <span>{sec.location}</span>
                          <span className="text-[11px] text-slate-400 font-normal">{sec.metric}</span>
                        </div>
                        <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px]">{sec.reason}</p>
                        {sec.action && (
                          <p className="mt-1 text-weather-600 dark:text-weather-400 text-[11px] font-medium">
                            Action: {sec.action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Driving Impact Breakdown (Rain, Heat, Wind) */}
              <div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-weather-500" />
                  Specific Driving Impact Breakdown:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Rain Impact */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50 text-xs space-y-1">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <CloudRain className="w-3.5 h-3.5" /> Rain & Aquaplaning
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {travelRecommendations.drivingImpacts?.rainImpact || travelRecommendations.drivingImpacts?.rain}
                    </p>
                  </div>

                  {/* Heat Impact */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50 text-xs space-y-1">
                    <span className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <Thermometer className="w-3.5 h-3.5" /> Heat & Vehicle Stress
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {travelRecommendations.drivingImpacts?.heatImpact || travelRecommendations.drivingImpacts?.heat}
                    </p>
                  </div>

                  {/* Wind Impact */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50 text-xs space-y-1">
                    <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <Wind className="w-3.5 h-3.5" /> Crosswind Stability
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {travelRecommendations.drivingImpacts?.windImpact || travelRecommendations.drivingImpacts?.wind}
                    </p>
                  </div>
                </div>
              </div>

              {/* Departure Window Analysis (Alternative Departure Times) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-weather-500" />
                    Alternative Departure Time Analysis:
                  </h4>
                  <span className="text-[11px] text-slate-400">Evaluated across ±2 hours</span>
                </div>

                {travelRecommendations.departureWindows && travelRecommendations.departureWindows.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
                    {travelRecommendations.departureWindows.map((win, wIdx) => {
                      const isSelected = win.isPlanned;
                      const isRecommended = travelRecommendations.recommendedWindow?.offsetMins === win.offsetMins;
                      return (
                        <div
                          key={wIdx}
                          className={`p-2.5 rounded-lg border text-center transition-all ${
                            isSelected
                              ? 'border-weather-500 bg-weather-50/30 dark:bg-navy-800 ring-1 ring-weather-500'
                              : 'border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50'
                          }`}
                        >
                          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {win.label.split('(')[0].trim()}
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 my-0.5">
                            {win.windowTimeStr}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div>Peak: <strong>{win.maxTemp}°C</strong></div>
                            <div className={win.maxRainProb > 35 ? 'text-blue-500 font-semibold' : ''}>
                              Rain: {win.maxRainProb}%
                            </div>
                          </div>
                          {isSelected && (
                            <span className="mt-1 inline-block text-[9px] px-1 py-0.2 rounded bg-weather-500 text-white font-bold">
                              Planned
                            </span>
                          )}
                          {!isSelected && isRecommended && (
                            <span className="mt-1 inline-block text-[9px] px-1 py-0.2 rounded bg-emerald-500 text-white font-bold">
                              Better Window
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-navy-850 p-2.5 rounded-lg border border-slate-200/60 dark:border-navy-800">
                  <strong>Departure Guidance:</strong> {travelRecommendations.departureAdvice}
                </p>
              </div>

              {/* Actionable Practical Precautions */}
              {travelRecommendations.precautions && travelRecommendations.precautions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Practical Driver Safety Precautions:
                  </h4>
                  <ul className="space-y-1.5">
                    {travelRecommendations.precautions.map((prec, pIdx) => (
                      <li key={pIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-weather-500 font-bold">•</span>
                        <span>{prec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strict Disclaimer per Engineering Integrity Standard */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-navy-800 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Safety Integrity Mandate:</strong> {travelRecommendations.disclaimer} Weather risks, official statutory warnings, and road closure data are evaluated as distinct categories. Absence of road closure data must not be taken as confirmation that roads are unobstructed. Always adhere to on-road physical signage, highway patrol speed limits, and local police instructions.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
