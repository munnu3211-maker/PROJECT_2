import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiArrowRight, FiCopy, FiCheck, FiVolume2 } from 'react-icons/fi';

const LANGUAGES = [
  { code: 'hi', name: 'हिन्दी', nameEn: 'Hindi' },
  { code: 'bn', name: 'বাংলা', nameEn: 'Bengali' },
  { code: 'te', name: 'తెలుగు', nameEn: 'Telugu' },
  { code: 'mr', name: 'मराठी', nameEn: 'Marathi' },
  { code: 'ta', name: 'தமிழ்', nameEn: 'Tamil' },
  { code: 'gu', name: 'ગુજરાતી', nameEn: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', nameEn: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', nameEn: 'Malayalam' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', nameEn: 'Punjabi' },
  { code: 'or', name: 'ଓଡ଼ିଆ', nameEn: 'Odia' },
  { code: 'ur', name: 'اردو', nameEn: 'Urdu' },
  { code: 'en', name: 'English', nameEn: 'English' },
];

// Pre-built election phrases for quick translation
const QUICK_PHRASES = [
  'Where is my polling booth?',
  'What documents do I need to vote?',
  'How to register as a voter?',
  'What is NOTA?',
  'How does EVM work?',
  'When is the election date?',
  'How to check voter ID status?',
  'What is VVPAT?',
];

// Pre-translated phrases (key election terms in major languages)
const TRANSLATIONS = {
  'Where is my polling booth?': {
    hi: 'मेरा मतदान केंद्र कहाँ है?',
    bn: 'আমার ভোটকেন্দ্র কোথায়?',
    te: 'నా పోలింగ్ బూత్ ఎక్కడ ఉంది?',
    mr: 'माझे मतदान केंद्र कुठे आहे?',
    ta: 'என் வாக்குச் சாவடி எங்கே?',
    gu: 'મારું મતદાન કેન્દ્ર ક્યાં છે?',
    kn: 'ನನ್ನ ಮತಗಟ್ಟೆ ಎಲ್ಲಿದೆ?',
    ml: 'എന്റെ പോളിംഗ് ബൂത്ത് എവിടെയാണ്?',
    pa: 'ਮੇਰਾ ਪੋਲਿੰਗ ਬੂਥ ਕਿੱਥੇ ਹੈ?',
    or: 'ମୋ ମତଦାନ କେନ୍ଦ୍ର କେଉଁଠାରେ?',
    ur: 'میرا پولنگ بوتھ کہاں ہے؟',
    en: 'Where is my polling booth?',
  },
  'What documents do I need to vote?': {
    hi: 'वोट करने के लिए मुझे कौन से दस्तावेज़ चाहिए?',
    bn: 'ভোট দিতে আমার কী কী নথি দরকার?',
    te: 'ఓటు వేయడానికి నాకు ఏ పత్రాలు కావాలి?',
    mr: 'मतदान करण्यासाठी मला कोणती कागदपत्रे हवीत?',
    ta: 'வாக்களிக்க எனக்கு என்ன ஆவணங்கள் தேவை?',
    gu: 'મતદાન કરવા માટે મારે કયા દસ્તાવેજો જોઈએ?',
    kn: 'ಮತದಾನ ಮಾಡಲು ನನಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?',
    ml: 'വോട്ട് ചെയ്യാൻ എനിക്ക് എന്ത് രേഖകൾ വേണം?',
    pa: 'ਵੋਟ ਪਾਉਣ ਲਈ ਮੈਨੂੰ ਕਿਹੜੇ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ ਹਨ?',
    or: 'ଭୋଟ ଦେବା ପାଇଁ ମୋତେ କ\'ଣ ଡକ୍ୟୁମେଣ୍ଟ ଦରକାର?',
    ur: 'ووٹ دینے کے لیے مجھے کون سے دستاویزات چاہئیں؟',
    en: 'What documents do I need to vote?',
  },
  'How to register as a voter?': {
    hi: 'मतदाता के रूप में पंजीकरण कैसे करें?',
    bn: 'ভোটার হিসেবে নিবন্ধন কীভাবে করবেন?',
    te: 'ఓటరుగా ఎలా నమోదు చేసుకోవాలి?',
    mr: 'मतदार म्हणून नोंदणी कशी करावी?',
    ta: 'வாக்காளராக எவ்வாறு பதிவு செய்வது?',
    gu: 'મતદાર તરીકે નોંધણી કેવી રીતે કરવી?',
    kn: 'ಮತದಾರರಾಗಿ ನೋಂದಣಿ ಹೇಗೆ ಮಾಡುವುದು?',
    ml: 'വോട്ടറായി എങ്ങനെ രജിസ്റ്റർ ചെയ്യാം?',
    pa: 'ਵੋਟਰ ਵਜੋਂ ਰਜਿਸਟਰ ਕਿਵੇਂ ਕਰੀਏ?',
    or: 'ଭୋଟର ଭାବେ ପଞ୍ଜିକରଣ କିପରି କରିବେ?',
    ur: 'ووٹر کے طور پر رجسٹریشن کیسے کریں؟',
    en: 'How to register as a voter?',
  },
  'What is NOTA?': {
    hi: 'NOTA क्या है?',
    bn: 'NOTA কী?',
    te: 'NOTA అంటే ఏమిటి?',
    mr: 'NOTA म्हणजे काय?',
    ta: 'NOTA என்றால் என்ன?',
    gu: 'NOTA શું છે?',
    kn: 'NOTA ಎಂದರೇನು?',
    ml: 'NOTA എന്താണ്?',
    pa: 'NOTA ਕੀ ਹੈ?',
    or: 'NOTA କ\'ଣ?',
    ur: 'NOTA کیا ہے؟',
    en: 'What is NOTA?',
  },
  'How does EVM work?': {
    hi: 'EVM कैसे काम करता है?',
    bn: 'EVM কিভাবে কাজ করে?',
    te: 'EVM ఎలా పని చేస్తుంది?',
    mr: 'EVM कसे काम करते?',
    ta: 'EVM எப்படி வேலை செய்கிறது?',
    gu: 'EVM કેવી રીતે કામ કરે છે?',
    kn: 'EVM ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?',
    ml: 'EVM എങ്ങനെ പ്രവർത്തിക്കുന്നു?',
    pa: 'EVM ਕਿਵੇਂ ਕੰਮ ਕਰਦੀ ਹੈ?',
    or: 'EVM କିପରି କାମ କରେ?',
    ur: 'EVM کیسے کام کرتی ہے؟',
    en: 'How does EVM work?',
  },
  'When is the election date?': {
    hi: 'चुनाव की तारीख कब है?',
    bn: 'নির্বাচনের তারিখ কবে?',
    te: 'ఎన్నికల తేదీ ఎప్పుడు?',
    mr: 'निवडणुकीची तारीख कधी आहे?',
    ta: 'தேர்தல் தேதி எப்போது?',
    gu: 'ચૂંટણીની તારીખ ક્યારે છે?',
    kn: 'ಚುನಾವಣೆ ದಿನಾಂಕ ಯಾವಾಗ?',
    ml: 'തിരഞ്ഞെടുപ്പ് തീയതി എപ്പോഴാണ്?',
    pa: 'ਚੋਣ ਦੀ ਤਰੀਕ ਕਦੋਂ ਹੈ?',
    or: 'ନିର୍ବାଚନ ତାରିଖ କେବେ?',
    ur: 'الیکشن کی تاریخ کب ہے؟',
    en: 'When is the election date?',
  },
  'How to check voter ID status?': {
    hi: 'वोटर ID की स्थिति कैसे जांचें?',
    bn: 'ভোটার আইডির স্থিতি কিভাবে পরীক্ষা করবেন?',
    te: 'ఓటర్ ID స్థితి ఎలా చెక్ చేయాలి?',
    mr: 'मतदार ओळखपत्राची स्थिती कशी तपासावी?',
    ta: 'வாக்காளர் அடையாள அட்டை நிலையை எப்படி சரிபார்ப்பது?',
    gu: 'મતદાર ID ની સ્થિતિ કેવી રીતે ચકાસવી?',
    kn: 'ವೋಟರ್ ID ಸ್ಥಿತಿಯನ್ನು ಹೇಗೆ ಪರಿಶೀಲಿಸುವುದು?',
    ml: 'വോട്ടർ ID സ്റ്റാറ്റസ് എങ്ങനെ പരിശോധിക്കാം?',
    pa: 'ਵੋਟਰ ID ਸਥਿਤੀ ਕਿਵੇਂ ਚੈੱਕ ਕਰੀਏ?',
    or: 'ଭୋଟର ID ସ୍ଥିତି କିପରି ଯାଞ୍ଚ କରିବେ?',
    ur: 'ووٹر ID کی حیثیت کیسے چیک کریں؟',
    en: 'How to check voter ID status?',
  },
  'What is VVPAT?': {
    hi: 'VVPAT क्या है?',
    bn: 'VVPAT কী?',
    te: 'VVPAT అంటే ఏమిటి?',
    mr: 'VVPAT म्हणजे काय?',
    ta: 'VVPAT என்றால் என்ன?',
    gu: 'VVPAT શું છે?',
    kn: 'VVPAT ಎಂದರೇನು?',
    ml: 'VVPAT എന്താണ്?',
    pa: 'VVPAT ਕੀ ਹੈ?',
    or: 'VVPAT କ\'ଣ?',
    ur: 'VVPAT کیا ہے؟',
    en: 'What is VVPAT?',
  },
};

export default function LanguageTranslator() {
  const [selectedLang, setSelectedLang] = useState('hi');
  const [selectedPhrase, setSelectedPhrase] = useState(QUICK_PHRASES[0]);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const translation = TRANSLATIONS[selectedPhrase]?.[selectedLang] || selectedPhrase;
  const langInfo = LANGUAGES.find(l => l.code === selectedLang);

  const handleCopy = () => {
    navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translation);
      utterance.lang = selectedLang === 'hi' ? 'hi-IN' :
                       selectedLang === 'bn' ? 'bn-IN' :
                       selectedLang === 'te' ? 'te-IN' :
                       selectedLang === 'ta' ? 'ta-IN' :
                       selectedLang === 'mr' ? 'mr-IN' :
                       selectedLang === 'gu' ? 'gu-IN' :
                       selectedLang === 'kn' ? 'kn-IN' :
                       selectedLang === 'ml' ? 'ml-IN' :
                       selectedLang === 'pa' ? 'pa-IN' :
                       selectedLang === 'ur' ? 'ur-IN' : 'en-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <FiGlobe size={16} className="text-primary" /> Election Translator
        </h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          11 Languages
        </span>
      </div>
      <p className="text-xs text-text-muted mb-4">Translate key election phrases into your regional language</p>

      {/* Language Selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {LANGUAGES.map((lang) => (
          <motion.button
            key={lang.code}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSelectedLang(lang.code)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedLang === lang.code
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-border hover:border-primary/20'
            }`}>
            {lang.name}
          </motion.button>
        ))}
      </div>

      {/* Quick Phrases */}
      <div className="mb-4">
        <p className="text-xs text-text-muted mb-2 font-medium">Select a phrase:</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PHRASES.map((phrase) => (
            <button
              key={phrase}
              onClick={() => setSelectedPhrase(phrase)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                selectedPhrase === phrase
                  ? 'bg-bg-elevated text-primary font-semibold border border-primary/20'
                  : 'bg-bg-elevated/50 text-text-muted hover:text-text-primary border border-transparent'
              }`}>
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Translation Output */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedPhrase}-${selectedLang}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl bg-bg-elevated border border-border p-4">

          {/* English source */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
            <span className="text-[10px] px-2 py-0.5 rounded bg-bg-card text-text-muted font-medium">English</span>
            <p className="text-sm text-text-secondary">{selectedPhrase}</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-2 mb-3">
            <FiArrowRight size={12} className="text-primary" />
            <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{langInfo?.nameEn}</span>
          </div>

          {/* Translated text */}
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-semibold text-text-primary leading-relaxed flex-1" dir={selectedLang === 'ur' ? 'rtl' : 'ltr'}>
              {translation}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleSpeak}
                className="p-2 rounded-lg bg-bg-card hover:bg-primary/10 text-text-muted hover:text-primary transition-all border border-border"
                title="Listen">
                <FiVolume2 size={14} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleCopy}
                className="p-2 rounded-lg bg-bg-card hover:bg-primary/10 text-text-muted hover:text-primary transition-all border border-border"
                title="Copy">
                {copied ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
