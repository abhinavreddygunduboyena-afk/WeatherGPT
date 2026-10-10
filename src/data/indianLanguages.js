/**
 * Supported Indian Languages for WeatherGPT Farmer Voice AI Agent.
 * Configured for Web Speech API (STT & TTS) and extensible to Bhashini pipelines.
 */

export const INDIAN_LANGUAGES = [
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    bhashiniCode: 'te',
    flag: '🌾',
    sampleQuestions: [
      { text: 'మిరప పంటకు రేపు వర్షం పడితే ఏమి చేయాలి?', label: 'మిరప & రేపటి వర్షం?' },
      { text: 'వరి పొలానికి రేపు నీరు పెట్టవచ్చా?', label: 'వరికి నీటిపారుదల?' },
      { text: 'వర్షం వల్ల పంట కోత దెబ్బతింటుందా?', label: 'పంట కోతపై ప్రభావం?' },
      { text: 'పురుగుమందులు పిచికారీ చేయడానికి వాతావరణం అనుకూలమా?', label: 'మందుల పిచికారీ?' },
      { text: 'రేపు మా ఊరిలో వర్షం పడుతుందా?', label: 'రేపటి వర్షం?' }
    ],
    ui: {
      title: 'మీ వ్యవసాయ సహాయకుడితో మాట్లాడండి',
      subtitle: 'వర్షం, నీటిపారుదల, మందుల పిచికారీ లేదా పంట కోత గురించి మీ గొంతుతో అడగండి',
      tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
      listening: 'వింటున్నాము... మాట్లాడండి',
      transcribing: 'మాటలను అర్థం చేసుకుంటున్నాము...',
      stopListening: 'ఆపండి',
      editPrompt: 'గుర్తించిన ప్రశ్నను ఇక్కడ సరిచూడండి లేదా మార్చండి:',
      askButton: 'సలహా అడగండి',
      clearButton: 'తుడిచివేయండి',
      speakAnswer: 'సమాధానం వినండి',
      stopSpeaking: 'మాట ఆపండి',
      replayAnswer: 'మళ్ళీ వినండి',
      typeFallbackPlaceholder: 'లేదా మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...',
      micDenied: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో మైక్ ఆన్ చేయండి లేదా క్రింద టైప్ చేయండి.',
      noSpeech: 'మాటలు వినిపించలేదు. దయచేసి మైక్ బటన్ నొక్కి స్పష్టంగా మాట్లాడండి.',
      notSupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి గూగుల్ క్రోమ్ ఉపయోగించండి లేదా టైప్ చేయండి.',
      voiceEngineWebSpeech: 'బ్రౌజర్ వాయిస్ ఇంజిన్ (తెలుగు)',
      voiceEngineBhashini: 'భాషిణి AI వాయిస్'
    }
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    bhashiniCode: 'hi',
    flag: '🌱',
    sampleQuestions: [
      { text: 'क्या कल मेरे खेत में बारिश होगी?', label: 'कल की बारिश?' },
      { text: 'क्या आज फसल की सिंचाई करनी चाहिए?', label: 'सिंचाई सलाह?' },
      { text: 'क्या आज कीटनाशक छिड़काव करना सुरक्षित है?', label: 'दवा छिड़काव?' },
      { text: 'क्या फसल कटाई के लिए आने वाला मौसम सही है?', label: 'कटाई का समय?' },
      { text: 'इस सप्ताह मेरी फसल के लिए क्या मौसम जोखिम हैं?', label: 'मौसम जोखिम?' }
    ],
    ui: {
      title: 'अपने किसान सहायक से बात करें',
      subtitle: 'बारिश, सिंचाई, छिड़काव या फसल कटाई के बारे में बोलकर पूछें',
      tapToSpeak: 'बोलने के लिए दबाएं',
      listening: 'सुन रहे हैं... बोलिए',
      transcribing: 'आवाज को समझा जा रहा है...',
      stopListening: 'रोकें',
      editPrompt: 'पहचाने गए प्रश्न को यहां जांचें या सुधारें:',
      askButton: 'सलाह पूछें',
      clearButton: 'साफ करें',
      speakAnswer: 'उत्तर सुनें',
      stopSpeaking: 'आवाज रोकें',
      replayAnswer: 'दोबारा सुनें',
      typeFallbackPlaceholder: 'या अपना प्रश्न यहां लिखें...',
      micDenied: 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग में माइक चालू करें या नीचे लिखें।',
      noSpeech: 'कोई आवाज नहीं सुनाई दी। कृपया माइक दबाकर साफ़ आवाज़ में बोलें।',
      notSupported: 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया गूगल क्रोम का उपयोग करें या लिखें।',
      voiceEngineWebSpeech: 'ब्राउज़र वॉयस इंजन (हिन्दी)',
      voiceEngineBhashini: 'भाषिणी AI वॉयस'
    }
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (India)',
    speechCode: 'en-IN',
    bhashiniCode: 'en',
    flag: '🌍',
    sampleQuestions: [
      { text: 'Can I irrigate my rice field tomorrow?', label: 'Irrigate rice field tomorrow?' },
      { text: 'Will rain affect harvesting?', label: 'Will rain affect harvesting?' },
      { text: 'What to do if it rains tomorrow for chilli crop?', label: 'Chilli crop & rain?' },
      { text: 'Is it safe to spray pesticides or foliar nutrition today?', label: 'Spraying Window?' },
      { text: 'Will it rain on my farm tomorrow?', label: 'Rain Tomorrow?' }
    ],
    ui: {
      title: 'Talk to Your Farm Assistant',
      subtitle: 'Ask about rainfall, irrigation, spraying windows, or harvesting using your voice',
      tapToSpeak: 'Tap to Speak',
      listening: 'Listening... Speak now',
      transcribing: 'Transcribing speech...',
      stopListening: 'Stop Listening',
      editPrompt: 'Review or edit transcribed question before asking:',
      askButton: 'Ask Advice',
      clearButton: 'Clear',
      speakAnswer: 'Listen to Answer',
      stopSpeaking: 'Stop Audio',
      replayAnswer: 'Replay Audio',
      typeFallbackPlaceholder: 'Or type your question here...',
      micDenied: 'Microphone access denied. Please allow microphone permissions in browser settings or type below.',
      noSpeech: 'No speech detected. Please tap the mic and speak clearly.',
      notSupported: 'Speech recognition is not supported in this browser. Please use Chrome or type your query.',
      voiceEngineWebSpeech: 'Browser Voice Engine (English)',
      voiceEngineBhashini: 'Bhashini AI Voice'
    }
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    bhashiniCode: 'kn',
    flag: '🌾',
    sampleQuestions: [
      { text: 'ನಾಳೆ ನಮ್ಮ ಊರಿನಲ್ಲಿ ಮಳೆ ಬರುತ್ತದೆಯೇ?', label: 'ನಾಳೆಯ ಮಳೆ?' },
      { text: 'ಇಂದು ಬೆಳೆಗಳಿಗೆ ನೀರು ಹಾಯಿಸಬೇಕೇ?', label: 'ನೀರಾವರಿ ಸಲಹೆ?' },
      { text: 'ಔಷಧಿ ಸಿಂಪಡಿಸಲು ಹವಾಮಾನ ಸೂಕ್ತವಾಗಿದೆಯೇ?', label: 'ಔಷಧಿ ಸಿಂಪಡಣೆ?' },
      { text: 'ಬೆಳೆ ಕಟಾವಿಗೆ ಮುಂಬರುವ ಹವಾಮಾನ ಸರಿಯಾಗಿದೆಯೇ?', label: 'ಕಟಾವಿನ ಸಮಯ?' }
    ],
    ui: {
      title: 'ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕರೊಂದಿಗೆ ಮಾತನಾಡಿ',
      subtitle: 'ಮಳೆ, ನೀರಾವರಿ, ಔಷಧಿ ಸಿಂಪಡಣೆ ಅಥವಾ ಕಟಾವಿನ ಬಗ್ಗೆ ಧ್ವನಿಯ ಮೂಲಕ ಕೇಳಿ',
      tapToSpeak: 'ಮಾತನಾಡಲು ಒತ್ತಿರಿ',
      listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ',
      transcribing: 'ಧ್ವನಿಯನ್ನು ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ...',
      stopListening: 'ನಿಲ್ಲಿಸಿ',
      editPrompt: 'ಗುರುತಿಸಲಾದ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ತಿದ್ದುಪಡಿ ಮಾಡಿ:',
      askButton: 'ಸಲಹೆ ಕೇಳಿ',
      clearButton: 'ಅಳಿಸಿ',
      speakAnswer: 'ಉತ್ತರವನ್ನು ಆಲಿಸಿ',
      stopSpeaking: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
      replayAnswer: 'ಮತ್ತೆ ಆಲಿಸಿ',
      typeFallbackPlaceholder: 'ಅಥವಾ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...',
      micDenied: 'ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಮೈಕ್ ಆನ್ ಮಾಡಿ.',
      noSpeech: 'ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ ಒತ್ತಿ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ.',
      notSupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ.',
      voiceEngineWebSpeech: 'ಬ್ರೌಸರ್ ವಾಯ್ಸ್ ಇಂಜಿನ್ (ಕನ್ನಡ)',
      voiceEngineBhashini: 'ಭಾಷಿಣಿ AI ವಾಯ್ಸ್'
    }
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    bhashiniCode: 'ta',
    flag: '🌱',
    sampleQuestions: [
      { text: 'நாளை எங்கள் பகுதியில் மழை பெய்யுமா?', label: 'நாளை மழை?' },
      { text: 'இன்று பயிருக்கு தண்ணீர் பாய்ச்ச வேண்டுமா?', label: 'பாசன ஆலோசனை?' },
      { text: 'மருந்து தெளிக்க வானிலை சாதகமாக உள்ளதா?', label: 'மருந்து தெளிப்பு?' },
      { text: 'அறுவடை செய்ய வானிலை ஏற்றதா?', label: 'அறுவடை சூழல்?' }
    ],
    ui: {
      title: 'உங்கள் விவசாய உதவியாளரிடம் பேசுங்கள்',
      subtitle: 'மழை, நீர்ப்பாசனம், பூச்சிக்கொல்லி தெளிப்பு குறித்து குரல் மூலம் கேளுங்கள்',
      tapToSpeak: 'பேச தட்டவும்',
      listening: 'கேட்கிறோம்... பேசுங்கள்',
      transcribing: 'குரல் மாற்றப்படுகிறது...',
      stopListening: 'நிறுத்து',
      editPrompt: 'கண்டறியப்பட்ட கேள்வியை சரிபார்க்கவும் அல்லது மாற்றவும்:',
      askButton: 'கேள்வி கேட்க',
      clearButton: 'அழி',
      speakAnswer: 'பதிலை கேட்க',
      stopSpeaking: 'நிறுத்து',
      replayAnswer: 'மீண்டும் கேட்க',
      typeFallbackPlaceholder: 'அல்லது உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...',
      micDenied: 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது.',
      noSpeech: 'குரல் கேட்கவில்லை. மைக் பொத்தானை அழுத்தி தெளிவாகப் பேசுங்கள்.',
      notSupported: 'இந்த உலாவியில் குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை.',
      voiceEngineWebSpeech: 'உலாவி குரல் இயந்திரம் (தமிழ்)',
      voiceEngineBhashini: 'பாஷிணி AI குரல்'
    }
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    bhashiniCode: 'mr',
    flag: '🌿',
    sampleQuestions: [
      { text: 'उद्या आमच्या गावात पाऊस पडेल का?', label: 'उद्याचा पाऊस?' },
      { text: 'आज पिकाला पाणी द्यावे का?', label: 'पाणी व्यवस्थापन?' },
      { text: 'औषध फवारणीसाठी हवामान अनुकूल आहे का?', label: 'फवारणी सल्ला?' },
      { text: 'पिकाच्या काढणीसाठी हवामान कसे आहे?', label: 'काढणी वेळ?' }
    ],
    ui: {
      title: 'तुमच्या शेती सहाय्यकाशी बोला',
      subtitle: 'पाऊस, सिंचन, फवारणी किंवा काढणीबद्दल बोलून विचारा',
      tapToSpeak: 'बोलण्यासाठी टॅप करा',
      listening: 'ऐकत आहोत... बोला',
      transcribing: 'आवाज समजून घेतला जात आहे...',
      stopListening: 'थांबवा',
      editPrompt: 'ओळखलेला प्रश्न येथे तपासा किंवा बदला:',
      askButton: 'सल्ला विचारा',
      clearButton: 'साफ करा',
      speakAnswer: 'उत्तर ऐका',
      stopSpeaking: 'आवाज थांबवा',
      replayAnswer: 'पुन्हा ऐका',
      typeFallbackPlaceholder: 'किंवा तुमचा प्रश्न येथे टाईप करा...',
      micDenied: 'मायक्रोफोन परवानगी नाकारली गेली.',
      noSpeech: 'कोणताही आवाज ऐकू आला नाही. स्पष्टपणे बोला.',
      notSupported: 'या ब्राउझरमध्ये आवाज ओळख उपलब्ध नाही.',
      voiceEngineWebSpeech: 'ब्राउझर व्हॉइस इंजिन (मराठी)',
      voiceEngineBhashini: 'भाषिणी AI व्हॉइस'
    }
  }
];

export function getLanguageByCode(code) {
  return INDIAN_LANGUAGES.find(l => l.code === code) || INDIAN_LANGUAGES[0];
}
