import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SCENARIOS = [
  { id: 1, text: "I found it hard to get out of bed this morning.", category: 'mood', emoji: '🛏️' },
  { id: 2, text: "Small things made me really irritable today.", category: 'mood', emoji: '😤' },
  { id: 3, text: "I felt a sense of dread without knowing why.", category: 'anxiety', emoji: '😰' },
  { id: 4, text: "I couldn't stop thinking about worst-case scenarios.", category: 'anxiety', emoji: '🌪️' },
  { id: 5, text: "I lay awake at night with racing thoughts.", category: 'sleep', emoji: '🌙' },
  { id: 6, text: "I felt too exhausted to do anything productive.", category: 'sleep', emoji: '😴' },
  { id: 7, text: "I zoned out during class or conversations.", category: 'focus', emoji: '💭' },
  { id: 8, text: "I avoided replying to messages from friends.", category: 'social', emoji: '📵' },
  { id: 9, text: "I felt like I was pretending to be okay.", category: 'mood', emoji: '🎭' },
  { id: 10, text: "I ate way more or less than usual.", category: 'physical', emoji: '🍽️' },
  { id: 11, text: "Physical tension (jaw, neck, shoulders) bothered me.", category: 'physical', emoji: '🏋️' },
  { id: 12, text: "I felt a sudden spike of panic in a normal situation.", category: 'anxiety', emoji: '💓' },
  { id: 13, text: "I compared myself negatively to others on social media.", category: 'mood', emoji: '📱' },
  { id: 14, text: "I used substances to cope with my feelings.", category: 'coping', emoji: '🍷' },
  { id: 15, text: "I found joy in a hobby or activity I care about.", category: 'positive', emoji: '🎨', isPositive: true },
  { id: 16, text: "I had at least one genuine conversation with someone.", category: 'positive', emoji: '💬', isPositive: true },
  { id: 17, text: "I felt motivated to work toward a personal goal.", category: 'positive', emoji: '🎯', isPositive: true },
  { id: 18, text: "I took care of myself — ate well, moved, or rested.", category: 'positive', emoji: '🧘', isPositive: true },
  { id: 19, text: "I felt disconnected from everyone around me.", category: 'social', emoji: '🏝️' },
  { id: 20, text: "I had thoughts that life isn't worth living.", category: 'crisis', emoji: '⚠️' },
];

const OPTIONS = [
  { label: 'Never', value: 0, color: '#22c55e', emoji: '🟢' },
  { label: 'Sometimes', value: 1, color: '#eab308', emoji: '🟡' },
  { label: 'Often', value: 2, color: '#f97316', emoji: '🟠' },
  { label: 'Always', value: 3, color: '#ef4444', emoji: '🔴' },
];

function computeScenarioScore(answers) {
  const maxScore = SCENARIOS.length * 3;
  let total = 0;

  answers.forEach((ans) => {
    const scenario = SCENARIOS.find(s => s.id === ans.id);
    if (scenario?.isPositive) {
      // Positive scenarios: higher = better, so invert
      total += (3 - ans.value);
    } else {
      total += ans.value;
    }
  });

  const pct = Math.round((total / maxScore) * 100);
  let severityLevel = 'Minimal';
  if (pct > 70) severityLevel = 'Severe';
  else if (pct > 45) severityLevel = 'Moderate';
  else if (pct > 20) severityLevel = 'Mild';

  // Category breakdown
  const categories = {};
  answers.forEach((ans) => {
    const scenario = SCENARIOS.find(s => s.id === ans.id);
    if (!scenario) return;
    const cat = scenario.category;
    if (!categories[cat]) categories[cat] = { total: 0, count: 0, max: 0 };
    categories[cat].count++;
    categories[cat].max += 3;
    if (scenario.isPositive) {
      categories[cat].total += (3 - ans.value);
    } else {
      categories[cat].total += ans.value;
    }
  });

  const categoryBreakdown = Object.entries(categories).map(([id, data]) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    score: data.total,
    max: data.max,
    pct: Math.round((data.total / data.max) * 100),
  }));

  return {
    quizScore: total,
    quizScoreMax: maxScore,
    severityLevel,
    pct,
    categoryScores: categoryBreakdown,
  };
}

const ScenarioCards = ({ onComplete }) => {
  const [phase, setPhase] = useState('intro'); // intro | swiping | done
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [animDir, setAnimDir] = useState(null);
  const [decisionTimes, setDecisionTimes] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState(null);

  const current = SCENARIOS[currentIndex];
  const total = SCENARIOS.length;
  const progress = Math.round((currentIndex / total) * 100);

  const handleAnswer = useCallback((value) => {
    if (phase !== 'swiping' || !current) return;

    // Track speed
    const now = Date.now();
    if (lastTimestamp) {
      setDecisionTimes(prev => [...prev, now - lastTimestamp]);
    }
    setLastTimestamp(now);

    setAnimDir(value <= 1 ? 'left' : 'right');
    const newAnswer = { id: current.id, value, category: current.category };

    setTimeout(() => {
      setAnswers(prev => [...prev, newAnswer]);
      setAnimDir(null);

      if (currentIndex + 1 >= total) {
        // Done
        setPhase('done');
        const allAnswers = [...answers, newAnswer];
        const result = computeScenarioScore(allAnswers);
        const avgTime = decisionTimes.length > 0
          ? Math.round(decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length)
          : 0;

        setTimeout(() => {
          onComplete({
            ...result,
            avgDecisionTime: avgTime,
            freeText: '', // No free text in card mode
          });
        }, 600);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 200);
  }, [phase, current, currentIndex, total, answers, lastTimestamp, decisionTimes, onComplete]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (phase !== 'swiping') return;
      if (e.key === '1') handleAnswer(0);
      if (e.key === '2') handleAnswer(1);
      if (e.key === '3') handleAnswer(2);
      if (e.key === '4') handleAnswer(3);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handleAnswer]);

  const startSwiping = () => {
    setPhase('swiping');
    setLastTimestamp(Date.now());
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          🃏 Round 5B: Scenario Cards
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {phase === 'intro'
            ? 'Real-Life Scenario Check'
            : phase === 'swiping'
            ? 'How often does this happen?'
            : 'Assessment Complete!'}
        </h2>
        <p className="text-gray-500 text-sm">
          {phase === 'intro'
            ? 'Rate how often relatable daily scenarios apply to you over the past 2 weeks.'
            : phase === 'swiping'
            ? `Scenario ${currentIndex + 1} of ${total}`
            : 'Analyzing your scenario responses...'}
        </p>
      </div>

      {phase === 'intro' && (
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 max-w-sm mx-auto">
            <div className="text-5xl mb-4">🃏</div>
            <p className="text-gray-600 text-sm mb-4">
              You'll see {total} daily-life scenarios. For each, rate how often it happens:
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {OPTIONS.map(opt => (
                <div key={opt.value} className="text-center">
                  <span className="text-lg">{opt.emoji}</span>
                  <p className="text-[9px] text-gray-500">{opt.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">You can also use keys 1-4 for quick input!</p>
          </div>
          <button
            onClick={startSwiping}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition"
          >
            Start Assessment →
          </button>
        </div>
      )}

      {phase === 'swiping' && current && (
        <>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Category tag */}
          <div className="text-center mb-3">
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
              {current.category.charAt(0).toUpperCase() + current.category.slice(1)}
              {current.isPositive && ' (Positive)'}
            </span>
          </div>

          {/* Scenario Card */}
          <div className="relative flex justify-center mb-8" style={{ minHeight: '200px' }}>
            {/* Background cards */}
            {currentIndex + 2 < total && (
              <div
                className="absolute w-72 bg-white rounded-2xl shadow-sm h-44 border border-gray-100"
                style={{ transform: 'rotate(2deg) translateY(6px)' }}
              />
            )}
            {currentIndex + 1 < total && (
              <div
                className="absolute w-72 bg-white rounded-2xl shadow-sm h-44 border border-gray-100"
                style={{ transform: 'rotate(-1deg) translateY(3px)' }}
              />
            )}

            <AnimatePresence>
              {animDir === null && (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    x: animDir === 'left' ? -150 : 150,
                    rotate: animDir === 'left' ? -10 : 10,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative w-72 bg-white rounded-2xl shadow-xl border-2 border-indigo-100 p-6 flex flex-col items-center justify-center z-10"
                  style={{ minHeight: '180px' }}
                >
                  <span className="text-4xl mb-3">{current.emoji}</span>
                  <p className="text-sm font-medium text-gray-700 text-center leading-relaxed">
                    "{current.text}"
                  </p>
                  {current.isPositive && (
                    <span className="mt-2 text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                      Positive indicator
                    </span>
                  )}
                  {current.category === 'crisis' && (
                    <span className="mt-2 text-[10px] text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                      ⚠ Important question
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
            {OPTIONS.map(opt => (
              <motion.button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-gray-200 hover:border-current transition-all"
                style={{ color: opt.color }}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-[10px] font-medium text-gray-600">{opt.label}</span>
                <span className="text-[9px] text-gray-400">({opt.value + 1})</span>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">✅</div>
          <p className="text-gray-600 mb-4">
            All {total} scenarios assessed.
          </p>
          <div className="flex justify-center gap-4 mb-4 text-sm">
            <span className="text-gray-500">
              Avg speed: <b>{decisionTimes.length > 0
                ? `${Math.round(decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length)}ms`
                : 'N/A'}</b>
            </span>
          </div>
          <p className="text-xs text-gray-400">Processing your assessment...</p>
        </motion.div>
      )}
    </div>
  );
};

export default ScenarioCards;
