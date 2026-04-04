import { useState, useRef, useCallback, useEffect } from 'react';

const GRID_SIZE = 4;
const TILE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
const FLASH_DURATION = 600;
const FLASH_GAP = 300;
const START_LENGTH = 3;
const MAX_LENGTH = 7;

function generateSequence(length) {
  const seq = [];
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
  }
  return seq;
}

function computeScore(maxSequence, totalErrors, avgHesitation) {
  let score = 0;
  if (maxSequence >= 7) score = 3;
  else if (maxSequence >= 5) score = 2;
  else if (maxSequence >= 4) score = 1;
  else score = -1;
  score -= Math.min(totalErrors * 0.5, 2);
  if (avgHesitation > 2000) score -= 1;
  return Math.max(-3, Math.min(3, Math.round(score * 10) / 10));
}

const MemoryPatternGame = ({ onComplete }) => {
  const [phase, setPhase] = useState('intro'); // intro | showing | input | success | fail | done
  const [sequenceLength, setSequenceLength] = useState(START_LENGTH);
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [flashingTile, setFlashingTile] = useState(null);
  const [errors, setErrors] = useState(0);
  const [maxAchieved, setMaxAchieved] = useState(0);
  const [clickTimes, setClickTimes] = useState([]);
  const lastClickRef = useRef(null);
  const timeoutRef = useRef(null);

  const showSequence = useCallback((seq) => {
    setPhase('showing');
    let i = 0;
    const show = () => {
      if (i >= seq.length) {
        setFlashingTile(null);
        setPhase('input');
        setPlayerInput([]);
        lastClickRef.current = Date.now();
        return;
      }
      setFlashingTile(seq[i]);
      timeoutRef.current = setTimeout(() => {
        setFlashingTile(null);
        i++;
        timeoutRef.current = setTimeout(show, FLASH_GAP);
      }, FLASH_DURATION);
    };
    timeoutRef.current = setTimeout(show, 500);
  }, []);

  const startRound = useCallback(() => {
    const seq = generateSequence(sequenceLength);
    setSequence(seq);
    setPlayerInput([]);
    showSequence(seq);
  }, [sequenceLength, showSequence]);

  const handleStart = () => {
    startRound();
  };

  const handleTileClick = (index) => {
    if (phase !== 'input') return;

    const now = Date.now();
    if (lastClickRef.current) {
      setClickTimes((prev) => [...prev, now - lastClickRef.current]);
    }
    lastClickRef.current = now;

    const nextInput = [...playerInput, index];
    setPlayerInput(nextInput);

    const currentStep = nextInput.length - 1;

    // Check if correct
    if (nextInput[currentStep] !== sequence[currentStep]) {
      // Wrong!
      setErrors((e) => e + 1);
      setMaxAchieved(Math.max(maxAchieved, sequenceLength - 1));
      setPhase('fail');

      // If we haven't reached max, end the game
      if (sequenceLength <= START_LENGTH) {
        // Failed at minimum length
        setTimeout(() => {
          finishGame(Math.max(maxAchieved, sequenceLength - 1));
        }, 1500);
      } else {
        setTimeout(() => {
          finishGame(Math.max(maxAchieved, sequenceLength - 1));
        }, 1500);
      }
      return;
    }

    // All correct for this round
    if (nextInput.length === sequence.length) {
      const achieved = sequenceLength;
      setMaxAchieved(Math.max(maxAchieved, achieved));

      if (sequenceLength >= MAX_LENGTH) {
        setPhase('success');
        setTimeout(() => finishGame(achieved), 1500);
      } else {
        setPhase('success');
        setTimeout(() => {
          setSequenceLength((l) => l + 1);
        }, 1200);
      }
    }
  };

  // When sequenceLength changes (after success), start next round
  useEffect(() => {
    if (sequenceLength > START_LENGTH && phase === 'success') {
      startRound();
    }
  }, [sequenceLength]);

  const finishGame = (maxSeq) => {
    setPhase('done');
    const avgHesitation =
      clickTimes.length > 0
        ? clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length
        : 0;
    const score = computeScore(maxSeq, errors, avgHesitation);
    onComplete({
      maxSequence: maxSeq,
      errors,
      avgHesitation: Math.round(avgHesitation),
      score,
    });
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const getTileColor = (index) => {
    if (flashingTile === index) return TILE_COLORS[index % TILE_COLORS.length];
    if (phase === 'input' && playerInput.includes(index)) return '#6366f1';
    if (phase === 'fail') return '#374151';
    return '#1e293b';
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
        🧠 Memory Pattern Game
      </div>

      {phase === 'intro' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Remember the Pattern
          </h2>
          <p className="text-gray-500 mb-2">
            Watch the tiles light up, then repeat the pattern in the same order.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Patterns get longer each round. How far can you go?
          </p>
          <button
            onClick={handleStart}
            className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition"
          >
            Start Game →
          </button>
        </div>
      )}

      {phase !== 'intro' && phase !== 'done' && (
        <div>
          <div className="flex items-center justify-between mb-4 max-w-xs mx-auto text-sm text-gray-500">
            <span>Sequence: {sequenceLength} tiles</span>
            <span>
              {phase === 'showing'
                ? '👀 Watch carefully...'
                : phase === 'input'
                ? '🎯 Your turn!'
                : phase === 'success'
                ? '✅ Correct!'
                : '❌ Wrong!'}
            </span>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: MAX_LENGTH - START_LENGTH + 1 }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full ${
                  i + START_LENGTH <= maxAchieved
                    ? 'bg-green-500'
                    : i + START_LENGTH === sequenceLength
                    ? 'bg-purple-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Grid */}
          <div
            className="grid gap-2 max-w-[280px] mx-auto mb-4"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleTileClick(i)}
                disabled={phase !== 'input'}
                className="aspect-square rounded-lg transition-all duration-200 border border-slate-700"
                style={{
                  backgroundColor: getTileColor(i),
                  transform: flashingTile === i ? 'scale(1.05)' : 'scale(1)',
                  boxShadow:
                    flashingTile === i
                      ? `0 0 20px ${TILE_COLORS[i % TILE_COLORS.length]}66`
                      : 'none',
                  cursor: phase === 'input' ? 'pointer' : 'default',
                }}
              />
            ))}
          </div>

          {/* Input progress */}
          {phase === 'input' && (
            <p className="text-xs text-gray-400">
              {playerInput.length} / {sequence.length} tiles
            </p>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Over!</h2>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-4">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600">{maxAchieved}</p>
              <p className="text-xs text-gray-500">Max Sequence</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-500">{errors}</p>
              <p className="text-xs text-gray-500">Errors</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-600">
                {clickTimes.length > 0
                  ? `${Math.round(clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length)}ms`
                  : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Avg Pause</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryPatternGame;
