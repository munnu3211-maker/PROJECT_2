import { motion } from 'framer-motion';
import TimelineEngine from '../components/TimelineEngine';

export default function TimelinePage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center shadow-lg">
            <span className="text-lg">📅</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Voting Timeline</h1>
            <p className="text-xs text-text-muted">Important dates and deadlines for your election journey</p>
          </div>
        </div>
      </div>
      <TimelineEngine />
    </motion.div>
  );
}
