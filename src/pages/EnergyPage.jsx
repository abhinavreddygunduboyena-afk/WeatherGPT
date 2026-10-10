import React, { useState } from 'react';
import { LayoutGrid, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { useEnergy } from '../contexts/EnergyContext';
import EnergyDashboard from '../components/energy/EnergyDashboard';
import AssessmentWorkspace from '../components/energy/AssessmentWorkspace';
import Tabs from '../components/common/Tabs';

export default function EnergyPage() {
  const { activeProject } = useEnergy();
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'workspace'

  const ENERGY_TABS = [
    { id: 'dashboard', label: 'Projects & Pipeline', icon: LayoutGrid },
    { id: 'workspace', label: `Workspace: ${activeProject?.name || 'Active Assessment'}`, icon: FileSpreadsheet }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-energy-600 dark:text-energy-400">
            Spatial Feasibility Core
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Energy-Site Intelligence
          </h1>
        </div>

        <Tabs
          tabs={ENERGY_TABS}
          activeTab={viewMode}
          onChange={setViewMode}
        />
      </div>

      {viewMode === 'dashboard' ? (
        <EnergyDashboard onOpenWorkspace={() => setViewMode('workspace')} />
      ) : (
        <AssessmentWorkspace onBack={() => setViewMode('dashboard')} />
      )}
    </div>
  );
}
