export const DEFAULT_LOCATIONS = [
  {
    id: 'hyd-in',
    name: 'Hyderabad',
    region: 'Telangana',
    country: 'India',
    lat: 17.3850,
    lon: 78.4867,
    timezone: 'Asia/Kolkata',
    elevation: 542,
    isDefault: true
  },
  {
    id: 'lon-uk',
    name: 'London',
    region: 'Greater London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    timezone: 'Europe/London',
    elevation: 25
  },
  {
    id: 'sfo-us',
    name: 'San Francisco',
    region: 'California',
    country: 'United States',
    lat: 37.7749,
    lon: -122.4194,
    timezone: 'America/Los_Angeles',
    elevation: 16
  },
  {
    id: 'tyo-jp',
    name: 'Tokyo',
    region: 'Kanto',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    timezone: 'Asia/Tokyo',
    elevation: 40
  },
  {
    id: 'syd-au',
    name: 'Sydney',
    region: 'New South Wales',
    country: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    timezone: 'Australia/Sydney',
    elevation: 19
  },
  {
    id: 'ber-de',
    name: 'Berlin',
    region: 'Berlin',
    country: 'Germany',
    lat: 52.5200,
    lon: 13.4050,
    timezone: 'Europe/Berlin',
    elevation: 34
  }
];

export const SAMPLE_FALLBACK_WEATHER = {
  location: DEFAULT_LOCATIONS[0],
  isLive: false,
  lastUpdated: new Date().toISOString(),
  source: 'WeatherGPT Baseline Simulation Engine (Demo)',
  current: {
    temperature: 28.5,
    feelsLike: 30.2,
    condition: 'Partly Cloudy',
    weatherCode: 2,
    humidity: 58,
    windSpeed: 14.4,
    windDirection: 215,
    windDirectionText: 'SW',
    visibility: 9.8,
    pressure: 1012.4,
    uvIndex: 7.2,
    sunrise: '06:12 AM',
    sunset: '06:05 PM',
    isDay: 1
  },
  hourly: [
    { time: '06:00', temp: 22.1, precipProb: 5, windSpeed: 8, condition: 'Clear', weatherCode: 0 },
    { time: '08:00', temp: 24.3, precipProb: 10, windSpeed: 10, condition: 'Sunny', weatherCode: 1 },
    { time: '10:00', temp: 27.0, precipProb: 15, windSpeed: 12, condition: 'Partly Cloudy', weatherCode: 2 },
    { time: '12:00', temp: 29.8, precipProb: 20, windSpeed: 15, condition: 'Partly Cloudy', weatherCode: 2 },
    { time: '14:00', temp: 31.2, precipProb: 35, windSpeed: 17, condition: 'Scattered Clouds', weatherCode: 3 },
    { time: '16:00', temp: 30.0, precipProb: 40, windSpeed: 16, condition: 'Scattered Clouds', weatherCode: 3 },
    { time: '18:00', temp: 27.5, precipProb: 25, windSpeed: 13, condition: 'Partly Cloudy', weatherCode: 2 },
    { time: '20:00', temp: 25.4, precipProb: 15, windSpeed: 11, condition: 'Clear', weatherCode: 1 },
    { time: '22:00', temp: 24.0, precipProb: 5, windSpeed: 9, condition: 'Clear', weatherCode: 0 }
  ],
  daily: [
    { date: 'Today', maxTemp: 31.2, minTemp: 22.0, condition: 'Partly Cloudy', weatherCode: 2, rainProb: 35, windSpeed: 15, uv: 7.2 },
    { date: 'Tomorrow', maxTemp: 32.5, minTemp: 22.8, condition: 'Sunny', weatherCode: 1, rainProb: 15, windSpeed: 12, uv: 8.0 },
    { date: 'Wed', maxTemp: 30.1, minTemp: 21.5, condition: 'Isolated Showers', weatherCode: 80, rainProb: 65, windSpeed: 18, uv: 5.5 },
    { date: 'Thu', maxTemp: 29.4, minTemp: 21.0, condition: 'Thunderstorm Risk', weatherCode: 95, rainProb: 75, windSpeed: 22, uv: 4.8 },
    { date: 'Fri', maxTemp: 31.0, minTemp: 22.2, condition: 'Partly Cloudy', weatherCode: 2, rainProb: 20, windSpeed: 14, uv: 7.4 },
    { date: 'Sat', maxTemp: 33.0, minTemp: 23.1, condition: 'Sunny & Warm', weatherCode: 0, rainProb: 10, windSpeed: 11, uv: 8.5 },
    { date: 'Sun', maxTemp: 32.2, minTemp: 23.0, condition: 'Mostly Sunny', weatherCode: 1, rainProb: 15, windSpeed: 13, uv: 8.1 }
  ]
};
