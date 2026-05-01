import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { sendChatMessage, getChatHistory } from '../services/api';
import {
  FiSend, FiVolume2, FiVolumeX, FiMessageCircle, FiBookOpen,
  FiHelpCircle, FiZap, FiExternalLink
} from 'react-icons/fi';
import { trackChatMessage } from '../utils/analytics';

const QUICK_QUESTIONS = [
  { label: 'How to register?', q: 'How do I register as a voter in India?' },
  { label: 'What is EVM?', q: 'What is an Electronic Voting Machine (EVM) and how does it work?' },
  { label: 'What is NOTA?', q: 'What is NOTA and how does it work in Indian elections?' },
  { label: 'Lok Sabha seats?', q: 'How many Lok Sabha seats are there in India?' },
  { label: 'Documents needed?', q: 'What documents do I need to carry on voting day?' },
  { label: 'वोटर ID कैसे बनाएँ?', q: 'वोटर ID कैसे बनाएँ? मुझे पूरी प्रक्रिया बताइए।' },
  { label: 'VVPAT क्या है?', q: 'VVPAT क्या है और ये कैसे काम करता है?' },
  { label: 'Election phases?', q: 'Why are Indian elections held in multiple phases?' },
];

const QUICK_FACTS = [
  { label: 'Voting Age', value: '18 years', icon: '🎂' },
  { label: 'Lok Sabha', value: '543 seats', icon: '🏛️' },
  { label: 'Voters', value: '96.8 Crore', icon: '🗳️' },
  { label: 'Helpline', value: '1950', icon: '📞' },
];

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getChatHistory(user._id);
        if (data.success && data.data.length > 0) {
          setMessages(data.data);
        } else {
          setMessages([{
            role: 'assistant',
            content: `🙏 **Namaste ${user?.name}!** Welcome to **VotePath AI** — your personal Indian election assistant.\n\n## 🤖 Who Am I?\nI am an AI-powered guide built on official **Election Commission of India (ECI)** data to help you navigate the entire voting process.\n\n## 🛠️ How Can I Help You?\n• **Voter Registration** — How to register, Form 6, eligibility\n• **Voter ID Issues** — Lost ID, name mismatch, corrections\n• **Polling Booth** — Find your booth, what to carry\n• **EVM & VVPAT** — How electronic voting machines work\n• **Election Rules** — Model Code of Conduct, voter rights\n• **Special Voting** — NRI, senior citizens, PwD, postal ballot\n• **Complaints** — Report violations via cVIGIL app\n• **Hindi / English** — I can answer in both! 🇮🇳\n\n## 📞 Quick Info\n• **ECI Helpline:** 1950\n• **Voter Portal:** https://voters.eci.gov.in/\n\n👉 **Next Step:** Ask me anything about voting, or type your question in Hindi!`,
          }]);
        }
      } catch {
        setMessages([{
          role: 'assistant',
          content: `🙏 **Namaste ${user?.name}!** Welcome to **VotePath AI**.\n\n## 🤖 Who Am I?\nI am your AI election assistant powered by **ECI** data.\n\n## 🛠️ I Can Help With:\n• Voter Registration & ID issues\n• Polling booth search\n• EVM & VVPAT explained\n• Election rules & voter rights\n• Hindi & English support 🇮🇳\n\n👉 **Next Step:** Ask me anything about voting!`,
        }]);
      }
    };
    if (user) load();
  }, [user]);

  useEffect(() => {
    // Scroll only the chat messages container (not the outer page)
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, sending]);

  const speak = (text) => {
    if (!voiceOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleaned = text.replace(/[#*_`\[\]()]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (overrideMsg) => {
    const msgText = overrideMsg || input.trim();
    if (!msgText || sending) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msgText }]);
    setSending(true);

    try {
      const { data } = await sendChatMessage(user._id, msgText);
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }]);
        speak(data.data.reply);
        trackChatMessage(data.data.provider || 'unknown');
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.',
      }]);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleQuickQuestion = (q) => {
    handleSend(q);
  };

  // ── Premium Markdown Renderer ─────────────────────────────────
  // Strips asterisks, renders headings, bullets, links, and
  // callout boxes for a polished chat experience
  const renderContent = (text) => {
    // Pre-process: strip all asterisks from the entire text
    const cleaned = text
      .replace(/^\*\*(.+?)\*\*\s*$/gm, '## $1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*\*/g, '');

    const lines = cleaned.split('\n');
    const elements = [];
    let bulletGroup = [];

    const flushBullets = () => {
      if (bulletGroup.length > 0) {
        elements.push(
          <div key={`bg-${elements.length}`} className="chat-bullet-group">
            {bulletGroup.map((b, j) => (
              <div key={j} className="chat-bullet-item">
                <span className="chat-bullet-dot">•</span>
                <span>{renderInlineLinks(b)}</span>
              </div>
            ))}
          </div>
        );
        bulletGroup = [];
      }
    };

    // Render inline links (https://...)
    const renderInlineLinks = (text) => {
      const parts = text.split(/(https?:\/\/[^\s,)]+)/g);
      return parts.map((part, i) => {
        if (part.match(/^https?:\/\//)) {
          const label = part.replace(/^https?:\/\//, '').replace(/\/$/, '');
          return (
            <a key={i} href={part} target="_blank" rel="noreferrer"
              className="chat-link">
              {label.length > 30 ? label.slice(0, 30) + '…' : label} ↗
            </a>
          );
        }
        return part;
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Bullet points — collect into a group
      if (line.startsWith('• ') || line.startsWith('- ')) {
        bulletGroup.push(line.replace(/^[•\-]\s*/, ''));
        continue;
      }

      // Flush any pending bullets before rendering non-bullet
      flushBullets();

      // 👉 Next Step callout
      if (line.startsWith('👉')) {
        elements.push(
          <div key={i} className="chat-callout">
            <span className="chat-callout-icon">👉</span>
            <span>{renderInlineLinks(line.replace(/^👉\s*/, ''))}</span>
          </div>
        );
        continue;
      }

      // ## Heading with emoji
      if (line.startsWith('## ')) {
        const headingText = line.replace('## ', '');
        elements.push(
          <div key={i} className="chat-heading">
            {headingText}
          </div>
        );
        continue;
      }

      // ### Sub-heading
      if (line.startsWith('### ')) {
        elements.push(
          <div key={i} className="chat-subheading">
            {line.replace('### ', '')}
          </div>
        );
        continue;
      }

      // Numbered steps (1. 2. 3.)
      const stepMatch = line.match(/^(\d+)[.)]\s+(.*)/);
      if (stepMatch) {
        elements.push(
          <div key={i} className="chat-step">
            <span className="chat-step-num">{stepMatch[1]}</span>
            <span>{renderInlineLinks(stepMatch[2])}</span>
          </div>
        );
        continue;
      }

      // Empty line → spacer
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-1.5" />);
        continue;
      }

      // Normal paragraph
      elements.push(
        <p key={i} className="chat-paragraph">
          {renderInlineLinks(line)}
        </p>
      );
    }

    flushBullets();
    return elements;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="h-full overflow-hidden" role="main" id="main-content" aria-label="AI Chat Assistant">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">AI Assistant</h1>
            <p className="text-xs text-text-muted">Ask about elections in English or Hindi</p>
          </div>
        </div>
        <button onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) window.speechSynthesis?.cancel(); }}
          className={`p-2.5 rounded-xl transition-all border ${voiceOn
              ? 'bg-primary/15 border-primary/30 text-primary'
              : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary'
            }`}
          aria-label={voiceOn ? 'Disable voice reading' : 'Enable voice reading'}
          aria-pressed={voiceOn}>
          {voiceOn ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 h-[calc(100%-60px)]">

        {/* ===== MAIN CHAT AREA ===== */}
        <div className="flex flex-col glass-card overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-primary via-secondary to-primary-glow" />

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 chat-scroll-hide" role="log" aria-live="polite" aria-label="Chat messages">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center flex-shrink-0 text-sm shadow-md">
                      🤖
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sending && (
              <div className="flex gap-3" role="status" aria-label="AI is thinking">
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center flex-shrink-0 text-sm" aria-hidden="true">
                  🤖
                </div>
                <div className="chat-bubble-assistant">
                  <div className="flex gap-1.5 py-1" aria-hidden="true">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="sr-only">AI is thinking, please wait...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-border bg-bg-card/50">
            <label htmlFor="chat-input" className="sr-only">Type your election question</label>
            <div className="flex gap-2 items-center" role="search">
              <input ref={inputRef} id="chat-input" type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={sending}
                className="input-field flex-1 text-sm"
                placeholder="Ask about elections | चुनाव के बारे में पूछें"
                aria-label="Type your election question" />
              <motion.button onClick={() => handleSend()} disabled={sending || !input.trim()}
                whileTap={{ scale: 0.9 }}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:shadow-xl">
                <FiSend size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ===== SIDEBAR ===== */}
        <aside className="hidden lg:flex flex-col gap-4 overflow-y-auto" aria-label="Chat sidebar">

          {/* Quick Questions */}
          <div className="glass-card-static p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FiZap size={14} className="text-primary" /> Quick Questions
            </h3>
            <div className="space-y-1.5">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleQuickQuestion(q.q)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-text-secondary border border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all">
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Facts */}
          <div className="glass-card-static p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FiBookOpen size={14} className="text-primary" /> Quick Facts
            </h3>
            <div className="space-y-2.5">
              {QUICK_FACTS.map((fact, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-text-muted flex items-center gap-2">
                    <span className="text-sm">{fact.icon}</span> {fact.label}:
                  </span>
                  <span className="text-xs font-bold text-primary">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Capabilities */}
          <div className="glass-card-static p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FiHelpCircle size={14} className="text-secondary" /> I can help with
            </h3>
            <ul className="space-y-1.5 text-xs text-text-muted">
              {[
                'Voter registration process',
                'Polling booth location',
                'Election dates & schedule',
                'EVM & VVPAT explained',
                'Rights of voters',
                'Model Code of Conduct',
                'Hindi & English support',
              ].map((cap, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-secondary flex-shrink-0" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          {/* ECI Link */}
          <a href="https://eci.gov.in" target="_blank" rel="noreferrer"
            className="glass-card-static p-3 flex items-center gap-3 hover:border-primary/30 transition-all group">
            <span className="text-xl">🇮🇳</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-text-primary group-hover:text-primary transition-colors">Election Commission of India</p>
              <p className="text-[10px] text-text-muted">Official ECI Portal</p>
            </div>
            <FiExternalLink size={12} className="text-text-muted group-hover:text-primary" />
          </a>
        </aside>
      </div>
    </motion.div>
  );
}
