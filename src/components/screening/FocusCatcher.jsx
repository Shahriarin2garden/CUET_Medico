import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GAME_DURATION = 30; // seconds
const SPAWN_INTERVAL = 800; // ms between spawns
const FALL_DURATION = 3500; // ms for object to fall
const BASKET_WIDTH = 80;

const TOKEN_TYPES = [
  { id: 'focus', emoji: '🎯', label: 'Focus', points: 10, type: 'good', color: '#22c55e' },
  { id: 'calm', emoji: '🕊️', label: 'Calm', points: 10, type: 'good', color: '#3b82f6' },
  { id: 'joy', emoji: '⭐', label: 'Joy', points: 15, type: 'good', color: '#eab308' },
  { id: 'distract', emoji: '📱', label: 'Distraction', points: -15, type: 'bad', color: '#ef4444' },
  { id: 'stress', emoji: '💢', label: 'Stress', points: -10, type: 'bad', color: '#f97316' },
  { id: 'noise', emoji: '📣', label: 'Noise', points: -10, type: 'bad', color: '#dc2626' },
];

let tokenIdCounter = 0;

function computeFocusScore(caught, missed, hit) {
  const goodCaught = caught.filter(t => t.type === 'good').length;
  const badCaught = caught.filter(t => t.type === 'bad').length;
  const goodMissed = missed.filter(t => t.type === 'good').length;
  const totalGoodPossible = goodCaught + goodMissed;

  const accuracy = totalGoodPossible > 0 ? goodCaught / totalGoodPossible : 0;
  const avoidance = hit > 0 ? badCaught / hit : 0;

  // Score: 0-10 (higher = more concern / less focus)
  let score = 5;
  score -= accuracy * 4; // Good accuracy lowers score
  score += avoidance * 3; // Catching bad tokens raises score
  score += (goodMissed * 0.3); // Missing good tokens is concerning

  return Math.max(0, Math.min(10, Math.round(score)));
}

const FocusCatcher = ({ onComplete }) => {
  const [phase, setPhase] = useState('intro'); // intro | playing | done
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [tokens, setTokens] = useState([]);
  const [basketX, setBasketX] = useState(50); // percentage
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState([]);
  const [missed, setMissed] = useState([]);
  const [totalSpawned, setTotalSpawned] = useState(0);
  const [lastCatch, setLastCatch] = useState(null);
  const [combo, setCombo] = useState(0);

  const gameRef = useRef(null);
  const spawnRef = useRef(null);
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const basketXRef = useRef(50);

  // Track mouse/touch for basket positioning
  const handlePointerMove = useCallback((e) => {
    if (phase !== 'playing' || !gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    let clientX;
    if (e.touches) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const x = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(8, Math.min(92, x));
    basketXRef.current = clamped;
    setBasketX(clamped);
  }, [phase]);

  // Spawn tokens
  const spawnToken = useCallback(() => {
    const type = TOKEN_TYPES[Math.floor(Math.random() * TOKEN_TYPES.length)];
    const x = Math.random() * 80 + 10; // 10-90%
    tokenIdCounter++;
    const token = {
      ...type,
      tokenId: tokenIdCounter,
      x,
      spawnTime: Date.now(),
    };
    setTokens(prev => [...prev, token]);
    setTotalSpawned(prev => prev + 1);
  }, []);

  // Check collisions
  const checkCollisions = useCallback(() => {
    const now = Date.now();
    setTokens(prev => {
      const remaining = [];
      const newCaught = [];
      const newMissed = [];

      prev.forEach(token => {
        const elapsed = now - token.spawnTime;
        const fallPct = (elapsed / FALL_DURATION) * 100;

        if (fallPct >= 100) {
          // Missed - fell off screen
          if (token.type === 'good') {
            newMissed.push(token);
          }
          return;
        }

        // Check if at basket level (85-95%)
        if (fallPct >= 82 && fallPct <= 98) {
          const dist = Math.abs(token.x - basketXRef.current);
          if (dist < 12) {
            // Caught!
            newCaught.push(token);
            return;
          }
        }

        remaining.push(token);
      });

      if (newCaught.length > 0) {
        newCaught.forEach(t => {
          setScore(prev => prev + t.points);
          setCaught(prev => [...prev, t]);
          setLastCatch({ ...t, time: Date.now() });
          if (t.type === 'good') {
            setCombo(prev => prev + 1);
          } else {
            setCombo(0);
          }
        });
      }

      if (newMissed.length > 0) {
        setMissed(prev => [...prev, ...newMissed]);
        setCombo(0);
      }

      return remaining;
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') return;

    // Spawn interval
    spawnRef.current = setInterval(spawnToken, SPAWN_INTERVAL);

    // Timer countdown
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Collision check loop
    const loop = () => {
      checkCollisions();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      clearInterval(spawnRef.current);
      clearInterval(timerRef.current);
      cancelAnimationFrame(animRef.current);
    };
  }, [phase, spawnToken, checkCollisions]);

  // End game
  useEffect(() => {
    if (phase !== 'done') return;
    clearInterval(spawnRef.current);
    clearInterval(timerRef.current);
    cancelAnimationFrame(animRef.current);

    const totalPoints = score;
    const goodCaught = caught.filter(t => t.type === 'good').length;
    const badCaught = caught.filter(t => t.type === 'bad').length;
    const goodMissed = missed.filter(t => t.type === 'good').length;
    const finalScore = computeFocusScore(caught, missed, totalSpawned);

    onComplete({
      totalPoints,
      goodCaught,
      badCaught,
      goodMissed,
      totalSpawned,
      score: finalScore,
    });
  }, [phase]);

  const startGame = () => {
    setPhase('playing');
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          🎯 Round 3B: Focus Catcher
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {phase === 'intro' ? 'Catch Focus Tokens!' : phase === 'playing' ? 'Stay Focused!' : 'Game Over!'}
        </h2>
        <p className="text-gray-500 text-sm">
          {phase === 'intro'
            ? 'Move your basket to catch focus tokens (🎯⭐🕊️) and avoid distractions (📱💢📣).'
            : phase === 'playing'
            ? `Time: ${timeLeft}s | Score: ${score} | Combo: ×${combo}`
            : 'Analyzing your attention patterns...'}
        </p>
      </div>

      {phase === 'intro' && (
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 max-w-sm mx-auto">
            <div className="flex justify-center gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-green-600 mb-2">CATCH ✓</p>
                <div className="flex gap-2">
                  {TOKEN_TYPES.filter(t => t.type === 'good').map(t => (
                    <span key={t.id} className="text-2xl">{t.emoji}</span>
                  ))}
                </div>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <p className="text-xs font-semibold text-red-600 mb-2">AVOID ✗</p>
                <div className="flex gap-2">
                  {TOKEN_TYPES.filter(t => t.type === 'bad').map(t => (
                    <span key={t.id} className="text-2xl">{t.emoji}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400">Move your cursor or finger to control the basket. {GAME_DURATION}s challenge!</p>
          </div>
          <button
            onClick={startGame}
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-500 transition"
          >
            Start Challenge →
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <>
          {/* HUD */}
          <div className="flex justify-between items-center mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">⏱ {timeLeft}s</span>
              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-purple-600">Score: {score}</span>
              {combo >= 3 && (
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-bold text-yellow-500"
                >
                  🔥 ×{combo}
                </motion.span>
              )}
            </div>
          </div>

          {/* Game Area */}
          <div
            ref={gameRef}
            onMouseMove={handlePointerMove}
            onTouchMove={handlePointerMove}
            className="relative w-full h-80 bg-gradient-to-b from-sky-100 to-sky-50 rounded-2xl overflow-hidden border-2 border-sky-200 cursor-none select-none"
          >
            {/* Falling tokens */}
            <AnimatePresence>
              {tokens.map(token => {
                const elapsed = Date.now() - token.spawnTime;
                const fallPct = Math.min((elapsed / FALL_DURATION) * 100, 100);
                return (
                  <motion.div
                    key={token.tokenId}
                    initial={{ top: '-5%', opacity: 0 }}
                    animate={{ top: `${fallPct}%`, opacity: 1 }}
                    transition={{ duration: 0.05, ease: 'linear' }}
                    className="absolute text-2xl"
                    style={{
                      left: `${token.x}%`,
                      transform: 'translate(-50%, -50%)',
                      filter: token.type === 'bad' ? 'drop-shadow(0 0 4px rgba(239,68,68,0.4))' : 'drop-shadow(0 0 4px rgba(34,197,94,0.4))',
                    }}
                  >
                    {token.emoji}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Basket */}
            <div
              className="absolute bottom-3 transition-all duration-75"
              style={{
                left: `${basketX}%`,
                transform: 'translateX(-50%)',
                width: BASKET_WIDTH,
              }}
            >
              <div className="text-center">
                <span className="text-3xl">🧺</span>
              </div>
            </div>

            {/* Catch feedback */}
            <AnimatePresence>
              {lastCatch && Date.now() - lastCatch.time < 500 && (
                <motion.div
                  key={lastCatch.time}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -40, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 text-lg font-bold"
                  style={{ color: lastCatch.type === 'good' ? '#22c55e' : '#ef4444' }}
                >
                  {lastCatch.type === 'good' ? `+${lastCatch.points}` : lastCatch.points}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats bar */}
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
            <span>✅ Caught: {caught.filter(t => t.type === 'good').length}</span>
            <span>❌ Hit: {caught.filter(t => t.type === 'bad').length}</span>
            <span>💨 Missed: {missed.length}</span>
          </div>
        </>
      )}

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600">{caught.filter(t => t.type === 'good').length}</p>
              <p className="text-xs text-gray-500">Focus Caught</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-500">{caught.filter(t => t.type === 'bad').length}</p>
              <p className="text-xs text-gray-500">Distractions Hit</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-purple-600">{score}</p>
              <p className="text-xs text-gray-500">Total Score</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Processing your attention metrics...</p>
        </motion.div>
      )}
    </div>
  );
};

export default FocusCatcher;
