import { CROPS_CATALOG, SOIL_TYPES, IRRIGATION_METHODS } from '../data/cropsData.js';

/**
 * Generate transparent, rule-based agrometeorological recommendations
 * based on live Open-Meteo telemetry and the farmer's crop profile.
 */
export function generateFarmingAdvisory(weatherData, farmProfile) {
  if (!weatherData) return null;

  const current = weatherData.current || {};
  const daily = weatherData.daily || [];
  const hourly = weatherData.hourly || [];
  const soil = weatherData.soil || {};

  const crop = CROPS_CATALOG.find(c => c.id === farmProfile.cropId) || CROPS_CATALOG[0];
  const stage = crop.stages.find(s => s.id === farmProfile.stageId) || crop.stages[2];
  const soilType = SOIL_TYPES.find(s => s.id === farmProfile.soilId) || SOIL_TYPES[4];
  const irrigation = IRRIGATION_METHODS.find(i => i.id === farmProfile.irrigationId) || IRRIGATION_METHODS[0];

  // 1. Calculate cumulative 48h and 7-day rainfall
  const next48hRainMm = (daily[0]?.precipSumMm || 0) + (daily[1]?.precipSumMm || 0);
  const next7DaysRainMm = daily.slice(0, 7).reduce((acc, d) => acc + (d.precipSumMm || 0), 0);
  const maxRainProb48h = Math.max(daily[0]?.rainProb || 0, daily[1]?.rainProb || 0);
  const maxTemp48h = Math.max(daily[0]?.maxTemp || current.temperature || 30, daily[1]?.maxTemp || 30);
  const maxWindKmh = Math.max(current.windSpeed || 0, daily[0]?.windSpeed || 0, daily[1]?.windSpeed || 0);

  // 2. Reference Evapotranspiration
  const et0Today = soil.et0Today || (daily[0]?.et0 || 4.8);
  const et0Week = soil.et0WeekSum || 35.0;

  // 3. Volumetric soil moisture percentage
  const soilMoisturePercent = soil.moisturePercent ?? (soil.moisture0to1cm ? Math.round(soil.moisture0to1cm * 100) : 24);

  const advisories = [];
  const alerts = [];

  // ==========================================
  // ADVISORY 1: IRRIGATION SCHEDULING
  // ==========================================
  if (next48hRainMm >= 12 || maxRainProb48h >= 65) {
    advisories.push({
      id: 'irrigation_postpone',
      category: 'Irrigation Management',
      title: 'Postpone Irrigation — Natural Precipitation Expected',
      status: 'Advisory',
      badgeVariant: 'blue',
      icon: 'Droplets',
      forecastIndicator: `Forecast indicates ~${Math.round(next48hRainMm)} mm precipitation (${maxRainProb48h}% probability) across next 48 hours. Estimated ET0 crop water demand is ~${et0Today} mm/day.`,
      agronomicImpact: `For ${crop.name} in ${stage.name} stage (${soilType.name}), natural rainfall is sufficient to recharge the root zone. Excessive watering combined with rain promotes water stagnation, root asphyxiation, and nutrient leaching.`,
      suggestedAction: 'Hold off planned canal, tube-well, or flood irrigation for 48-72 hours. Check furrow drainage outlets to allow excess rainwater discharge if soil is black clay.',
      forecastWindow: 'Next 48 Hours',
      dataSource: 'Open-Meteo High-Resolution NWP',
      explainability: {
        forecastData: `Rainfall: ${next48hRainMm} mm | Rain Prob: ${maxRainProb48h}% | Soil Moisture: ${soilMoisturePercent}%`,
        cropStageContext: `${crop.name} at ${stage.name} (${stage.waterNeed})`,
        mechanism: `When anticipated rainfall exceeds daily evapotranspiration (${et0Today} mm), additional irrigation incurs wasted pumping expenditure and reduces root oxygenation.`,
        recommendedAction: 'Postpone irrigation; monitor field watermarks after rain.',
        limitations: 'Convective rainfall can vary locally; re-verify topsoil wetness before resuming pumping.'
      }
    });
  } else if (next7DaysRainMm <= 3 && maxTemp48h >= 32 && soilMoisturePercent < 22) {
    const isCriticalStage = ['flowering', 'tasseling', 'grain_filling', 'squaring', 'formative', 'pod_development'].includes(stage.id);
    advisories.push({
      id: 'irrigation_schedule',
      category: 'Irrigation Management',
      title: isCriticalStage ? 'Critical Irrigation Required — Moisture Deficit Looming' : 'Schedule Routine Irrigation',
      status: isCriticalStage ? 'Warning' : 'Advisory',
      badgeVariant: isCriticalStage ? 'amber' : 'emerald',
      icon: 'Droplets',
      forecastIndicator: `Dry spell across next 7 days (< ${Math.round(next7DaysRainMm)} mm rain expected). Cumulative atmospheric water demand (ET0) is ~${Math.round(et0Week)} mm with soil moisture at ~${soilMoisturePercent}%.`,
      agronomicImpact: `In ${stage.name} stage (${stage.sensitivity} moisture sensitivity), drought stress causes flower abortion, poor grain filling, or stunted tillering in ${crop.name}.`,
      suggestedAction: irrigation.id === 'drip' 
        ? 'Operate drip cycles in early morning or evening hours to minimize evaporative losses.'
        : 'Schedule light furrow or basin irrigation within the next 24-48 hours. Avoid deep standing water in hot midday sun.',
      forecastWindow: 'Next 3-5 Days',
      dataSource: 'Open-Meteo High-Resolution NWP',
      explainability: {
        forecastData: `7-Day Rain: ${next7DaysRainMm} mm | Weekly ET0: ${et0Week} mm | Soil Moisture: ${soilMoisturePercent}%`,
        cropStageContext: `${crop.name} at ${stage.name} (Sensitivity: ${stage.sensitivity})`,
        mechanism: `High vapor pressure deficit driven by temperatures reaching ${maxTemp48h}°C accelerates transpirational demand, depleting root zone moisture.`,
        recommendedAction: 'Apply recommended moisture replenishment; prioritize early morning cycles.',
        limitations: 'Actual irrigation volume depends on local well discharge capacity and field slope.'
      }
    });
  } else {
    advisories.push({
      id: 'irrigation_stable',
      category: 'Irrigation Management',
      title: 'Maintain Balanced Soil Moisture Baseline',
      status: 'Optimal',
      badgeVariant: 'emerald',
      icon: 'Droplets',
      forecastIndicator: `Forecast indicates light intermittent moisture (~${Math.round(next7DaysRainMm)} mm over 7 days). Current soil moisture is ~${soilMoisturePercent}% volumetric water content.`,
      agronomicImpact: `Soil moisture levels are currently within the acceptable physiological range for ${crop.name} at ${stage.name}.`,
      suggestedAction: 'Maintain regular scheduled checks. No emergency adjustments required today.',
      forecastWindow: 'Next 5 Days',
      dataSource: 'Open-Meteo High-Resolution NWP',
      explainability: {
        forecastData: `Moisture: ${soilMoisturePercent}% | Daily ET0: ~${et0Today} mm/day`,
        cropStageContext: `${crop.name} at ${stage.name}`,
        mechanism: 'Soil moisture matches atmospheric evaporative demand within steady equilibrium.',
        recommendedAction: 'Continue standard agronomic monitoring.',
        limitations: 'Microclimate variations in sandy or gravelly patches may require spot checks.'
      }
    });
  }

  // ==========================================
  // ADVISORY 2: FOLIAR SPRAY & FIELD WORK WINDOW
  // ==========================================
  const hourlyNext24h = hourly.slice(0, 24);
  const safeSprayHours = hourlyNext24h.filter(h => (h.windSpeed || 0) < 15 && (h.precipProb || 0) < 25 && (h.temp || 25) < 35);
  const isWindy = maxWindKmh >= 18;
  const isRainImminent = (daily[0]?.rainProb || 0) >= 50 || (daily[0]?.precipSumMm || 0) >= 4;

  if (isRainImminent) {
    advisories.push({
      id: 'spray_rain_risk',
      category: 'Foliar Spray & Crop Protection',
      title: 'Avoid Chemical Sprays — Rain Washoff Risk',
      status: 'Warning',
      badgeVariant: 'amber',
      icon: 'AlertTriangle',
      forecastIndicator: `High precipitation probability (${daily[0]?.rainProb || 0}%) or showers expected within 24 hours.`,
      agronomicImpact: `Foliar pesticides, micro-nutrients, or bio-fungicides require a minimum rain-free drying window of 4-6 hours to adhere and penetrate leaf cuticles.`,
      suggestedAction: 'Postpone scheduled foliar spraying until skies clear and rain risk drops below 30% to avoid wasted input costs and chemical runoff.',
      forecastWindow: 'Next 24 Hours',
      dataSource: 'Open-Meteo High-Resolution NWP',
      explainability: {
        forecastData: `Rain Prob: ${daily[0]?.rainProb}% | Expected Rain: ${daily[0]?.precipSumMm || 0} mm`,
        cropStageContext: `${crop.name} at ${stage.name}`,
        mechanism: 'Raindrops mechanically wash active ingredients off foliage into soil, polluting runoff and neutralizing protection efficacy.',
        recommendedAction: 'Reschedule foliar applications to a clear forecast window.',
        limitations: 'Systemic formulations with rain-fast stickers may tolerate light mist, but heavy showers will neutralize efficacy.'
      }
    });
  } else if (isWindy) {
    advisories.push({
      id: 'spray_wind_drift',
      category: 'Foliar Spray & Crop Protection',
      title: 'Strong Wind Drift Warning — Delay Spraying Operations',
      status: 'Advisory',
      badgeVariant: 'amber',
      icon: 'Wind',
      forecastIndicator: `Gusty surface winds reaching ${Math.round(maxWindKmh)} km/h detected in the forecast (safe threshold is < 15 km/h).`,
      agronomicImpact: `High wind velocities cause fine aerosol droplets to drift off-target, reducing canopy coverage on ${crop.name} and risking scorch to neighbouring parcels.`,
      suggestedAction: 'Suspend motorized or knapsack spray operations until late evening or early morning when boundary-layer winds subside below 12 km/h.',
      forecastWindow: 'Next 24-36 Hours',
      dataSource: 'Open-Meteo High-Resolution NWP',
      explainability: {
        forecastData: `Max Wind Speed: ${Math.round(maxWindKmh)} km/h`,
        cropStageContext: `${crop.name} at ${stage.name}`,
        mechanism: 'Wind velocity above 15 km/h imparts lateral velocity exceeding droplet settling rates, causing significant aerodynamic drift.',
        recommendedAction: 'Operate nozzles only in calm morning hours (< 12 km/h).',
        limitations: 'Local windbreaks, trees, and terrain can modulate local ground velocity.'
      }
    });
  } else {
    advisories.push({
      id: 'spray_favorable',
      category: 'Foliar Spray & Crop Protection',
      title: 'Favorable Spray Window Available',
      status: 'Optimal',
      badgeVariant: 'emerald',
      icon: 'CheckCircle2',
      forecastIndicator: `Calm boundary layer conditions (wind < 14 km/h, rain probability < 20%). ${safeSprayHours.length} suitable daytime hours identified.`,
      agronomicImpact: `Optimal atmospheric conditions for foliar nutrient sprays, bio-agents, or targeted protective treatments on ${crop.name}.`,
      suggestedAction: 'Recommended spraying window: early morning (07:00 - 10:00 AM) or late afternoon (04:00 - 06:30 PM). Always wear protective farm gear.',
      forecastWindow: 'Next 24 Hours',
      dataSource: 'Open-Meteo High-Resolution NWP',
      explainability: {
        forecastData: `Wind: ${Math.round(current.windSpeed || 10)} km/h | Rain Prob: ${daily[0]?.rainProb || 10}%`,
        cropStageContext: `${crop.name} canopy`,
        mechanism: 'Low wind velocity minimizes drift while moderate humidity prevents rapid droplet desiccation before cuticular absorption.',
        recommendedAction: 'Utilize this window for any scheduled agronomic treatments.',
        limitations: 'Always follow manufacturer safety instructions; do not spray in intense midday direct heat.'
      }
    });
  }

  // ==========================================
  // ADVISORY 3: HEAT STRESS OR COLD ALERT
  // ==========================================
  if (maxTemp48h >= crop.thresholds.heatStressC) {
    advisories.push({
      id: 'heat_stress_advisory',
      category: 'Thermal Stress & Plant Physiology',
      title: `High Thermal Stress Warning (Max ${Math.round(maxTemp48h)}°C)`,
      status: 'Warning',
      badgeVariant: 'red',
      icon: 'Sun',
      forecastIndicator: `Daily maximum temperatures projected to touch ${Math.round(maxTemp48h)}°C, exceeding the ${crop.thresholds.heatStressC}°C physiological comfort threshold for ${crop.name}.`,
      agronomicImpact: stage.id === 'flowering' || stage.id === 'tasseling'
        ? `Acute risk during ${stage.name}: High temperatures desiccate pollen grains, shorten stigma receptivity, and trigger substantial blossom drop.`
        : `Elevated respiration over photosynthesis rates; accelerated moisture loss and leaf rolling.`,
      suggestedAction: irrigation.id === 'drip'
        ? 'Provide light, frequent drip pulses to cool root microclimate.'
        : 'Ensure soil does not bake dry; apply straw mulching if available to reduce root-zone thermal buildup.',
      forecastWindow: 'Next 48 Hours',
      dataSource: 'Open-Meteo High-Resolution NWP',
      explainability: {
        forecastData: `Max Temp: ${Math.round(maxTemp48h)}°C (Threshold: ${crop.thresholds.heatStressC}°C)`,
        cropStageContext: `${crop.name} in ${stage.name}`,
        mechanism: 'Enzymatic inactivation and pollen desiccation occur when ambient temperatures surpass thermal physiological maximums.',
        recommendedAction: 'Maintain soil moisture buffer to support transpirational cooling.',
        limitations: 'Canopy temperatures may differ by 2-3°C depending on transpirational vigor.'
      }
    });

    alerts.push({
      id: 'heat_alert',
      type: 'Thermal Heat Stress',
      severity: 'moderate',
      message: `Max temperature reaches ${Math.round(maxTemp48h)}°C. High thermal risk for ${crop.name} in ${stage.name}. Keep fields hydrated.`,
      threshold: `Max Temp ≥ ${crop.thresholds.heatStressC}°C`,
      source: 'Open-Meteo High-Resolution NWP (Agro Model)',
      officialLink: 'https://mausam.imd.gov.in/'
    });
  }

  // ==========================================
  // ADVISORY 4: MICROCLIMATIC PEST & DISEASE RISK
  // ==========================================
  const currentHumidity = current.humidity || 50;
  const isHighHumidity = currentHumidity >= 75 || (hourlyNext24h.filter(h => (h.humidity || 0) >= 80).length >= 8);
  const isModerateTemp = (current.temperature || 26) >= 20 && (current.temperature || 26) <= 32;

  if (isHighHumidity && isModerateTemp && crop.diseases.length > 0) {
    const primaryDisease = crop.diseases[0];
    advisories.push({
      id: 'disease_risk_advisory',
      category: 'Pest & Disease Microclimate',
      title: `Elevated Microclimate Risk: ${primaryDisease.name}`,
      status: 'Advisory',
      badgeVariant: 'amber',
      icon: 'ShieldAlert',
      forecastIndicator: `High ambient humidity (${currentHumidity}%) combined with warm moderate temperatures (${Math.round(current.temperature || 26)}°C) creates prolonged canopy dew/wetness.`,
      agronomicImpact: `${primaryDisease.warning}`,
      suggestedAction: 'Conduct vigilant field scouting of lower leaves and stem bases. Ensure field drainage pathways are free of weeds to improve canopy air circulation.',
      forecastWindow: 'Next 3-5 Days',
      dataSource: 'Open-Meteo Microclimate Telemetry',
      explainability: {
        forecastData: `Relative Humidity: ${currentHumidity}% | Ambient Temp: ${Math.round(current.temperature || 26)}°C`,
        cropStageContext: `${crop.name} (${primaryDisease.triggers})`,
        mechanism: 'Extended leaf wetness duration exceeding 6-8 hours provides the liquid water film required for fungal spore germination and stomatal penetration.',
        recommendedAction: 'Scout 20 random plants across field diagonals; seek local Krishi Vigyan Kendra (KVK) guidance if lesions emerge.',
        limitations: 'Environmental indicator only; actual disease incidence depends on previous field inoculums and varietal resistance.'
      }
    });
  }

  // ==========================================
  // ADVISORY 5: STAGE-SPECIFIC FIELD GUIDANCE
  // ==========================================
  if (stage.id === 'maturity' || stage.id === 'harvesting' || stage.id === 'picking') {
    if (next7DaysRainMm <= 5) {
      advisories.push({
        id: 'harvest_window_good',
        category: 'Harvest & Post-Harvest',
        title: 'Clear Harvesting & Sun-Drying Window Ahead',
        status: 'Optimal',
        badgeVariant: 'emerald',
        icon: 'Sparkles',
        forecastIndicator: `Dry sunny weather projected for the next 7 days (rain sum < ${Math.round(next7DaysRainMm)} mm).`,
        agronomicImpact: `Critical for harvesting and post-harvest drying of ${crop.name}. Low moisture prevents seed mold, discoloration, and aflatoxin development.`,
        suggestedAction: 'Mobilize combine harvesters or labor to complete cutting, threshing, and yard drying during this favorable dry spell.',
        forecastWindow: 'Next 5-7 Days',
        dataSource: 'Open-Meteo High-Resolution NWP',
        explainability: {
          forecastData: `7-Day Rain: ${next7DaysRainMm} mm | Sunny Daytime Conditions`,
          cropStageContext: `${crop.name} at ${stage.name}`,
          mechanism: 'Absence of rain and high solar radiation allows grain/fiber moisture to fall below the 12-14% safe storage threshold.',
          recommendedAction: 'Execute harvest and threshing; prepare tarpaulins as routine safety measure.',
          limitations: 'Monitor overnight dew levels which may delay morning threshing by 1-2 hours.'
        }
      });
    } else {
      advisories.push({
        id: 'harvest_window_wet',
        category: 'Harvest & Post-Harvest',
        title: 'Harvest Alert — Protect Mature Crop Against Wetting',
        status: 'Warning',
        badgeVariant: 'red',
        icon: 'AlertTriangle',
        forecastIndicator: `Rainfall of ~${Math.round(next7DaysRainMm)} mm projected during the harvest window.`,
        agronomicImpact: `Rain falling on mature unharvested ${crop.name} triggers grain sprouting, lodging, and fungal pod/boll rot.`,
        suggestedAction: 'If crop is cut, transfer sheaves immediately to sheltered threshing floors or cover with waterproof tarpaulins. Delay fresh cutting until rain passes.',
        forecastWindow: 'Next 3-5 Days',
        dataSource: 'Open-Meteo High-Resolution NWP',
        explainability: {
          forecastData: `Expected Rain: ${next7DaysRainMm} mm`,
          cropStageContext: `${crop.name} in harvest stage`,
          mechanism: 'Free moisture on mature seed coats re-hydrates grain enzymes, triggering pre-harvest sprouting and fungal colonization.',
          recommendedAction: 'Protect harvested produce with tarpaulins; dig drainage trenches in flat fields.',
          limitations: 'Localized convective storm cells may produce higher rainfall totals than model averages.'
        }
      });

      alerts.push({
        id: 'harvest_rain_alert',
        type: 'Harvest Weather Disruption',
        severity: 'high',
        message: `Rainfall forecasted during ${crop.name} harvesting. Protect drying yards and postpone un-sheltered cutting.`,
        threshold: `Precipitation ≥ ${Math.round(next7DaysRainMm)} mm during maturity`,
        source: 'Open-Meteo High-Resolution NWP',
        officialLink: 'https://mausam.imd.gov.in/'
      });
    }
  }

  // ==========================================
  // WEATHER-BASED ALERTS GENERATION
  // ==========================================
  if (next48hRainMm >= 30) {
    alerts.push({
      id: 'heavy_rain_alert',
      type: 'Heavy Rainfall Warning',
      severity: 'high',
      message: `Significant rainfall (~${Math.round(next48hRainMm)} mm in 48h) expected. Check field bunds and ensure open drainage to prevent waterlogging.`,
      threshold: '48-Hour Rainfall ≥ 30 mm',
      source: 'Open-Meteo High-Resolution NWP Model',
      officialLink: 'https://mausam.imd.gov.in/'
    });
  }

  if (soilType.id === 'black_clay' && next48hRainMm >= 20) {
    alerts.push({
      id: 'waterlogging_alert',
      type: 'Waterlogging & Root Asphyxiation Risk',
      severity: 'moderate',
      message: `Black cotton clay soils have slow infiltration. Rainfall of ${Math.round(next48hRainMm)} mm will cause surface ponding. Clear drainage furrows.`,
      threshold: 'Clay Soil + Rain ≥ 20 mm',
      source: 'Open-Meteo Agro-Pedology Model',
      officialLink: 'https://imdgeospatial.imd.gov.in/agromet.html'
    });
  }

  if (maxWindKmh >= 25) {
    alerts.push({
      id: 'high_wind_alert',
      type: 'Strong Wind Hazard',
      severity: 'moderate',
      message: `Wind gusts of ${Math.round(maxWindKmh)} km/h. Risk of lodging in tall crops (maize, sugarcane) and spray drift. Check trellises.`,
      threshold: 'Wind Gusts ≥ 25 km/h',
      source: 'Open-Meteo Atmospheric Forecast',
      officialLink: 'https://mausam.imd.gov.in/'
    });
  }

  if (next7DaysRainMm < 2 && et0Week >= 35 && soilMoisturePercent < 20) {
    alerts.push({
      id: 'dry_spell_alert',
      type: 'Extended Dry Spell',
      severity: 'moderate',
      message: `7-day dry spell with high atmospheric evaporation (${Math.round(et0Week)} mm ET0). Soil moisture at ${soilMoisturePercent}%. Moisture stress developing.`,
      threshold: '7-Day Rain < 2 mm & Soil Moisture < 20%',
      source: 'Open-Meteo Agro-Drought Model',
      officialLink: 'https://imdgeospatial.imd.gov.in/agromet.html'
    });
  }

  return {
    crop,
    stage,
    soilType,
    irrigation,
    metrics: {
      next48hRainMm: Math.round(next48hRainMm * 10) / 10,
      next7DaysRainMm: Math.round(next7DaysRainMm * 10) / 10,
      maxTemp48h: Math.round(maxTemp48h),
      maxWindKmh: Math.round(maxWindKmh),
      et0Today,
      et0Week: Math.round(et0Week),
      soilMoisturePercent,
      safeSprayHoursCount: safeSprayHours.length
    },
    advisories,
    alerts,
    lastGenerated: new Date().toISOString()
  };
}
