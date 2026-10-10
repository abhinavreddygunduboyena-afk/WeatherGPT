import React from 'react';
import { Sun, Wind, Waves, Flame, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function TechCriteriaCard({ project }) {
  if (!project) return null;

  const { technology, metrics = {} } = project;

  const getTechIcon = () => {
    switch (technology) {
      case 'solar': return Sun;
      case 'wind': return Wind;
      case 'hydropower': return Waves;
      case 'thermal': return Flame;
      default: return Cpu;
    }
  };

  const Icon = getTechIcon();

  return (
    <Card
      title={`Technology-Specific Evaluation: ${project.technologyLabel}`}
      subtitle="Multi-parameter site scoring calibrated to physical operational constraints"
      icon={Icon}
      action={
        <div className="flex items-center gap-2">
          {!project.isRenewable && (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800">
              NON-RENEWABLE ASSET
            </span>
          )}
          <Badge variant={metrics.overallFeasibilityScore >= 80 ? 'teal' : 'amber'} size="md">
            Overall Score: {metrics.overallFeasibilityScore || 80}/100
          </Badge>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Resource Primary Metric */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {metrics.resourceMetricLabel || 'Primary Resource Metric'}
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            {metrics.resourceValue}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Engineering Score:</span>
            <span className="font-semibold text-energy-600 dark:text-energy-400">{metrics.resourceScore}/100</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-navy-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-energy-500 h-full rounded-full" style={{ width: `${metrics.resourceScore}%` }} />
          </div>
        </div>

        {/* Environmental / Climate Factor */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {metrics.cloudFactorLabel || 'Atmospheric / Fluid Factor'}
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            {metrics.cloudFactorValue}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Factor Index:</span>
            <span className="font-semibold text-energy-600 dark:text-energy-400">{metrics.cloudScore}/100</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-navy-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-energy-500 h-full rounded-full" style={{ width: `${metrics.cloudScore}%` }} />
          </div>
        </div>

        {/* Terrain / Physical Infrastructure */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {metrics.terrainLabel || 'Terrain / Civil Suitability'}
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 truncate" title={metrics.terrainValue}>
            {metrics.terrainValue}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Civil Score:</span>
            <span className="font-semibold text-energy-600 dark:text-energy-400">{metrics.terrainScore}/100</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-navy-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-energy-500 h-full rounded-full" style={{ width: `${metrics.terrainScore}%` }} />
          </div>
        </div>

        {/* Grid Evacuation */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {metrics.gridLabel || 'Grid Interconnection Corridor'}
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 truncate" title={metrics.gridValue}>
            {metrics.gridValue}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Interconnection Score:</span>
            <span className="font-semibold text-energy-600 dark:text-energy-400">{metrics.gridScore}/100</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-navy-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-energy-500 h-full rounded-full" style={{ width: `${metrics.gridScore}%` }} />
          </div>
        </div>

        {/* Environmental / Clearance Compliance */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800 md:col-span-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {metrics.environmentalLabel || 'Environmental Safeguards & Permits'}
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {metrics.environmentalValue}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Statutory Clearance Margin:</span>
            <span className={`font-semibold ${metrics.environmentalScore < 60 ? 'text-red-500' : 'text-energy-600 dark:text-energy-400'}`}>
              {metrics.environmentalScore}/100
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-navy-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${metrics.environmentalScore < 60 ? 'bg-red-500' : 'bg-energy-500'}`} 
              style={{ width: `${metrics.environmentalScore}%` }} 
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
