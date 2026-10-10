import React, { useState } from 'react';
import { 
  Sprout, Droplets, Wind, Sun, AlertTriangle, CheckCircle2, 
  HelpCircle, ChevronDown, ChevronUp, Clock, Info, ShieldAlert 
} from 'lucide-react';
import { useFarmer } from '../../contexts/FarmerContext';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function FarmerRecommendations() {
  const { farmingAdvisory } = useFarmer();
  const advisories = farmingAdvisory?.advisories || [];
  const crop = farmingAdvisory?.crop || { name: 'Crop' };
  const stage = farmingAdvisory?.stage || { name: 'Stage' };

  // Expand/collapse states for "Why this recommendation?"
  const [expandedWhy, setExpandedWhy] = useState({});

  const toggleWhy = (id) => {
    setExpandedWhy(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card
      title="Personalized Agrometeorological Advisories"
      subtitle={`Synthesized for ${crop.name} at ${stage.name} stage based on physical NWP telemetry`}
      icon={Sprout}
    >
      <div className="space-y-4">
        {advisories.map((adv) => {
          const isWhyOpen = expandedWhy[adv.id];

          return (
            <div
              key={adv.id}
              className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-xs transition-all hover:border-slate-300 dark:hover:border-navy-700"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    {adv.category.includes('Irrigation') ? <Droplets className="w-4 h-4 text-blue-500" /> :
                     adv.category.includes('Spray') ? <Wind className="w-4 h-4 text-emerald-500" /> :
                     adv.category.includes('Thermal') ? <Sun className="w-4 h-4 text-amber-500" /> :
                     adv.category.includes('Pest') ? <ShieldAlert className="w-4 h-4 text-orange-500" /> :
                     <Sprout className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {adv.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {adv.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {adv.forecastWindow}
                  </span>
                  <Badge variant={adv.badgeVariant} size="sm">
                    {adv.status}
                  </Badge>
                </div>
              </div>

              {/* 1. What the forecast indicates */}
              <div className="mb-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  1. Forecast Observation:
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {adv.forecastIndicator}
                </p>
              </div>

              {/* 2. Why it matters for crop */}
              <div className="mb-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200">2. Agronomic Impact ({crop.name}):</strong> {adv.agronomicImpact}
              </div>

              {/* 3. Suggested practical action */}
              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                <strong className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  3. Practical Farm Action:
                </strong>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {adv.suggestedAction}
                </p>
              </div>

              {/* Meta & Explainability Button */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <div>
                  <span>Horizon: {adv.forecastWindow}</span> • <span>Source: {adv.dataSource}</span>
                </div>

                {/* "Why this recommendation?" Toggle */}
                {adv.explainability && (
                  <button
                    type="button"
                    onClick={() => toggleWhy(adv.id)}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Why this recommendation?</span>
                    {isWhyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Expandable "Why this recommendation?" section */}
              {isWhyOpen && adv.explainability && (
                <div className="mt-3 p-3.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850/80 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-500" />
                    Transparent Agronomic Model Rationale
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-navy-800">
                      <span className="text-slate-400 font-medium">Underlying Weather Values:</span>
                      <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{adv.explainability.forecastData}</p>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-navy-800">
                      <span className="text-slate-400 font-medium">Crop Physiological State:</span>
                      <p className="text-slate-800 dark:text-slate-200 mt-0.5">{adv.explainability.cropStageContext}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-700 dark:text-slate-200">Biophysical Mechanism:</strong> {adv.explainability.mechanism}
                  </div>

                  <div className="p-2 rounded bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                    <strong>Model Limitation & Uncertainty:</strong> {adv.explainability.limitations}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </Card>
  );
}
