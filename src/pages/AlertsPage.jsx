import React from 'react';
import { ShieldAlert, AlertTriangle, Bell, Info } from 'lucide-react';
import WeatherAlertsList from '../components/weather/WeatherAlertsList';
import { SAMPLE_ALERTS } from '../data/sampleAlerts';

export default function AlertsPage() {
  const criticalCount = SAMPLE_ALERTS.filter(a => a.severity === 'critical').length;
  const warningCount = SAMPLE_ALERTS.filter(a => a.severity === 'warning').length;
  const advisoryCount = SAMPLE_ALERTS.filter(a => a.severity === 'advisory').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Severe Meteorological Warnings & Advisories
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time weather threat tracking with strict distinction between official warnings and app decision-support notices.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-950 bg-red-50/40 dark:bg-red-950/20">
          <div className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider">Critical Hazards</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">High swell / cyclone risk</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-950 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">Severe Warnings</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{warningCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Thunderstorm & gusts</div>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-950 bg-blue-50/40 dark:bg-blue-950/20">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Model Advisories</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{advisoryCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Heat index / UV alerts</div>
        </div>
      </div>

      <WeatherAlertsList alerts={SAMPLE_ALERTS} />
    </div>
  );
}
