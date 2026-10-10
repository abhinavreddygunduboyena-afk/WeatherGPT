import React from 'react';
import { 
  PlusCircle, Zap, Sun, Wind, Waves, Flame, ChevronRight, 
  MapPin, Award, CheckCircle2, AlertCircle, BarChart3, Database 
} from 'lucide-react';
import { useEnergy } from '../../contexts/EnergyContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import DemoBadge from '../common/DemoBadge';
import { formatPowerMW } from '../../utils/formatters';

export default function EnergyDashboard({ onOpenWorkspace }) {
  const { 
    projects, 
    technologyFilter, 
    setTechnologyFilter, 
    selectProject, 
    openCreateModal 
  } = useEnergy();

  const filteredProjects = technologyFilter === 'all' 
    ? projects 
    : projects.filter(p => p.technology === technologyFilter);

  // Compute aggregate stats
  const totalCapacityMW = projects.reduce((acc, p) => acc + (p.capacityMW || 0), 0);
  const renewableProjectsCount = projects.filter(p => p.isRenewable).length;

  const handleSelect = (id) => {
    selectProject(id);
    if (onOpenWorkspace) onOpenWorkspace();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Energy-Site Intelligence Engine
            </h2>
            <Badge variant="teal" size="sm">Decision Support</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evaluating terrain, resource density, transmission evacuation, and ecological clearances for utility-scale developments.
          </p>
        </div>

        <Button
          variant="energy"
          size="md"
          icon={PlusCircle}
          onClick={openCreateModal}
        >
          New Site Assessment
        </Button>
      </div>

      {/* Aggregate Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-xs">
          <div className="text-xs text-slate-400 font-medium mb-1">Active Projects</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projects.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assessed Perimeters</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-xs">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Pipeline</div>
          <div className="text-2xl font-bold text-energy-600 dark:text-energy-400">{formatPowerMW(totalCapacityMW)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Aggregate Capacity</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-xs">
          <div className="text-xs text-slate-400 font-medium mb-1">Renewable Assets</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{renewableProjectsCount} / {projects.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Clean Energy Focus</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-xs">
          <div className="text-xs text-slate-400 font-medium mb-1">Telemetry Status</div>
          <div className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Demo Mode</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Simulated Reanalysis</div>
        </div>
      </div>

      {/* Technology Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Technologies' },
          { id: 'solar', label: 'Solar Photovoltaic', icon: Sun },
          { id: 'wind', label: 'Onshore Wind', icon: Wind },
          { id: 'hydropower', label: 'Hydropower', icon: Waves },
          { id: 'thermal', label: 'Thermal Power', icon: Flame }
        ].map(filter => {
          const Icon = filter.icon;
          const isActive = technologyFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setTechnologyFilter(filter.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors select-none whitespace-nowrap ${
                isActive
                  ? 'bg-energy-600 text-white font-medium shadow-xs'
                  : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((proj) => {
          const isThermal = proj.technology === 'thermal';
          return (
            <div
              key={proj.id}
              onClick={() => handleSelect(proj.id)}
              className="p-5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 hover:border-energy-500/60 dark:hover:border-energy-500/60 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={isThermal ? 'red' : 'teal'} size="sm">
                      {proj.technologyLabel}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatPowerMW(proj.capacityMW)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-energy-600 dark:text-energy-400">
                      Score: {proj.metrics?.overallFeasibilityScore || 80}/100
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-energy-600 dark:group-hover:text-energy-400 transition-colors">
                  {proj.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{proj.district}, {proj.stateRegion}, {proj.country}</span>
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                  {proj.notes}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-400">
                <DemoBadge label="SIMULATED BENCHMARK" />
                <span className="flex items-center gap-1 text-energy-600 dark:text-energy-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  <span>Open Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
