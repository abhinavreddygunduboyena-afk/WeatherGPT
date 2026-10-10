export const SAMPLE_ALERTS = [
  {
    id: 'alert-off-01',
    title: 'IMD Severe Thunderstorm & Gusty Wind Warning',
    type: 'official_warning',
    typeLabel: 'Official Meteorological Warning',
    severity: 'warning', // 'warning', 'critical', 'advisory'
    category: 'thunderstorm',
    region: 'Hyderabad & Ranga Reddy District',
    coordinates: { lat: 17.3850, lon: 78.4867 },
    issuedAt: '2026-10-09T11:00:00+05:30',
    expiresAt: '2026-10-09T22:00:00+05:30',
    source: 'India Meteorological Department (IMD) - State Centre',
    description: 'Moderate to intense thunderstorms accompanied by lightning and surface wind gusts reaching 40-50 km/h expected across isolated pockets.',
    precautions: [
      'Avoid sheltering under isolated trees or temporary metal canopies during lightning.',
      'Secure loose outdoor materials, scaffolding, and solar array mounting brackets.',
      'Postpone non-essential highway travel during the peak convective storm window (16:00 - 19:30).'
    ]
  },
  {
    id: 'alert-app-02',
    title: 'WeatherGPT Advisory: Elevated Heat Index & Solar Radiation',
    type: 'app_notice',
    typeLabel: 'App-Generated Decision Support Advisory',
    severity: 'advisory',
    category: 'heat',
    region: 'Telangana Southern Plateau',
    coordinates: { lat: 16.7488, lon: 77.9944 },
    issuedAt: '2026-10-09T08:30:00+05:30',
    expiresAt: '2026-10-09T17:00:00+05:30',
    source: 'WeatherGPT Environmental Intelligence Engine',
    description: 'Calculated wet-bulb and dry temperature index will exceed 34°C feels-like threshold between 12:00 and 15:30. Outdoor physical exertion should include mandatory hydration protocols.',
    precautions: [
      'Schedule heavy construction and crane lifts in morning windows before 11:30 AM.',
      'Ensure field workers have access to shade and electrolyte supplies.',
      'Note: This is an analytical model advisory, not an official disaster directive.'
    ]
  },
  {
    id: 'alert-off-03',
    title: 'Coastal High Swell & Wind Hazard Bulletin',
    type: 'official_warning',
    typeLabel: 'Official Meteorological Warning',
    severity: 'critical',
    category: 'marine',
    region: 'Gulf of Kutch & Saurashtra Coastline',
    coordinates: { lat: 22.8350, lon: 69.7120 },
    issuedAt: '2026-10-09T06:00:00+05:30',
    expiresAt: '2026-10-10T18:00:00+05:30',
    source: 'National Ocean Information Centre (INCOIS)',
    description: 'High swell waves in the range of 3.2 - 4.1 meters forecasted. Strong offshore winds 45-55 km/h. Small vessel movement suspended.',
    precautions: [
      'Suspend all barge transfer operations and sea-water intake dredging works.',
      'Reinforce coastal seawalls and check containment dykes around fuel storage terminals.',
      'Adhere strictly to Coast Guard navigational advisories.'
    ]
  }
];
