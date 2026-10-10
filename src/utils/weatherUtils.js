// Interpret WMO Weather Interpretation Codes (WW)
export function getWmoWeatherInfo(code) {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', icon: 'Sun', severity: 'normal', color: 'text-amber-500' };
    case 1:
      return { label: 'Mainly Clear', icon: 'Sun', severity: 'normal', color: 'text-amber-400' };
    case 2:
      return { label: 'Partly Cloudy', icon: 'CloudSun', severity: 'normal', color: 'text-blue-400' };
    case 3:
      return { label: 'Overcast', icon: 'Cloud', severity: 'normal', color: 'text-slate-400' };
    case 45:
    case 48:
      return { label: 'Fog & Depositing Rime Fog', icon: 'CloudFog', severity: 'advisory', color: 'text-slate-400' };
    case 51:
    case 53:
    case 55:
      return { label: 'Drizzle', icon: 'CloudDrizzle', severity: 'normal', color: 'text-blue-400' };
    case 61:
    case 63:
    case 65:
      return { label: 'Rain', icon: 'CloudRain', severity: 'normal', color: 'text-blue-500' };
    case 66:
    case 67:
      return { label: 'Freezing Rain', icon: 'CloudSnow', severity: 'warning', color: 'text-cyan-400' };
    case 71:
    case 73:
    case 75:
      return { label: 'Snowfall', icon: 'Snowflake', severity: 'advisory', color: 'text-cyan-300' };
    case 77:
      return { label: 'Snow Grains', icon: 'Snowflake', severity: 'advisory', color: 'text-cyan-200' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', icon: 'CloudRain', severity: 'normal', color: 'text-blue-600' };
    case 85:
    case 86:
      return { label: 'Snow Showers', icon: 'CloudSnow', severity: 'advisory', color: 'text-cyan-400' };
    case 95:
      return { label: 'Thunderstorm', icon: 'CloudLightning', severity: 'warning', color: 'text-amber-500' };
    case 96:
    case 99:
      return { label: 'Severe Thunderstorm with Hail', icon: 'CloudLightning', severity: 'critical', color: 'text-red-500' };
    default:
      return { label: 'Moderate Weather', icon: 'Cloud', severity: 'normal', color: 'text-blue-400' };
  }
}

export function degreesToCompass(deg) {
  if (deg === null || deg === undefined) return 'N/A';
  const val = Math.round((deg / 22.5) + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[(val % 16)];
}

export function getUvCategory(uv) {
  if (uv < 3) return { level: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  if (uv < 6) return { level: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
  if (uv < 8) return { level: 'High', color: 'text-amber-500', bg: 'bg-amber-500/10' };
  if (uv < 11) return { level: 'Very High', color: 'text-red-500', bg: 'bg-red-500/10' };
  return { level: 'Extreme', color: 'text-purple-500', bg: 'bg-purple-500/10' };
}

export function convertTemperature(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || isNaN(celsius)) {
    return '--';
  }
  if (unit === 'F') {
    return Math.round((celsius * 9 / 5 + 32) * 10) / 10;
  }
  return Math.round(celsius * 10) / 10;
}
