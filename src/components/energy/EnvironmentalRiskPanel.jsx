import React from 'react';
import { ShieldAlert, AlertCircle, FileWarning, Trees, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';
import DemoBadge from '../common/DemoBadge';

export default function EnvironmentalRiskPanel({ project }) {
  if (!project) return null;

  const { environmentalRisks, missingDataWarnings = [], isRenewable, verifiedData } = project;

  return (
    <Card
      title="Environmental Safeguards & Data Assurance"
      subtitle="Ecological buffer analysis, audit gaps, and required statutory field validations"
      icon={Trees}
    >
      <div className="space-y-4">
        {/* Verification Status Banner */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-850/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Data Assurance Level:</span>
            {verifiedData ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Ground-Truth Records
              </span>
            ) : (
              <DemoBadge label="DEMO SIMULATION — NOT STATUTORILY VERIFIED" />
            )}
          </div>
          <span className="text-slate-400">Standard: IEC / IFC Performance Standard 6</span>
        </div>

        {/* Renewable vs Non-Renewable Banner if Thermal */}
        {!isRenewable && (
          <div className="p-4 rounded-xl bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 text-xs">
            <div className="flex items-center gap-2 font-bold text-red-800 dark:text-red-300 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              NON-RENEWABLE GENERATION ASSET
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Thermal power projects burn fossil fuels, generating substantial CO2, sulfur dioxide, and particulate emissions. This project cannot be classified under renewable energy portfolio standards and requires mandatory Flue Gas Desulfurization (FGD), high-efficiency electrostatic precipitators, and continuous stack opacity telemetry.
            </p>
          </div>
        )}

        {/* Environmental & Climate Risk Text */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850/70 border border-slate-200 dark:border-navy-800">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Ecological & Climate Hazard Profile
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {environmentalRisks || 'Standard environmental review required.'}
          </p>
        </div>

        {/* Missing-Data Warnings */}
        {missingDataWarnings.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Missing-Data Warnings & Required Next Steps
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
              Before committing capital expenditure or filing definitive environmental impact reports, the following telemetry gaps must be resolved:
            </p>
            <ul className="space-y-1.5">
              {missingDataWarnings.map((warn, idx) => (
                <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
