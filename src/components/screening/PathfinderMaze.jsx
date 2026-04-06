import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const GRID_SIZE = 5;
const FLASH_DURATION = 2500; // ms to show path
const LEVELS = [
  { pathLength: 4, name: 'Warm-up' },
  { pathLength: 6, name: 'Easy' },
  { pathLength: 8, name: 'Medium' },
  { pathLength: 10, name: 'Hard' },
  { pathLength: 13, name: 'Expert' },
];

function generatePath(length) {
  const path = [];
  const visited = new Set();
  // Start from a random edge cell
  let row = 0;
  let col = Math.floor(Math.random() * GRID_SIZE);
  path.push(row * GRID_SIZE + col);
  visited.add(row * GRID_SIZE + col);

  const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0], // cardinal
    [1, 1], [1, -1], [-1, 1], [-1, -1], // diagonal
  ];

  for (let i = 1; i < length; i++) {
    // Shuffle directions
    const shuffled = [...directions].sort(() => Math.random() - 0.5);
    let moved = false;

    for (const [dr, dc] of shuffled) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !visited.has(nr * GRID_SIZE + nc)) {
        row = nr;
        col = nc;
        path.push(row * GRID_SIZE + col);
        visited.add(row * GRID_SIZE + col);
        moved = true;
        break;
      }
    }

    if (!moved) break; // Dead end
  }

  return path;
}

function computePathfinderScore(levels, errors, avgTime) {
  const maxLevel = levels;
  let score = 5;
  if (maxLevel >= 5) score -= 3;
  else if (maxLevel >= 3) score -= 2;
  else if (maxLevel >= 2) score -= 1;
  score += Math.min(errors * 0.5, 3);
  if (avgTime > 4000) score += 1;
  return Math.max(0, Math.min(10, Math.round(score)));
}

const PathfinderMaze = ({ onComplete }) => {
  const [phase, setPhase] = useState('intro'); // intro | showing | tracing | feedback | levelUp | done
  const [level, setLevel] = useState(0);
  const [path, setPath] = useState([]);
  const [playerPath, setPlayerPath] = useState([]);
  const [flashedCells, setFlashedCells] = useState(new Set());
  const [errors, setErrors] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [maxLevelReached, setMaxLevelReached] = useState(0);
  const [traceTimes, setTraceTimes] = useState([]);
  const [stepStartTime, setStepStartTime] = useState(null);
  const [wrongCell, setWrongCell] = useState(null);
  const timeoutRef = useRef(null);

  const currentLevel = LEVELS[level] || LEVELS[LEVELS.length - 1];

  const startLevel = useCallback(() => {
    const newPath = generatePath(currentLevel.pathLength);
    setPath(newPath);
    setPlayerPath([]);
    setErrors(0);
    setWrongCell(null);

    // Show path
    setPhase('showing');
    setFlashedCells(new Set(newPath));

    timeoutRef.current = setTimeout(() => {
      setFlashedCells(new Set());
      setPhase('tracing');
      setStepStartTime(Date.now());
    }, FLASH_DURATION);
  }, [currentLevel]);

  const handleCellClick = (cellIndex) => {
    if (phase !== 'tracing') return;

    const expectedIndex = playerPath.length;
    const expected = path[expectedIndex];

    if (cellIndex === expected) {
      // Correct!
      const now = Date.now();
      if (stepStartTime) {
        setTraceTimes(prev => [...prev, now - stepStartTime]);
      }
      setStepStartTime(now);
      setWrongCell(null);

      const newPath = [...playerPath, cellIndex];
      setPlayerPath(newPath);

      if (newPath.length === path.length) {
        // Level complete!
        setMaxLevelReached(Math.max(maxLevelReached, level + 1));
        setPhase('feedback');

        if (level + 1 >= LEVELS.length) {
          // Beat all levels
          setTimeout(() => finishGame(LEVELS.length), 1200);
        } else {
          setTimeout(() => {
            setPhase('levelUp');
          }, 800);
        }
      }
    } else {
      // Wrong
      setErrors(e => e + 1);
      setTotalErrors(e => e + 1);
      setWrongCell(cellIndex);

      if (errors + 1 >= 3) {
        // Too many errors this level — end
        setTimeout(() => finishGame(Math.max(maxLevelReached, level)), 1000);
      }

      setTimeout(() => setWrongCell(null), 600);
    }
  };

  const advanceLevel = () => {
    setLevel(prev => prev + 1);
  };

  useEffect(() => {
    if (level > 0 && phase === 'levelUp') {
      // Do nothing, wait for user
    }
  }, [level]);

  const handleStartLevel = () => {
    startLevel();
  };

  // When player clicks "Next Level" on levelUp screen
  const handleNextLevel = () => {
    advanceLevel();
  };

  // effect: when level changes (and was bumped from levelUp), start it
  useEffect(() => {
    if (level > 0 && phase === 'levelUp') {
      startLevel();
    }
  }, [level]);

  const finishGame = (maxLvl) => {
    setPhase('done');
    const avgTime = traceTimes.length > 0
      ? Math.round(traceTimes.reduce((a, b) => a + b, 0) / traceTimes.length)
      : 0;
    const finalScore = computePathfinderScore(maxLvl, totalErrors, avgTime);

    onComplete({
      maxLevel: maxLvl,
      maxLevelName: LEVELS[Math.min(maxLvl, LEVELS.length) - 1]?.name || 'N/A',
      totalErrors,
      avgTraceTime: avgTime,
      score: finalScore,
    });
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const getCellStyle = (index) => {
    const isFlashed = flashedCells.has(index);
    const isTraced = playerPath.includes(index);
    const isNext = path[playerPath.length] === index && phase === 'tracing';
    const isWrong = wrongCell === index;
    const isStart = path[0] === index;
    const isEnd = path[path.length - 1] === index;

    // Showing phase
    if (phase === 'showing') {
      if (isFlashed) {
        const pathIndex = path.indexOf(index);
        if (isStart) return { bg: '#22c55e', border: '#16a34a', text: '🟢', glow: '0 0 12px rgba(34,197,94,0.5)' };
        if (isEnd) return { bg: '#ef4444', border: '#dc2626', text: '🏁', glow: '0 0 12px rgba(239,68,68,0.5)' };
        return {
          bg: `hsl(${260 + pathIndex * 8}, 70%, 60%)`,
          border: `hsl(${260 + pathIndex * 8}, 70%, 50%)`,
          text: pathIndex + 1,
          glow: `0 0 8px hsla(${260 + pathIndex * 8}, 70%, 60%, 0.4)`,
        };
      }
      return { bg: '#1e293b', border: '#334155', text: '', glow: 'none' };
    }

    // Tracing phase
    if (isWrong) return { bg: '#ef4444', border: '#dc2626', text: '✗', glow: '0 0 12px rgba(239,68,68,0.5)' };
    if (isTraced) {
      return { bg: '#8b5cf6', border: '#7c3aed', text: playerPath.indexOf(index) + 1, glow: '0 0 8px rgba(139,92,246,0.4)' };
    }
    if (phase === 'tracing' && isStart && playerPath.length === 0) {
      return { bg: '#22c55e', border: '#16a34a', text: '▶', glow: '0 0 12px rgba(34,197,94,0.6)' };
    }
    return { bg: '#1e293b', border: '#334155', text: '', glow: 'none' };
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
        🗺️ Round 4B: Pathfinder Maze
      </div>

      {phase === 'intro' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Remember the Hidden Path
          </h2>
          <p className="text-gray-500 mb-2">
            A path will flash on the grid. Memorize it, then trace it from start to finish!
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Each level gets harder. 3 wrong clicks and the game ends.
          </p>
          <button
            onClick={handleStartLevel}
            className="bg-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-cyan-500 transition"
          >
            Start Pathfinder →
          </button>
        </div>
      )}

      {(phase === 'showing' || phase === 'tracing' || phase === 'feedback') && (
        <div>
          {/* Level info */}
          <div className="flex items-center justify-between mb-4 max-w-xs mx-auto text-sm text-gray-500">
            <span>Level {level + 1}: {currentLevel.name}</span>
            <span>
              {phase === 'showing'
                ? '👀 Memorize the path!'
                : phase === 'tracing'
                ? `🎯 ${playerPath.length}/${path.length} traced`
                : '✅ Perfect!'}
            </span>
          </div>

          {/* Error counter */}
          <div className="flex justify-center gap-1 mb-3">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  i < errors ? 'bg-red-500 text-white' : 'bg-gray-200'
                }`}
              >
                {i < errors ? '✗' : '♥'}
              </div>
            ))}
          </div>

          {/* Level progress */}
          <div className="flex justify-center gap-1 mb-4">
            {LEVELS.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1.5 rounded-full ${
                  i < maxLevelReached
                    ? 'bg-green-500'
                    : i === level
                    ? 'bg-cyan-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Grid */}
          <div
            className="grid gap-1.5 max-w-[300px] mx-auto mb-4"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const style = getCellStyle(i);
              return (
                <motion.button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  disabled={phase !== 'tracing'}
                  whileTap={phase === 'tracing' ? { scale: 0.9 } : {}}
                  className="aspect-square rounded-lg transition-all duration-200 flex items-center justify-center text-xs font-bold text-white border-2"
                  style={{
                    backgroundColor: style.bg,
                    borderColor: style.border,
                    boxShadow: style.glow,
                    cursor: phase === 'tracing' ? 'pointer' : 'default',
                  }}
                >
                  {style.text}
                </motion.button>
              );
            })}
          </div>

          {phase === 'showing' && (
            <p className="text-xs text-gray-400 animate-pulse">
              Path will disappear soon — remember the sequence!
            </p>
          )}
          {phase === 'tracing' && (
            <p className="text-xs text-gray-400">
              Click cells in order. {3 - errors} lives remaining.
            </p>
          )}
        </div>
      )}

      {phase === 'levelUp' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-8"
        >
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Level {level + 1} Complete!
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Ready for {LEVELS[level + 1]?.name || 'the next'} difficulty?
          </p>
          <button
            onClick={handleNextLevel}
            className="bg-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-cyan-500 transition"
          >
            Next Level →
          </button>
        </motion.div>
      )}

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pathfinder Complete!</h2>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-4">
            <div className="bg-cyan-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-cyan-600">{maxLevelReached}</p>
              <p className="text-xs text-gray-500">Max Level</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-500">{totalErrors}</p>
              <p className="text-xs text-gray-500">Errors</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-600">
                {traceTimes.length > 0
                  ? `${Math.round(traceTimes.reduce((a, b) => a + b, 0) / traceTimes.length)}ms`
                  : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Avg Step</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Processing spatial memory data...</p>
        </motion.div>
      )}
    </div>
  );
};

export default PathfinderMaze;
