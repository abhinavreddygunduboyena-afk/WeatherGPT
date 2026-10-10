import React, { useState, useEffect } from 'react';
import { X, Sprout, Check, Layers, Droplets, Ruler, HelpCircle, MapPin, Calendar } from 'lucide-react';
import { useFarmer } from '../../contexts/FarmerContext';
import { useWeather } from '../../contexts/WeatherContext';
import Button from '../common/Button';

export default function FarmProfileModal({ isOpen, onClose }) {
  const { 
    farmProfile, 
    updateFarmProfile, 
    cropsCatalog, 
    soilTypes, 
    irrigationMethods, 
    areaUnits 
  } = useFarmer();
  const { currentLocation, selectLocation, savedLocations } = useWeather();

  const [formData, setFormData] = useState(farmProfile);
  const [selectedLocName, setSelectedLocName] = useState(currentLocation?.name);

  useEffect(() => {
    setFormData(farmProfile);
    setSelectedLocName(currentLocation?.name);
  }, [farmProfile, currentLocation, isOpen]);

  if (!isOpen) return null;

  const currentCrop = cropsCatalog.find(c => c.id === formData.cropId) || cropsCatalog[0];

  const handleCropChange = (cropId) => {
    const selected = cropsCatalog.find(c => c.id === cropId);
    setFormData(prev => ({
      ...prev,
      cropId,
      stageId: selected?.stages[1]?.id || selected?.stages[0]?.id || 'vegetative'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedLocName && selectedLocName !== currentLocation?.name) {
      const match = savedLocations.find(l => l.name === selectedLocName);
      if (match) {
        selectLocation(match);
      }
    }
    updateFarmProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Farm & Crop Profile Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tailor weather alerts, irrigation schedules, and agronomic recommendations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Farm Location Selection */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Farm Location
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Current: {currentLocation?.name}
              </span>
            </div>
            <select
              value={selectedLocName}
              onChange={(e) => setSelectedLocName(e.target.value)}
              className="w-full bg-white dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={currentLocation?.name}>
                ✓ Active Weather Location: {currentLocation?.name} ({currentLocation?.country})
              </option>
              {savedLocations?.filter(l => l.name !== currentLocation?.name).map(loc => (
                <option key={loc.id || loc.name} value={loc.name}>
                  {loc.name} ({loc.region ? `${loc.region}, ` : ''}{loc.country})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Select any saved location or reuse the active weather location for live field telemetry.
            </p>
          </div>

          {/* 1. Crop Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Select Cultivated Crop
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {cropsCatalog.map(c => {
                const isSelected = formData.cropId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCropChange(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-navy-700/80 bg-slate-50/50 dark:bg-navy-850/60 hover:border-slate-300 dark:hover:border-navy-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-lg mb-1">
                      <span>{c.icon}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {c.localName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Growth Stage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Current Growth Stage ({currentCrop.name})
              </label>
              <span className="text-[11px] text-slate-400">
                Determines moisture & thermal sensitivity
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentCrop.stages.map(st => {
                const isSelected = formData.stageId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, stageId: st.id }))}
                    className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 font-medium'
                        : 'border-slate-200 dark:border-navy-700/80 hover:bg-slate-50 dark:hover:bg-navy-850 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{st.name}</div>
                      <div className="text-[10px] text-slate-400">Sensitivity: <strong className="text-emerald-600 dark:text-emerald-400 font-medium">{st.sensitivity}</strong> ({st.durationDays} days)</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Soil Type & Drainage */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Field Soil Type (If Known)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {soilTypes.map(st => {
                const isSelected = formData.soilId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, soilId: st.id }))}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-navy-700/80 hover:bg-slate-50 dark:hover:bg-navy-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{st.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{st.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Irrigation System & Farm Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Irrigation */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Irrigation Method
              </label>
              <select
                value={formData.irrigationId}
                onChange={(e) => setFormData(prev => ({ ...prev, irrigationId: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {irrigationMethods.map(im => (
                  <option key={im.id} value={im.id}>
                    {im.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Farm Area */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Farm Extent (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.farmArea || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, farmArea: e.target.value }))}
                  placeholder="e.g. 5"
                  className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={formData.areaUnit || 'Acres'}
                  onChange={(e) => setFormData(prev => ({ ...prev, areaUnit: e.target.value }))}
                  className="bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {areaUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 5. Optional Farming Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-navy-800">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Sowing / Planting Date (Optional)
              </label>
              <input
                type="date"
                value={formData.sowingDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sowingDate: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Seed Variety / Field Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.variety || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                placeholder="e.g. BPT 5204 (Samba Mahsuri), Hybrid-68"
                className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Save & Re-evaluate Farm
          </Button>
        </div>

      </div>
    </div>
  );
}
