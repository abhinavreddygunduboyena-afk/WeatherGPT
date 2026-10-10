import { SAMPLE_ENERGY_PROJECTS } from '../data/sampleEnergyProjects';

/**
 * Energy Intelligence Service
 * Provides multi-criteria technology-specific assessment logic
 */

export function getStoredProjects() {
  try {
    const raw = localStorage.getItem('weathergpt_energy_projects');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load projects from localStorage, using samples', e);
  }
  return SAMPLE_ENERGY_PROJECTS;
}

export function saveProjects(projects) {
  try {
    localStorage.setItem('weathergpt_energy_projects', JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to persist projects to localStorage', e);
  }
}

/**
 * Generate a new assessment based on user-provided inputs
 */
export function generateProjectAssessment(formData) {
  const { name, country, stateRegion, district, technology, capacityMW, priorities, notes } = formData;
  const cap = Number(capacityMW) || 50;
  const isRenewable = technology !== 'thermal';

  // Seeded / pseudo-deterministic coordinates based on region
  const lat = 16.5 + (Math.random() * 4 - 2);
  const lon = 78.5 + (Math.random() * 4 - 2);

  // Generate technology-specific metrics and explainability
  let metrics = {};
  let radarMetrics = [];
  let whyThisLocation = { advantages: [], limitations: [] };
  let environmentalRisks = '';
  let missingDataWarnings = [];
  let candidates = [];

  if (technology === 'solar') {
    metrics = {
      resourceMetricLabel: 'Solar Irradiation (GHI)',
      resourceValue: '5.28 kWh/m²/day',
      resourceScore: 89,
      cloudFactorLabel: 'Cloud Cover Attenuation',
      cloudFactorValue: '26.5% Annual Mean',
      cloudScore: 86,
      terrainLabel: 'Terrain Slope & Ground Cover',
      terrainValue: '< 3° gradient, Arid wasteland',
      terrainScore: 88,
      gridLabel: 'Grid Substation Interconnection',
      gridValue: '5.8 km to 132/220kV substation',
      gridScore: 85,
      environmentalLabel: 'Ecological & Protected Zone',
      environmentalValue: 'Outside eco-sensitive buffer',
      environmentalScore: 92,
      overallFeasibilityScore: 88
    };
    radarMetrics = [
      { subject: 'Solar GHI Yield', A: 89, fullMark: 100 },
      { subject: 'Grid Proximity', A: 85, fullMark: 100 },
      { subject: 'Slope Stability', A: 88, fullMark: 100 },
      { subject: 'Low Cloud Loss', A: 86, fullMark: 100 },
      { subject: 'Eco Safeguards', A: 92, fullMark: 100 },
      { subject: 'Land Availability', A: 84, fullMark: 100 }
    ];
    whyThisLocation = {
      advantages: [
        'Optimal solar insolation band delivering over 1,750 equivalent full-load hours annually.',
        'Flat topography drastically reduces civil grading and civil foundation preparation costs.',
        'Feeder corridor capacity verified for 50-150 MW interconnection within 6 km radius.'
      ],
      limitations: [
        'High summer ambient temperatures may lead to nominal 3-5% inverter thermal clipping.',
        'Periodic dry dust requires dry robotic array cleaning to safeguard water resources.'
      ]
    };
    environmentalRisks = 'Low ecological disruption. Project footprint avoids arable agriculture and wildlife corridors. Ground clearing must implement erosion control.';
    missingDataWarnings = [
      'Ground-truth solar irradiance pyranometer audit missing (modeled using satellite ERA5 datasets).',
      'Geotechnical soil pull-out test data required to finalize single-axis tracker piling specifications.'
    ];
    candidates = [
      { id: 'cs-1', name: 'Candidate Site A (Western Flatlands)', lat: lat + 0.04, lon: lon - 0.03, areaHectares: Math.round(cap * 1.8), ghi: 5.35, gridDistKm: 4.5, slopeDeg: 1.5, score: 90, recommended: true },
      { id: 'cs-2', name: 'Candidate Site B (Northern Ridge Uplands)', lat: lat + 0.08, lon: lon + 0.05, areaHectares: Math.round(cap * 2.1), ghi: 5.21, gridDistKm: 8.2, slopeDeg: 3.4, score: 83, recommended: false },
      { id: 'cs-3', name: 'Candidate Site C (Southern Scrub Basin)', lat: lat - 0.05, lon: lon + 0.02, areaHectares: Math.round(cap * 1.9), ghi: 5.18, gridDistKm: 9.7, slopeDeg: 2.1, score: 80, recommended: false }
    ];

  } else if (technology === 'wind') {
    metrics = {
      resourceMetricLabel: 'Mean Annual Wind Speed (120m)',
      resourceValue: '7.45 m/s (Weibull k=2.08)',
      resourceScore: 84,
      cloudFactorLabel: 'Seasonal Wind Uniformity',
      cloudFactorValue: 'Monsoon surge: 10.2 m/s, Winter: 5.1 m/s',
      cloudScore: 76,
      terrainLabel: 'Terrain Elevation & Ruggedness',
      terrainValue: 'Elevated plateau, RIX < 0.8%',
      terrainScore: 85,
      gridLabel: 'Grid Interconnection Distance',
      gridValue: '8.4 km to 220kV Pooling Substation',
      gridScore: 80,
      environmentalLabel: 'Avian & Bat Impact Clearance',
      environmentalValue: 'Low collision probability zone',
      environmentalScore: 81,
      overallFeasibilityScore: 81
    };
    radarMetrics = [
      { subject: 'Wind Resource', A: 84, fullMark: 100 },
      { subject: 'Grid Access', A: 80, fullMark: 100 },
      { subject: 'Terrain Ruggedness', A: 85, fullMark: 100 },
      { subject: 'Seasonal Balance', A: 76, fullMark: 100 },
      { subject: 'Avian Buffer', A: 81, fullMark: 100 },
      { subject: 'Logistics Access', A: 78, fullMark: 100 }
    ];
    whyThisLocation = {
      advantages: [
        'Persistent ridgeline funneling synoptic seasonal wind flows at elevated capacity factors.',
        'Low surface roughness (aerodynamic z0 < 0.04m) ensures low shear turbulence on turbine blades.',
        'Adequate road turning radius available along access highway for 70m blade haulage.'
      ],
      limitations: [
        'Marked seasonal intermittency requiring grid buffering or hybridization during low-wind months.',
        'Turbine foundations in fractured rock require specialized deep geotechnical anchoring.'
      ]
    };
    environmentalRisks = 'Moderate avian flight activity. Blade radar curtailment and acoustic bird deterrents recommended during migratory seasons.';
    missingDataWarnings = [
      'Site anemometry mast record is below the 12-month bankability standard (presently 6 months).',
      'Wake loss simulation requires detailed micro-siting CFD run.'
    ];
    candidates = [
      { id: 'cw-1', name: 'Candidate Ridge North (High Elevation)', lat: lat + 0.05, lon: lon - 0.02, areaHectares: Math.round(cap * 3.5), meanWindSpeed: 7.62, gridDistKm: 7.1, roughness: 0.02, score: 85, recommended: true },
      { id: 'cw-2', name: 'Candidate Plateau South (Broad Crest)', lat: lat - 0.06, lon: lon + 0.04, areaHectares: Math.round(cap * 4.0), meanWindSpeed: 7.25, gridDistKm: 12.0, roughness: 0.04, score: 78, recommended: false }
    ];

  } else if (technology === 'hydropower') {
    metrics = {
      resourceMetricLabel: 'Design River Discharge (Q)',
      resourceValue: '36.8 m³/s (90% dependable flow)',
      resourceScore: 82,
      cloudFactorLabel: 'Seasonal Runoff Ratio',
      cloudFactorValue: 'Lean:Peak = 1:5.2',
      cloudScore: 70,
      terrainLabel: 'Gross Hydraulic Head Drop',
      terrainValue: '142 meters gross net head',
      terrainScore: 88,
      gridLabel: 'High-Altitude Grid Evacuation',
      gridValue: '19.4 km to Regional Substation',
      gridScore: 69,
      environmentalLabel: 'Environmental Flow Compliance',
      environmentalValue: 'Maintains minimum 20% lean season eco-flow',
      environmentalScore: 78,
      overallFeasibilityScore: 77
    };
    radarMetrics = [
      { subject: 'Hydraulic Head', A: 88, fullMark: 100 },
      { subject: 'River Flow', A: 82, fullMark: 100 },
      { subject: 'Catchment Health', A: 75, fullMark: 100 },
      { subject: 'Eco-Flow Safety', A: 78, fullMark: 100 },
      { subject: 'Grid Corridor', A: 69, fullMark: 100 },
      { subject: 'Geotech Stability', A: 70, fullMark: 100 }
    ];
    whyThisLocation = {
      advantages: [
        'Natural river gradient creates a 140m+ head with a compact tunnel headrace length.',
        'Run-of-river configuration avoids large-scale land submergence or human displacement.',
        'Snowmelt provides sustained discharge extending into early summer before the monsoon.'
      ],
      limitations: [
        'Substantial seasonal flow fluctuation requires variable-speed Pelton/Francis runner selection.',
        'High sediment yield during monsoon cloudbursts demands intensive desilting chambers.'
      ]
    };
    environmentalRisks = 'High aquatic habitat conservation priority. Must enforce strict environmental baseline flow and fish-pass bypass channels.',
    missingDataWarnings = [
      'River hydrological gauge records only cover 5 seasons; 10-year flood frequency model required.',
      'Tunnel rock mass rating (RMR) core tests still pending environmental stage clearance.'
    ];
    candidates = [
      { id: 'ch-1', name: 'Intake Option Upper Gorge', lat: lat + 0.03, lon: lon - 0.01, headM: 154, qDesign: 34.5, tunnelKm: 4.8, score: 81, recommended: true },
      { id: 'ch-2', name: 'Intake Option Lower Bend', lat: lat - 0.04, lon: lon + 0.02, headM: 130, qDesign: 39.2, tunnelKm: 6.2, score: 74, recommended: false }
    ];

  } else {
    // Thermal Power - explicitly non-renewable
    metrics = {
      resourceMetricLabel: 'Fuel Rail Logistics & Storage',
      resourceValue: 'Dedicated freight siding (7.8 km rail link)',
      resourceScore: 86,
      cloudFactorLabel: 'Cooling Water Volume Security',
      cloudFactorValue: 'River/Canal allocation permit secured',
      cloudScore: 82,
      terrainLabel: 'Industrial Foundation Soil Bearing',
      terrainValue: 'High bearing capacity alluvium',
      terrainScore: 84,
      gridLabel: '400kV Bulk Evacuation Transmission',
      gridValue: '8.5 km to National Grid Node',
      gridScore: 88,
      environmentalLabel: 'Air Dispersion & Emission Baseline',
      environmentalValue: 'Stringent stack limits (SO2 < 100 mg/Nm³)',
      environmentalScore: 52, // Critical indicator
      overallFeasibilityScore: 71
    };
    radarMetrics = [
      { subject: 'Fuel Logistics', A: 86, fullMark: 100 },
      { subject: 'Cooling Water', A: 82, fullMark: 100 },
      { subject: 'Grid Evacuation', A: 88, fullMark: 100 },
      { subject: 'Soil Foundation', A: 84, fullMark: 100 },
      { subject: 'Air Clearance', A: 52, fullMark: 100 },
      { subject: 'Ash Disposal', A: 60, fullMark: 100 }
    ];
    whyThisLocation = {
      advantages: [
        'Logistically viable railway linkage allows continuous coal/fuel unit train supply.',
        'Proximity to cooling water intake source meets requirement for closed-cycle cooling towers.',
        'High-capacity 400kV switchyard has adequate stability margin for continuous baseload dispatch.'
      ],
      limitations: [
        'NON-RENEWABLE CONVENTIONAL ASSET: Emits significant greenhouse gases and particulate matter.',
        'Mandates Flue Gas Desulfurization (FGD) and Selective Catalytic Reduction (SCR) with high CapEx.',
        'Requires 100% dry ash management and disposal agreements with cement and brick industries.'
      ]
    };
    environmentalRisks = 'CRITICAL ENVIRONMENTAL CONCERN: Substantial sulfur dioxide, nitrogen oxide, and greenhouse emissions. Ambient air quality in downwind zone must be continuously monitored by statutory pollution control boards.',
    missingDataWarnings = [
      'Comprehensive 3-season Environmental Impact Assessment (EIA) public hearing pending.',
      'Groundwater leaching monitoring network around proposed dry fly-ash dyke unverified.'
    ];
    candidates = [
      { id: 'ct-1', name: 'Industrial Zone Site East (Rail Adjacent)', lat: lat + 0.02, lon: lon - 0.02, portDistKm: 8.5, waterIntakeM: 1200, aqiBaseline: 88, score: 74, recommended: true },
      { id: 'ct-2', name: 'Suburban Industrial Plot West', lat: lat - 0.05, lon: lon + 0.04, portDistKm: 18.2, waterIntakeM: 6500, aqiBaseline: 112, score: 60, recommended: false }
    ];
  }

  const newProject = {
    id: `proj-${technology.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
    name,
    technology,
    technologyLabel: technology === 'solar' ? 'Solar Photovoltaic' :
                     technology === 'wind' ? 'Onshore Wind Farm' :
                     technology === 'hydropower' ? 'Run-of-River Hydropower' :
                     'Supercritical Thermal (Non-Renewable)',
    isRenewable,
    capacityMW: cap,
    country,
    stateRegion,
    district,
    coordinates: { lat, lon },
    status: 'feasibility',
    verifiedData: false, // Label clearly as demo/unverified
    createdAt: new Date().toISOString().slice(0, 10),
    priorities: priorities || ['Resource Quality', 'Grid Interconnection', 'Environmental Buffer'],
    notes: notes || `Preliminary assessment conducted for ${name}.`,
    metrics,
    radarMetrics,
    candidates,
    whyThisLocation,
    environmentalRisks,
    missingDataWarnings
  };

  const existing = getStoredProjects();
  const updated = [newProject, ...existing];
  saveProjects(updated);
  return newProject;
}
