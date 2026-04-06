import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOTION_CARDS = [
  { id: 1, text: 'Confident', weight: 2, type: 'positive', color: '#22c55e' },
  { id: 2, text: 'Worried', weight: -1, type: 'negative', color: '#f97316' },
  { id: 3, text: 'Grateful', weight: 3, type: 'positive', color: '#10b981' },
  { id: 4, text: 'Overwhelmed', weight: -2, type: 'negative', color: '#ef4444' },
  { id: 5, text: 'Motivated', weight: 2, type: 'positive', color: '#22c55e' },
  { id: 6, text: 'Lonely', weight: -2, type: 'negative', color: '#8b5cf6' },
  { id: 7, text: 'Excited', weight: 1, type: 'positive', color: '#22c55e' },
  { id: 8, text: 'Numb', weight: -3, type: 'negative', color: '#6b7280' },
  { id: 9, text: 'Peaceful', weight: 2, type: 'positive', color: '#06b6d4' },
  { id: 10, text: 'Irritable', weight: -1, type: 'negative', color: '#f97316' },
  { id: 11, text: 'Hopeful', weight: 2, type: 'positive', color: '#10b981' },
  { id: 12, text: 'Helpless', weight: -3, type: 'negative', color: '#ef4444' },
  { id: 13, text: 'Proud', weight: 1, type: 'positive', color: '#3b82f6' },
  { id: 14, text: 'Scared', weight: -2, type: 'negative', color: '#ef4444' },
  { id: 15, text: 'Loved', weight: 2, type: 'positive', color: '#ec4899' },
  { id: 16, text: 'Empty', weight: -3, type: 'negative', color: '#6b7280' },
  { id: 17, text: 'Focused', weight: 1, type: 'positive', color: '#3b82f6' },
  { id: 18, text: 'Panicked', weight: -2, type: 'negative', color: '#ef4444' },
  { id: 19, text: 'Content', weight: 2, type: 'positive', color: '#22c55e' },
  { id: 20, text: 'Trapped', weight: -3, type: 'negative', color: '#dc2626' },
];

// Shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FeelingSorter = ({ onComplete }) => {
  const [cards] = useState(() => shuffle(EMOTION_CARDS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [backpack, setBackpack] = useState([]);
  const [discarded, setDiscarded] = useState([]);
  const [direction, setDirection] = useState(null); // 'left' | 'right' | null
  const [sortTimes, setSortTimes] = useState([]);
  const [phase, setPhase] = useState('intro'); // intro | sorting | done
  const lastTimestamp = useRef(null);

  const currentCard = cards[currentIndex];
  const total = cards.length;
  const progress = Math.round((currentIndex / total) * 100);

  const handleSort = useCallback((dir) => {
    if (!currentCard || phase !== 'sorting') return;

    // Track decision speed
    const now = Date.now();
    if (lastTimestamp.current) {
      setSortTimes(prev => [...prev, now - lastTimestamp.current]);
    }
    lastTimestamp.current = now;

    setDirection(dir);

    setTimeout(() => {
      if (dir === 'right') {
        setBackpack(prev => [...prev, currentCard]);
      } else {
        setDiscarded(prev => [...prev, currentCard]);
      }
      setDirection(null);

      if (currentIndex + 1 >= total) {
        // Done
        setPhase('done');
        const finalBackpack = dir === 'right' ? [...backpack, currentCard] : backpack;
        const finalDiscarded = dir === 'left' ? [...discarded, currentCard] : discarded;
        const avgTime = sortTimes.length > 0
          ? Math.round(sortTimes.reduce((a, b) => a + b, 0) / sortTimes.length)
          : 0;
        const totalWeight = finalBackpack.reduce((s, c) => s + c.weight, 0);
        const negCount = finalBackpack.filter(c => c.weight < 0).length;
        // Score: 0-10, higher = more concern
        const normalized = Math.max(0, Math.min(10, Math.round(5 - totalWeight / 3)));

        setTimeout(() => {
          onComplete({
            backpack: finalBackpack.map(c => c.text),
            discarded: finalDiscarded.map(c => c.text),
            backpackCount: finalBackpack.length,
            negativeCount: negCount,
            avgDecisionTime: avgTime,
            totalWeight,
            score: normalized,
          });
        }, 800);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 250);
  }, [currentCard, currentIndex, phase, backpack, discarded, sortTimes, total, onComplete]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (phase !== 'sorting') return;
      if (e.key === 'ArrowLeft') handleSort('left');
      if (e.key === 'ArrowRight') handleSort('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handleSort]);

  const startSorting = () => {
    setPhase('sorting');
    lastTimestamp.current = Date.now();
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          🎒 Round 2B: Feeling Sorter
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {phase === 'intro'
            ? 'Sort Your Emotional Backpack'
            : phase === 'sorting'
            ? 'Swipe to Sort'
            : 'Sorting Complete!'}
        </h2>
        <p className="text-gray-500 text-sm">
          {phase === 'intro'
            ? 'Cards will appear with emotions. Swipe right (→) to keep, left (←) to discard.'
            : phase === 'sorting'
            ? `Card ${currentIndex + 1} of ${total} — Backpack: ${backpack.length} items`
            : 'Analyzing your emotional selections...'}
        </p>
      </div>

      {phase === 'intro' && (
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 max-w-sm mx-auto">
            <div className="text-5xl mb-4">🎒</div>
            <p className="text-gray-600 text-sm mb-3">
              You'll see 20 emotion cards. For each one, decide:
            </p>
            <div className="flex justify-center gap-6 mb-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg">👈</span>
                </div>
                <span className="text-xs text-gray-500">Discard</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg">👉</span>
                </div>
                <span className="text-xs text-gray-500">Keep</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">Use arrow keys or buttons. Decision speed is tracked!</p>
          </div>
          <button
            onClick={startSorting}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-500 transition"
          >
            Start Sorting →
          </button>
        </div>
      )}

      {phase === 'sorting' && currentCard && (
        <>
          {/* Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Zones */}
          <div className="flex justify-between items-center px-4 mb-4">
            <div className="text-center opacity-60">
              <span className="text-2xl">🗑️</span>
              <p className="text-[10px] text-gray-400">Discard</p>
              <p className="text-xs font-bold text-gray-500">{discarded.length}</p>
            </div>
            <div className="text-center opacity-60">
              <span className="text-2xl">🎒</span>
              <p className="text-[10px] text-gray-400">Keep</p>
              <p className="text-xs font-bold text-gray-500">{backpack.length}</p>
            </div>
          </div>

          {/* Card Stack */}
          <div className="relative h-64 mb-8 flex items-center justify-center">
            {/* Background cards */}
            {currentIndex + 2 < total && (
              <div
                className="absolute w-56 h-48 bg-white rounded-2xl shadow-sm border border-gray-100"
                style={{ transform: 'rotate(3deg) translateY(8px)' }}
              />
            )}
            {currentIndex + 1 < total && (
              <div
                className="absolute w-56 h-48 bg-white rounded-2xl shadow-sm border border-gray-100"
                style={{ transform: 'rotate(-1.5deg) translateY(4px)' }}
              />
            )}

            {/* Main card */}
            <AnimatePresence>
              {direction === null && (
                <motion.div
                  key={currentCard.id}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    x: direction === 'left' ? -200 : 200,
                    rotate: direction === 'left' ? -15 : 15,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative w-56 h-48 bg-white rounded-2xl shadow-xl border-2 flex flex-col items-center justify-center p-6 z-10"
                  style={{ borderColor: currentCard.color }}
                >
                  <span className="text-4xl mb-3">
                    {currentCard.type === 'positive' ? '✨' : '🌧️'}
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: currentCard.color }}
                  >
                    {currentCard.text}
                  </span>
                  <span className="text-xs text-gray-400 mt-2">
                    Does this resonate with you?
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Swipe indicator */}
            {direction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                className={`absolute z-20 text-6xl ${direction === 'left' ? '-translate-x-12' : 'translate-x-12'}`}
              >
                {direction === 'left' ? '❌' : '✅'}
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-6">
            <motion.button
              onClick={() => handleSort('left')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xl shadow-md hover:shadow-lg transition-shadow border-2 border-red-200"
            >
              ←
            </motion.button>
            <motion.button
              onClick={() => handleSort('right')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-xl shadow-md hover:shadow-lg transition-shadow border-2 border-green-200"
            >
              →
            </motion.button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">Or use ← → arrow keys</p>
        </>
      )}

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">🎒</div>
          <p className="text-gray-600 mb-4">
            You kept <span className="font-bold text-blue-600">{backpack.length}</span> emotions
            and discarded <span className="font-bold text-gray-500">{discarded.length}</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {backpack.map((c, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.text}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400">Processing your emotional profile...</p>
        </motion.div>
      )}
    </div>
  );
};

export default FeelingSorter;
