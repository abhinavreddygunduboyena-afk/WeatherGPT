import React from 'react';
import { ShieldAlert, AlertTriangle, CloudRain, Sun, Wind, Waves, ExternalLink, CheckCircle2, Info } from 'lucide-react';
import { useFarmer } from '../../contexts/FarmerContext';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function FarmerAlertsPanel() {
  const { farmingAdvisory } = useFarmer();
  const alerts = farmingAdvisory?.alerts || [];

  return (
    <Card
      title="Weather-Based Farming Alerts & Hazard Matrix"
      subtitle="Evaluated against agronomic thresholds for crop protection and field operations"
      icon={ShieldAlert}
    >
      {/* Official Government Provenance Notice Bar */}
      <div className="mb-4 p-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 dark:text-slate-200">Advisory Provenance Notice:</strong> The alerts below are internally derived from numerical NWP weather forecasts and crop physiology thresholds. For statutory district agricultural bulletins, refer directly to official meteorological authorities.
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          <a
            href="https://mausam.imd.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            IMD Mausam
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>•</span>
          <a
            href="https://imdgeospatial.imd.gov.in/agromet.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            IMD Agromet Advisory
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Active Alerts List */}
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alt) => {
            const isHigh = alt.severity === 'high';
            return (
              <div
                key={alt.id}
                className={`p-4 rounded-xl border transition-all ${
                  isHigh
                    ? 'border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20'
                    : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${isHigh ? 'text-red-500' : 'text-amber-500'}`} />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                      {alt.type}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Trigger: {alt.threshold}
                    </span>
                    <Badge variant={isHigh ? 'red' : 'amber'} size="sm">
                      {alt.severity.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {alt.message}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-navy-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Source: {alt.source}</span>
                  <a
                    href={alt.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-500 flex items-center gap-0.5"
                  >
                    Check Official Agromet
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            No Severe Agro-Weather Hazards Detected
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            Atmospheric temperature, wind gusts, and precipitation forecasts are currently within standard physiological limits for your crop and soil profile.
          </p>
        </div>
      )}
    </Card>
  );
}
