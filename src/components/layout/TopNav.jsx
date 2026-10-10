import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sun, Moon, Search, Bell, Menu, CloudSun, Zap, Sprout, 
  MapPin, User, ChevronDown, Check, Sparkles, AlertCircle, X, RefreshCw 
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useWeather } from '../../contexts/WeatherContext';
import { searchLocations } from '../../services/weatherService';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function TopNav({ onOpenMobileSidebar, onOpenNotifications }) {
  const { theme, toggleTheme } = useTheme();
  const { currentLocation, selectLocation } = useWeather();
  const location = useLocation();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // User Profile Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Determine active mode
  const isWeatherMode = location.pathname.startsWith('/weather');
  const isEnergyMode = location.pathname.startsWith('/energy');
  const isFarmerMode = location.pathname.startsWith('/farmer');

  // Breadcrumb generation
  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/': return 'Overview Dashboard';
      case '/weather': return 'Weather Intelligence';
      case '/energy': return 'Energy Intelligence';
      case '/farmer': return 'Farmer Intelligence';
      case '/saved-locations': return 'Saved Locations';
      case '/projects': return 'Energy Projects';
      case '/alerts': return 'Weather & Hazard Alerts';
      case '/settings': return 'System Settings';
      default: return 'WeatherGPT';
    }
  };

  // Debounced search with loading, error, and empty result handling
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        if (results?.networkError) {
          setSearchError(results.networkError);
        } else {
          setSearchError(null);
        }
      } catch (err) {
        setSearchError(err.message || 'Error searching locations');
      } finally {
        setIsSearching(false);
        setIsSearchOpen(true);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc) => {
    selectLocation(loc);
    setIsSearchOpen(false);
    setSearchQuery('');
    if (!isWeatherMode && !isFarmerMode && !isEnergyMode && location.pathname !== '/') {
      navigate('/weather');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 transition-colors">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-navy-800 lg:hidden transition-colors"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
              WeatherGPT Console
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {getBreadcrumb()}
            </h1>
          </div>
        </div>

        {/* Center: Search Field */}
        <div ref={searchContainerRef} className="relative hidden md:block flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search worldwide cities or study regions..."
              className="w-full bg-slate-100 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-weather-500/20 focus:border-weather-500 transition-all"
            />
            {isSearching && (
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 animate-spin">
                ⏳
              </span>
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-navy-850 rounded-xl shadow-xl border border-slate-200 dark:border-navy-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto">
              {isSearching ? (
                <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-weather-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Searching Open-Meteo worldwide locations...</span>
                </div>
              ) : searchError ? (
                <div className="px-4 py-3 text-xs text-rose-600 dark:text-rose-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Geocoding search failed: {searchError}</span>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      Showing matching offline saved cities:
                    </div>
                  )}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-4 text-xs text-center text-slate-500 dark:text-slate-400">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    No locations found for "{searchQuery}"
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Check your spelling or search for a major nearby city.
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-3.5 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Worldwide Results Matching "{searchQuery}"
                  </div>
                  {searchResults.map((res) => (
                    <button
                      key={res.id || `${res.name}-${res.lat}`}
                      onClick={() => handleSelectLocation(res)}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-weather-500 shrink-0" />
                        <div>
                          <span className="font-semibold">{res.name}</span>
                          {res.region && <span className="text-slate-400 ml-1">({res.region})</span>}
                          {res.country && <span className="text-slate-400 ml-1">, {res.country}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {res.timezone && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-navy-800 px-1.5 py-0.5 rounded">
                            {res.timezone}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {res.lat?.toFixed(2)}°, {res.lon?.toFixed(2)}°
                        </span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Search Button */}
          <button
            onClick={() => {
              setIsMobileSearchOpen(!isMobileSearchOpen);
              if (!isMobileSearchOpen) {
                setIsSearchOpen(true);
              }
            }}
            className="p-2 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors md:hidden"
            aria-label="Toggle mobile search"
            title="Search worldwide cities"
          >
            {isMobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Mode Switcher */}
          <div className="hidden sm:flex items-center p-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-xs">
            <button
              onClick={() => navigate('/weather')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                isWeatherMode
                  ? 'bg-weather-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>Weather</span>
            </button>
            <button
              onClick={() => navigate('/energy')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                isEnergyMode
                  ? 'bg-energy-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Energy</span>
            </button>
            <button
              onClick={() => navigate('/farmer')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                isFarmerMode
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Farmer</span>
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Panel Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="View system notifications"
            title="Notifications & Hazard Bulletins"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          {/* User Profile */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="User Profile & Station Config"
          >
            <div className="w-6 h-6 rounded-full bg-weather-600 text-white flex items-center justify-center text-xs font-bold">
              ENG
            </div>
            <span className="hidden xl:inline text-xs font-semibold">Engineering Lead</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay / Drawer */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border-t border-slate-200 dark:border-navy-800 animate-in fade-in slide-in-from-top-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search worldwide cities (e.g. London, Tokyo)..."
              autoFocus
              className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-weather-500/20 focus:border-weather-500"
            />
            {isSearching && (
              <span className="absolute right-3 top-2.5 text-xs text-slate-400">⏳</span>
            )}
          </div>

          {/* Mobile Autocomplete Results */}
          {isSearchOpen && searchQuery.trim().length >= 2 && (
            <div className="mt-2 bg-white dark:bg-navy-900 rounded-lg border border-slate-200 dark:border-navy-700 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800 shadow-md">
              {isSearching ? (
                <div className="p-3 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-weather-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Searching Open-Meteo worldwide...</span>
                </div>
              ) : searchError ? (
                <div className="p-3 text-xs text-rose-600 dark:text-rose-400">
                  <p className="font-semibold">Network error connecting to geocoding API.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{searchError}</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 dark:text-slate-400 text-center">
                  No matching locations found for "{searchQuery}".
                </div>
              ) : (
                searchResults.map((res) => (
                  <button
                    key={res.id || `${res.name}-${res.lat}`}
                    onClick={() => {
                      handleSelectLocation(res);
                      setIsMobileSearchOpen(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{res.name}</span>
                      {res.region && <span className="text-slate-400 ml-1">({res.region})</span>}
                      {res.country && <span className="text-slate-400 ml-1">, {res.country}</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {res.lat?.toFixed(1)}°, {res.lon?.toFixed(1)}°
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* User Profile Information Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Engineering Workspace Profile"
        subtitle="Platform deployment credentials and telemetry authorization"
        maxWidth="max-w-md"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setIsProfileModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
            <div className="w-10 h-10 rounded-full bg-weather-600 text-white flex items-center justify-center font-bold text-sm">
              ENG
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Lead Environmental Engineer</h4>
              <p className="text-slate-400">Decision Support & Feasibility Division</p>
            </div>
          </div>

          <div className="space-y-2 divide-y divide-slate-100 dark:divide-navy-800">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Organization:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">WeatherGPT Engineering Demo</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Current Station:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentLocation.name}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Weather Telemetry:</span>
              <span className="font-semibold text-emerald-600">Open-Meteo High-Res API (Active)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Database Backend:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Local Cache / Demo Synchronizer</span>
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
}
