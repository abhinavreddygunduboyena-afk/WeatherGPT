/**
 * Multilingual Context-Aware Farmer Assistant Service.
 * Evaluates farmer questions against active crop profile, phenology, and real-time Open-Meteo telemetry.
 * Connects to modular Gemini LLM proxy if configured; otherwise utilizes the robust, rule-based
 * Indian agrometeorological reasoning engine supporting Telugu, Hindi, and English out-of-the-box.
 */

export async function askFarmerAssistant(
  userQuery,
  weatherData,
  farmProfile,
  farmingAdvisory,
  selectedLanguage = 'te',
  conversationHistory = []
) {
  const query = userQuery.toLowerCase().trim();
  const lang = selectedLanguage || 'te';

  // 1. ATTEMPT SECURE BACKEND LLM CALL (GEMINI)
  try {
    const apiResponse = await fetch('/api/farmer/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userQuery,
        lang,
        weather: weatherData,
        farm: farmProfile,
        advisory: farmingAdvisory,
        history: conversationHistory
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      if (data.success && data.answer) {
        return {
          text: data.answer,
          provider: data.provider || 'Google Gemini 1.5 Flash',
          isLlm: true
        };
      }
    }
  } catch (backendErr) {
    // Graceful fallback to local engine if server proxy times out or is offline
  }

  // 2. HIGH-PRECISION LOCAL AGRONOMIC ENGINE (ZERO-KEY FALLBACK)
  // Simulate natural brief inference delay (200-350ms)
  await new Promise(resolve => setTimeout(resolve, 250));

  const locName = weatherData?.location?.name || 'Selected Farm';
  const current = weatherData?.current || {};
  const daily = weatherData?.daily || [];
  const soil = weatherData?.soil || {};

  const crop = farmingAdvisory?.crop || { name: 'Crop', category: 'Agriculture', thresholds: { heatStressC: 36 } };
  const stage = farmingAdvisory?.stage || { name: 'Current Stage', sensitivity: 'Moderate' };
  const soilType = farmingAdvisory?.soilType || { name: 'Black Soil / Clay' };
  const irrigation = farmingAdvisory?.irrigation || { name: 'Scheduled Irrigation' };
  const metrics = farmingAdvisory?.metrics || {};

  const rain48h = metrics.next48hRainMm ?? 0;
  const rain7d = metrics.next7DaysRainMm ?? 0;
  const soilMoist = metrics.soilMoisturePercent ?? 24;
  const et0 = metrics.et0Today ?? 4.8;
  const temp = current.temperature ?? 28;
  const wind = current.windSpeed ?? 10;
  const humidity = current.humidity ?? 55;
  const maxWind = metrics.maxWindKmh ?? wind;
  const rainProb = daily[0]?.rainProb ?? 15;

  // Determine language intent: explicit language code or script detection
  const isTelugu = lang === 'te' || /[\u0C00-\u0C7F]/.test(query);
  const isHindi = lang === 'hi' || /[\u0900-\u097F]/.test(query);

  // Intent Detection
  const isRainQuery = query.includes('rain') || query.includes('shower') || query.includes('वर्षा') || query.includes('बारिश') || query.includes('వర్షం') || query.includes('వాన');
  const isIrrigationQuery = query.includes('irrigate') || query.includes('water') || query.includes('సింఛాయి') || query.includes('सिंचाई') || query.includes('నీరు') || query.includes('తడి');
  const isSprayQuery = query.includes('spray') || query.includes('pesticide') || query.includes('छिड़काव') || query.includes('दवा') || query.includes('పిచికారీ') || query.includes('మందు');
  const isHarvestQuery = query.includes('harvest') || query.includes('cutting') || query.includes('कटाई') || query.includes('కోత') || query.includes('నూర్పిడి');
  const isWindQuery = query.includes('wind') || query.includes('gust') || query.includes('हवा') || query.includes('आंधी') || query.includes('గాలి') || query.includes('తుఫాను');
  const isFlowerQuery = query.includes('flower') || query.includes('pollination') || query.includes('फूल') || query.includes('పువ్వు') || query.includes('పూత');

  let answerText = '';

  // --------------------------------------------------------------------------
  // A. TELUGU RESPONSES (తెలుగు)
  // --------------------------------------------------------------------------
  if (isTelugu) {
    // Specific check for chilli + rain ("మిరప పంటకు రేపు వర్షం పడితే ఏమి చేయాలి?")
    if ((query.includes('మిరప') || crop.id === 'chili') && (query.includes('వర్షం') || query.includes('వాన') || isRainQuery)) {
      answerText = `🌶️ **మిరప పంటకు వర్ష సూచన జాగ్రత్తలు (${locName}):**\n\n` +
        `రాబోయే సమయంలో సుమారు **~${rain48h} mm** (వచ్చే 7 రోజుల్లో మొత్తం **~${rain7d} mm**) వర్షపాతం నమోదయ్యే అవకాశం ఉంది.\n\n` +
        `**మిరప పంట రక్షణకు వెంటనే చేయవలసిన పనులు:**\n` +
        `• **మురుగునీటి పారుదల:** పొలంలో ఎక్కడా వర్షపు నీరు నిల్వ ఉండకుండా కాలువలను వెంటనే క్లియర్ చేయండి. నీరు నిలిస్తే వేరుకుళ్ళు మరియు కొమ్మ ఎండు తెగుళ్ళు తీవ్రమవుతాయి.\n` +
        `• **కళ్లంలో ఉన్న కాయలు:** ఆరబోసిన ఎండిన మిరపకాయలు ఉంటే తడవకుండా టార్పాలిన్లతో వెంటనే కప్పి భద్రపరచండి.\n` +
        `• **వర్షం తగ్గాక రక్షణ:** వర్షం ఆగిన వెంటనే కొమ్మకుళ్ళు, కాయకుళ్ళు (ఆంత్రాక్నోస్) నివారణకు సిఫార్సు చేసిన శిలీంద్ర సంహారిణి (ఉదా: కాపర్ ఆక్సిక్లోరైడ్ లేదా మాంకోజెబ్) పిచికారీ చేయండి.\n` +
        `• కొత్తగా ఎరువులు లేదా రసాయనాల పిచికారీని వర్షం తగ్గే వరకు వాయిదా వేయండి.`;
    } else if ((query.includes('వరి') || crop.id === 'rice') && isIrrigationQuery) {
      if (rain48h >= 10) {
        answerText = `🌾 **వరి పొలానికి నీటిపారుదల సలహా (${locName}):**\n\n` +
          `**రేపు వరి చేనుకు కొత్తగా నీరు పెట్టడం వాయిదా వేయండి.**\n\n` +
          `• **కారణం:** రాబోయే 48 గంటల్లో సుమారు **${rain48h} mm** వర్షం పడే అవకాశం ఉంది (${daily[0]?.rainProb || 20}% సంభావ్యత).\n` +
          `• వర్షపు నీరే పంటకు సరిపోతుంది కాబట్టి విద్యుత్ మరియు నీటి వనరులను ఆదా చేసుకోండి.\n` +
          `• చేలగట్లను పరిశీలించి అధిక నీరు బయటకు పోయేందుకు మదుములను సిద్ధం చేయండి.`;
      } else {
        answerText = `🌾 **వరి పొలానికి నీటిపారుదల సలహా (${locName}):**\n\n` +
          `**అవును, మీ వరి పొలానికి తగినంత నీరు పారించవచ్చు.**\n\n` +
          `• రాబోయే 48 గంటల్లో భారీ వర్ష సూచన లేదు (కేవలం ~${rain48h} mm వర్షం).\n` +
          `• వరి పంట ${stage.name} దశలో ఉన్నందున నేలలో తేమ నిరంతరం ఉండేలా చూసుకోండి. ఉదయం లేదా సాయంత్రం వేళల్లో నీరు పెట్టడం మంచిది.`;
      }
    } else if (isHarvestQuery && (query.includes('వర్షం') || query.includes('వాన') || rain7d > 2)) {
      if (rain7d > 5 || rain48h > 2) {
        answerText = `⚠️ **వర్షం వల్ల పంట కోతపై ప్రభావం (${locName}):**\n\n` +
          `**అవును, రాబోయే వర్షం పంట కోతను ప్రభావితం చేసే అవకాశం ఉంది.**\n\n` +
          `• వచ్చే 7 రోజుల్లో మొత్తం సుమారు **${rain7d} mm** వర్షపాతం అంచనా వేయబడింది.\n` +
          `• తడి వాతావరణంలో కోత కోస్తే గింజలలో తేమ పెరిగి రంగు మారడం, మొలక రావడం లేదా బూజు పట్టే ప్రమాదం ఉంది.\n` +
          `• కోత మిషన్లు తడి నేలలో దిగబడిపోతాయి. కాబట్టి వర్షం తగ్గి నేల ఆరే వరకు కోతను వాయిదా వేయండి.\n` +
          `• కోసిన పంట కళ్లంలో ఉంటే వెంటనే టార్పాలిన్లతో కప్పి సురక్షిత ప్రదేశంలో ఉంచండి.`;
      } else {
        answerText = `🌾 **పంట కోతపై వాతావరణ ప్రభావం (${locName}):**\n\n` +
          `**లేదు, రాబోయే వాతావరణం పంట కోతకు చాలా అనుకూలంగా ఉంది.**\n\n` +
          `• రాబోయే 7 రోజుల్లో పొడి ఎండ వాతావరణం ఉంటుంది (మొత్తం వర్షం కేవలం ~${rain7d} mm).\n` +
          `• కోత పనులు పూర్తి చేసుకోవడానికి మరియు ధాన్యాన్ని కళ్లంలో ఆరబెట్టుకోవడానికి ఇది సరైన సమయం.`;
      }
    } else if (isRainQuery) {
      if (rain7d > 15 || rain48h > 5) {
        answerText = `🌧️ **${locName} వర్షపాత సూచన:**\n\n` +
          `రాబోయే 48 గంటల్లో సుమారు **${rain48h} mm**, మరియు వచ్చే 7 రోజుల్లో మొత్తం **${rain7d} mm** వర్షం పడే అవకాశం ఉంది.\n\n` +
          `**మీ ${crop.name} పంటకు సలహా (${stage.name}):**\n` +
          `• పంటకు నీరు పెట్టడం తాత్కాలికంగా ఆపండి.\n` +
          `• పొలంలో నీరు నిల్వ ఉండకుండా మురుగు కాలువలను శుభ్రం చేయండి.\n` +
          `• ఎరువులు చల్లడం లేదా మందుల పిచికారీ చేయడం వర్షం తగ్గే వరకు వాయిదా వేయండి.`;
      } else {
        answerText = `☀️ **${locName} వర్షపాత సూచన:**\n\n` +
          `రాబోయే 7 రోజుల్లో పెద్దగా వర్ష సూచన లేదు (మొత్తం వర్షం సుమారు **${rain7d} mm** మాత్రమే).\n\n` +
          `**పంట సంరక్షణ:**\n` +
          `• వాతావరణంలో రోజువారీ తేమ ఆవిరి (ET0) **${et0} mm/day** గా ఉంది.\n` +
          `• మీ ${irrigation.name} విధానం ద్వారా ఉదయం లేదా సాయంత్రం వేళల్లో సాధారణ తడులు ఇవ్వండి.`;
      }
    } else if (isIrrigationQuery) {
      if (rain48h >= 10 || soilMoist > 32) {
        answerText = `💧 **నీటిపారుదల సలహా:**\n\n` +
          `**ఈ రోజు నీరు పెట్టడం వాయిదా వేయండి.**\n\n` +
          `• **కారణం:** రాబోయే 48 గంటల్లో ~${rain48h} mm వర్షం వచ్చే అవకాశం ఉంది, మరియు నేలలో తేమ ఇప్పటికే ~${soilMoist}% ఉంది.\n` +
          `• ${soilType.name} నేలలో అధిక నీరు నిలిస్తే వేరు కుళ్ళు తెగులు వచ్చే ప్రమాదం ఉంది.\n` +
          `• వర్షం తగ్గిన 24 గంటల తర్వాత మళ్ళీ నేల తేమను పరిశీలించండి.`;
      } else {
        answerText = `💧 **నీటిపారుదల సలహా:**\n\n` +
          `**అవును, తగినంత తేలికపాటి తడి ఇవ్వవచ్చు.**\n\n` +
          `• నేలలో ప్రస్తుత తేమ సుమారు **${soilMoist}%** ఉంది, అలాగే రోజువారీ ఆవిరి **${et0} mm**.\n` +
          `• ${crop.name} పంట ${stage.name} దశలో ఉన్నందున తేమ లోపం రాకుండా ఉదయం 6 నుండి 9 గంటల మధ్య నీరు పెట్టండి.`;
      }
    } else if (isSprayQuery) {
      if (maxWind < 15 && rainProb < 25) {
        answerText = `🌱 **మందుల పిచికారీ అనుకూలత:**\n\n` +
          `**అవును, పిచికారీ చేయడానికి మంచి అనుకూల సమయం.**\n\n` +
          `• ప్రస్తుత గాలి వేగం: **${wind} km/h** (సురక్షిత పరిమితి: 15 km/h లోపు).\n` +
          `• వర్షం పడే అవకాశం చాలా తక్కువ (${rainProb}%).\n` +
          `• అనుకూల సమయం: ఉదయం 7 నుండి 10 గంటలు, లేదా సాయంత్రం 4:30 నుండి 6:30 గంటల మధ్య.\n` +
          `*(సూచన: మధ్యాహ్నం తీవ్ర ఎండలో పిచికారీ చేయవద్దు).*`;
      } else {
        answerText = `⚠️ **మందుల పిచికారీ జాగ్రత్త:**\n\n` +
          `**ప్రస్తుతం పిచికారీ చేయడం మంచిది కాదు.**\n\n` +
          `${maxWind >= 15 ? `• గాలి వేగం ${maxWind} km/h గా ఉన్నందున మందు ఇతర ప్రాంతాలకు కొట్టుకుపోయే ప్రమాదం ఉంది.\n` : ''}` +
          `${rainProb >= 25 ? `• వర్షం పడే అవకాశం ${rainProb}% ఉన్నందున పిచికారీ చేసిన మందు కొట్టుకుపోతుంది.\n` : ''}` +
          `• గాలి వేగం తగ్గిన తర్వాత మాత్రమే పిచికారీ చేపట్టండి.`;
      }
    } else if (isHarvestQuery) {
      if (rain7d <= 5) {
        answerText = `🌾 **పంట కోత అనుకూలత:**\n\n` +
          `**అవును, పంట కోతకు చాలా అనుకూలమైన వాతావరణం.**\n\n` +
          `• రాబోయే 7 రోజుల్లో పొడి వాతావరణం ఉంటుంది (వర్షం < ${rain7d} mm).\n` +
          `• కోత మిషన్లు నడపడానికి మరియు ధాన్యాన్ని కళ్లంలో ఆరబెట్టడానికి (తేమ 12-14% వరకు) మంచి ఎండ ఉంటుంది.\n` +
          `• మీ వ్యవసాయ పనులను వెంటనే పూర్తి చేసుకోండి.`;
      } else {
        answerText = `⚠️ **పంట కోత హెచ్చరిక:**\n\n` +
          `**పంట కోతను కొద్ది రోజులు వాయిదా వేయడం మంచిది.**\n\n` +
          `• రాబోయే రోజుల్లో దాదాపు **${rain7d} mm** వర్షం పడే అవకాశం ఉంది.\n` +
          `• తడి వాతావరణంలో కోత కోస్తే గింజలకు బూజు పట్టడం మరియు రంగు మారే ప్రమాదం ఉంది.\n` +
          `• ఇప్పటికే కోసిన పంట ఉంటే టార్పాలిన్లతో వెంటనే కప్పి భద్రపరచండి.`;
      }
    } else if (isWindQuery) {
      answerText = `💨 **తీవ్ర గాలుల జాగ్రత్తలు:**\n\n` +
        `• ప్రస్తుత గాలి వేగం: **${wind} km/h** (గరిష్టంగా: ${maxWind} km/h).\n` +
        `• గాలుల వేగం 15 km/h దాటితే ఎలాంటి పురుగుమందులు పిచికారీ చేయవద్దు.\n` +
        `• ఎత్తైన పంటలు (మొక్కజొన్న, అరటి, పత్తి) పడిపోకుండా చేలగట్ల దగ్గర తగిన మద్దతు ఇవ్వండి.`;
    } else if (isFlowerQuery) {
      answerText = `🌸 **పూత దశలో తీసుకోవాల్సిన జాగ్రత్తలు:**\n\n` +
        `• **ఉష్ణోగ్రత:** గరిష్ట ఉష్ణోగ్రత ${crop.thresholds?.heatStressC || 36}°C దాటితే పరాగ సంపర్కం దెబ్బతింటుంది.\n` +
        `• **తేమ సమతుల్యత:** ఈ దశలో నేలలో తీవ్ర తేమ లోపం రాకుండా తేలికపాటి తడులు ఇవ్వండి (ప్రస్తుత తేమ: ~${soilMoist}%).\n` +
        `• అధిక గాలి మరియు వర్షం సమయంలో పూత రాలే అవకాశం ఉన్నందున గమనిస్తూ ఉండండి.`;
    } else {
      answerText = `👨‍🌾 **${locName} - ${crop.name} (${stage.name}) సమగ్ర సమాచారం:**\n\n` +
        `• **ప్రస్తుత ఉష్ణోగ్రత:** ${temp}°C, తేమ: ${humidity}%, గాలి వేగం: ${wind} km/h.\n` +
        `• **నేల స్థితి:** నేలలో తేమ ~${soilMoist}%, రోజువారీ ఆవిరి ~${et0} mm.\n` +
        `• **వర్షపాతం:** రాబోయే 7 రోజుల్లో సుమారు ~${rain7d} mm వర్షం.\n` +
        `• మీరు వర్షం, నీటిపారుదల, మందుల పిచికారీ లేదా పంట కోత గురించి స్పష్టంగా అడగవచ్చు.`;
    }
  }

  // --------------------------------------------------------------------------
  // B. HINDI RESPONSES (हिन्दी)
  // --------------------------------------------------------------------------
  else if (isHindi) {
    if (isRainQuery) {
      if (rain7d > 15 || rain48h > 5) {
        answerText = `🌧️ **${locName} के लिए बारिश का पूर्वानुमान:**\n\n` +
          `अगले 48 घंटों में लगभग **${rain48h} mm** और अगले 7 दिनों में कुल **~${rain7d} mm** बारिश होने की संभावना है।\n\n` +
          `**आपकी ${crop.name} फसल (${stage.name}) के लिए सुझाव:**\n` +
          `• आगामी सिंचाई को तुरंत टाल दें ताकि खेत में जलभराव न हो।\n` +
          `• खेत की जल निकासी (ड्रेनेज) नालियों को खुला और साफ़ रखें।\n` +
          `• यूरिया या कीटनाशक का छिड़काव बारिश रुकने तक न करें।`;
      } else {
        answerText = `☀️ **${locName} के लिए मौसम पूर्वानुमान:**\n\n` +
          `अगले 7 दिनों में भारी बारिश की कोई संभावना नहीं है (कुल वर्षा केवल **~${rain7d} mm** अनुमानित)।\n\n` +
          `**फसल सुझाव:**\n` +
          `• दैनिक वाष्पीकरण (ET0) लगभग **${et0} mm/दिन** है।\n` +
          `• अपनी ${irrigation.name} प्रणाली के अनुसार सुबह या शाम के समय सामान्य सिंचाई करें।`;
      }
    } else if (isIrrigationQuery) {
      if (rain48h >= 10 || soilMoist > 32) {
        answerText = `💧 **सिंचाई सलाह:**\n\n` +
          `**आज सिंचाई स्थगित रखें।**\n\n` +
          `• **कारण:** अगले 48 घंटों में ~${rain48h} mm बारिश होने की संभावना है, और मिट्टी में पहले से ~${soilMoist}% नमी मौजूद है।\n` +
          `• ${soilType.name} मिट्टी में अधिक पानी भरने से जड़ों को नुकसान पहुंच सकता है।\n` +
          `• बारिश के 24 घंटे बाद मिट्टी की नमी देखकर ही अगला पानी दें।`;
      } else {
        answerText = `💧 **सिंचाई सलाह:**\n\n` +
          `**हाँ, हल्की सिंचाई की जा सकती है।**\n\n` +
          `• मिट्टी में मौजूदा नमी **~${soilMoist}%** है और दैनिक वाष्पीकरण **${et0} mm** है।\n` +
          `• ${crop.name} फसल ${stage.name} अवस्था में है, इसलिए सुबह 6 से 9 बजे के बीच सिंचाई करना सबसे उपयुक्त रहेगा।`;
      }
    } else if (isSprayQuery) {
      if (maxWind < 15 && rainProb < 25) {
        answerText = `🌱 **दवा छिड़काव की स्थिति:**\n\n` +
          `**हाँ, छिड़काव के लिए मौसम अनुकूल है।**\n\n` +
          `• हवा की गति: **${wind} km/h** (सुरक्षित सीमा: 15 km/h से कम)।\n` +
          `• बारिश की संभावना केवल **${rainProb}%** है, जिससे दवा पत्तों पर सूखने का पूरा समय मिलेगा।\n` +
          `• उचित समय: सुबह 7 से 10 बजे या शाम 4:30 से 6:30 बजे।\n` +
          `*(सावधानी: दोपहर की तेज़ धूप में छिड़काव न करें)।*`;
      } else {
        answerText = `⚠️ **छिड़काव में सावधानी:**\n\n` +
          `**अभी कीटनाशक या पोषण का छिड़काव न करें।**\n\n` +
          `${maxWind >= 15 ? `• हवा की गति ${maxWind} km/h है, जिससे दवा हवा में उड़कर नष्ट हो जाएगी।\n` : ''}` +
          `${rainProb >= 25 ? `• बारिश की संभावना ${rainProb}% है, जिससे दवा धुलने का खतरा है।\n` : ''}` +
          `• मौसम शांत होने पर ही छिड़काव करें।`;
      }
    } else if (isHarvestQuery) {
      if (rain7d <= 5) {
        answerText = `🌾 **फसल कटाई की स्थिति:**\n\n` +
          `**हाँ, फसल कटाई के लिए बहुत अच्छा मौसम है।**\n\n` +
          `• अगले 7 दिनों में मौसम सूखा और धूपदार रहेगा (वर्षा < ${rain7d} mm)।\n` +
          `• कंबाइन हार्वेस्टर चलाने और कटी फसल को सुखाने (12-14% नमी तक) के लिए परिस्थितियां आदर्श हैं।\n` +
          `• समय रहते अपनी कटाई पूरी कर लें।`;
      } else {
        answerText = `⚠️ **कटाई संबंधित चेतावनी:**\n\n` +
          `**फसल कटाई कुछ दिनों के लिए टाल दें।**\n\n` +
          `• आने वाले दिनों में लगभग **${rain7d} mm** बारिश का अनुमान है।\n` +
          `• गीली फसल काटने से दानों में फफूंद और कालापन आने का डर रहता है।\n` +
          `• यदि फसल कटी हुई है, तो उसे तुरंत तिरपाल से ढक दें।`;
      }
    } else if (isWindQuery) {
      answerText = `💨 **तेज़ हवा से सुरक्षा उपाय:**\n\n` +
        `• वर्तमान हवा की गति: **${wind} km/h** (झोंके: ${maxWind} km/h)।\n` +
        `• 15 km/h से अधिक हवा में कोई छिड़काव न करें।\n` +
        `• लंबी फसलों (मक्का, गन्ना, कपास) को गिरने (लॉजिंग) से बचाने के लिए उचित सहारा दें।`;
    } else if (isFlowerQuery) {
      answerText = `🌸 **फूल आने की अवस्था में सावधानियां:**\n\n` +
        `• तापमान ${crop.thresholds?.heatStressC || 36}°C से ऊपर जाने पर परागण प्रभावित होता है।\n` +
        `• मिट्टी में नमी की कमी न होने दें (वर्तमान नमी: ~${soilMoist}%)।\n` +
        `• तेज़ हवा या भारी बारिश के दौरान फूल झड़ने की निगरानी रखें।`;
    } else {
      answerText = `👨‍🌾 **${locName} - ${crop.name} (${stage.name}) समग्र स्थिति:**\n\n` +
        `• **तापमान:** ${temp}°C, नमी: ${humidity}%, हवा: ${wind} km/h।\n` +
        `• **मिट्टी की स्थिति:** नमी ~${soilMoist}%, दैनिक वाष्पीकरण ~${et0} mm/दिन।\n` +
        `• **वर्षा पूर्वानुमान:** अगले 7 दिनों में कुल ~${rain7d} mm वर्षा।\n` +
        `• आप बारिश, सिंचाई, छिड़काव या कटाई के बारे में बोलकर या लिखकर पूछ सकते हैं।`;
    }
  }

  // --------------------------------------------------------------------------
  // C. ENGLISH RESPONSES
  // --------------------------------------------------------------------------
  else {
    // Specific check for chilli + rain ("What to do if it rains tomorrow for chilli crop?")
    if ((query.includes('chilli') || query.includes('chili') || crop.id === 'chili') && (query.includes('rain') || isRainQuery)) {
      answerText = `🌶️ **Chilli Crop Precautions for Rain in ${locName}:**\n\n` +
        `Upcoming precipitation model shows **~${rain48h} mm** (7-day total: **~${rain7d} mm**).\n\n` +
        `**Urgent Actions for Chilli Field:**\n` +
        `• **Drainage:** Immediately ensure all field furrows and drainage channels are clear. Water stagnation rapidly causes Phytophthora root rot and collar rot.\n` +
        `• **Sun-Drying Yards:** If you have harvested red chillies drying on open yards, cover them immediately with waterproof tarpaulins to prevent mold and color loss.\n` +
        `• **Post-Rain Spray:** Once the rain ceases, apply a recommended protective fungicide (e.g. Copper Oxychloride 3g/L or Mancozeb 2.5g/L) to prevent anthracnose/fruit rot spread.\n` +
        `• Postpone chemical sprays and fertilizer top-dressing until weather stabilizes.`;
    } else if ((query.includes('rice') || crop.id === 'rice') && isIrrigationQuery) {
      if (rain48h >= 10) {
        answerText = `🌾 **Rice Field Irrigation Advisory (${locName}):**\n\n` +
          `**Recommendation: Postpone irrigation tomorrow.**\n\n` +
          `• Model predicts **~${rain48h} mm** rainfall over the next 48 hours (${daily[0]?.rainProb || 20}% probability).\n` +
          `• Natural precipitation will satisfy paddy water demands, saving power and irrigation costs.\n` +
          `• Inspect field bunds and drainage outlets to avoid excessive ponding above 5 cm.`;
      } else {
        answerText = `🌾 **Rice Field Irrigation Advisory (${locName}):**\n\n` +
          `**Recommendation: Yes, you can irrigate your rice field tomorrow.**\n\n` +
          `• Minimal rainfall projected (~${rain48h} mm within 48h).\n` +
          `• For rice in ${stage.name} stage, maintain consistent shallow submergence or saturated soil by irrigating in early morning hours.`;
      }
    } else if (isHarvestQuery && (query.includes('rain') || rain7d > 2)) {
      if (rain7d > 5 || rain48h > 2) {
        answerText = `⚠️ **Rain Impact on Harvesting Operations (${locName}):**\n\n` +
          `**Yes, upcoming rainfall will significantly affect harvesting.**\n\n` +
          `• Projected cumulative 7-day rainfall is **~${rain7d} mm**.\n` +
          `• Wet straw and high humidity cause combine harvesters to bog down and promote grain sprouting/mold.\n` +
          `• Postpone harvesting until dry weather returns and ground firms up.\n` +
          `• Cover any threshed produce with tarpaulins immediately.`;
      } else {
        answerText = `🌾 **Harvesting Weather Suitability (${locName}):**\n\n` +
          `**No, upcoming weather is dry and favorable for harvesting.**\n\n` +
          `• Total 7-day rainfall is minimal (~${rain7d} mm) with clear skies.\n` +
          `• Optimal window for combine harvesting, threshing, and sun-drying to reach 12-14% storage moisture.`;
      }
    } else if (isRainQuery) {
      if (rain7d > 15 || rain48h > 5) {
        answerText = `🌧️ **Rainfall Forecast for ${locName}:**\n\n` +
          `Precipitation is indicated in the numerical model. Projected **~${rain48h} mm** within 48 hours, and a 7-day total of **~${rain7d} mm**.\n\n` +
          `**Agronomic Actions for ${crop.name} (${stage.name}):**\n` +
          `• Postpone upcoming irrigation cycles to avoid waterlogging and root rot.\n` +
          `• Inspect field drainage channels and spillways.\n` +
          `• Hold off on broadcasting granular fertilizers or foliar sprays until rain clears.`;
      } else {
        answerText = `☀️ **Rainfall Outlook for ${locName}:**\n\n` +
          `Relatively dry conditions expected. The 7-day total precipitation is **~${rain7d} mm** with minimal rain disruption.\n\n` +
          `**Field Management:**\n` +
          `• Atmospheric water loss (ET0) is running at **~${et0} mm/day**.\n` +
          `• Proceed with scheduled ${irrigation.name} cycles, preferably in early morning hours.`;
      }
    } else if (isIrrigationQuery) {
      if (rain48h >= 10 || soilMoist > 32) {
        answerText = `💧 **Irrigation Recommendation:**\n\n` +
          `**Recommendation: Postpone Irrigation.**\n\n` +
          `• **Key Factors:** ~${rain48h} mm rain is expected within 48 hours, and topsoil moisture is already high at ~${soilMoist}%.\n` +
          `• Adding water to ${soilType.name} risks soil compaction and nutrient leaching.\n` +
          `• Re-evaluate soil root zone 24 hours after the rain passes.`;
      } else {
        answerText = `💧 **Irrigation Recommendation:**\n\n` +
          `**Recommendation: Proceed with Routine Scheduled Irrigation.**\n\n` +
          `• Soil moisture is currently **~${soilMoist}%** with daily ET0 demand of **${et0} mm/day**.\n` +
          `• For ${crop.name} in ${stage.name}, maintain consistent moisture by irrigating during early morning (06:00 - 09:00 AM).`;
      }
    } else if (isSprayQuery) {
      if (maxWind < 15 && rainProb < 25) {
        answerText = `🌱 **Foliar Spray Suitability:**\n\n` +
          `**Status: Favorable Window for Spraying.**\n\n` +
          `• Current wind speed: **${wind} km/h** (safe threshold: < 15 km/h), minimizing drift.\n` +
          `• Low rain probability (${rainProb}%), providing the required 4-6 hour rain-free drying window.\n` +
          `• Optimal hours: 07:00 - 10:00 AM or 04:30 - 06:30 PM. Avoid intense midday heat.`;
      } else {
        answerText = `⚠️ **Foliar Spray Advisory:**\n\n` +
          `**Status: Caution — Suboptimal Spray Conditions.**\n\n` +
          `${maxWind >= 15 ? `• Wind speed of ${maxWind} km/h exceeds the 15 km/h threshold, causing severe spray drift.\n` : ''}` +
          `${rainProb >= 25 ? `• Rain probability is ${rainProb}%. Impending showers will wash active ingredients off foliage.\n` : ''}` +
          `• Delay spraying until wind calms and dry weather stabilizes.`;
      }
    } else if (isHarvestQuery) {
      if (rain7d <= 5) {
        answerText = `🌾 **Harvesting Weather Suitability:**\n\n` +
          `**Status: Highly Favorable Harvesting Window.**\n\n` +
          `• 7-day precipitation is projected under **${rain7d} mm** with stable sunny conditions.\n` +
          `• Ideal for mechanized combine harvesting, threshing, and sun-drying to reach 12-14% safe storage moisture.\n` +
          `• Proceed with field operations to maximize this dry window.`;
      } else {
        answerText = `⚠️ **Harvesting Advisory:**\n\n` +
          `**Status: Caution — Wet Weather Approaching.**\n\n` +
          `• Approximately **${rain7d} mm** rain projected across the coming week.\n` +
          `• Harvesting in wet conditions leads to machine bogging and grain mold/discoloration.\n` +
          `• Cover any harvested sheaves with tarpaulins immediately. Delay cutting until ground dries.`;
      }
    } else if (isWindQuery) {
      answerText = `💨 **Wind Hazard Precautions:**\n\n` +
        `• Current wind speed: **${wind} km/h** with gusts up to **${maxWind} km/h**.\n` +
        `• Halt all foliar spraying when winds exceed 15 km/h.\n` +
        `• For tall or top-heavy crops (maize, banana, sugarcane), ensure field bund supports and staking are reinforced against lodging.`;
    } else if (isFlowerQuery) {
      answerText = `🌸 **Flowering Stage Management for ${crop.name}:**\n\n` +
        `• Temperatures above ${crop.thresholds?.heatStressC || 36}°C can desiccate pollen grains and reduce fruit set.\n` +
        `• Ensure steady soil moisture (~${soilMoist}%) to prevent flower shedding.\n` +
        `• Scout for thrips and sucking pests favored by humid mornings.`;
    } else {
      answerText = `👨‍🌾 **Field Overview for ${locName} (${crop.name} — ${stage.name}):**\n\n` +
        `• **Current Telemetry:** Temp: ${temp}°C, Humidity: ${humidity}%, Wind: ${wind} km/h.\n` +
        `• **Soil Status:** Surface moisture: ~${soilMoist}%, Daily ET0: ~${et0} mm/day.\n` +
        `• **Upcoming Weather:** 7-day cumulative rainfall: ~${rain7d} mm.\n` +
        `• Ask questions about rainfall, irrigation schedules, spraying windows, or harvesting.`;
    }
  }

  return {
    text: answerText,
    provider: 'Rule-Based Agrometeorological Engine (Open-Meteo Telemetry)',
    isLlm: false
  };
}
