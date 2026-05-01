import { motion } from 'framer-motion';
import ScenarioSimulator from '../components/ScenarioSimulator';
import { FiInfo, FiZap, FiShield } from 'react-icons/fi';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function ScenarioPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-8">

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center shadow-lg shadow-primary/20 text-xl">
            🎭
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Scenario Simulator</h1>
            <p className="text-xs text-text-muted">Practice real-world voter situations and learn the solution</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: <FiZap size={14} />, title: 'AI-Powered', desc: 'Solutions based on actual ECI guidelines', color: 'text-primary', bg: 'bg-bg-elevated border-primary/20' },
          { icon: <FiShield size={14} />, title: 'Verified Steps', desc: 'Each step links to official portals', color: 'text-secondary', bg: 'bg-bg-elevated border-secondary/20' },
          { icon: <FiInfo size={14} />, title: 'Learn by Doing', desc: 'Practice scenarios before election day', color: 'text-primary', bg: 'bg-bg-elevated border-primary/20' },
        ].map((item, i) => (
          <motion.div key={i} variants={fadeUp}
            className={`flex items-start gap-3 p-4 rounded-xl border ${item.bg}`}>
            <div className={`mt-0.5 ${item.color}`}>{item.icon}</div>
            <div>
              <p className={`text-xs font-bold ${item.color}`}>{item.title}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Simulator */}
      <ScenarioSimulator />
    </motion.div>
  );
}
