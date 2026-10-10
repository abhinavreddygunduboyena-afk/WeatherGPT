# WeatherGPT Node.js + Express Backend Service

A lightweight, secure Node.js + Express backend service for WeatherGPT. It centralizes secret credentials, proxies AI and transit routing APIs, validates client inputs, provides CORS support, and connects seamlessly to the React + Vite frontend.

---

## 1. Architecture & Endpoints

| Endpoint | Method | Purpose | Authentication / Credentials |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | System health, uptime & service status | None (Public) |
| `/api/farmer/ai-chat` | `POST` | Multilingual Farmer AI Assistant | Optional `GEMINI_API_KEY` (falls back to local agro engine) |
| `/api/route` | `GET` | Driving directions & route coordinates | Optional `OPENROUTESERVICE_API_KEY` (falls back to OSRM) |
| `/api/imd/warnings` | `GET` | Official IMD statutory weather alerts | Optional `IMD_API_KEY` (reports authorization requirements) |
| `/api/bhashini/info` | `GET` | Indian language speech engine status | Optional `BHASHINI_API_KEY` (reports active speech provider) |
| `/api/bhashini/tts` | `POST` | Bhashini Indian language speech proxy | Optional `BHASHINI_API_KEY` |

> **Note on Open-Meteo:** Public weather forecasting and geocoding continue to be retrieved directly from Open-Meteo by the frontend (`src/services/weatherService.js`), avoiding unnecessary server bandwidth and latency overhead.

---

## 2. Windows Setup & Running Instructions

### Option A: Running from the Project Root (Recommended)

1. **Install Backend Dependencies:**
   ```cmd
   npm run server:install
   ```

2. **Run Backend Service (Port 3001):**
   ```cmd
   npm run server
   ```
   *(For development with auto-reload: `npm run server:dev`)*

3. **Run Frontend in a Second Terminal (Port 5173):**
   ```cmd
   npm run dev
   ```

---

### Option B: Running from the `server/` Directory

1. **Navigate to the server directory:**
   ```cmd
   cd server
   ```

2. **Install dependencies:**
   ```cmd
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   ```cmd
   copy .env.example .env
   ```

4. **Start the Express Server:**
   ```cmd
   npm start
   ```

---

## 3. Environment Variables Configuration (`server/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | Express HTTP server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin for CORS |
| `GEMINI_API_KEY` | *(None)* | Google AI Studio key for generative farmer responses |
| `OPENROUTESERVICE_API_KEY` | *(None)* | OpenRouteService key for premium driving directions |
| `IMD_API_KEY` | *(None)* | India Meteorological Department official data access key |
| `BHASHINI_API_KEY` | *(None)* | Digital India National Language Translation Mission key |
