import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample candidate data (realistic Indian election format)
const CANDIDATES = [
  { id: 1, name: 'Rajesh Kumar', party: 'Bharatiya Jan Sewa Party', symbol: '🌻', color: '#FF9933' },
  { id: 2, name: 'Priya Sharma', party: 'Rashtriya Lok Morcha', symbol: '🌿', color: '#138808' },
  { id: 3, name: 'Amit Singh', party: 'Janta Kalyan Dal', symbol: '⭐', color: '#3B82F6' },
  { id: 4, name: 'Fatima Begum', party: 'Independent', symbol: '🏠', color: '#8B5CF6' },
  { id: 5, name: 'Suresh Yadav', party: 'Samajik Nyay Party', symbol: '🔔', color: '#EF4444' },
  { id: 6, name: 'NOTA', party: 'None of the Above', symbol: '✖️', color: '#6B7280' },
];

export default function EVMDemo() {
  const [step, setStep] = useState('intro'); // intro | voting | vvpat | done
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [vvpatVisible, setVvpatVisible] = useState(false);
  const [vvpatTimer, setVvpatTimer] = useState(7);
  const [pressedButton, setPressedButton] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleVote = (candidate) => {
    setPressedButton(candidate.id);
    setSelectedCandidate(candidate);

    // LED light + beep simulation
    setTimeout(() => {
      setStep('vvpat');
      setVvpatVisible(true);

      // VVPAT countdown (7 seconds as per ECI rules)
      let count = 7;
      setVvpatTimer(count);
      const interval = setInterval(() => {
        count--;
        setVvpatTimer(count);
        if (count <= 0) {
          clearInterval(interval);
          setVvpatVisible(false);
          setStep('done');
        }
      }, 1000);
    }, 800);
  };

  const resetDemo = () => {
    setStep('intro');
    setSelectedCandidate(null);
    setVvpatVisible(false);
    setVvpatTimer(7);
    setPressedButton(null);
    setShowInstructions(true);
  };

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          🖥️ Interactive EVM Demo
        </h2>
        {step !== 'intro' && (
          <button onClick={resetDemo}
            className="text-xs text-primary hover:underline font-medium px-3 py-1 rounded-lg border border-primary/20 hover:bg-primary/5 transition-all">
            🔄 Try Again
          </button>
        )}
      </div>
      <p className="text-xs text-text-muted mb-5">Practice using the Electronic Voting Machine before election day</p>

      {/* ── STEP INDICATOR ── */}
      <div className="flex items-center gap-2 mb-5">
        {['intro', 'voting', 'vvpat', 'done'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === s ? 'bg-primary text-white shadow-md shadow-primary/30' :
              ['intro', 'voting', 'vvpat', 'done'].indexOf(step) > i ? 'bg-primary/20 text-primary' :
              'bg-bg-elevated text-text-muted border border-border'
            }`}>
              {i + 1}
            </div>
            {i < 3 && <div className={`w-6 sm:w-10 h-0.5 rounded-full transition-all ${
              ['intro', 'voting', 'vvpat', 'done'].indexOf(step) > i ? 'bg-primary/40' : 'bg-border'
            }`} />}
          </div>
        ))}
        <span className="text-[10px] text-text-muted ml-2 hidden sm:inline">
          {step === 'intro' && 'Start Demo'}
          {step === 'voting' && 'Cast Vote'}
          {step === 'vvpat' && 'Verify VVPAT'}
          {step === 'done' && 'Complete'}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* ── INTRO SCREEN ── */}
        {step === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🗳️</div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Welcome to EVM Practice</h3>
              <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
                This is a simulation of India's <strong>Electronic Voting Machine (EVM)</strong> used in all elections.
                Practice here so you feel confident on election day!
              </p>

              {showInstructions && (
                <div className="max-w-sm mx-auto text-left space-y-2 mb-6">
                  {[
                    'Look at the Ballot Unit with candidate names',
                    'Press the BLUE button next to your candidate',
                    'A light will glow and a beep will sound',
                    'Check the VVPAT slip (visible for 7 seconds)',
                    'Your vote is recorded securely!'
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{i + 1}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setStep('voting'); setShowInstructions(false); }}
                className="px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl shadow-md shadow-primary/25 hover:shadow-lg transition-all">
                Start EVM Demo →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── VOTING SCREEN (EVM Simulation) ── */}
        {step === 'voting' && (
          <motion.div key="voting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* LEFT: Ballot Unit */}
            <div className="rounded-2xl border-2 border-border bg-bg-elevated/50 overflow-hidden">
              <div className="bg-bg-elevated px-4 py-2.5 border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Ballot Unit</span>
                <span className="text-[10px] text-text-muted">Constituency: Demo-001</span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-0 px-3 py-2 text-[10px] text-text-muted font-semibold uppercase border-b border-border/50">
                <span className="w-8 text-center">S.No</span>
                <span className="px-2">Candidate / Party</span>
                <span className="w-10 text-center">Symbol</span>
                <span className="w-14 text-center">Button</span>
              </div>

              {/* Candidate rows */}
              <div className="divide-y divide-border/30">
                {CANDIDATES.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`grid grid-cols-[auto_1fr_auto_auto] gap-0 items-center px-3 py-2.5 transition-all ${
                      pressedButton === c.id ? 'bg-primary/10' : 'hover:bg-bg-elevated'
                    }`}>
                    {/* Serial Number */}
                    <span className="w-8 text-center text-xs font-bold text-text-muted">{i + 1}</span>

                    {/* Name + Party */}
                    <div className="px-2">
                      <p className="text-sm font-semibold text-text-primary leading-tight">{c.name}</p>
                      <p className="text-[10px] text-text-muted">{c.party}</p>
                    </div>

                    {/* Symbol */}
                    <span className="w-10 text-center text-xl">{c.symbol}</span>

                    {/* Vote Button */}
                    <div className="w-14 flex justify-center">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleVote(c)}
                        disabled={pressedButton !== null}
                        className={`w-10 h-8 rounded-lg text-xs font-bold transition-all ${
                          pressedButton === c.id
                            ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}>
                        {pressedButton === c.id ? '✓' : 'VOTE'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RIGHT: Control Unit */}
            <div className="rounded-2xl border-2 border-border bg-bg-elevated/50 overflow-hidden">
              <div className="bg-bg-elevated px-4 py-2.5 border-b border-border">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Control Unit</span>
              </div>

              <div className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                {/* LED Indicator */}
                <div className={`w-5 h-5 rounded-full mb-4 transition-all duration-300 ${
                  pressedButton ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' : 'bg-red-500/30'
                }`} />

                <div className="text-4xl mb-3">
                  {pressedButton ? '🔔' : '🗳️'}
                </div>

                <p className="text-sm font-semibold text-text-primary text-center mb-1">
                  {pressedButton ? 'Vote Registered!' : 'Ready to Record'}
                </p>
                <p className="text-xs text-text-muted text-center">
                  {pressedButton
                    ? 'A beep sound confirms your vote'
                    : 'Press a BLUE button on the Ballot Unit'}
                </p>

                {pressedButton && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-500 font-medium">✅ Total Votes Cast: 1</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── VVPAT VERIFICATION ── */}
        {step === 'vvpat' && selectedCandidate && (
          <motion.div key="vvpat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center py-6">
            <h3 className="text-base font-bold text-text-primary mb-1">📃 VVPAT Verification</h3>
            <p className="text-xs text-text-muted mb-4">Verify your printed slip — visible for <strong className="text-primary">{vvpatTimer}s</strong></p>

            {/* VVPAT Slip */}
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-56 bg-white rounded-xl border-2 border-dashed border-gray-300 p-5 shadow-lg relative overflow-hidden">

              {/* Animated progress bar showing time left */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 7, ease: 'linear' }}
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"
              />

              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">VVPAT Slip</p>
                <div className="text-3xl mb-2">{selectedCandidate.symbol}</div>
                <p className="text-sm font-bold text-gray-800">{selectedCandidate.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{selectedCandidate.party}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-[10px] text-gray-400">S.No: {selectedCandidate.id} | Const: Demo-001</p>
                </div>
              </div>
            </motion.div>

            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-xs text-text-muted">Slip will drop into sealed box in {vvpatTimer}s</p>
            </div>
          </motion.div>
        )}

        {/* ── DONE SCREEN ── */}
        {step === 'done' && selectedCandidate && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
              className="text-5xl mb-4">
              🎉
            </motion.div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Vote Cast Successfully!</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto mb-2">
              You voted for <strong className="text-primary">{selectedCandidate.name}</strong> ({selectedCandidate.party})
            </p>
            <p className="text-xs text-text-muted max-w-sm mx-auto mb-6">
              On election day, this is how the real EVM works. The VVPAT slip confirms your vote 
              was recorded correctly before dropping into a sealed box.
            </p>

            <div className="flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={resetDemo}
                className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-md shadow-primary/25 hover:shadow-lg transition-all">
                🔁 Try Again
              </motion.button>
            </div>

            {/* Key Takeaways */}
            <div className="max-w-sm mx-auto mt-6 text-left space-y-2">
              <p className="text-xs font-semibold text-text-secondary mb-1">💡 Remember on election day:</p>
              {[
                'Press the button ONCE — there\'s no undo',
                'Wait for the BEEP before leaving the compartment',
                'Check the VVPAT slip to confirm your choice',
                'If EVM malfunctions, inform the Presiding Officer'
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-text-muted">
                  <span className="text-primary font-bold">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
