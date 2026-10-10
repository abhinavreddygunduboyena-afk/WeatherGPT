import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_LOCATIONS, SAMPLE_FALLBACK_WEATHER } from '../data/defaultLocations';
import { fetchWeatherData } from '../services/weatherService';

const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const stored = localStorage.getItem('weathergpt_active_location');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_LOCATIONS[0]; // Hyderabad default
  });

  const [weatherData, setWeatherData] = useState(SAMPLE_FALLBACK_WEATHER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState(() => {
    try {
      return localStorage.getItem('weathergpt_unit') || 'C';
    } catch (e) {
      return 'C';
    }
  });

  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const stored = localStorage.getItem('weathergpt_saved_locations');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [DEFAULT_LOCATIONS[0], DEFAULT_LOCATIONS[1], DEFAULT_LOCATIONS[2]];
  });

  const [recentLocations, setRecentLocations] = useState(() => {
    try {
      const stored = localStorage.getItem('weathergpt_recent_locations');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [DEFAULT_LOCATIONS[0], DEFAULT_LOCATIONS[1]];
  });

  // Load weather when location changes or on refresh
  const loadWeather = useCallback(async (location, bypassCache = false) => {
    if (!location) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(
        location.lat, 
        location.lon, 
        location.name, 
        location.timezone || 'auto',
        bypassCache
      );
      setWeatherData(data);
      if (data.fetchError) {
        setError(data.fetchError);
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Unable to connect to Open-Meteo weather service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(currentLocation, false);
  }, [currentLocation, loadWeather]);

  const selectLocation = (location) => {
    setCurrentLocation(location);
    try {
      localStorage.setItem('weathergpt_active_location', JSON.stringify(location));
      setRecentLocations(prev => {
        const filtered = prev.filter(p => p.name !== location.name);
        const updated = [location, ...filtered].slice(0, 5);
        localStorage.setItem('weathergpt_recent_locations', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {}
  };

  const refreshWeather = () => {
    loadWeather(currentLocation, true);
  };

  const retryWeather = () => {
    loadWeather(currentLocation, true);
  };

  const toggleUnit = () => {
    setUnit(prev => {
      const next = prev === 'C' ? 'F' : 'C';
      try { localStorage.setItem('weathergpt_unit', next); } catch (e) {}
      return next;
    });
  };

  const saveLocation = (loc) => {
    setSavedLocations(prev => {
      if (prev.some(p => p.name === loc.name)) return prev;
      const updated = [...prev, loc];
      try { localStorage.setItem('weathergpt_saved_locations', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const removeLocation = (locName) => {
    setSavedLocations(prev => {
      const updated = prev.filter(p => p.name !== locName);
      try { localStorage.setItem('weathergpt_saved_locations', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const isSaved = (locName) => {
    return savedLocations.some(p => p.name === locName);
  };

  return (
    <WeatherContext.Provider
      value={{
        currentLocation,
        weatherData,
        isLoading,
        error,
        unit,
        savedLocations,
        recentLocations,
        selectLocation,
        refreshWeather,
        retryWeather,
        toggleUnit,
        saveLocation,
        removeLocation,
        isSaved
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
