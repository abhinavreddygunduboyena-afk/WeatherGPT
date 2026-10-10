import React from 'react';

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className = ""
}) {
  return (
    <div className={`flex items-center space-x-1 border-b border-slate-200 dark:border-navy-800 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors duration-150 -mb-px select-none ${
              isActive
                ? 'border-weather-600 text-weather-600 dark:border-weather-400 dark:text-weather-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-weather-600 dark:text-weather-400' : ''}`} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-weather-100 text-weather-700 dark:bg-weather-950 dark:text-weather-300' : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
