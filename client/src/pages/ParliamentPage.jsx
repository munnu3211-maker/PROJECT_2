import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';

// Parliament data
const LOK_SABHA = {
  totalSeats: 543,
  electedSeats: 543,
  term: '5 years',
  speaker: 'Speaker of Lok Sabha',
  minimumAge: 25,
  quorum: '1/10th of total members',
  sessions: ['Budget Session (Feb–May)', 'Monsoon Session (Jul–Aug)', 'Winter Session (Nov–Dec)'],
};

const RAJYA_SABHA = {
  totalSeats: 245,
  elected: 233,
  nominated: 12,
  term: '6 years (1/3 retire every 2 years)',
  chairman: 'Vice President of India',
  minimumAge: 30,
  quorum: '1/10th of total members',
};

const STATE_SEATS = [
  { state: 'Uttar Pradesh', ls: 80, rs: 31 },
  { state: 'Maharashtra', ls: 48, rs: 19 },
  { state: 'West Bengal', ls: 42, rs: 16 },
  { state: 'Tamil Nadu', ls: 39, rs: 18 },
  { state: 'Bihar', ls: 40, rs: 16 },
  { state: 'Madhya Pradesh', ls: 29, rs: 11 },
  { state: 'Karnataka', ls: 28, rs: 12 },
  { state: 'Gujarat', ls: 26, rs: 11 },
  { state: 'Andhra Pradesh', ls: 25, rs: 11 },
  { state: 'Rajasthan', ls: 25, rs: 10 },
  { state: 'Odisha', ls: 21, rs: 10 },
  { state: 'Kerala', ls: 20, rs: 9 },
  { state: 'Telangana', ls: 17, rs: 7 },
  { state: 'Jharkhand', ls: 14, rs: 6 },
  { state: 'Assam', ls: 14, rs: 7 },
  { state: 'Punjab', ls: 13, rs: 7 },
  { state: 'Chhattisgarh', ls: 11, rs: 5 },
  { state: 'Haryana', ls: 10, rs: 5 },
];

const HOW_PARLIAMENT_WORKS = [
  {
    title: 'What is Parliament?',
    content: 'The Parliament of India is the supreme legislative body consisting of two Houses — Lok Sabha (House of the People) and Rajya Sabha (Council of States), along with the President of India.',
  },
  {
    title: 'How are Laws Made?',
    content: 'A Bill can be introduced in either House. It goes through three readings, committee scrutiny, and debate. Once passed by both Houses, it goes to the President for assent. Money Bills can only be introduced in Lok Sabha.',
  },
  {
    title: 'Who can Become an MP?',
    content: 'For Lok Sabha: Indian citizen, minimum 25 years old, registered voter. For Rajya Sabha: Indian citizen, minimum 30 years old. Disqualifications include holding an office of profit, unsound mind, or being an undischarged insolvent.',
  },
  {
    title: 'Key Parliamentary Officials',
    content: 'Speaker of Lok Sabha presides over the lower house. Vice President of India is the ex-officio Chairman of Rajya Sabha. The Prime Minister is the leader of the majority party in Lok Sabha.',
  },
  {
    title: 'Parliamentary Sessions',
    content: 'Parliament meets in three sessions annually: Budget Session (Feb–May), Monsoon Session (Jul–Aug), and Winter Session (Nov–Dec). The President can summon, prorogue, or dissolve sessions.',
  },
  {
    title: 'Parliamentary Privileges',
    content: 'MPs enjoy freedom of speech in Parliament, immunity from court proceedings for statements made in the House, and the right to access information for legislative duties.',
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };


function AccordionItem({ item: faqItem, isOpen, onToggle }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-elevated/50 transition-colors">
        <span className="text-sm font-semibold text-text-primary">{faqItem.title}</span>
        {isOpen ? <FiChevronUp size={16} className="text-primary" /> : <FiChevronDown size={16} className="text-text-muted" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-4 pb-4">
              <p className="text-sm text-text-secondary leading-relaxed">{faqItem.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ParliamentPage() {
  const [activeTab, setActiveTab] = useState('lok-sabha');
  const [openFaq, setOpenFaq] = useState(0);
  const [showAllStates, setShowAllStates] = useState(false);

  const displayedStates = showAllStates ? STATE_SEATS : STATE_SEATS.slice(0, 10);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-xl">🏛️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Parliament of India</h1>
          <p className="text-xs text-text-muted">Understanding India's legislative system</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex rounded-xl bg-bg-elevated p-1 max-w-md">
        {[
          { key: 'lok-sabha', label: 'Lok Sabha', seats: '543' },
          { key: 'rajya-sabha', label: 'Rajya Sabha', seats: '245' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${activeTab === tab.key
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-text-muted hover:text-text-primary'
              }`}>
            {tab.label} <span className="ml-1 opacity-70">({tab.seats})</span>
          </button>
        ))}
      </motion.div>

      {/* House Info Cards */}
      <AnimatePresence mode="wait">
        {activeTab === 'lok-sabha' ? (
          <motion.div key="lok-sabha" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lok Sabha Overview */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src="/assets/lok-sabha-icon.png" alt="Lok Sabha" className="w-10 h-10 object-contain drop-shadow-lg" />
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Lok Sabha</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">House of the People</span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-border/30 mb-2">
                <img src="/assets/lok-sabha-hemicycle.png" alt="Lok Sabha Chamber" className="w-full h-auto object-cover" />
              </div>
              <p className="text-center text-xs text-text-muted font-medium mb-2">{LOK_SABHA.totalSeats} Total Seats</p>

              <div className="mt-5 space-y-2.5">
                {[
                  { label: 'Total Seats', value: LOK_SABHA.totalSeats },
                  { label: 'Term', value: LOK_SABHA.term },
                  { label: 'Minimum Age', value: `${LOK_SABHA.minimumAge} years` },
                  { label: 'Presiding Officer', value: LOK_SABHA.speaker },
                  { label: 'Quorum', value: LOK_SABHA.quorum },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-text-muted">{row.label}</span>
                    <span className="text-sm font-medium text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sessions */}
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                📅 Parliamentary Sessions
              </h3>
              <div className="space-y-3">
                {LOK_SABHA.sessions.map((session, i) => {
                  const icons = ['🌸', '🌧️', '❄️'];
                  return (
                    <div key={i} className="p-3.5 rounded-xl bg-bg-elevated border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{icons[i]}</span>
                        <h4 className="text-sm font-semibold text-text-primary">{session}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-primary">Did you know?</strong> The Lok Sabha was constituted for the first time on 17 April 1952 after the first general elections held from 25 October 1951 to 21 February 1952.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="rajya-sabha" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rajya Sabha Overview */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src="/assets/rajya-sabha-icon.png" alt="Rajya Sabha" className="w-10 h-10 object-contain drop-shadow-lg" />
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Rajya Sabha</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-medium">Council of States</span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-border/30 mb-2">
                <img src="/assets/rajya-sabha-hemicycle.png" alt="Rajya Sabha Chamber" className="w-full h-auto object-cover" />
              </div>
              <p className="text-center text-xs text-text-muted font-medium mb-2">{RAJYA_SABHA.totalSeats} Total Seats</p>

              <div className="mt-5 space-y-2.5">
                {[
                  { label: 'Total Seats', value: RAJYA_SABHA.totalSeats },
                  { label: 'Elected Members', value: RAJYA_SABHA.elected },
                  { label: 'Nominated by President', value: RAJYA_SABHA.nominated },
                  { label: 'Term', value: RAJYA_SABHA.term },
                  { label: 'Minimum Age', value: `${RAJYA_SABHA.minimumAge} years` },
                  { label: 'Chairman', value: RAJYA_SABHA.chairman },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-text-muted">{row.label}</span>
                    <span className="text-sm font-medium text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rajya Sabha Key Features */}
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                ⚡ Key Features
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Permanent Body', desc: 'Rajya Sabha is never fully dissolved. 1/3rd members retire every 2 years.', icon: '♾️' },
                  { title: 'State Representation', desc: 'Members are elected by state legislative assemblies via proportional representation.', icon: '🗺️' },
                  { title: 'Special Powers', desc: 'Can create new All India Services (Art. 312) and move resolution to transfer state subjects to Parliament.', icon: '⚖️' },
                  { title: 'No Money Bills', desc: 'Cannot introduce or reject Money Bills. Can only suggest amendments within 14 days.', icon: '💰' },
                ].map((feature, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-bg-elevated border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{feature.icon}</span>
                      <h4 className="text-sm font-semibold text-text-primary">{feature.title}</h4>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed pl-7">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* State-wise Seat Distribution */}
      <motion.div variants={item} className="glass-card p-6">
        <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          📊 State-wise Seat Distribution (Top States)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 text-text-muted font-medium text-xs">State</th>
                <th className="text-center py-2.5 text-text-muted font-medium text-xs">Lok Sabha</th>
                <th className="text-center py-2.5 text-text-muted font-medium text-xs">Rajya Sabha</th>
                <th className="text-center py-2.5 text-text-muted font-medium text-xs">Total</th>
              </tr>
            </thead>
            <tbody>
              {displayedStates.map((s, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-bg-elevated/50 transition-colors">
                  <td className="py-2.5 text-text-primary font-medium">{s.state}</td>
                  <td className="py-2.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{s.ls}</span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">{s.rs}</span>
                  </td>
                  <td className="py-2.5 text-center text-text-secondary font-semibold">{s.ls + s.rs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => setShowAllStates(!showAllStates)}
          className="mt-3 text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
          {showAllStates ? 'Show Less' : `Show All ${STATE_SEATS.length} States`}
          {showAllStates ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
        </button>
      </motion.div>

      {/* How Parliament Works — FAQ */}
      <motion.div variants={item}>
        <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <FiInfo className="text-primary" /> How Parliament Works
        </h3>
        <div className="space-y-2">
          {HOW_PARLIAMENT_WORKS.map((faq, i) => (
            <AccordionItem key={i} item={faq} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
          ))}
        </div>
      </motion.div>

      {/* Footer Link */}
      <motion.div variants={item} className="text-center pb-4">
        <a href="https://sansad.in" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          Visit sansad.in for Official Parliament Info <FiExternalLink size={14} />
        </a>
      </motion.div>
    </motion.div>
  );
}
