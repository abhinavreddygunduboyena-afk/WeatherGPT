import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DemoBadge({ label = "DEMO DATA — NOT VERIFIED", tooltip = "This assessment uses simulated environmental baseline metrics for demonstration purposes." }) {
  return (
    <span
      title={tooltip}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 select-none shadow-xs"
    >
      <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
