import React from 'react';
import { AlertTriangle, ShieldAlert, Info, Bell, CheckCircle2 } from 'lucide-react';
import { SAMPLE_ALERTS } from '../../data/sampleAlerts';
import Badge from '../common/Badge';
import { formatDate, formatTime } from '../../utils/formatters';

export default function WeatherAlertsList({ alerts = SAMPLE_ALERTS }) {
  return (
    <div className="space-y-4">
      {/* Distinction Header Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-900/60 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
            Provenance Notice: Official Meteorological Warnings vs. Algorithmic Advisories
          </p>
          Official meteorological warnings are statutory alerts from national hydromet agencies.
          App-generated advisories are decision-support insights synthesized from spatial atmospheric models.
        </div>
      </div>

      {alerts.map((alert) => {
        const isOfficial = alert.type === 'official_warning';
        const isCritical = alert.severity === 'critical';
        const isWarning = alert.severity === 'warning';

        return (
          <div
            key={alert.id}
            className={`rounded-xl border p-5 transition-all shadow-sm ${
              isCritical
                ? 'bg-red-50/30 dark:bg-red-950/20 border-red-300 dark:border-red-900'
                : isWarning
                ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                {isCritical ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                ) : isWarning ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                ) : (
                  <Bell className="w-5 h-5 text-blue-500 shrink-0" />
                )}
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {alert.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={isOfficial ? 'red' : 'blue'}
                  size="sm"
                  dot
                >
                  {alert.typeLabel}
                </Badge>
                <Badge
                  variant={isCritical ? 'red' : isWarning ? 'amber' : 'slate'}
                  size="sm"
                >
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1 mb-3">
              <span>Region: <strong className="text-slate-700 dark:text-slate-300">{alert.region}</strong></span>
              <span>•</span>
              <span>Source: <strong className="text-slate-700 dark:text-slate-300">{alert.source}</strong></span>
              <span>•</span>
              <span>Expires: {formatDate(alert.expiresAt)} at {formatTime(alert.expiresAt)}</span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3.5">
              {alert.description}
            </p>

            {alert.precautions && alert.precautions.length > 0 && (
              <div className="pt-3 border-t border-slate-200/60 dark:border-navy-800/80">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Actionable Operational Guidelines:
                </div>
                <ul className="space-y-1">
                  {alert.precautions.map((p, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
