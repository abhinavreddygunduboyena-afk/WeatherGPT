import React, { useState } from 'react';
import { 
  Building2, MapPin, Printer, ArrowLeft, Download, ShieldCheck, 
  FileText, Sliders, ExternalLink, AlertTriangle 
} from 'lucide-react';
import { useEnergy } from '../../contexts/EnergyContext';
import LeafletMap from '../maps/LeafletMap';
import TechCriteriaCard from './TechCriteriaCard';
import LocationExplainability from './LocationExplainability';
import CandidateComparisonTable from './CandidateComparisonTable';
import EnvironmentalRiskPanel from './EnvironmentalRiskPanel';
import PrintableReportModal from './PrintableReportModal';
import EnergySuitabilityRadar from '../charts/EnergySuitabilityRadar';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import DemoBadge from '../common/DemoBadge';
import { formatCoordinates } from '../../utils/formatters';

export default function AssessmentWorkspace({ onBack }) {
  const { activeProject } = useEnergy();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!activeProject) {
    return <div className="p-8 text-center text-xs text-slate-400">No project selected.</div>;
  }

  const { coordinates, candidates = [], radarMetrics = [] } = activeProject;
  const centerCoords = coordinates?.lat && coordinates?.lon 
    ? [coordinates.lat, coordinates.lon] 
    : [17.3850, 78.4867];

  // Map markers for primary site and candidate parcels
  const mapMarkers = [
    {
      id: 'main',
      name: `${activeProject.name} (Study Hub)`,
      lat: centerCoords[0],
      lon: centerCoords[1],
      score: activeProject.metrics?.overallFeasibilityScore,
      details: `${activeProject.capacityMW} MW ${activeProject.technologyLabel}`
    },
    ...candidates.map(c => ({
      id: c.id,
      name: c.name,
      lat: c.lat,
      lon: c.lon,
      score: c.score,
      recommended: c.recommended,
      isCandidate: true,
      details: `Score: ${c.score}/100`
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Top Action & Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Return to energy dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Projects / Assessment Workspace /</span>
              <span className="text-xs text-energy-600 dark:text-energy-400 font-semibold">{activeProject.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {activeProject.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => setIsPrintModalOpen(true)}
          >
            Printable Report
          </Button>
        </div>
      </div>

      {/* Provenance Alert Notice */}
      <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <DemoBadge label="DEMO SIMULATION — NOT STATUTORILY VERIFIED" />
          <span className="text-slate-700 dark:text-slate-300">
            Resource metrics and land parcel attributes are simulated for platform demonstration.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Baseline: ERA5 / Global Solar & Wind Atlas
        </span>
      </div>

      {/* Workspace Grid: Map & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Study Area Map */}
        <div className="lg:col-span-7">
          <Card
            title="Study Area Spatial Intelligence"
            subtitle={`Centroid: ${formatCoordinates(centerCoords[0], centerCoords[1])} (${activeProject.district}, ${activeProject.stateRegion})`}
            icon={MapPin}
            action={
              <span className="text-[11px] text-slate-400">
                Study Radius: 15 km
              </span>
            }
          >
            <LeafletMap
              center={centerCoords}
              zoom={11}
              studyAreaRadiusKm={15}
              markers={mapMarkers}
              className="h-80 w-full"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-weather-600" /> Center Hub
                <span className="w-2.5 h-2.5 rounded-full bg-energy-600 ml-2" /> Candidate Parcels
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2" /> Top Recommended
              </span>
              <span>Tiles © OpenStreetMap</span>
            </div>
          </Card>
        </div>

        {/* Right: Radar Chart */}
        <div className="lg:col-span-5">
          <Card
            title="Multi-Criteria Feasibility Radar"
            subtitle="Normalized physical, electrical, and environmental vector balance"
            icon={Sliders}
          >
            <EnergySuitabilityRadar data={radarMetrics} />
          </Card>
        </div>
      </div>

      {/* Technology Specific Criteria */}
      <TechCriteriaCard project={activeProject} />

      {/* Why This Location? Section */}
      <LocationExplainability whyThisLocation={activeProject.whyThisLocation} />

      {/* Candidate Sites Comparison Table */}
      <CandidateComparisonTable 
        candidates={candidates} 
        technology={activeProject.technology} 
      />

      {/* Environmental & Data Assurance Panel */}
      <EnvironmentalRiskPanel project={activeProject} />

      {/* Printable Report Modal */}
      <PrintableReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        project={activeProject}
      />
    </div>
  );
}
