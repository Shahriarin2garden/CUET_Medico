import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FEELING_DROPS = [
  { id: 'stress', label: 'Stress', color: '#ef4444', emoji: '😤', weight: -2 },
  { id: 'calm', label: 'Calm', color: '#3b82f6', emoji: '😌', weight: 2 },
  { id: 'anxiety', label: 'Anxiety', color: '#f97316', emoji: '😰', weight: -2 },
  { id: 'joy', label: 'Joy', color: '#22c55e', emoji: '😊', weight: 3 },
  { id: 'sadness', label: 'Sadness', color: '#6366f1', emoji: '😢', weight: -3 },
  { id: 'energy', label: 'Energy', color: '#eab308', emoji: '⚡', weight: 1 },
  { id: 'anger', label: 'Anger', color: '#dc2626', emoji: '😡', weight: -2 },
  { id: 'hope', label: 'Hope', color: '#10b981', emoji: '🌟', weight: 2 },
  { id: 'fear', label: 'Fear', color: '#7c3aed', emoji: '😨', weight: -2 },
  { id: 'love', label: 'Love', color: '#ec4899', emoji: '💕', weight: 3 },
  { id: 'fatigue', label: 'Fatigue', color: '#6b7280', emoji: '😴', weight: -1 },
  { id: 'peace', label: 'Peace', color: '#06b6d4', emoji: '🕊️', weight: 2 },
];

function blendColors(drops) {
  if (drops.length === 0) return '#e2e8f0';
  let r = 0, g = 0, b = 0;
  drops.forEach(d => {
    const drop = FEELING_DROPS.find(f => f.id === d);
    if (!drop) return;
    const hex = drop.color;
    r += parseInt(hex.slice(1, 3), 16);
    g += parseInt(hex.slice(3, 5), 16);
    b += parseInt(hex.slice(5, 7), 16);
  });
  const len = drops.length;
  r = Math.round(r / len);
  g = Math.round(g / len);
  b = Math.round(b / len);
  return `rgb(${r}, ${g}, ${b})`;
}

function computeMixerScore(drops) {
  if (drops.length === 0) return { score: 5, totalWeight: 0, blend: '#e2e8f0' };
  const totalWeight = drops.reduce((sum, id) => {
    const drop = FEELING_DROPS.find(f => f.id === id);
    return sum + (drop?.weight || 0);
  }, 0);
  // Map weight range (-3*12 to +3*12) -> score 0-10 (higher = worse)
  const normalized = Math.max(0, Math.min(10, Math.round(5 - totalWeight / 2)));
  const blend = blendColors(drops);
  return { score: normalized, totalWeight, blend };
}

const MoodMixer = ({ onComplete }) => {
  const [drops, setDrops] = useState([]);
  const [phase, setPhase] = useState('mixing'); // mixing | done
  const [fillAnim, setFillAnim] = useState(false);
  const beakerRef = useRef(null);
  const MAX_DROPS = 8;

  const addDrop = (id) => {
    if (drops.length >= MAX_DROPS) return;
    if (drops.filter(d => d === id).length >= 2) return; // max 2 of same
    setDrops(prev => [...prev, id]);
    setFillAnim(true);
    setTimeout(() => setFillAnim(false), 400);
  };

  const removeLast = () => {
    setDrops(prev => prev.slice(0, -1));
  };

  const handleDone = () => {
    if (drops.length < 2) return;
    setPhase('done');
    const result = computeMixerScore(drops);
    setTimeout(() => {
      onComplete({
        drops: drops.map(id => FEELING_DROPS.find(f => f.id === id)?.label),
        dropIds: drops,
        ...result,
      });
    }, 1200);
  };

  const fillLevel = (drops.length / MAX_DROPS) * 100;
  const blendedColor = blendColors(drops);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          🧪 Round 1B: Mood Mixer
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {phase === 'mixing' ? 'Mix Your Emotional Potion' : 'Your Emotional Blend'}
        </h2>
        <p className="text-gray-500 text-sm">
          {phase === 'mixing'
            ? `Drop feeling orbs into the beaker to create your emotional mix. ${drops.length}/${MAX_DROPS} drops used.`
            : 'Analyzing your emotional composition...'}
        </p>
      </div>

      {phase === 'mixing' && (
        <>
          {/* Feeling Drops Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-8 px-4">
            {FEELING_DROPS.map((drop) => {
              const count = drops.filter(d => d === drop.id).length;
              const disabled = drops.length >= MAX_DROPS || count >= 2;
              return (
                <motion.button
                  key={drop.id}
                  onClick={() => addDrop(drop.id)}
                  disabled={disabled}
                  whileHover={{ scale: disabled ? 1 : 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                    count > 0
                      ? 'border-current shadow-md'
                      : disabled
                      ? 'border-gray-100 opacity-40'
                      : 'border-gray-200 hover:border-current hover:shadow-sm'
                  }`}
                  style={{
                    color: drop.color,
                    backgroundColor: count > 0 ? `${drop.color}12` : undefined,
                  }}
                >
                  <span className="text-2xl">{drop.emoji}</span>
                  <span className="text-[10px] font-medium text-gray-600">{drop.label}</span>
                  {count > 0 && (
                    <span
                      className="text-[9px] font-bold text-white px-1.5 rounded-full"
                      style={{ backgroundColor: drop.color }}
                    >
                      ×{count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Beaker */}
          <div className="flex justify-center mb-8">
            <div className="relative" ref={beakerRef}>
              {/* Beaker container */}
              <div
                className="relative w-40 h-56 rounded-b-3xl border-4 border-slate-300 overflow-hidden bg-slate-50"
                style={{
                  borderTop: 'none',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                }}
              >
                {/* Beaker mouth */}
                <div className="absolute -top-1 -left-2 w-[calc(100%+16px)] h-2 bg-slate-300 rounded-t-sm" />

                {/* Fill level */}
                <motion.div
                  animate={{
                    height: `${fillLevel}%`,
                    backgroundColor: blendedColor,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="absolute bottom-0 left-0 right-0 rounded-b-2xl"
                  style={{
                    background: drops.length > 1
                      ? `linear-gradient(135deg, ${drops.map(id => FEELING_DROPS.find(f => f.id === id)?.color).join(', ')})`
                      : blendedColor,
                  }}
                />

                {/* Bubbles */}
                <AnimatePresence>
                  {fillAnim && (
                    <>
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={`bubble-${i}-${drops.length}`}
                          initial={{ opacity: 0.8, y: 0, scale: 0.3 }}
                          animate={{ opacity: 0, y: -80, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, delay: i * 0.15 }}
                          className="absolute rounded-full"
                          style={{
                            width: 10 + i * 4,
                            height: 10 + i * 4,
                            bottom: `${fillLevel - 5}%`,
                            left: `${30 + i * 15}%`,
                            backgroundColor: `${blendedColor}66`,
                            border: '1px solid rgba(255,255,255,0.4)',
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>

                {/* Drop count */}
                {drops.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl drop-shadow-lg">
                      {drops.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Scale marks */}
              <div className="absolute top-0 -right-8 h-full flex flex-col justify-between py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-3 h-px bg-slate-300" />
                    <span className="text-[8px] text-slate-400">{(MAX_DROPS / 4) * (4 - i)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drop tags */}
          {drops.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {drops.map((id, i) => {
                const drop = FEELING_DROPS.find(f => f.id === id);
                return (
                  <motion.span
                    key={`${id}-${i}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white"
                    style={{ backgroundColor: drop?.color }}
                  >
                    {drop?.emoji} {drop?.label}
                  </motion.span>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-3">
            {drops.length > 0 && (
              <button
                onClick={removeLast}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition"
              >
                Undo Last
              </button>
            )}
            <button
              onClick={handleDone}
              disabled={drops.length < 2}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-40 hover:bg-purple-500 transition"
            >
              Analyze Mix →
            </button>
          </div>
        </>
      )}

      {/* Done state */}
      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div
            className="w-32 h-32 rounded-full mx-auto mb-4 shadow-xl border-4 border-white"
            style={{
              background: drops.length > 1
                ? `conic-gradient(${drops.map((id, i) => {
                    const d = FEELING_DROPS.find(f => f.id === id);
                    const angle = (360 / drops.length) * i;
                    return `${d?.color} ${angle}deg`;
                  }).join(', ')})`
                : blendedColor,
            }}
          />
          <p className="text-sm text-gray-500">Your emotional blend is being analyzed...</p>
          <div className="flex justify-center gap-2 mt-3">
            {drops.map((id, i) => {
              const d = FEELING_DROPS.find(f => f.id === id);
              return <span key={i} className="text-xl">{d?.emoji}</span>;
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MoodMixer;
