import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, PlusCircle, Search, Filter, Sun, Wind, 
  Waves, Flame, ArrowRight, Trash2, MapPin 
} from 'lucide-react';
import { useEnergy } from '../contexts/EnergyContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DemoBadge from '../components/common/DemoBadge';
import { formatPowerMW } from '../utils/formatters';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, selectProject, deleteProject, openCreateModal } = useEnergy();
  const [techFilter, setTechFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = projects.filter(p => {
    const matchesTech = techFilter === 'all' || p.technology === techFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.stateRegion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTech && matchesSearch;
  });

  const handleOpen = (id) => {
    selectProject(id);
    navigate('/energy');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Energy Site Projects Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Catalog of evaluated generation parcels, grid feasibility studies, and environmental clearances.
          </p>
        </div>

        <Button
          variant="energy"
          size="sm"
          icon={PlusCircle}
          onClick={openCreateModal}
        >
          New Site Project
        </Button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
        <div className="flex-1 min-w-[200px] max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter projects by title or region..."
            className="w-full bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'solar', label: 'Solar' },
            { id: 'wind', label: 'Wind' },
            { id: 'hydropower', label: 'Hydro' },
            { id: 'thermal', label: 'Thermal' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTechFilter(f.id)}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                techFilter === f.id
                  ? 'bg-energy-600 text-white font-medium shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-750'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table List */}
      <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-850 uppercase text-[10px] text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3.5">Project Identification</th>
                <th className="px-4 py-3.5">Technology</th>
                <th className="px-4 py-3.5">Capacity</th>
                <th className="px-4 py-3.5">Jurisdiction</th>
                <th className="px-4 py-3.5">Score</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filtered.map(proj => {
                const isThermal = proj.technology === 'thermal';
                return (
                  <tr key={proj.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{proj.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{proj.id}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant={isThermal ? 'red' : 'teal'} size="sm">
                        {proj.technologyLabel}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {formatPowerMW(proj.capacityMW)}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {proj.district}, {proj.stateRegion}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-energy-600 dark:text-energy-400">
                        {proj.metrics?.overallFeasibilityScore || 80}/100
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="capitalize text-slate-500 font-medium">
                        {proj.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        title="Delete project record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => handleOpen(proj.id)}
                      >
                        Workspace
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
