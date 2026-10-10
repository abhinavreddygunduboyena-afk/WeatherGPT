export const SAMPLE_ENERGY_PROJECTS = [
  {
    id: 'proj-sol-01',
    name: 'Telangana Deccan Solar Array',
    technology: 'solar',
    technologyLabel: 'Solar Photovoltaic',
    isRenewable: true,
    capacityMW: 150,
    country: 'India',
    stateRegion: 'Telangana',
    district: 'Mahabubnagar',
    coordinates: { lat: 16.7488, lon: 77.9944 },
    status: 'detailed_review',
    verifiedData: false, // clearly demo data
    createdAt: '2026-09-12',
    priorities: ['High GHI Yield', 'Substation Proximity', 'Flat Barren Scrubland'],
    notes: 'Proposed 150 MW utility-scale tracking PV system connecting to the 220kV State Transmission Network.',
    metrics: {
      resourceMetricLabel: 'Global Horizontal Irradiance (GHI)',
      resourceValue: '5.42 kWh/m²/day',
      resourceScore: 91,
      cloudFactorLabel: 'Mean Annual Cloud Cover',
      cloudFactorValue: '28.4%',
      cloudScore: 84,
      terrainLabel: 'Terrain Slope & Land Use',
      terrainValue: '< 2.5° slope, Barren / Scrub',
      terrainScore: 89,
      gridLabel: 'Grid Interconnection Distance',
      gridValue: '4.2 km to 220kV Substation',
      gridScore: 92,
      environmentalLabel: 'Protected / Eco Buffer',
      environmentalValue: 'Zero forest overlap, 18km from sanctuary',
      environmentalScore: 95,
      overallFeasibilityScore: 90
    },
    radarMetrics: [
      { subject: 'Solar Resource', A: 91, fullMark: 100 },
      { subject: 'Grid Access', A: 92, fullMark: 100 },
      { subject: 'Terrain Suitability', A: 89, fullMark: 100 },
      { subject: 'Low Cloud Penalty', A: 84, fullMark: 100 },
      { subject: 'Eco Safeguards', A: 95, fullMark: 100 },
      { subject: 'Water Availability', A: 78, fullMark: 100 }
    ],
    candidates: [
      { id: 'c1', name: 'Site Alpha (Jadcherla Plains)', lat: 16.772, lon: 78.021, areaHectares: 320, ghi: 5.46, gridDistKm: 3.8, slopeDeg: 1.8, score: 92, recommended: true },
      { id: 'c2', name: 'Site Beta (Balanagar Plateau)', lat: 16.890, lon: 78.110, areaHectares: 290, ghi: 5.39, gridDistKm: 7.2, slopeDeg: 3.1, score: 85, recommended: false },
      { id: 'c3', name: 'Site Gamma (Koilkonda Uplands)', lat: 16.650, lon: 77.850, areaHectares: 410, ghi: 5.41, gridDistKm: 11.5, slopeDeg: 4.8, score: 79, recommended: false }
    ],
    whyThisLocation: {
      advantages: [
        'Consistently high annual GHI exceeding 5.4 kWh/m²/day with minimal monsoon shading duration.',
        'Immediate proximity (3.8 km) to a 220kV bay at the Jadcherla grid substation with available evacuation headroom.',
        'Flat semi-arid terrain classified as non-agricultural scrubland minimizing resettlement and land acquisition friction.'
      ],
      limitations: [
        'Elevated ambient summer temperatures (exceeding 42°C in April-May) cause a 4.2% thermal derating on silicon modules.',
        'Dust accumulation requires optimized dry automated robotic cleaning or seasonal water allocation.'
      ]
    },
    environmentalRisks: 'Low ecological impact. No scheduled wildlife migration corridors. Groundwater extraction for panel cleaning is prohibited by local aquifer regulations.',
    missingDataWarnings: [
      'On-site ground pyranometer telemetry missing (currently using 10km satellite reanalysis data).',
      'Geotechnical soil resistivity and pull-out tests required prior to final piling design.'
    ]
  },
  {
    id: 'proj-wnd-02',
    name: 'Anantapur Wind Corridor Cluster',
    technology: 'wind',
    technologyLabel: 'Onshore Wind Farm',
    isRenewable: true,
    capacityMW: 200,
    country: 'India',
    stateRegion: 'Andhra Pradesh',
    district: 'Anantapur',
    coordinates: { lat: 14.6819, lon: 77.6007 },
    status: 'feasibility',
    verifiedData: false,
    createdAt: '2026-08-20',
    priorities: ['Hub-Height Wind Resource (>7.5 m/s)', 'Ridge Topography', 'Evacuation Capacity'],
    notes: '200 MW onshore wind turbine farm targeting 140m hub heights on ridge topography.',
    metrics: {
      resourceMetricLabel: 'Mean Wind Speed (120m hub)',
      resourceValue: '7.82 m/s (Weibull k=2.15)',
      resourceScore: 88,
      cloudFactorLabel: 'Seasonal Wind Uniformity',
      cloudFactorValue: 'High during SW monsoon (May–Sep)',
      cloudScore: 78,
      terrainLabel: 'Terrain Elevation & Roughness',
      terrainValue: 'Undulating ridge, z0 = 0.03m',
      terrainScore: 86,
      gridLabel: '400kV PGCIL Substation Corridor',
      gridValue: '12.8 km interconnection',
      gridScore: 81,
      environmentalLabel: 'Bat & Avian Migration Buffer',
      environmentalValue: 'Outside known flyways, acoustic study needed',
      environmentalScore: 82,
      overallFeasibilityScore: 83
    },
    radarMetrics: [
      { subject: 'Wind Resource', A: 88, fullMark: 100 },
      { subject: 'Grid Access', A: 81, fullMark: 100 },
      { subject: 'Topography Suitability', A: 86, fullMark: 100 },
      { subject: 'Seasonal Stability', A: 78, fullMark: 100 },
      { subject: 'Avian Risk Buffer', A: 82, fullMark: 100 },
      { subject: 'Road Logistics (Blades)', A: 75, fullMark: 100 }
    ],
    candidates: [
      { id: 'cw1', name: 'Ridge Sector East (Gooty Ridge)', lat: 15.115, lon: 77.640, areaHectares: 540, meanWindSpeed: 7.95, gridDistKm: 11.2, roughness: 0.02, score: 87, recommended: true },
      { id: 'cw2', name: 'Plateau Sector West (Uravakonda)', lat: 14.940, lon: 77.260, areaHectares: 680, meanWindSpeed: 7.60, gridDistKm: 14.5, roughness: 0.04, score: 81, recommended: false },
      { id: 'cw3', name: 'Valley Inflow Sector (Penukonda)', lat: 14.080, lon: 77.590, areaHectares: 490, meanWindSpeed: 7.30, gridDistKm: 19.8, roughness: 0.06, score: 74, recommended: false }
    ],
    whyThisLocation: {
      advantages: [
        'Strong channelized wind speeds during the southwest monsoon peaking over 9.5 m/s.',
        'Continuous ridgeline providing natural flow acceleration (speed-up factor of ~1.12).',
        'Direct access to national highway NH-44 enabling heavy transport of 75m turbine blades.'
      ],
      limitations: [
        'Significant seasonal wind lull between November and February yielding low capacity factor during winter.',
        'Challenging civil work required for crane platforms on rocky basalt ridges.'
      ]
    },
    environmentalRisks: 'Moderate raptor activity noted in adjacent crags. Acoustic deterrence and automated curtailment sensors recommended during dusk flight times.',
    missingDataWarnings: [
      'Full 12-month met mast LiDAR lidar records not yet completed (currently at 7 months).',
      'Wake interference modeling pending final turbine model selection.'
    ]
  },
  {
    id: 'proj-hyd-03',
    name: 'Teesta Basin Run-of-River Hydro',
    technology: 'hydropower',
    technologyLabel: 'Run-of-River Hydropower',
    isRenewable: true,
    capacityMW: 75,
    country: 'India',
    stateRegion: 'Sikkim',
    district: 'Mangan',
    coordinates: { lat: 27.5020, lon: 88.5280 },
    status: 'concept',
    verifiedData: false,
    createdAt: '2026-07-05',
    priorities: ['Perennial Discharge', 'Hydraulic Head (>180m)', 'Geotechnical Stability'],
    notes: '75 MW run-of-river scheme utilizing 195m net head with deep rock tunnel headrace.',
    metrics: {
      resourceMetricLabel: 'Design River Discharge (Q)',
      resourceValue: '48.5 m³/s (90% dependable flow)',
      resourceScore: 85,
      cloudFactorLabel: 'Seasonal Hydrograph Ratio',
      cloudFactorValue: 'Monsoon:Lean = 4.8:1',
      cloudScore: 72,
      terrainLabel: 'Gross Hydraulic Head',
      terrainValue: '195 m gross head drop',
      terrainScore: 94,
      gridLabel: 'Trans-Himalayan Grid Corridor',
      gridValue: '28.5 km to 400kV GIS Switchyard',
      gridScore: 68,
      environmentalLabel: 'Environmental Flow Mandate',
      environmentalValue: '20% continuous eco-discharge maintained',
      environmentalScore: 80,
      overallFeasibilityScore: 79
    },
    radarMetrics: [
      { subject: 'Hydraulic Head', A: 94, fullMark: 100 },
      { subject: 'River Flow', A: 85, fullMark: 100 },
      { subject: 'Slope Stability', A: 68, fullMark: 100 },
      { subject: 'Eco-Flow Compliance', A: 80, fullMark: 100 },
      { subject: 'Grid Corridor', A: 68, fullMark: 100 },
      { subject: 'Flood Resiliency', A: 73, fullMark: 100 }
    ],
    candidates: [
      { id: 'ch1', name: 'Intake Option A (Chungthang Confluence)', lat: 27.601, lon: 88.640, headM: 205, qDesign: 46.2, tunnelKm: 5.4, score: 82, recommended: true },
      { id: 'ch2', name: 'Intake Option B (Lachen Gorge)', lat: 27.720, lon: 88.550, headM: 180, qDesign: 51.0, tunnelKm: 7.1, score: 76, recommended: false }
    ],
    whyThisLocation: {
      advantages: [
        'Glacial and monsoon-fed perennial river system providing reliable base discharge.',
        'Steep gorge geometry enables 195m head with relatively compact 5.4km headrace tunnel.',
        'Run-of-river layout avoids major storage inundation and forest submergence.'
      ],
      limitations: [
        'High seismic zone (Zone IV/V) and landslide susceptibility along desilting basin slope.',
        'Extremely abrasive suspended sediment during flood season requires ceramic-coated turbine runners.'
      ]
    },
    environmentalRisks: 'Riparian ecosystem sensitivity. Requires round-the-clock environmental flow enforcement and upstream GLOF (Glacial Lake Outburst Flood) monitoring radar.',
    missingDataWarnings: [
      'Long-term silt sediment load sampling during peak monsoon is incomplete.',
      'Comprehensive seismic microzonation and subsurface core borings awaiting forest permits.'
    ]
  },
  {
    id: 'proj-thm-04',
    name: 'Coastal Logistics Thermal Facility',
    technology: 'thermal',
    technologyLabel: 'Supercritical Thermal (Non-Renewable)',
    isRenewable: false,
    capacityMW: 660,
    country: 'India',
    stateRegion: 'Gujarat',
    district: 'Kutch',
    coordinates: { lat: 22.8350, lon: 69.7120 },
    status: 'feasibility',
    verifiedData: false,
    createdAt: '2026-06-15',
    priorities: ['Deepwater Port Fuel Access', 'Cooling Seawater Supply', 'Air Quality Dispersion'],
    notes: 'CRITICAL: Thermal power is a non-renewable, fossil-fuel asset. Proposed single-unit 660 MW supercritical coal/blend plant with sea-water cooling and flue-gas desulfurization (FGD).',
    metrics: {
      resourceMetricLabel: 'Fuel Rail/Port Logistics',
      resourceValue: 'Imported coal via conveyor (6.5 km to port)',
      resourceScore: 92,
      cloudFactorLabel: 'Cooling Water Availability',
      cloudFactorValue: 'Deep seawater intake pipeline permitted',
      cloudScore: 90,
      terrainLabel: 'Coastal Soil & Foundation',
      terrainValue: 'Marine clay requiring piled raft foundation',
      terrainScore: 71,
      gridLabel: '765kV High-Capacity Evacuation',
      gridValue: '14.2 km to 765kV Wardha-Kutch node',
      gridScore: 89,
      environmentalLabel: 'Air Quality & Emission Baseline',
      environmentalValue: 'PM2.5 baseline elevated; FGD & SCR mandated',
      environmentalScore: 54, // lower score due to high emission stringency
      overallFeasibilityScore: 73
    },
    radarMetrics: [
      { subject: 'Fuel Logistics', A: 92, fullMark: 100 },
      { subject: 'Cooling Water', A: 90, fullMark: 100 },
      { subject: 'Grid Evacuation', A: 89, fullMark: 100 },
      { subject: 'Foundation Ground', A: 71, fullMark: 100 },
      { subject: 'Air Quality Clearance', A: 54, fullMark: 100 },
      { subject: 'Fly Ash Disposal', A: 68, fullMark: 100 }
    ],
    candidates: [
      { id: 'ct1', name: 'Coastal Plot A (Mundra North)', lat: 22.845, lon: 69.730, portDistKm: 6.2, waterIntakeM: 850, aqiBaseline: 82, score: 76, recommended: true },
      { id: 'ct2', name: 'Inland Plot B (Anjar Corridor)', lat: 23.110, lon: 70.020, portDistKm: 28.5, waterIntakeM: 14000, aqiBaseline: 94, score: 62, recommended: false }
    ],
    whyThisLocation: {
      advantages: [
        'Immediate proximity to deep-water coal unloading terminal significantly lowers transportation landed cost.',
        'Abundant seawater for once-through or closed-loop cooling eliminating freshwater depletion.',
        'High-voltage 765kV national grid backbone capable of absorbing 660 MW baseload.'
      ],
      limitations: [
        'NON-RENEWABLE ASSET: High greenhouse gas footprint (approx. 780 g CO2/kWh under supercritical regime).',
        'Stringent Ministry of Environment statutory clearances required for SO2, NOx, and mercury limits.',
        'Marine outfall thermal plume restrictions must not exceed +3°C above ambient seawater temperature.'
      ]
    },
    environmentalRisks: 'HIGH SENSITIVITY: Coastal mangrove buffer zone within 4 km. Mandates continuous online emission monitoring (CEMS) and 100% fly ash utilization agreement with nearby cement manufacturers.',
    missingDataWarnings: [
      'Baseline seasonal ambient air quality (AAQ) monitoring must be repeated for post-monsoon cycle.',
      'Marine thermal dispersion hydrodynamic modeling report pending coastal zone review.'
    ]
  }
];
