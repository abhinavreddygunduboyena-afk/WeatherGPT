import React, { useState } from 'react';
import { ArrowUpDown, Award, CheckCircle2, ChevronDown, Filter } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import DemoBadge from '../common/DemoBadge';

export default function CandidateComparisonTable({ candidates = [], technology = 'solar' }) {
  const [sortField, setSortField] = useState('score');
  const [sortAsc, setSortAsc] = useState(false);

  if (!candidates || candidates.length === 0) {
    return (
      <Card
        title="Candidate Site Comparison"
        subtitle="Ranked alternative parcel comparisons within the study perimeter"
      >
        <div className="p-6 text-center text-xs text-slate-400">
          No alternative candidate parcels designated for this study perimeter yet.
        </div>
      </Card>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  return (
    <Card
      title="Candidate Site Trade-Off Comparison"
      subtitle="Evaluated parcels ranked across resource density, terrain gradient, and transmission distance"
      action={<DemoBadge label="SIMULATED CANDIDATE BENCHMARKS" />}
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-navy-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-navy-850 uppercase text-[10px] text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-800">
            <tr>
              <th className="px-4 py-3">Candidate Parcel</th>
              <th className="px-3 py-3">Coordinates</th>
              <th className="px-3 py-3">
                {technology === 'solar' ? 'Area / GHI' :
                 technology === 'wind' ? 'Area / Wind Spd' :
                 technology === 'hydropower' ? 'Head / Discharge' :
                 'Port Dist / Water Intake'}
              </th>
              <th className="px-3 py-3">Grid Proximity</th>
              <th 
                className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-1">
                  <span>Feasibility Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-center">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80">
            {sortedCandidates.map((c) => (
              <tr 
                key={c.id} 
                className={`transition-colors ${
                  c.recommended 
                    ? 'bg-emerald-50/20 dark:bg-emerald-950/10 font-medium' 
                    : 'hover:bg-slate-50/80 dark:hover:bg-navy-800/40'
                }`}
              >
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-[10px] text-slate-400">ID: {c.id}</div>
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-slate-500">
                  {c.lat?.toFixed(3)}°, {c.lon?.toFixed(3)}°
                </td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                  {technology === 'solar' && `${c.areaHectares} ha | ${c.ghi} kWh/m²`}
                  {technology === 'wind' && `${c.areaHectares} ha | ${c.meanWindSpeed} m/s`}
                  {technology === 'hydropower' && `${c.headM}m head | ${c.qDesign} m³/s`}
                  {technology === 'thermal' && `${c.portDistKm} km port | ${c.waterIntakeM}m intake`}
                </td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                  {c.gridDistKm ? `${c.gridDistKm} km` : c.tunnelKm ? `${c.tunnelKm} km tunnel` : 'Direct substation link'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{c.score}</span>
                    <div className="w-16 bg-slate-200 dark:bg-navy-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${c.score >= 85 ? 'bg-emerald-500' : c.score >= 75 ? 'bg-energy-500' : 'bg-amber-500'}`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {c.recommended ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <Award className="w-3 h-3 text-emerald-600" />
                      Recommended Primary
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Secondary Option</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
