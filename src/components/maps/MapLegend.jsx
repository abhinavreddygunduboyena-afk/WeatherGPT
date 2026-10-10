import React from 'react';

export default function MapLegend({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-50/80 dark:bg-navy-850/80 border border-slate-200/80 dark:border-navy-700/60 rounded-lg text-xs text-slate-600 dark:text-slate-300">
      <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Legend:</span>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span 
            className="w-2.5 h-2.5 rounded-full shrink-0" 
            style={{ backgroundColor: item.color }} 
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
