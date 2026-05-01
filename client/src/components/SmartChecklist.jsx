import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { getChecklist, updateChecklistItem } from '../services/api';
import toast from 'react-hot-toast';
import { FiCheckSquare, FiSquare, FiCheck } from 'react-icons/fi';

export default function SmartChecklist({ onProgressChange }) {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getChecklist(user._id);
        if (data.success) {
          setItems(data.data.items);
          setProgress(data.data.progress);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    if (user) fetch();
  }, [user]);

  const toggleItem = async (itemKey) => {
    const item = items.find(i => i.key === itemKey);
    if (!item) return;

    try {
      const { data } = await updateChecklistItem(user._id, itemKey, !item.completed);
      if (data.success) {
        setItems(data.data.items);
        setProgress(data.data.progress);
        onProgressChange?.(data.data.progress);
        toast.success(item.completed ? 'Unchecked!' : 'Step completed! ✨');
      }
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <FiCheckSquare className="text-primary" /> Smart Checklist
        </h2>
        <span className="text-sm font-semibold text-primary">
          {progress.completed}/{progress.total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-border mb-4 overflow-hidden">
        <motion.div className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="loading-shimmer h-14 w-full" />)}
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {items.map((item, i) => (
            <motion.div key={item.key}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleItem(item.key)}
              className={`checklist-item ${item.completed ? 'completed' : ''}`}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                item.completed
                  ? 'bg-secondary border-secondary'
                  : 'border-text-muted'
              }`}>
                {item.completed && <FiCheck size={12} className="text-bg-dark" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                  {item.label}
                </p>
                <p className="text-text-muted text-xs truncate">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
