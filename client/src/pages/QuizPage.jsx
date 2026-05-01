import { motion } from 'framer-motion';
import QuizSection from '../components/QuizSection';

const LEARNING_TOPICS = [
  { icon: '🗳️', title: 'Right to Vote', desc: 'Article 326 guarantees universal adult suffrage — every citizen 18+ can vote.' },
  { icon: '📋', title: 'ECI Independence', desc: 'The Election Commission is an autonomous constitutional body under Article 324.' },
  { icon: '🔒', title: 'Secret Ballot', desc: 'Your vote is secret. No one — not even a court — can ask whom you voted for.' },
  { icon: '📅', title: 'Election Cycles', desc: 'Lok Sabha elections every 5 years. State assemblies may differ in schedule.' },
  { icon: '🎖️', title: 'NOTA Option', desc: 'Since 2013, you can choose "None of the Above" if no candidate appeals to you.' },
  { icon: '🛡️', title: 'MCC Protection', desc: 'Model Code of Conduct prevents misuse of power during the election period.' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function QuizPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-xl">🧠</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Learn & Quiz</h1>
          <p className="text-xs text-text-muted">Test your knowledge about India's electoral process</p>
        </div>
      </motion.div>

      {/* Did You Know Cards */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-text-secondary mb-3">📖 Did You Know?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEARNING_TOPICS.map((topic, i) => (
            <motion.div key={i} variants={item}
              className="glass-card-static p-4 hover:border-primary/30 transition-all group">
              <span className="text-2xl block mb-2">{topic.icon}</span>
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">
                {topic.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">{topic.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quiz Component */}
      <motion.div variants={item}>
        <QuizSection />
      </motion.div>
    </motion.div>
  );
}
