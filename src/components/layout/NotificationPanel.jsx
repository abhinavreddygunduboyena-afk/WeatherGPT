import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { SAMPLE_ALERTS } from '../../data/sampleAlerts';
import Badge from '../common/Badge';
import { formatDate, formatTime } from '../../utils/formatters';

export default function NotificationPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-navy-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-weather-600 dark:text-weather-400" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                System Notifications & Bulletins
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Active Severe Warnings ({SAMPLE_ALERTS.length})
            </div>

            {SAMPLE_ALERTS.map(alert => (
              <div
                key={alert.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50 text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {alert.title}
                  </span>
                  <Badge variant={alert.severity === 'critical' ? 'red' : 'amber'} size="sm">
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                  {alert.description}
                </p>
                <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>{alert.region}</span>
                  <span>{formatTime(alert.issuedAt)}</span>
                </div>
              </div>
            ))}

            <div className="pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Platform Status
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Open-Meteo Gateway Active</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Live NWP atmospheric feed connected. Zero API key overhead.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-850/70 text-center">
            <button
              onClick={onClose}
              className="text-xs text-weather-600 dark:text-weather-400 font-medium hover:underline"
            >
              Close notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
