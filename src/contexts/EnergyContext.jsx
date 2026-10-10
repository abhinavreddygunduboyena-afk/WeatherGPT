import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredProjects, saveProjects, generateProjectAssessment } from '../services/energyService';
import { SAMPLE_ENERGY_PROJECTS } from '../data/sampleEnergyProjects';

const EnergyContext = createContext();

export function EnergyProvider({ children }) {
  const [projects, setProjects] = useState(() => getStoredProjects());
  const [activeProjectId, setActiveProjectId] = useState(() => {
    return projects[0]?.id || SAMPLE_ENERGY_PROJECTS[0].id;
  });
  const [technologyFilter, setTechnologyFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || SAMPLE_ENERGY_PROJECTS[0];

  const handleCreateProject = (formData) => {
    const created = generateProjectAssessment(formData);
    setProjects(prev => [created, ...prev]);
    setActiveProjectId(created.id);
    setIsCreateModalOpen(false);
    return created;
  };

  const deleteProject = (id) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (activeProjectId === id && filtered.length > 0) {
        setActiveProjectId(filtered[0].id);
      }
      return filtered;
    });
  };

  const selectProject = (id) => {
    setActiveProjectId(id);
  };

  return (
    <EnergyContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        technologyFilter,
        isCreateModalOpen,
        setTechnologyFilter,
        selectProject,
        createProject: handleCreateProject,
        deleteProject,
        openCreateModal: () => setIsCreateModalOpen(true),
        closeCreateModal: () => setIsCreateModalOpen(false)
      }}
    >
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  const context = useContext(EnergyContext);
  if (!context) {
    throw new Error('useEnergy must be used within an EnergyProvider');
  }
  return context;
}
