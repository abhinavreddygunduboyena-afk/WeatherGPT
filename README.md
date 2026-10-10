# WeatherGPT — Environmental & Energy Intelligence Platform

WeatherGPT is a production-grade, engineering-inspired web platform combining **Real-Time Weather Decision Support** with **Energy-Site Feasibility Intelligence** across Solar, Wind, Hydropower, and Thermal generation assets.

Designed for energy planners, industrial developers, municipal teams, and environmental engineers.

---

## 🚀 Quick Start

### 1. Installation
Install frontend and backend dependencies:
```cmd
npm install
npm run server:install
```

### 2. Running Frontend & Backend on Windows

**Terminal 1 — Run Express Backend (Port 3001):**
```cmd
npm run server
```

**Terminal 2 — Run React + Vite Frontend (Port 5173):**
```cmd
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Production Build
```cmd
npm run build
npm run preview
```

---

## 🌟 Core Architecture & Capabilities

### 1. Weather Intelligence Engine
- **Live NWP Atmospheric Telemetry**: Real-time numerical weather prediction data powered by Open-Meteo REST API (zero key required, global coordinate resolution).
- **Comprehensive Observations**: Temperature, feels-like, WMO weather codes, relative humidity, wind speed & directional compass, surface barometric pressure, visibility, UV radiation risk index, sunrise and sunset times.
- **Diurnal & 7-Day Forecasting**: Scrollable hourly strip with temperature trends and precipitation probability bars (powered by Recharts).
- **WeatherGPT Conversational Assistant**:
  - Context-aware atmospheric queries.
  - Outdoor college event and conference planning.
  - Travel window comparisons (morning vs evening).
  - Safety precautions and PPE guidelines.
  - Multi-lingual capability including native **Telugu** weather summaries (`Explain the forecast in Telugu`).
- **Weather Impact Simulator**: Evaluates operational thresholds for College Events, Agriculture / Spraying, Highway Travel, Construction & Crane Work, Outdoor Sports, and Heavy Field Work. Explicitly factors in model uncertainty (never makes false guarantees of 100% safety).
- **Travel-Weather Corridor Advisor**: Interpolates road surface risk, localized showers, and arrival estimates along highway corridors (e.g. Hyderabad → Vijayawada, Hyderabad → Bangalore).
- **Hazard Alerts Bulletin**: Strict provenance division between **Official Statutory Meteorological Warnings** (e.g. IMD, INCOIS) and **App-Generated Algorithmic Advisories**.

---

### 2. Energy-Site Intelligence Engine
- **Multi-Criteria Assessment Workspace**: Tailored physical parameters per energy technology:
  - **Solar Photovoltaic**: GHI solar insolation, cloud coverage attenuation, slope stability, grid substation proximity, eco-buffers.
  - **Onshore Wind**: Hub-height wind speeds (120m), Weibull shape parameters, terrain roughness, grid evacuation, avian flyways.
  - **Run-of-River Hydropower**: River discharge hydrographs (Q), gross hydraulic head, lean/monsoon ratios, continuous environmental flow mandate (20%), landslide/seismic stability.
  - **Thermal Power**: Strictly designated as **Non-Renewable Fossil Resource**. Assesses railway fuel sidings, port logistics, cooling water volumes, baseline PM2.5/NOx airsheds, and statutory FGD clearances.
- **Explainable Feasibility ("Why this location?")**: Itemizes positive engineering drivers and operational bottlenecks for every candidate parcel.
- **Multi-Candidate Site Ranking Table**: Sortable, filterable candidate comparisons.
- **Study Area Mapping**: Leaflet-powered GIS map featuring centroid hubs, candidate markers, and 15km study perimeter geometry with cartographic dark/light theme switching.
- **Printable Feasibility Report**: Clean technical memorandum ready for browser printing (`window.print()`) or JSON export.

---

### 3. Design System & Theme Engine
- **Themes**: Fully designed **Deep Navy / Slate** dark theme (`#060a12`, `#0b1325`, `#14203d`) and **Cool Slate / Crisp White** light theme (`#ffffff`, `#f8fafc`, `#e2e8f0`).
- **Visual Palette**: Semantic Blue for weather, Energy Teal for generation sites, Amber for advisories, and Red restricted to severe hazards and non-renewable designations.
- **Responsive Shell**: Collapsible sidebar on desktop, responsive mobile drawer, accessible top navigation bar with live search autocomplete.
- **Persistence**: Theme, metric/imperial units, active station, and newly created energy projects persist across browser sessions in `localStorage`.

---

## 🔌 Integration Status

| Subsystem | Integration Layer | Status | Provenance Badge |
|---|---|---|---|
| **Live Global Weather** | Open-Meteo REST API | Connected & Live | `LIVE OBSERVATION` |
| **Soil & Agro Telemetry** | Open-Meteo Agromet API | Connected & Live | `Live API` |
| **Farmer Intelligence AI** | Gemini 1.5 Flash / Local Agro Core | Connected & Active | `Agro AI / Dual-Core` |
| **Multilingual Voice AI** | Web Speech API & Bhashini Pipeline | Connected & Active | `Voice AI Agent` |
| **Express Backend Service** | Node.js Express (Port 3001) | Connected & Running | `Express Proxy Active` |
| **Highway Route Directions** | OpenRouteService / OSRM | Connected & Live | `ORS / OSRM Routing` |
| **Atmospheric Conversational AI**| WeatherGPT Context Engine | Connected & Active | `Context-Aware AI` |
| **Official Weather Warnings** | IMD Statutory Warnings Proxy | Secure Proxy Active | `Ministry of Earth Sciences` |
| **Energy Feasibility Models** | Multi-Criteria Analytical Models | Deterministic Simulation | `DEMO DATA — NOT VERIFIED` |
| **Cloud Database Sync** | Supabase REST Client | Configured via `.env.example` | `LOCAL CACHE / DEMO` |

---

## 📁 Code Organization

```
WeatherGPT/
├── server/                   # Lightweight Node.js + Express Backend
│   ├── src/
│   │   ├── config/env.js     # Validated environment configuration & safe status
│   │   ├── controllers/      # farmerController, routeController, alertController, speechController
│   │   ├── middleware/       # validator.js, errorHandler.js
│   │   ├── routes/           # farmerRoutes, routeRoutes, alertRoutes, speechRoutes, healthRoutes
│   │   └── index.js          # Express app entry point (port 3001)
│   ├── .env.example          # Server environment template
│   └── package.json          # Express dependencies
│
├── src/                      # React 18 + Vite Frontend
│   ├── components/
│   │   ├── farmer/           # FarmerVoiceAssistant, FarmerChat, FarmerForecastTabs, FarmProfileCard, FarmerWeatherCard, FarmerRecommendations, FarmerAlertsPanel
│   │   ├── weather/          # CurrentWeatherCard, ForecastTabs, WeatherChat, ImpactSimulator, TravelAdvisor, AlertsList
│   │   ├── energy/           # Dashboard, Workspace, TechCriteriaCard, CandidateComparison, Explainability, PrintableReport, CreateModal
│   │   ├── layout/           # AppLayout, Sidebar, TopNav, NotificationPanel
│   │   └── common/           # Button, Card, Badge, Modal, Table, Tabs, Input
│   ├── contexts/             # ThemeContext, WeatherContext, EnergyContext, FarmerContext
│   ├── data/                 # cropsData, indianLanguages, defaultLocations, sampleEnergyProjects
│   ├── pages/                # OverviewPage, WeatherPage, EnergyPage, FarmerPage, SavedLocationsPage, ProjectsPage, AlertsPage, SettingsPage
│   ├── services/             # weatherService, farmerAssistantService, farmingAdvisoryService, speechService, geoService
│   └── App.jsx
│
├── vite.config.js            # Vite config with backend proxy (/api -> http://localhost:3001)
└── package.json              # Frontend scripts & root workspace runners
```
