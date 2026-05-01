import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGlobe, FiArrowRight, FiCopy, FiCheck, FiVolume2, FiSend, FiRotateCcw, FiArrowDown, FiRepeat
} from 'react-icons/fi';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const LANGUAGES = [
  { code: 'hi', name: 'हिन्दी', nameEn: 'Hindi', speechCode: 'hi-IN' },
  { code: 'bn', name: 'বাংলা', nameEn: 'Bengali', speechCode: 'bn-IN' },
  { code: 'te', name: 'తెలుగు', nameEn: 'Telugu', speechCode: 'te-IN' },
  { code: 'mr', name: 'मराठी', nameEn: 'Marathi', speechCode: 'mr-IN' },
  { code: 'ta', name: 'தமிழ்', nameEn: 'Tamil', speechCode: 'ta-IN' },
  { code: 'gu', name: 'ગુજરાતી', nameEn: 'Gujarati', speechCode: 'gu-IN' },
  { code: 'kn', name: 'ಕನ್ನಡ', nameEn: 'Kannada', speechCode: 'kn-IN' },
  { code: 'ml', name: 'മലയാളം', nameEn: 'Malayalam', speechCode: 'ml-IN' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', nameEn: 'Punjabi', speechCode: 'pa-IN' },
  { code: 'or', name: 'ଓଡ଼ିଆ', nameEn: 'Odia', speechCode: 'or-IN' },
  { code: 'ur', name: 'اردو', nameEn: 'Urdu', speechCode: 'ur-PK' },
  { code: 'en', name: 'English', nameEn: 'English', speechCode: 'en-US' },
];

const QUICK_PHRASES = [
  'Where is my polling booth?',
  'What documents do I need to vote?',
  'How to register as a voter?',
  'What is NOTA?',
  'How does EVM work?',
  'When is the election date?',
  'How to check voter ID status?',
  'What is VVPAT?',
  'Can I vote without Voter ID card?',
  'What is the age limit for voting?',
];

// ── Free Translation API (MyMemory) ──
async function translateViaMyMemory(text, sourceLang, targetLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}&de=votepath@election.in`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }
  throw new Error(data.responseDetails || 'Translation failed');
}

export default function TranslatorPage() {
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [voices, setVoices] = useState([]);
  const textareaRef = useRef(null);

  const selectedSource = LANGUAGES.find(l => l.code === sourceLang);
  const selectedTarget = LANGUAGES.find(l => l.code === targetLang);

  // ── Pre-load browser voices on mount ──
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };

    loadVoices(); // Try immediately (Firefox)
    window.speechSynthesis.onvoiceschanged = loadVoices; // Chrome/Edge load async

    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    if (sourceLang === targetLang) {
      setError('Source and target languages must be different.');
      return;
    }
    setError('');
    setIsTranslating(true);
    setTranslatedText('');

    try {
      const result = await translateViaMyMemory(inputText.trim(), sourceLang, targetLang);
      setTranslatedText(result);
      setHistory(prev => [
        { input: inputText.trim(), output: result, sourceLang, targetLang, lang: selectedTarget.nameEn, langCode: targetLang },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Text-to-Speech — properly finds voice for each language ──
  const handleSpeak = (text, langCode) => {
    if (!('speechSynthesis' in window) || !text) return;

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const langInfo = LANGUAGES.find(l => l.code === langCode);
    const speechCode = langInfo?.speechCode || 'en-US';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Get latest voices (they may have loaded after component mount)
    const allVoices = window.speechSynthesis.getVoices();

    // Find best voice with multiple strategies
    let bestVoice = null;

    // 1. Exact match: "hi-IN" === "hi-IN"
    bestVoice = allVoices.find(v => v.lang === speechCode);

    // 2. Prefix match: voice.lang starts with "hi"
    if (!bestVoice) {
      bestVoice = allVoices.find(v => v.lang.startsWith(langCode + '-'));
    }
    if (!bestVoice) {
      bestVoice = allVoices.find(v => v.lang.startsWith(langCode));
    }

    // 3. Google voice for the language (Google voices are highest quality)
    if (!bestVoice) {
      bestVoice = allVoices.find(v =>
        v.name.toLowerCase().includes('google') && v.lang.startsWith(langCode)
      );
    }

    // 4. Any voice mentioning the language name
    if (!bestVoice && langInfo) {
      bestVoice = allVoices.find(v =>
        v.name.toLowerCase().includes(langInfo.nameEn.toLowerCase())
      );
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang; // Sync lang with the found voice
    }

    setIsSpeaking(true);

    // Safety timeout — prevent infinite speaking state
    const safetyMs = Math.max(text.length * 120, 8000);
    const timer = setTimeout(() => {
      setIsSpeaking(false);
      window.speechSynthesis.cancel();
    }, safetyMs);

    utterance.onend = () => { clearTimeout(timer); setIsSpeaking(false); };
    utterance.onerror = () => { clearTimeout(timer); setIsSpeaking(false); };

    window.speechSynthesis.speak(utterance);
  };

  const handleQuickPhrase = (phrase) => {
    setInputText(phrase);
    setSourceLang('en');
    textareaRef.current?.focus();
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setError('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center shadow-lg shadow-primary/20">
            <FiGlobe size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Election Translator</h1>
            <p className="text-xs text-text-muted">Translate any text into 11 Indian languages instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-3 py-1 rounded-full bg-secondary/10 text-secondary font-medium border border-secondary/20">
            ⚡ Free &amp; Instant
          </span>
          <span className="text-[10px] px-3 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
            🗣️ Text-to-Speech
          </span>
        </div>
      </motion.div>

      {/* Language Selector Row */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Source Language */}
          <div className="flex-1 w-full">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-2">From</p>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={`src-${lang.code}`}
                  onClick={() => setSourceLang(lang.code)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sourceLang === lang.code
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-border/50'
                  }`}>
                  {lang.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button */}
          <motion.button
            whileTap={{ scale: 0.85, rotate: 180 }}
            onClick={handleSwapLangs}
            className="p-2.5 rounded-xl bg-bg-elevated border border-border hover:border-primary/30 hover:bg-primary/5 text-text-muted hover:text-primary transition-all self-center flex-shrink-0"
            title="Swap languages">
            <FiRepeat size={16} />
          </motion.button>

          {/* Target Language */}
          <div className="flex-1 w-full">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-2">To</p>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={`tgt-${lang.code}`}
                  onClick={() => setTargetLang(lang.code)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    targetLang === lang.code
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-border/50'
                  }`}>
                  {lang.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Translation Interface */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Section */}
        <div className="glass-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              📝 {selectedSource?.nameEn} <span className="text-base">{selectedSource?.name !== selectedSource?.nameEn ? `(${selectedSource?.name})` : ''}</span>
            </span>
            <span className="text-[10px] text-text-muted">{inputText.length}/1000</span>
          </div>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value.slice(0, 1000))}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste any text here... (Press Enter to translate)"
            rows={5}
            dir={sourceLang === 'ur' ? 'rtl' : 'ltr'}
            className="input-field text-sm resize-none flex-1 min-h-[140px]"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-3 gap-2">
            <div className="flex items-center gap-2">
              <button onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary px-3 py-2 rounded-lg hover:bg-bg-elevated transition-all">
                <FiRotateCcw size={12} /> Clear
              </button>
              {inputText.trim() && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSpeak(inputText, sourceLang)}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5 transition-all"
                  title="Listen to original">
                  <FiVolume2 size={13} /> Listen
                </motion.button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTranslate}
              disabled={!inputText.trim() || isTranslating || sourceLang === targetLang}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-md shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all w-full sm:w-auto">
              {isTranslating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <FiSend size={14} /> Translate
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Output Section */}
        <div className="glass-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              🌐 {selectedTarget?.nameEn} <span className="text-base">{selectedTarget?.name !== selectedTarget?.nameEn ? `(${selectedTarget?.name})` : ''}</span>
            </span>
            {translatedText && (
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleSpeak(translatedText, targetLang)}
                  disabled={isSpeaking}
                  className={`p-2 rounded-lg transition-all border border-border ${
                    isSpeaking
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-bg-elevated hover:bg-primary/10 text-text-muted hover:text-primary'
                  }`}
                  title="Listen">
                  <FiVolume2 size={14} className={isSpeaking ? 'animate-pulse' : ''} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleCopy(translatedText)}
                  className="p-2 rounded-lg bg-bg-elevated hover:bg-primary/10 text-text-muted hover:text-primary transition-all border border-border"
                  title="Copy">
                  {copied ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
                </motion.button>
              </div>
            )}
          </div>

          <div className={`flex-1 min-h-[140px] rounded-xl p-4 ${
            translatedText ? 'bg-bg-elevated border border-border' : 'bg-bg-elevated/50 border border-dashed border-border/50'
          }`} dir={targetLang === 'ur' ? 'rtl' : 'ltr'}>
            <AnimatePresence mode="wait">
              {isTranslating ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full py-8">
                  <div className="flex gap-1.5 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-xs text-text-muted">Translating to {selectedTarget?.nameEn}...</p>
                </motion.div>
              ) : translatedText ? (
                <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-lg leading-relaxed text-text-primary font-medium">
                    {translatedText}
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full py-8">
                  <span className="text-2xl mb-2">⚠️</span>
                  <p className="text-xs text-accent text-center">{error}</p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <span className="text-3xl mb-2 opacity-40">🌐</span>
                  <p className="text-xs text-text-muted">Translation will appear here</p>
                  <p className="text-[10px] text-text-muted mt-1">Type text and press Enter or click Translate</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Quick Election Phrases */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          ⚡ Quick Election Phrases
        </h3>
        <p className="text-xs text-text-muted mb-3">Click any phrase to auto-fill, then hit Translate</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PHRASES.map((phrase) => (
            <motion.button
              key={phrase}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickPhrase(phrase)}
              className={`px-3 py-2 rounded-xl text-xs transition-all ${
                inputText === phrase
                  ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-border hover:border-primary/20'
              }`}>
              {phrase}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Translation History */}
      {history.length > 0 && (
        <motion.div variants={item} className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              📜 Recent Translations
            </h3>
            <button onClick={() => setHistory([])}
              className="text-[10px] text-text-muted hover:text-primary transition-colors">
              Clear History
            </button>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-xl bg-bg-elevated border border-border/50 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted truncate">{h.input}</p>
                    <div className="flex items-center gap-1.5 my-1">
                      <FiArrowDown size={10} className="text-primary" />
                      <span className="text-[10px] text-primary font-medium">{h.lang}</span>
                    </div>
                    <p className="text-sm text-text-primary font-medium" dir={h.langCode === 'ur' ? 'rtl' : 'ltr'}>{h.output}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => handleSpeak(h.output, h.langCode)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-all">
                      <FiVolume2 size={12} />
                    </button>
                    <button onClick={() => handleCopy(h.output)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-all">
                      <FiCopy size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info Note */}
      <motion.div variants={item} className="p-4 rounded-xl bg-primary/5 border border-primary/15">
        <p className="text-xs text-text-secondary leading-relaxed">
          <span className="font-semibold text-primary">🌐 Powered by MyMemory:</span> Translations use the MyMemory Translation API.
          Text-to-Speech uses your browser's built-in voices — availability depends on your device and browser.
          For best results, use <strong>Chrome</strong> or <strong>Edge</strong> which support the most Indian language voices.
        </p>
      </motion.div>
    </motion.div>
  );
}
