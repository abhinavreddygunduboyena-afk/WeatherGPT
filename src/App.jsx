import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { WeatherProvider } from './contexts/WeatherContext';
import { EnergyProvider } from './contexts/EnergyContext';
import { FarmerProvider } from './contexts/FarmerContext';
import AppLayout from './components/layout/AppLayout';
import OverviewPage from './pages/OverviewPage';
import WeatherPage from './pages/WeatherPage';
import EnergyPage from './pages/EnergyPage';
import FarmerPage from './pages/FarmerPage';
import SavedLocationsPage from './pages/SavedLocationsPage';
import ProjectsPage from './pages/ProjectsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <WeatherProvider>
        <EnergyProvider>
          <FarmerProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<OverviewPage />} />
                  <Route path="weather" element={<WeatherPage />} />
                  <Route path="energy" element={<EnergyPage />} />
                  <Route path="farmer" element={<FarmerPage />} />
                  <Route path="saved-locations" element={<SavedLocationsPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </FarmerProvider>
        </EnergyProvider>
      </WeatherProvider>
    </ThemeProvider>
  );
}
