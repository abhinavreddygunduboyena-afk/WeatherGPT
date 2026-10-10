import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useWeather } from './WeatherContext';
import { generateFarmingAdvisory } from '../services/farmingAdvisoryService';
import { CROPS_CATALOG, SOIL_TYPES, IRRIGATION_METHODS, AREA_UNITS } from '../data/cropsData';

const FarmerContext = createContext();

const DEFAULT_FARM_PROFILE = {
  cropId: 'rice',
  stageId: 'vegetative',
  soilId: 'black_clay',
  irrigationId: 'flood',
  farmArea: '5',
  areaUnit: 'Acres'
};

export function FarmerProvider({ children }) {
  const { weatherData, refreshWeather, isLoading: isWeatherLoading } = useWeather();

  const [farmProfile, setFarmProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('weathergpt_farm_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_FARM_PROFILE;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTimestamp, setAnalysisTimestamp] = useState(() => new Date().toISOString());

  // Save profile to localStorage on change
  const updateFarmProfile = (newProfile) => {
    setFarmProfile(prev => {
      const updated = { ...prev, ...newProfile };
      try {
        localStorage.setItem('weathergpt_farm_profile', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Generate real-time agronomic advisories based on weather & profile
  const farmingAdvisory = useMemo(() => {
    if (!weatherData) return null;
    return generateFarmingAdvisory(weatherData, farmProfile);
  }, [weatherData, farmProfile, analysisTimestamp]);

  // "Analyze My Farm" action
  const analyzeFarm = async () => {
    setIsAnalyzing(true);
    refreshWeather();
    await new Promise(resolve => setTimeout(resolve, 600));
    setAnalysisTimestamp(new Date().toISOString());
    setIsAnalyzing(false);
  };

  return (
    <FarmerContext.Provider value={{
      farmProfile,
      updateFarmProfile,
      farmingAdvisory,
      advisory: farmingAdvisory,
      analyzeFarm,
      isAnalyzing: isAnalyzing || isWeatherLoading,
      cropsCatalog: CROPS_CATALOG,
      soilTypes: SOIL_TYPES,
      irrigationMethods: IRRIGATION_METHODS,
      areaUnits: AREA_UNITS
    }}>
      {children}
    </FarmerContext.Provider>
  );
}

export function useFarmer() {
  const context = useContext(FarmerContext);
  if (!context) {
    throw new Error('useFarmer must be used within a FarmerProvider');
  }
  return context;
}
