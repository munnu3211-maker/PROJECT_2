import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { getChecklist } from '../services/api';
import { FiTrendingUp } from 'react-icons/fi';

export default function ReadinessScore() {
  const { user } = useUser();
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const { data } = await getChecklist(user._id);
        if (data.success) setScore(data.data.progress.percentage);
      } catch { setScore(user.readinessScore || 0); }
      setLoading(false);
    };
    if (user) fetchScore();
  }, [user]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#00D9A6';
    if (score >= 50) return '#FFB347';
    return '#FF6B6B';
  };

  const getMessage = () => {
    if (score >= 80) return 'Almost ready to vote! 🎉';
    if (score >= 50) return 'Good progress! Keep going 💪';
    if (score >= 25) return 'Getting started! Complete more steps';
    return "Let's begin your journey! 🚀";
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col items-center justify-center">
      <h2 className="section-title text-lg justify-center">
        <FiTrendingUp className="text-primary" /> Readiness Score
      </h2>

      <div className="progress-ring-container my-4">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" className="progress-ring-bg"
            strokeWidth="8" />
          <motion.circle cx="80" cy="80" r={radius} fill="none"
            stroke={getColor()} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: loading ? circumference : offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="progress-ring-fill" />
        </svg>
        <div className="absolute text-center">
          <motion.span className="text-3xl font-bold" style={{ color: getColor() }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {loading ? '...' : `${score}%`}
          </motion.span>
          <p className="text-text-muted text-xs">Ready</p>
        </div>
      </div>

      <p className="text-text-secondary text-sm text-center">{getMessage()}</p>

      <div className="mt-4 w-full space-y-2">
        {[
          { label: 'Registration', done: user?.voterStatus === 'registered' },
          { label: 'Voter ID', done: user?.hasVoterId },
          { label: 'Documents', done: false },
          { label: 'Booth Located', done: false },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs px-2">
            <span className="text-text-secondary">{item.label}</span>
            <span className={item.done ? 'text-secondary' : 'text-text-muted'}>
              {item.done ? '✅' : '⬜'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
