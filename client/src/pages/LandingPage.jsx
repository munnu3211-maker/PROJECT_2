import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  FiArrowRight, FiCheckCircle, FiShield, FiZap, FiCpu,
  FiChevronRight, FiLock, FiMapPin, FiMessageCircle, FiBookOpen,
  FiUsers, FiMap, FiAward, FiStar
} from 'react-icons/fi';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const FEATURES = [
  { icon: <FiZap />, title: 'Personalized Journey', desc: 'AI creates YOUR unique voting roadmap based on your profile and location.', gradient: 'from-[#FF9933] to-[#E65100]' },
  { icon: <FiCheckCircle />, title: 'Smart Checklist', desc: 'Track every step — from registration to election day with readiness scores.', gradient: 'from-[#138808] to-[#1B5E20]' },
  { icon: <FiCpu />, title: 'Gemini AI Chat', desc: 'Get instant answers in English or Hindi, powered by Google Gemini.', gradient: 'from-[#000080] to-[#1A237E]' },
  { icon: <FiShield />, title: 'Neutral & Official', desc: 'Based entirely on ECI processes — zero political bias, 100% factual.', gradient: 'from-[#FF9933] via-white to-[#138808]' },
  { icon: <FiMapPin />, title: 'Booth Finder', desc: 'Locate your polling station, know what to carry, and booth timings.', gradient: 'from-[#E65100] to-[#BF360C]' },
  { icon: <FiMap />, title: 'India ECI Map', desc: 'Explore state-wise election data, voter statistics, and constituency info.', gradient: 'from-[#1B5E20] to-[#138808]' },
];

const STATS = [
  { end: 950, suffix: 'M+', label: 'Registered Voters in India' },
  { end: 10.5, suffix: 'L+', label: 'Polling Stations Nationwide', decimals: 1 },
  { end: 543, suffix: '', label: 'Lok Sabha Constituencies' },
  { end: 36, suffix: '', label: 'States & Union Territories' },
];

function CountUp({ end, suffix = '', decimals = 0, duration = 2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = Math.min((now - startTime) / (duration * 1000), 1);
      // easeOutExpo for snappy start, slow finish
      const eased = elapsed === 1 ? 1 : 1 - Math.pow(2, -10 * elapsed);
      const current = eased * end;
      setCount(current);
      if (elapsed < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration]);

  const display = decimals > 0 ? count.toFixed(decimals) : Math.round(count);

  return (
    <span ref={ref} className="text-2xl sm:text-3xl font-extrabold gradient-text tabular-nums">
      {display}{suffix}
    </span>
  );
}

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Profile', desc: 'Sign up and tell us your age, state, and voter status. We personalize everything for you.', icon: <FiUsers /> },
  { step: '02', title: 'Get Your Roadmap', desc: 'AI generates a step-by-step election checklist tailored to your situation.', icon: <FiCheckCircle /> },
  { step: '03', title: 'Ask Anything', desc: 'Chat with our AI assistant about voter ID, EVM, booth location — in English or Hindi.', icon: <FiMessageCircle /> },
  { step: '04', title: 'Vote with Confidence', desc: 'Walk into your booth fully prepared. Know the rules, carry the right documents.', icon: <FiAward /> },
];

const TESTIMONIALS = [
  { name: 'Priya S.', location: 'Mumbai, MH', text: 'First time voter and I had no idea where to start. VotePath AI made everything so clear — from getting my voter ID to finding my booth!', rating: 5 },
  { name: 'Rahul K.', location: 'Lucknow, UP', text: 'The AI chatbot answered all my questions about EVM and VVPAT in Hindi. Really helpful for my parents who are not tech-savvy.', rating: 5 },
  { name: 'Ananya M.', location: 'Bangalore, KA', text: 'Love the checklist feature — it tracks your readiness percentage. I went from 30% to 100% in just two days!', rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-dark relative overflow-x-hidden">

      {/* ====== NAVBAR ====== */}
      <header className="sticky top-0 z-40 bg-bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-sm shadow-lg shadow-primary/20">
              🗳️
            </div>
            <div>
              <span className="text-base font-bold gradient-text">VotePath AI</span>
              <span className="hidden sm:inline text-xs text-text-muted ml-2">Election Journey Assistant</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-text-secondary hover:text-primary transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link to="/auth" className="btn-primary text-xs px-4 py-2">
              Get Started <FiChevronRight className="inline ml-0.5" size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ====== HERO ====== */}
      <section className="relative z-10 px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI-Powered Election Assistant — Made in India 🇮🇳
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 text-text-primary">
            Your{' '}
            <span className="relative">
              <span className="gradient-text">Personalized</span>
              <motion.div className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary to-secondary"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }} style={{ transformOrigin: 'left' }} />
            </span>
            <br />
            Election Journey
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Not just information —{' '}
            <span className="text-text-primary font-semibold">actionable, step-by-step guidance</span>{' '}
            based on YOUR situation. From voter registration to election day — we've got you covered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth">
              <motion.button
                className="btn-primary text-sm sm:text-base px-8 py-3.5 shadow-xl shadow-primary/20"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}>
                Start My Journey <FiArrowRight className="inline ml-2" />
              </motion.button>
            </Link>
            <a href="https://voters.eci.gov.in/" target="_blank" rel="noreferrer"
              className="btn-secondary text-sm px-6 py-3">
              Visit ECI Portal ↗
            </a>
          </motion.div>
        </div>
      </section>

      {/* ====== STATS BAR ====== */}
      <section className="relative z-10 border-y border-border/50 bg-bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Indian Tricolor Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
        {/* Indian Tricolor Animated Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-40%] right-[-10%] w-[350px] h-[350px] rounded-full blur-[100px] animate-tricolor-saffron"
            style={{ background: 'radial-gradient(circle, rgba(255,153,51,0.2) 0%, transparent 70%)' }} />
          <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] rounded-full blur-[80px] animate-tricolor-white"
            style={{ background: 'radial-gradient(circle, rgba(0,56,168,0.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-40%] right-[15%] w-[350px] h-[350px] rounded-full blur-[100px] animate-tricolor-green"
            style={{ background: 'radial-gradient(circle, rgba(19,136,8,0.18) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <div key={i}>
                <CountUp end={s.end} suffix={s.suffix} decimals={s.decimals || 0} duration={2.2} />
                <p className="text-xs text-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="relative z-10 px-5 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">What We Offer</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Everything You Need for Election Day</h2>
            <p className="text-text-muted text-sm mt-2 max-w-lg mx-auto">From registration status to booth location — VotePath AI covers your entire voting journey</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass-card p-6 group hover:border-primary/30 transition-all">
                <div className={`w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center mb-4 text-primary shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-sm text-text-primary mb-1.5">{f.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="relative z-10 px-5 py-20 bg-bg-card/30 border-y border-border/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs text-secondary font-semibold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">How It Works</h2>
            <p className="text-text-muted text-sm mt-2">Four simple steps to become a confident voter</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} variants={fadeUp}
                className="relative glass-card p-6 text-center group hover:border-secondary/30 transition-all">
                <span className="absolute top-3 right-4 text-4xl font-extrabold text-border/50 select-none">{step.step}</span>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-4 text-secondary group-hover:bg-secondary/20 transition-all">
                  {step.icon}
                </div>
                <h3 className="font-bold text-sm text-text-primary mb-1.5">{step.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 text-border">
                    <FiChevronRight size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== WHAT YOU CAN DO ====== */}
      <section className="relative z-10 px-5 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">Platform Capabilities</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Ask the AI Anything About</h2>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              '📝 Voter Registration', '🪪 Voter ID / EPIC Card', '📍 Booth Location',
              '🗳️ EVM & VVPAT', '📋 Election Rules', '🏠 Absentee Voting',
              '👴 Senior Citizen Voting', '♿ PwD Voter Rights',
              '🚫 Filing Complaints', '📞 ECI Helpline', '🏛️ Parliament Info', '🧠 Quiz & Learn',
            ].map((topic, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass-card-static px-4 py-3 text-center text-xs font-medium text-text-secondary hover:text-primary hover:border-primary/20 transition-all cursor-default">
                {topic}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className="relative z-10 px-5 py-20 bg-bg-card/30 border-y border-border/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">User Stories</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">What Voters Say</h2>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass-card p-5 flex flex-col">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <FiStar key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed flex-1">"{t.text}"</p>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-[10px] text-text-muted">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="relative z-10 px-5 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card p-8 sm:p-12 border-primary/20">
            <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-5 text-2xl shadow-xl">
              🗳️
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
              Ready to Start Your Election Journey?
            </h2>
            <p className="text-text-muted text-sm max-w-md mx-auto mb-6">
              Join thousands of informed voters who are using AI to navigate the election process with confidence.
            </p>
            <Link to="/auth">
              <motion.button className="btn-primary text-base px-10 py-4 shadow-xl shadow-primary/25"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Create Free Account <FiArrowRight className="inline ml-2" />
              </motion.button>
            </Link>
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              <span className="text-xs text-text-muted flex items-center gap-1.5"><FiLock size={10} className="text-secondary" /> Encrypted & Secure</span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs text-text-muted">100% Free</span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs text-text-muted">No Political Affiliation</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="relative z-10 border-t border-border/50 bg-bg-card/50">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-xs shadow-md">🗳️</div>
                <span className="text-sm font-bold gradient-text">VotePath AI</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                AI-powered election journey assistant helping Indian citizens navigate the voting process with confidence.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="https://voters.eci.gov.in/" target="_blank" rel="noreferrer" className="text-xs text-text-muted hover:text-primary transition-colors">ECI Voter Portal</a></li>
                <li><a href="https://electoralsearch.eci.gov.in/" target="_blank" rel="noreferrer" className="text-xs text-text-muted hover:text-primary transition-colors">Electoral Search</a></li>
                <li><a href="https://sansad.in" target="_blank" rel="noreferrer" className="text-xs text-text-muted hover:text-primary transition-colors">Sansad.in</a></li>
                <li><a href="https://nvsp.in/" target="_blank" rel="noreferrer" className="text-xs text-text-muted hover:text-primary transition-colors">NVSP Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">Contact ECI</h4>
              <ul className="space-y-2">
                <li className="text-xs text-text-muted">📞 Helpline: <a href="tel:1950" className="text-primary hover:underline">1950</a></li>
                <li className="text-xs text-text-muted">📧 complaints@eci.gov.in</li>
                <li className="text-xs text-text-muted">🌐 www.eci.gov.in</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-text-muted">© 2025 VotePath AI — Not affiliated with Election Commission of India. For educational purposes.</p>
            <div className="flex items-center gap-4 text-[10px] text-text-muted">
              <span>🇮🇳 Made for India</span>
              <span>🔒 Non-Political</span>
              <span>🤖 AI-Powered</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
