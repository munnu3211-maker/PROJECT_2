import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { getQuiz, submitQuiz } from '../services/api';
import toast from 'react-hot-toast';
import { FiBookOpen, FiAward, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';

export default function QuizSection() {
  const { user } = useUser();
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getQuiz();
        if (data.success) setQuiz(data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSelect = (qId, optionIndex) => {
    if (submitted) return;
    setSelected(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmit = async () => {
    const answers = quiz.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: selected[q.id] !== undefined ? selected[q.id] : -1,
    }));
    
    try {
      const { data } = await submitQuiz(user._id, answers);
      if (data.success) {
        setResults(data.data);
        setSubmitted(true);
        if (data.data.percentage >= 70) {
          toast.success(`Great score! ${data.data.score}/${data.data.total} 🎉`);
        } else {
          toast('Keep learning! You can try again anytime 💪', { icon: '📚' });
        }
      }
    } catch (e) { toast.error('Failed to submit quiz'); }
  };

  const restart = () => {
    setCurrentQ(0);
    setSelected({});
    setSubmitted(false);
    setResults(null);
    setStarted(false);
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h2 className="section-title"><FiBookOpen className="text-primary" /> Learn & Quiz</h2>
        <div className="loading-shimmer h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="section-title"><FiBookOpen className="text-primary" /> Learn & Quiz</h2>

      {!started ? (
        /* Start Screen */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
          <span className="text-5xl block mb-3">🧠</span>
          <h3 className="text-xl font-bold mb-2">Test Your Election Knowledge</h3>
          <p className="text-text-secondary text-sm mb-4">
            {quiz?.questions?.length || 10} questions about India's electoral process.<br />
            Score 70%+ to boost your readiness score!
          </p>
          <motion.button onClick={() => setStarted(true)} className="btn-primary"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            Start Quiz <FiBookOpen className="inline ml-1" />
          </motion.button>
        </motion.div>
      ) : submitted && results ? (
        /* Results Screen */
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4">
          <span className="text-5xl block mb-3">{results.percentage >= 70 ? '🏆' : '📚'}</span>
          <h3 className="text-2xl font-bold mb-1">
            {results.score}/{results.total}
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            {results.percentage}% — {results.percentage >= 70 ? 'Excellent! You know your rights!' : 'Keep learning about the voting process!'}
            {results.readinessBonus && (
              <span className="block text-secondary text-xs mt-1">+10 Readiness Score bonus! 🎉</span>
            )}
          </p>

          {/* Answer review */}
          <div className="text-left space-y-2 max-h-60 overflow-y-auto mb-4">
            {quiz.questions.map((q, i) => {
              const r = results.results.find(r => r.questionId === q.id);
              return (
                <div key={q.id} className={`p-3 rounded-xl text-xs ${r?.correct ? 'bg-secondary/5 border border-secondary/20' : 'bg-red-500/5 border border-red-500/20'}`}>
                  <p className="font-medium text-text-primary mb-1">
                    {r?.correct ? '✅' : '❌'} {q.question}
                  </p>
                  <p className="text-text-muted">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <motion.button onClick={restart} className="btn-secondary"
            whileHover={{ scale: 1.03 }}>
            <FiRefreshCw className="inline mr-1" /> Try Again
          </motion.button>
        </motion.div>
      ) : (
        /* Quiz Questions */
        <AnimatePresence mode="wait">
          <motion.div key={currentQ}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}>

            {/* Progress */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">
                Question {currentQ + 1} of {quiz.questions.length}
              </span>
              <div className="flex gap-1">
                {quiz.questions.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentQ ? 'bg-primary' : i < currentQ || selected[quiz.questions[i].id] !== undefined ? 'bg-primary/40' : 'bg-border'
                  }`} />
                ))}
              </div>
            </div>

            {/* Question */}
            <h3 className="text-base font-semibold mb-4">
              {quiz.questions[currentQ].question}
            </h3>

            {/* Options */}
            <div className="space-y-2 mb-4">
              {quiz.questions[currentQ].options.map((opt, i) => (
                <motion.button key={i}
                  onClick={() => handleSelect(quiz.questions[currentQ].id, i)}
                  whileTap={{ scale: 0.98 }}
                  className={`quiz-option w-full text-left text-sm ${
                    selected[quiz.questions[currentQ].id] === i ? 'selected' : ''
                  }`}>
                  <span className="inline-block w-6 text-text-muted">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </motion.button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="btn-secondary text-sm px-4 py-2 disabled:opacity-30">
                Previous
              </button>
              {currentQ < quiz.questions.length - 1 ? (
                <button onClick={() => setCurrentQ(currentQ + 1)}
                  className="btn-primary text-sm px-4 py-2">
                  Next →
                </button>
              ) : (
                <button onClick={handleSubmit}
                  className="btn-primary text-sm px-6 py-2"
                  disabled={Object.keys(selected).length === 0}>
                  Submit Quiz <FiAward className="inline ml-1" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
