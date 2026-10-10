import React, { useState } from 'react';
import { Sprout, Edit3, RefreshCw, MapPin, Layers, Droplets, Ruler, CheckCircle2 } from 'lucide-react';
import { useFarmer } from '../../contexts/FarmerContext';
import { useWeather } from '../../contexts/WeatherContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import FarmProfileModal from './FarmProfileModal';

export default function FarmProfileCard() {
  const { farmProfile, farmingAdvisory, analyzeFarm, isAnalyzing } = useFarmer();
  const { weatherData } = useWeather();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const crop = farmingAdvisory?.crop || { name: 'Rice (Paddy)', icon: '🌾' };
  const stage = farmingAdvisory?.stage || { name: 'Active Vegetative', sensitivity: 'Moderate' };
  const soilType = farmingAdvisory?.soilType || { name: 'Black Cotton / Clay' };
  const irrigation = farmingAdvisory?.irrigation || { name: 'Flood / Basin' };
  const loc = weatherData?.location || { name: 'Selected Farm' };

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm p-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Farm Profile Summary */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-2xl shrink-0 border border-emerald-500/20">
              {crop.icon || '🌾'}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {crop.name} Field
                </h2>
                <Badge variant="emerald" size="sm">
                  {stage.name}
                </Badge>
                {farmProfile.farmArea && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded">
                    {farmProfile.farmArea} {farmProfile.areaUnit}
                  </span>
                )}
              </div>

              {/* Farm metadata row */}
              <div className="flex items-center gap-3 sm:gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-700 dark:text-slate-200 font-medium">{loc.name}</strong>
                  {loc.region && ` (${loc.region})`}
                </span>
                {farmProfile.variety && (
                  <>
                    <span>•</span>
                    <span>Variety: <strong className="text-slate-700 dark:text-slate-200">{farmProfile.variety}</strong></span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Soil: <strong>{soilType.name.split('/')[0]}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-slate-400" />
                  <span>Irrigation: <strong>{irrigation.name.split('(')[0]}</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Edit Crop Profile
            </Button>

            {/* Prominent Analyze My Farm Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={analyzeFarm}
              disabled={isAnalyzing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing Farm...' : 'Analyze My Farm'}
            </Button>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <FarmProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
