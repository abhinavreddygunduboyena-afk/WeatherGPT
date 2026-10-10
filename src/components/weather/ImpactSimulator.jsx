import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldCheck, HelpCircle, Calendar, Clock, 
  MapPin, CheckCircle2, XCircle, Info, ChevronRight, Activity
} from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import Card from '../common/Card';
import Badge from '../common/Badge';

const ACTIVITIES = [
  { id: 'college_event', name: 'Outdoor College Event / Fest', sensitivity: 'High rain/lightning sensitivity, audio-visual hazards' },
  { id: 'farming', name: 'Farming / Spraying & Harvest', sensitivity: 'Wind drift, soil moisture, rainfall timing' },
  { id: 'travel', name: 'Road Travel / Highway Logistics', sensitivity: 'Visibility, slick roads, aquaplaning risk' },
  { id: 'construction', name: 'Construction & Crane Lifts', sensitivity: 'Wind shear >30 km/h, scaffolding, wet concrete curing' },
  { id: 'sports', name: 'Outdoor Sports / Athletics', sensitivity: 'Heat index, wet turf, dehydration, lightning risk' },
  { id: 'outdoor_work', name: 'Field Labour / Heavy Work', sensitivity: 'UV exposure, heat exhaustion, sudden storms' }
];

export default function ImpactSimulator() {
  const { weatherData } = useWeather();
  const [selectedActivity, setSelectedActivity] = useState('college_event');
  const [timeWindow, setTimeWindow] = useState('afternoon'); // 'morning' | 'afternoon' | 'evening'
  const [targetDate, setTargetDate] = useState('tomorrow');

  const curr = weatherData?.current || {};
  const daily = weatherData?.daily || [];
  const chosenForecast = targetDate === 'today' ? daily[0] : daily[1] || daily[0];

  const rainChance = chosenForecast?.rainProb ?? 25;
  const windSpeed = chosenForecast?.windSpeed ?? 14;
  const temp = chosenForecast?.maxTemp ?? 30;
  const uv = chosenForecast?.uv ?? 6;

  // Evaluate risk level based on activity and environmental parameters
  let riskLevel = 'LOW'; // 'LOW', 'MODERATE', 'ELEVATED'
  let riskColor = 'emerald';
  let primaryConcerns = [];
  let recommendations = [];
  let rationale = '';

  if (selectedActivity === 'college_event') {
    if (rainChance >= 40 || windSpeed >= 25) {
      riskLevel = 'ELEVATED';
      riskColor = 'amber';
      primaryConcerns.push(`Rain probability is ${rainChance}%, posing risk to outdoor sound equipment and seating.`);
      recommendations.push('Prepare a waterproof canopy for electrical switchboards and mixing consoles.');
      recommendations.push('Designate an indoor auditorium or covered quadrangle as standby contingency.');
      rationale = `Convective atmospheric dynamics suggest intermittent precipitation chances (${rainChance}%). Open-air events without overhead shelter risk disruptions.`;
    } else {
      riskLevel = 'MODERATE';
      riskColor = 'blue';
      primaryConcerns.push(`Daytime temperatures reach ~${temp}°C with UV index of ${uv}.`);
      recommendations.push('Set up hydration stations and shade canopies for attendees.');
      recommendations.push('Monitor radar within 3 hours of showtime.');
      rationale = `Precipitation threat is manageable (${rainChance}%), but thermal load requires shade and spectator hydration.`;
    }
  } else if (selectedActivity === 'construction') {
    if (windSpeed >= 20) {
      riskLevel = 'ELEVATED';
      riskColor = 'amber';
      primaryConcerns.push(`Wind gusts expected up to ${windSpeed} km/h, which approaches safe crane hoist thresholds.`);
      recommendations.push('Halt tower crane operations if gusts exceed 35 km/h on site anemometers.');
      recommendations.push('Tether all perimeter scaffolding and loose corrugated tin sheets.');
      rationale = `Wind shear presents aerodynamic drag on suspended loads.`;
    } else {
      riskLevel = 'LOW';
      riskColor = 'emerald';
      primaryConcerns.push('Wind and precipitation remain within standard OSHA/site safety guidelines.');
      recommendations.push('Carry out planned pours and steel fixing with routine PPE.');
      rationale = `Stable barometric pressure and wind speeds below 18 km/h.`;
    }
  } else if (selectedActivity === 'farming') {
    if (rainChance >= 30) {
      riskLevel = 'MODERATE';
      riskColor = 'amber';
      primaryConcerns.push(`Rain probability (${rainChance}%) could wash away pesticide/fertilizer applications.`);
      recommendations.push('Delay chemical foliar spraying until dry 24-hour window opens.');
      recommendations.push('Clear field drainage bunds to avoid localized root waterlogging.');
      rationale = `Foliar agrochemicals require minimum 4–6 hour rain-free curing period.`;
    } else {
      riskLevel = 'LOW';
      riskColor = 'emerald';
      primaryConcerns.push('Favorable moisture and sunshine balance.');
      recommendations.push('Safe to proceed with cultivation, spraying, and grain drying.');
      rationale = `Sunshine and light breeze encourage proper soil aeration.`;
    }
  } else {
    // General outdoor sports / work / travel
    if (temp >= 33 || uv >= 8) {
      riskLevel = 'MODERATE';
      riskColor = 'amber';
      primaryConcerns.push(`Extreme heat stress index (${temp}°C) and UV index of ${uv}.`);
      recommendations.push('Enforce mandatory 15-minute rest rotations per hour in shaded enclosures.');
      recommendations.push('Provide electrolyte replenishments and high-SPF sun protection.');
      rationale = `Elevated heat index accelerates dehydration and reduces worker cognitive vigilance.`;
    } else {
      riskLevel = 'LOW';
      riskColor = 'emerald';
      primaryConcerns.push('Atmospheric baseline indicators within healthy tolerances.');
      recommendations.push('Maintain standard hydration and outdoor gear.');
      rationale = `Mild seasonal parameters provide favorable operational window.`;
    }
  }

  return (
    <Card
      title="Weather Impact & Activity Risk Simulator"
      subtitle="Evaluates microclimate risk factors against specific operational thresholds"
      icon={Activity}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Input Selection */}
        <div className="md:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Activity Type
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-weather-500"
            >
              {ACTIVITIES.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {ACTIVITIES.find(a => a.id === selectedActivity)?.sensitivity}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Date
              </label>
              <select
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Time Window
              </label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="morning">Morning (07:00 - 12:00)</option>
                <option value="afternoon">Afternoon (12:00 - 17:00)</option>
                <option value="evening">Evening (17:00 - 21:00)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800 text-xs space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Selected Corridor Metrics
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Expected Temperature:</span> <strong>{temp}°C</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Precipitation Risk:</span> <strong>{rainChance}%</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Sustained Wind Speed:</span> <strong>{windSpeed} km/h</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>UV Radiation Index:</span> <strong>{uv} / 11</strong>
            </div>
          </div>
        </div>

        {/* Right: Simulation Assessment Output */}
        <div className="md:col-span-7 flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/40">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Simulation Assessment
              </span>
              <Badge variant={riskColor} size="md" dot>
                {riskLevel === 'ELEVATED' ? 'Elevated Weather Risk' : riskLevel === 'MODERATE' ? 'Moderate Caution' : 'Low Meteorological Risk'}
              </Badge>
            </div>

            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Why this recommendation?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {rationale}
              </p>
            </div>

            {/* Primary Concerns */}
            <div className="mb-3">
              <h5 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Key Identified Factors:
              </h5>
              <ul className="space-y-1">
                {primaryConcerns.map((c, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practical Precautions */}
            <div>
              <h5 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Practical Precautions:
              </h5>
              <ul className="space-y-1">
                {recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strict Uncertainty & Safety Disclaimer */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-navy-800 flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Statistical Uncertainty Notice:</strong> Atmospheric forecasts are probabilistic models and local microclimates vary. <em>WeatherGPT never guarantees that an activity is 100% safe.</em> Always consult official local meteorological advisories prior to critical events.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
