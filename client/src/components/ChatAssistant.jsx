import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { sendChatMessage, getChatHistory } from '../services/api';
import { FiMessageCircle, FiSend, FiVolume2, FiVolumeX } from 'react-icons/fi';

export default function ChatAssistant({ fullHeight = false }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getChatHistory(user._id);
        if (data.success && data.data.length > 0) {
          setMessages(data.data);
        } else {
          setMessages([{
            role: 'assistant',
            content: `Namaste ${user.name}! 🙏 I'm your VotePath AI assistant. I'm here to help you with anything related to voting in India.\n\nYou can ask me things like:\n• "How do I register as a voter?"\n• "What documents do I need?"\n• "Where is my polling booth?"\n• "Mujhe vote dene ke liye kya karna hoga?"\n\nWhat would you like to know?`,
          }]);
        }
      } catch (e) {
        setMessages([{
          role: 'assistant',
          content: `Hi ${user.name}! 👋 I'm your VotePath AI assistant. Ask me anything about the Indian voting process!`,
        }]);
      }
    };
    if (user) load();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSending(true);

    try {
      const { data } = await sendChatMessage(user._id, userMsg);
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }]);
        speak(data.data.reply);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again or check if the server is running.',
      }]);
    }
    setSending(false);
  };

  const quickQuestions = [
    'How do I register as a voter?',
    'What documents do I need to vote?',
    'How to find my polling booth?',
    'What is NOTA?',
  ];

  return (
    <div className={`glass-card p-6 ${fullHeight ? 'flex flex-col h-full' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <FiMessageCircle className="text-primary" /> AI Chat Assistant
        </h2>
        <button onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) window.speechSynthesis?.cancel(); }}
          className={`p-2 rounded-lg transition-colors ${voiceOn ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text-primary'}`}
          title={voiceOn ? 'Disable Voice' : 'Enable Voice'}>
          {voiceOn ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
        </button>
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {quickQuestions.map((q, i) => (
            <button key={i} onClick={() => { setInput(q); }}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className={`${fullHeight ? 'flex-1' : 'h-72'} overflow-y-auto space-y-3 mb-4 pr-2 flex flex-col`}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        {sending && (
          <div className="chat-bubble-assistant">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input type="text" className="input-field flex-1"
          placeholder="Ask me anything about voting... (English or Hinglish)"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={sending} />
        <motion.button onClick={handleSend} disabled={sending || !input.trim()}
          whileTap={{ scale: 0.9 }}
          className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed">
          <FiSend size={16} />
        </motion.button>
      </div>
    </div>
  );
}
