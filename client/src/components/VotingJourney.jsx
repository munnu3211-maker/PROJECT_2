import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { getJourney } from '../services/api';
import { FiMap, FiExternalLink, FiClock, FiCheckCircle, FiCircle } from 'react-icons/fi';

export default function VotingJourney() {
  const { user } = useUser();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getJourney(user._id);
        if (data.success) setJourney(data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    if (user) fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h2 className="section-title"><FiMap className="text-primary" /> Your Voting Journey</h2>
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="loading-shimmer h-16 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="section-title"><FiMap className="text-primary" /> Your Voting Journey</h2>
      {journey?.summary && (
        <p className="section-subtitle">{journey.summary}</p>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {journey?.steps?.map((step, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex gap-3 p-3 rounded-xl transition-all ${
              step.completed
                ? 'bg-secondary/5 border border-secondary/20'
                : 'bg-bg-elevated border border-border hover:border-primary/30'
            }`}>
            <div className="flex-shrink-0 mt-1">
              {step.completed
                ? <FiCheckCircle className="text-secondary" size={18} />
                : <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">{step.number}</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm ${step.completed ? 'text-secondary' : 'text-text-primary'}`}>
                {step.title}
              </h3>
              <p className="text-text-secondary text-xs mt-0.5 line-clamp-2">{step.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                {step.resource && (
                  <a href={step.resource} target="_blank" rel="noreferrer"
                    className="text-primary text-xs flex items-center gap-1 hover:underline">
                    <FiExternalLink size={10} /> Visit
                  </a>
                )}
                {step.estimatedTime && (
                  <span className="text-text-muted text-xs flex items-center gap-1">
                    <FiClock size={10} /> {step.estimatedTime}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {journey?.nextAction && (
        <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary-glow font-medium">
            👉 Next: {journey.nextAction}
          </p>
        </div>
      )}
    </div>
  );
}
