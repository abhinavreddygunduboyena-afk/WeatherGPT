import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import Card from '../common/Card';

export default function LocationExplainability({ whyThisLocation }) {
  if (!whyThisLocation) return null;

  const { advantages = [], limitations = [] } = whyThisLocation;

  return (
    <Card
      title="Why this location?"
      subtitle="Explainable engineering rationale behind spatial suitability and risk trade-offs"
      icon={HelpCircle}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Supporting Factors */}
        <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/60">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
              Key Supporting Factors
            </h4>
          </div>
          <ul className="space-y-2">
            {advantages.map((adv, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Operational Bottlenecks / Limitations */}
        <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
              Operational Constraints & Limiting Factors
            </h4>
          </div>
          <ul className="space-y-2">
            {limitations.map((lim, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
