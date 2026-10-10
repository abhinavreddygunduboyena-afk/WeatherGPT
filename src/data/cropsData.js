/**
 * Agronomic database for crops, growth stages, weather sensitivity thresholds,
 * and environmental risk profiles.
 */

export const CROPS_CATALOG = [
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    localName: 'వరి / Chawal',
    category: 'Cereal / Grain',
    icon: '🌾',
    waterRequirement: 'Very High (1200-1500 mm)',
    preferredSoil: 'Clay Loam / Alluvial (Slow drainage)',
    stages: [
      { id: 'nursery', name: 'Nursery & Seedbed', durationDays: '20-25', sensitivity: 'Moderate', waterNeed: 'Standing water 2-3 cm' },
      { id: 'transplanting', name: 'Transplanting / Early Tillering', durationDays: '20-30', sensitivity: 'High', waterNeed: 'Shallow submergence 3-5 cm' },
      { id: 'vegetative', name: 'Active Tillering & Panicle Initiation', durationDays: '30-40', sensitivity: 'High', waterNeed: 'Submerged 5 cm' },
      { id: 'flowering', name: 'Flowering & Anthesis', durationDays: '15-20', sensitivity: 'Critical', waterNeed: 'Highest water sensitivity; avoid drying' },
      { id: 'grain_filling', name: 'Milking & Grain Dough', durationDays: '20-25', sensitivity: 'High', waterNeed: 'Maintain saturated soil' },
      { id: 'maturity', name: 'Maturity & Harvesting', durationDays: '10-15', sensitivity: 'Low', waterNeed: 'Drain field 10 days before harvest' }
    ],
    thresholds: {
      heatStressC: 36,
      coldStressC: 15,
      criticalWindKmh: 22,
      minSoilMoisturePercent: 35,
      optimalTempMinC: 22,
      optimalTempMaxC: 32
    },
    diseases: [
      { name: 'Rice Blast (Pyricularia oryzae)', triggers: 'RH > 85%, Temp 20-28°C, Overcast/Dew', warning: 'Favorable for leaf and neck blast. Avoid excessive nitrogen top-dressing during humid overcast weeks.' },
      { name: 'Sheath Blight (Rhizoctonia solani)', triggers: 'RH > 80%, Temp 28-32°C, Dense canopy', warning: 'High humidity inside the tillering canopy promotes fungal lesion spread from water line.' }
    ]
  },
  {
    id: 'cotton',
    name: 'Cotton',
    localName: 'పత్తి / Kapas',
    category: 'Commercial Fiber',
    icon: '☁️',
    waterRequirement: 'Medium (600-800 mm)',
    preferredSoil: 'Deep Black Cotton Soil / Well-drained Loam',
    stages: [
      { id: 'sowing', name: 'Land Prep & Sowing', durationDays: '10-15', sensitivity: 'High', waterNeed: 'Moist seedbed; avoid crusting heavy rain' },
      { id: 'seedling', name: 'Seedling Establishment', durationDays: '20-25', sensitivity: 'Moderate', waterNeed: 'Light irrigation; strictly no waterlogging' },
      { id: 'squaring', name: 'Squaring & Vegetative', durationDays: '35-45', sensitivity: 'Moderate', waterNeed: 'Moderate moisture' },
      { id: 'flowering', name: 'Peak Flowering & Boll Development', durationDays: '40-50', sensitivity: 'Critical', waterNeed: 'Peak water demand; moisture stress drops bolls' },
      { id: 'boll_bursting', name: 'Boll Opening & Maturation', durationDays: '25-30', sensitivity: 'High', waterNeed: 'Dry weather required; rain ruins fiber grade' },
      { id: 'picking', name: 'Harvesting / Cotton Picking', durationDays: '20-30', sensitivity: 'Critical', waterNeed: 'Zero rain; sunny dry days essential' }
    ],
    thresholds: {
      heatStressC: 40,
      coldStressC: 16,
      criticalWindKmh: 20,
      minSoilMoisturePercent: 20,
      optimalTempMinC: 25,
      optimalTempMaxC: 35
    },
    diseases: [
      { name: 'Boll Rot & Sucking Pests (Aphids/Whiteflies)', triggers: 'RH > 75%, Temp 26-34°C', warning: 'High humidity and cloudy microclimates favor sucking pest multiplication and fungal boll rot.' },
      { name: 'Bacterial Blight', triggers: 'Wind + Driving rain, Temp 28-34°C', warning: 'Wind-driven rain spreads bacterial pathogens through stomata on tender foliage.' }
    ]
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    localName: 'మొక్కజొన్న / Makka',
    category: 'Cereal / Coarse Grain',
    icon: '🌽',
    waterRequirement: 'Medium (500-700 mm)',
    preferredSoil: 'Well-drained Sandy Loam to Clay Loam',
    stages: [
      { id: 'sowing', name: 'Sowing & Germination', durationDays: '7-10', sensitivity: 'Moderate', waterNeed: 'Adequate seed zone moisture' },
      { id: 'knee_high', name: 'Knee-high (Vegetative)', durationDays: '25-30', sensitivity: 'Moderate', waterNeed: 'Regular soil moisture' },
      { id: 'tasseling', name: 'Tasseling & Silking (Flowering)', durationDays: '15-20', sensitivity: 'Critical', waterNeed: 'Extreme drought sensitivity; water stress causes pollen desiccation' },
      { id: 'grain_filling', name: 'Milking & Dough Stage', durationDays: '25-30', sensitivity: 'High', waterNeed: 'Steady moisture for grain weight' },
      { id: 'maturity', name: 'Black Layer & Harvesting', durationDays: '15-20', sensitivity: 'Low', waterNeed: 'Dry sunny days for field drying' }
    ],
    thresholds: {
      heatStressC: 37,
      coldStressC: 12,
      criticalWindKmh: 24,
      minSoilMoisturePercent: 22,
      optimalTempMinC: 20,
      optimalTempMaxC: 32
    },
    diseases: [
      { name: 'Fall Armyworm (Spodoptera frugiperda)', triggers: 'Warm dry spells followed by light showers', warning: 'Scout whorls of young maize plants during dry, warm vegetative windows.' },
      { name: 'Turcicum Leaf Blight', triggers: 'RH > 80%, Temp 20-26°C with dew', warning: 'Cool humid conditions promote elongated spindle-shaped lesions on middle leaves.' }
    ]
  },
  {
    id: 'chili',
    name: 'Chili (Mirchi)',
    localName: 'మిరప / Mirchi',
    category: 'Spice / Cash Crop',
    icon: '🌶️',
    waterRequirement: 'Medium (600-900 mm)',
    preferredSoil: 'Black Clay Loam / Red Sandy Loam (Good drainage)',
    stages: [
      { id: 'nursery', name: 'Nursery & Hardening', durationDays: '30-40', sensitivity: 'High', waterNeed: 'Frequent light wetting; avoid damping off' },
      { id: 'transplanting', name: 'Transplanting & Vegetative', durationDays: '25-30', sensitivity: 'Moderate', waterNeed: 'Uniform soil moisture; sensitive to stagnation' },
      { id: 'flowering', name: 'Flowering & Fruit Set', durationDays: '30-40', sensitivity: 'Critical', waterNeed: 'High sensitivity: drought causes flower drop; excess causes rot' },
      { id: 'fruit_development', name: 'Fruit Development & Ripening', durationDays: '30-45', sensitivity: 'High', waterNeed: 'Consistent root moisture' },
      { id: 'harvesting', name: 'Picking & Sun Drying', durationDays: '30-40', sensitivity: 'Critical', waterNeed: 'Dry sunny days for drying yards' }
    ],
    thresholds: {
      heatStressC: 38,
      coldStressC: 14,
      criticalWindKmh: 18,
      minSoilMoisturePercent: 25,
      optimalTempMinC: 22,
      optimalTempMaxC: 32
    },
    diseases: [
      { name: 'Anthracnose / Fruit Rot (Dieback)', triggers: 'Continuous drizzle, RH > 80%, Temp 25-30°C', warning: 'Intermittent rainfall during fruiting creates acute anthracnose spore dispersal.' },
      { name: 'Thrips & Mites (Leaf Curl)', triggers: 'Dry spells + High ambient temp', warning: 'Dry warm spells accelerate thrips multiplication on tender leaves.' }
    ]
  },
  {
    id: 'tomato',
    name: 'Tomato',
    localName: 'టమోటా / Tamatar',
    category: 'Vegetable / Horticultural',
    icon: '🍅',
    waterRequirement: 'Medium (500-750 mm)',
    preferredSoil: 'Deep Well-drained Loam (pH 6.0 - 7.0)',
    stages: [
      { id: 'seedling', name: 'Nursery & Transplanting', durationDays: '25-30', sensitivity: 'High', waterNeed: 'Gentle irrigation' },
      { id: 'vegetative', name: 'Vegetative & Branching', durationDays: '25-35', sensitivity: 'Moderate', waterNeed: 'Regular irrigation' },
      { id: 'flowering', name: 'Flowering & Fruit Set', durationDays: '25-30', sensitivity: 'Critical', waterNeed: 'Temperatures > 34°C cause flower abortion' },
      { id: 'fruiting', name: 'Fruit Development & Breaker', durationDays: '30-40', sensitivity: 'High', waterNeed: 'Avoid moisture fluctuations (prevents blossom end rot/cracking)' },
      { id: 'harvesting', name: 'Harvesting & Grading', durationDays: '20-30', sensitivity: 'Moderate', waterNeed: 'Dry picking conditions' }
    ],
    thresholds: {
      heatStressC: 35,
      coldStressC: 13,
      criticalWindKmh: 18,
      minSoilMoisturePercent: 25,
      optimalTempMinC: 20,
      optimalTempMaxC: 30
    },
    diseases: [
      { name: 'Late Blight (Phytophthora infestans)', triggers: 'RH > 90%, Temp 15-24°C, Cloudy/Rain', warning: 'Cool wet canopies cause rapid destructive blight spread on foliage and green fruit.' },
      { name: 'Early Blight (Alternaria solani)', triggers: 'Alternating wet and dry periods, Temp 24-30°C', warning: 'Warm humid spells trigger concentric target-board lesions on lower foliage.' }
    ]
  },
  {
    id: 'wheat',
    name: 'Wheat',
    localName: 'గోధుమ / Gehun',
    category: 'Rabi Cereal',
    icon: '🌾',
    waterRequirement: 'Low-Medium (400-600 mm)',
    preferredSoil: 'Well-aerated Clay Loam / Alluvial',
    stages: [
      { id: 'crown_root', name: 'Crown Root Initiation (CRI)', durationDays: '20-25', sensitivity: 'Critical', waterNeed: 'Mandatory 1st irrigation stage for root crown' },
      { id: 'tillering', name: 'Tillering & Jointing', durationDays: '25-35', sensitivity: 'Moderate', waterNeed: 'Steady root zone moisture' },
      { id: 'flowering', name: 'Booting & Flowering (Heading)', durationDays: '20-25', sensitivity: 'Critical', waterNeed: 'Water stress directly reduces spikelet fertility' },
      { id: 'milking', name: 'Milk & Dough Stage', durationDays: '25-30', sensitivity: 'Critical', waterNeed: 'Terminal heat stress risk; maintain light moisture' },
      { id: 'harvesting', name: 'Maturity & Combine Harvesting', durationDays: '15-20', sensitivity: 'Low', waterNeed: 'Zero moisture; golden ripe straw' }
    ],
    thresholds: {
      heatStressC: 32,
      coldStressC: 5,
      criticalWindKmh: 20,
      minSoilMoisturePercent: 20,
      optimalTempMinC: 15,
      optimalTempMaxC: 26
    },
    diseases: [
      { name: 'Yellow / Stripe Rust (Puccinia striiformis)', triggers: 'High humidity/fog, Temp 10-18°C', warning: 'Cool foggy mornings favor yellow rust pustules in linear stripes.' },
      { name: 'Terminal Heat Stress', triggers: 'Daily Max Temp > 32°C during grain filling', warning: 'Early summer heat shrivels grains and cuts thousand-grain weight.' }
    ]
  },
  {
    id: 'groundnut',
    name: 'Groundnut (Peanut)',
    localName: 'వేరుశనగ / Moongphali',
    category: 'Oilseed / Legume',
    icon: '🥜',
    waterRequirement: 'Low-Medium (450-650 mm)',
    preferredSoil: 'Light Sandy Loam (Loose texture for peg entry)',
    stages: [
      { id: 'sowing', name: 'Sowing & Germination', durationDays: '8-12', sensitivity: 'Moderate', waterNeed: 'Moist loose friable soil' },
      { id: 'vegetative', name: 'Vegetative Growth', durationDays: '20-25', sensitivity: 'Moderate', waterNeed: 'Moderate moisture' },
      { id: 'flowering', name: 'Flowering & Peg Penetration', durationDays: '25-35', sensitivity: 'Critical', waterNeed: 'Soil must be moist and friable for pegs to penetrate underground' },
      { id: 'pod_development', name: 'Pod Development & Kernel Filling', durationDays: '30-40', sensitivity: 'Critical', waterNeed: 'Crucial for pod weight and oil content' },
      { id: 'harvesting', name: 'Digging & Pod Drying', durationDays: '10-15', sensitivity: 'High', waterNeed: 'Dry soil; rain during digging rots pods and triggers aflatoxin' }
    ],
    thresholds: {
      heatStressC: 38,
      coldStressC: 15,
      criticalWindKmh: 22,
      minSoilMoisturePercent: 18,
      optimalTempMinC: 22,
      optimalTempMaxC: 32
    },
    diseases: [
      { name: 'Tikka Leaf Spot (Cercospora)', triggers: 'RH > 80%, Temp 25-30°C with leaf wetness', warning: 'Extended cloud cover and high humidity promote rapid defoliation.' },
      { name: 'Aflatoxin Contamination (Aspergillus)', triggers: 'Drought during pod maturity followed by late rain', warning: 'End-season soil drying followed by pod wetting promotes Aspergillus molds.' }
    ]
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    localName: 'చెరకు / Ganna',
    category: 'Long-duration Commercial',
    icon: '🎋',
    waterRequirement: 'High (1500-2500 mm)',
    preferredSoil: 'Deep Fertile Loam with Adequate Drainage',
    stages: [
      { id: 'germination', name: 'Germination & Sprouting', durationDays: '35-45', sensitivity: 'Moderate', waterNeed: 'Frequent light watering' },
      { id: 'formative', name: 'Formative / Tillering Phase', durationDays: '60-75', sensitivity: 'Critical', waterNeed: 'High water requirement; maximum shoot growth' },
      { id: 'grand_growth', name: 'Grand Growth Phase (Cane Elongation)', durationDays: '120-150', sensitivity: 'High', waterNeed: 'Regular irrigation matching ET0' },
      { id: 'ripening', name: 'Ripening & Sugar Accumulation', durationDays: '60-90', sensitivity: 'Moderate', waterNeed: 'Withhold irrigation 2-3 weeks before harvest to concentrate sucrose' }
    ],
    thresholds: {
      heatStressC: 42,
      coldStressC: 12,
      criticalWindKmh: 28,
      minSoilMoisturePercent: 30,
      optimalTempMinC: 24,
      optimalTempMaxC: 36
    },
    diseases: [
      { name: 'Red Rot (Colletotrichum falcatum)', triggers: 'Waterlogged fields + warm humid weather', warning: 'Poor field drainage after heavy monsoon rain triggers devastating red rot spread.' }
    ]
  }
];

export const SOIL_TYPES = [
  { id: 'black_clay', name: 'Black Cotton / Clay Soil', waterRetention: 'Very High', drainage: 'Slow (Prone to waterlogging)', desc: 'High clay content; cracks deeply when dry, swells and holds water when wet.' },
  { id: 'red_loam', name: 'Red Sandy Loam', waterRetention: 'Moderate', drainage: 'Fast (Well-drained)', desc: 'Porous texture with good aeration; requires frequent light irrigations.' },
  { id: 'alluvial', name: 'Alluvial / Riverine Loam', waterRetention: 'High', drainage: 'Moderate', desc: 'Highly fertile and balanced in moisture retention and drainage.' },
  { id: 'sandy', name: 'Sandy / Coastal Soil', waterRetention: 'Low', drainage: 'Very Fast (Rapid percolation)', desc: 'Fast water infiltration; nutrients leach quickly under heavy downpours.' },
  { id: 'general', name: 'General / Not Sure', waterRetention: 'Average', drainage: 'Moderate', desc: 'Standard agricultural soil baseline.' }
];

export const IRRIGATION_METHODS = [
  { id: 'rainfed', name: 'Rain-fed (No Canal/Borewell)', desc: 'Completely dependent on seasonal rainfall and soil moisture storage.' },
  { id: 'drip', name: 'Drip Irrigation (Micro-irrigation)', desc: 'Targeted water delivery directly to root zone with high efficiency.' },
  { id: 'sprinkler', name: 'Sprinkler Irrigation', desc: 'Overhead spray simulating rain; sensitive to strong wind drift.' },
  { id: 'flood', name: 'Flood / Furrow / Basin', desc: 'Surface flooding; high water volume, susceptible to pooling during rain.' }
];

export const AREA_UNITS = ['Acres', 'Hectares', 'Bighas', 'Guntas', 'Cents'];
