import React, { useState } from 'react';
import { PlusCircle, Sun, Wind, Waves, Flame, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useEnergy } from '../../contexts/EnergyContext';

const PRIORITIES_OPTIONS = [
  'Resource Quality & Yield',
  'Substation Proximity (<10km)',
  'Flat / Low Gradient Slope',
  'Low Ecological Sensitivity',
  'Road Transport Access',
  'Cooling Water / River Flow'
];

export default function CreateProjectModal() {
  const { isCreateModalOpen, closeCreateModal, createProject } = useEnergy();

  const [formData, setFormData] = useState({
    name: '',
    country: 'India',
    stateRegion: '',
    district: '',
    technology: 'solar',
    capacityMW: '',
    priorities: ['Resource Quality & Yield', 'Substation Proximity (<10km)'],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Project name is required.';
    if (!formData.country.trim()) errs.country = 'Country is required.';
    if (!formData.stateRegion.trim()) errs.stateRegion = 'State or region is required.';
    if (!formData.district.trim()) errs.district = 'District or study area is required.';
    if (!formData.capacityMW || Number(formData.capacityMW) <= 0) {
      errs.capacityMW = 'Proposed capacity must be a positive number in MW.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      createProject(formData);
      // Reset form
      setFormData({
        name: '',
        country: 'India',
        stateRegion: '',
        district: '',
        technology: 'solar',
        capacityMW: '',
        priorities: ['Resource Quality & Yield', 'Substation Proximity (<10km)'],
        notes: ''
      });
      setErrors({});
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePriority = (p) => {
    setFormData(prev => ({
      ...prev,
      priorities: prev.priorities.includes(p)
        ? prev.priorities.filter(item => item !== p)
        : [...prev.priorities, p]
    }));
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={closeCreateModal}
      title="Create Energy-Site Assessment"
      subtitle="Configure physical study perimeter and technical parameters for site feasibility evaluation"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={closeCreateModal}>
            Cancel
          </Button>
          <Button 
            variant="energy" 
            size="sm" 
            onClick={handleSubmit} 
            loading={isSubmitting}
          >
            Run Feasibility Assessment
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <Input
          label="Project Name *"
          placeholder="e.g. Deccan Plateau Solar Hub"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        {/* Location Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Country *"
            placeholder="e.g. India"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            error={errors.country}
          />
          <Input
            label="State / Region *"
            placeholder="e.g. Telangana"
            value={formData.stateRegion}
            onChange={(e) => setFormData({ ...formData, stateRegion: e.target.value })}
            error={errors.stateRegion}
          />
          <Input
            label="District / Study Area *"
            placeholder="e.g. Mahabubnagar"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            error={errors.district}
          />
        </div>

        {/* Technology Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Energy Technology *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'solar', label: 'Solar PV', icon: Sun, color: 'text-amber-500' },
              { id: 'wind', label: 'Wind Power', icon: Wind, color: 'text-blue-500' },
              { id: 'hydropower', label: 'Hydropower', icon: Waves, color: 'text-teal-500' },
              { id: 'thermal', label: 'Thermal Power', icon: Flame, color: 'text-red-500' }
            ].map(tech => {
              const Icon = tech.icon;
              const isSelected = formData.technology === tech.id;
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, technology: tech.id })}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-energy-500 bg-energy-50/50 dark:bg-energy-950/30 text-energy-900 dark:text-energy-200 ring-1 ring-energy-500 font-semibold'
                      : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-navy-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${tech.color}`} />
                  <span>{tech.label}</span>
                </button>
              );
            })}
          </div>

          {/* Explicit Thermal Warning */}
          {formData.technology === 'thermal' && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex items-start gap-2 text-[11px] text-red-800 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span>
                <strong>Notice:</strong> Thermal power is a non-renewable fossil resource. The assessment will evaluate fuel logistics (rail/port), cooling-water allocations, and mandatory SO2/NOx stack emission clearance thresholds.
              </span>
            </div>
          )}
        </div>

        {/* Capacity in MW */}
        <div>
          <Input
            label="Proposed Generation Capacity (MW) *"
            type="number"
            placeholder="e.g. 100"
            value={formData.capacityMW}
            onChange={(e) => setFormData({ ...formData, capacityMW: e.target.value })}
            error={errors.capacityMW}
            helperText="Nominal nameplate capacity to determine land parcel footprint and evacuation voltage."
          />
        </div>

        {/* Assessment Priorities */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Main Assessment Priorities
          </label>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES_OPTIONS.map(p => {
              const isChecked = formData.priorities.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePriority(p)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                    isChecked
                      ? 'bg-energy-100 text-energy-800 border-energy-300 dark:bg-energy-950 dark:text-energy-300 dark:border-energy-800 font-medium'
                      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-navy-800 dark:text-slate-400 dark:border-navy-700'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Optional Project Notes / Site Scope
          </label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Special boundary conditions, target off-taker or transmission utility..."
            className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-energy-500"
          />
        </div>
      </form>
    </Modal>
  );
}
