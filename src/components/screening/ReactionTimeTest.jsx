import { useState, useRef, useCallback, useEffect } from 'react';

const TOTAL_ROUNDS = 5;
const COLORS = { waiting: '#334155', ready: '#ef4444', go: '#22c55e' };

function computeStats(times) {
  if (times.length === 0) return { avgTime: 0, stdDev: 0 };
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((sum, t) => sum + (t - avg) ** 2, 0) / times.length;
  return { avgTime: Math.round(avg), stdDev: Math.round(Math.sqrt(variance)) };
}

function computeScore(times, falseStarts) {
  const { avgTime, stdDev } = computeStats(times);
  let score = 0;
  if (avgTime < 300) score = 2;
  else if (avgTime < 500) score = 1;
  else if (avgTime < 800) score = -1;
  else score = -2;
  if (stdDev > 150) score -= 1;
  score -= falseStarts;
  return { score: Math.max(-5, Math.min(3, score)), avgTime, stdDev };
}

const ReactionTimeTest = ({ onComplete }) => {
  const [phase, setPhase] = useState('intro'); // intro | waiting | ready | go | result | roundResult | done
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [currentTime, setCurrentTime] = useState(null);
  const [falseStartMsg, setFalseStartMsg] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startRound = useCallback(() => {
    setFalseStartMsg(false);
    setCurrentTime(null);
    setPhase('ready');

    // Random delay 1-4 seconds before turning green
    const delay = 1000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setPhase('go');
    }, delay);
  }, []);

  const handleClick = () => {
    if (phase === 'intro') {
      setPhase('waiting');
      setTimeout(startRound, 500);
      return;
    }

    if (phase === 'ready') {
      // Clicked too early
      clearTimeout(timerRef.current);
      setFalseStarts((p) => p + 1);
      setFalseStartMsg(true);
      setTimeout(() => startRound(), 1500);
      return;
    }

    if (phase === 'go') {
      const elapsed = Date.now() - startTimeRef.current;
      setCurrentTime(elapsed);
      setTimes((p) => [...p, elapsed]);
      setPhase('roundResult');
      return;
    }

    if (phase === 'roundResult') {
      const nextRound = round + 1;
      const mergedTimes = times.length > round ? [...times] : [...times, currentTime];
      if (nextRound >= TOTAL_ROUNDS) {
        setPhase('done');
        const result = computeScore(mergedTimes, falseStarts);
        onComplete({
          times: mergedTimes,
          falseStarts,
          ...result,
        });
      } else {
        setRound(nextRound);
        startRound();
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const getLabel = (ms) => {
    if (ms < 250) return 'Lightning fast! ⚡';
    if (ms < 350) return 'Great reflexes! 🎯';
    if (ms < 500) return 'Good 👍';
    if (ms < 700) return 'A bit slow 🐢';
    return 'Take your time 😊';
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
        🎮 Round 3: Reaction Time Test
      </div>

      {phase === 'intro' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Test Your Reaction Speed
          </h2>
          <p className="text-gray-500 mb-2">
            When the circle turns <span className="text-green-500 font-bold">GREEN</span>, click as fast as you can!
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Avoid clicking on <span className="text-red-500 font-bold">RED</span> to preserve your reflex streak.
          </p>
          <button
            onClick={handleClick}
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-500 transition"
          >
            Start Test →
          </button>
        </div>
      )}

      {(phase === 'ready' || phase === 'go' || phase === 'roundResult') && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Round {round + 1} of {TOTAL_ROUNDS}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Current false starts: {falseStarts}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < round ? 'bg-green-500' : i === round ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Main circle */}
          <button
            onClick={handleClick}
            className="mx-auto block w-48 h-48 rounded-full transition-all duration-200 text-white font-bold text-lg focus:outline-none"
            style={{
              backgroundColor:
                phase === 'roundResult'
                  ? '#8b5cf6'
                  : phase === 'go'
                  ? COLORS.go
                  : COLORS.ready,
              transform: phase === 'go' ? 'scale(1.05)' : 'scale(1)',
              boxShadow:
                phase === 'go'
                  ? '0 0 40px rgba(34,197,94,0.4)'
                  : phase === 'ready'
                  ? '0 0 40px rgba(239,68,68,0.3)'
                  : '0 0 20px rgba(139,92,246,0.3)',
            }}
          >
            {phase === 'ready' && (falseStartMsg ? 'Too early! Wait...' : 'Wait...')}
            {phase === 'go' && 'CLICK!'}
            {phase === 'roundResult' && `${currentTime}ms`}
          </button>

          {phase === 'roundResult' && (
            <div className="mt-4">
              <p className="text-gray-500">{getLabel(currentTime)}</p>
              <p className="text-xs text-gray-400 mt-1">Click circle for next round</p>
            </div>
          )}

          {falseStartMsg && phase === 'ready' && (
            <p className="text-red-500 text-sm mt-4">Too early! Wait for green.</p>
          )}
        </div>
      )}

      {phase === 'waiting' && (
        <div className="flex items-center justify-center h-48">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {phase === 'done' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Results</h2>
          <div className="space-y-2 mb-6">
            {times.map((t, i) => (
              <div key={i} className="flex items-center gap-3 max-w-xs mx-auto">
                <span className="text-xs text-gray-500 w-16">Round {i + 1}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((t / 1000) * 100, 100)}%`,
                      backgroundColor: t < 350 ? '#22c55e' : t < 500 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-xs font-mono w-14 text-right">{t}ms</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <span>Avg: <b>{computeStats(times).avgTime}ms</b></span>
            <span>Variability: <b>{computeStats(times).stdDev}ms</b></span>
            <span>False starts: <b>{falseStarts}</b></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionTimeTest;
