import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { getScenarios, runScenario } from '../services/api';
import {
  FiArrowLeft, FiExternalLink, FiFileText,
  FiClock, FiPhone, FiCheckCircle, FiChevronRight, FiAlertCircle, FiPlay
} from 'react-icons/fi';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function ScenarioSimulator() {
  const { user } = useUser();
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getScenarios();
        if (data.success) setScenarios(data.data);
      } catch (e) { console.error(e); }
      setFetchingList(false);
    };
    fetch();
  }, []);

  const simulate = async (scenarioId) => {
    setSelectedScenario(scenarioId);
    setLoading(true);
    try {
      const { data } = await runScenario(user._id, scenarioId);
      if (data.success) setResult(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const reset = () => { setSelectedScenario(null); setResult(null); };

  const selectedMeta = scenarios.find(s => s.id === selectedScenario);

  return (
    <AnimatePresence mode="wait">
      {!selectedScenario ? (
        /* ====== SCENARIO GRID ====== */
        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
              <span className="text-sm">🎭</span> Choose a Scenario
            </h2>
            <p className="text-xs text-text-muted mb-5">Select a voter situation to simulate and learn the solution</p>

            {fetchingList ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i => <div key={i} className="loading-shimmer h-28 rounded-xl" />)}
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scenarios.map((s) => (
                  <motion.button key={s.id} variants={fadeUp}
                    onClick={() => simulate(s.id)}
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl bg-bg-elevated border border-border hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 text-left transition-all group">
                    <span className="text-2xl block mb-2">{s.icon}</span>
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-purple-400 transition-colors">{s.title}</h3>
                    <p className="text-text-muted text-xs mt-1 leading-relaxed line-clamp-2">{s.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-[10px] text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Simulate <FiChevronRight size={10} />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        /* ====== SCENARIO RESULT ====== */
        <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
          className="space-y-4">

          {/* Back Button */}
          <button onClick={reset}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors font-medium">
            <FiArrowLeft size={14} /> Back to all scenarios
          </button>

          {loading ? (
            <div className="glass-card p-6 space-y-3">
              <div className="loading-shimmer h-16 rounded-xl" />
              {[1,2,3,4].map(i => <div key={i} className="loading-shimmer h-20 rounded-xl" />)}
            </div>
          ) : result && (
            <>
              {/* Scenario Header Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 border-purple-500/20">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{selectedMeta?.icon || '🎯'}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-text-primary">{result.title}</h2>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{result.description}</p>
                  </div>
                </div>
              </motion.div>

              {/* Steps */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FiCheckCircle size={14} className="text-secondary" /> Step-by-Step Solution
                </h3>

                <motion.div variants={container} initial="hidden" animate="show"
                  className="relative space-y-0">

                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#FF9933] via-white to-[#138808] rounded-full" />

                  {result.steps?.map((step, i) => (
                    <motion.div key={i} variants={fadeUp}
                      className="relative flex gap-4 pb-5 last:pb-0">
                      {/* Step Number Circle */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center shadow-md shadow-primary/20">
                          <span className="text-xs font-bold text-text-primary">{step.number || i + 1}</span>
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 bg-bg-elevated border border-border rounded-xl p-4 hover:border-primary/20 transition-all">
                        <h4 className="text-sm font-semibold text-text-primary">{step.action}</h4>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{step.details}</p>
                        {step.link && (
                          <a href={step.link} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary hover:underline font-medium">
                            <FiExternalLink size={11} /> Open Portal
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Info Cards Row */}
              <motion.div variants={container} initial="hidden" animate="show"
                className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.documentsNeeded?.length > 0 && (
                  <motion.div variants={fadeUp}
                    className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                        <FiFileText size={13} className="text-amber-400" />
                      </div>
                      <p className="text-xs font-bold text-text-primary">Documents Required</p>
                    </div>
                    <ul className="space-y-1.5">
                      {result.documentsNeeded.map((d, i) => (
                        <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span> {d}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {result.estimatedTime && (
                  <motion.div variants={fadeUp}
                    className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <FiClock size={13} className="text-blue-400" />
                      </div>
                      <p className="text-xs font-bold text-text-primary">Estimated Time</p>
                    </div>
                    <p className="text-sm font-semibold text-blue-400">{result.estimatedTime}</p>
                    <p className="text-[10px] text-text-muted mt-1">Processing & completion time</p>
                  </motion.div>
                )}

                {result.helplineNumber && (
                  <motion.div variants={fadeUp}
                    className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <FiPhone size={13} className="text-emerald-400" />
                      </div>
                      <p className="text-xs font-bold text-text-primary">Helpline</p>
                    </div>
                    <a href={`tel:${result.helplineNumber}`}
                      className="text-lg font-bold text-emerald-400 font-mono hover:underline">
                      {result.helplineNumber}
                    </a>
                    <p className="text-[10px] text-text-muted mt-1">Tap to call ECI helpline</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Next Action CTA */}
              {result.nextAction && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-5 border-secondary/20 bg-secondary/5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiAlertCircle size={16} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Next Action</p>
                      <p className="text-sm text-text-primary font-medium">{result.nextAction}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Simulate Again Button */}
              <div className="text-center pt-2">
                <button onClick={reset}
                  className="btn-secondary text-xs px-5 py-2.5 inline-flex items-center gap-2">
                  <span>🎭</span> Try Another Scenario
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
