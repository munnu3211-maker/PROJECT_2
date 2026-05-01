import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { getTimeline } from '../services/api';
import { FiCalendar, FiClock } from 'react-icons/fi';

export default function TimelineEngine() {
  const { user } = useUser();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getTimeline(user._id);
        if (data.success) setTimeline(data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    if (user) fetch();
  }, [user]);

  const getPriorityColor = (p) => {
    if (p === 'high') return 'text-red-500';
    if (p === 'medium') return 'text-blue-500';
    return 'text-text-muted';
  };

  const getDotColor = (event, isFirst) => {
    if (event.completed) return 'bg-secondary border-secondary shadow-secondary/30';
    if (isFirst) return 'bg-primary border-primary shadow-primary/30 animate-pulse';
    return 'bg-border border-text-muted';
  };

  return (
    <div className="glass-card p-4 sm:p-6">
      <h2 className="section-title">
        <FiCalendar className="text-primary" /> Voting Timeline
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="loading-shimmer h-16 w-full" />)}
        </div>
      ) : (
        <>
          <div className="max-h-[600px] overflow-y-auto pr-1 chat-scroll-hide">
            <div className="tl-container">
              {timeline?.events?.map((event, i) => (
                <motion.div key={event.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="tl-item"
                >
                  {/* Dot */}
                  <div className="tl-dot-wrap">
                    <div className={`tl-dot ${getDotColor(event, i === 0)}`} />
                  </div>

                  {/* Content Card */}
                  <div className={`tl-content ${
                    event.completed
                      ? 'bg-secondary/5 border-secondary/20'
                      : 'bg-bg-elevated border-border'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold text-sm ${event.completed ? 'text-secondary line-through' : 'text-text-primary'}`}>
                        {event.title}
                      </h3>
                      {event.priority === 'high' && !event.completed && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20 flex-shrink-0">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-xs mt-0.5">{event.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <FiClock size={10} className={getPriorityColor(event.priority)} />
                      <span className={`text-xs ${getPriorityColor(event.priority)}`}>
                        {event.deadline}
                      </span>
                      {event.daysFromNow > 0 && !event.completed && (
                        <span className="text-text-muted text-xs">
                          • {event.daysFromNow} days from now
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {timeline?.nextAction && (
            <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary-glow font-medium">
                ⏰ {timeline.nextAction}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
