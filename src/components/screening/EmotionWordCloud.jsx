import { useState } from 'react';
import { motion } from 'framer-motion';

const WORDS = [
  { text: 'Happy', weight: 3, color: '#22c55e' },
  { text: 'Anxious', weight: -1, color: '#eab308' },
  { text: 'Hopeless', weight: -3, color: '#ef4444' },
  { text: 'Energetic', weight: 2, color: '#22c55e' },
  { text: 'Tired', weight: -1, color: '#f97316' },
  { text: 'Scared', weight: -1, color: '#ef4444' },
  { text: 'Peaceful', weight: 2, color: '#22c55e' },
  { text: 'Angry', weight: -1, color: '#ef4444' },
  { text: 'Lonely', weight: -2, color: '#8b5cf6' },
  { text: 'Grateful', weight: 3, color: '#22c55e' },
  { text: 'Overwhelmed', weight: -2, color: '#f97316' },
  { text: 'Numb', weight: -2, color: '#6b7280' },
  { text: 'Excited', weight: 1, color: '#22c55e' },
  { text: 'Worthless', weight: -3, color: '#ef4444' },
  { text: 'Confident', weight: 2, color: '#22c55e' },
  { text: 'Panicked', weight: -2, color: '#ef4444' },
  { text: 'Calm', weight: 2, color: '#22c55e' },
  { text: 'Irritable', weight: -1, color: '#f97316' },
  { text: 'Loved', weight: 2, color: '#ec4899' },
  { text: 'Empty', weight: -3, color: '#6b7280' },
  { text: 'Motivated', weight: 2, color: '#22c55e' },
  { text: 'Helpless', weight: -3, color: '#ef4444' },
  { text: 'Focused', weight: 1, color: '#3b82f6' },
  { text: 'Restless', weight: -1, color: '#eab308' },
  { text: 'Content', weight: 2, color: '#22c55e' },
  { text: 'Guilty', weight: -2, color: '#8b5cf6' },
  { text: 'Proud', weight: 1, color: '#3b82f6' },
  { text: 'Confused', weight: -1, color: '#eab308' },
  { text: 'Hopeful', weight: 2, color: '#10b981' },
  { text: 'Trapped', weight: -3, color: '#ef4444' },
];

// Randomize font sizes for visual variety
const SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];

function getWordSize(index) {
  return SIZES[index % SIZES.length];
}

const EmotionWordCloud = ({ onComplete }) => {
  const [selected, setSelected] = useState([]);
  const MAX_SELECT = 10;

  const toggleWord = (word) => {
    setSelected((prev) => {
      if (prev.includes(word.text)) {
        return prev.filter((w) => w !== word.text);
      }
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, word.text];
    });
  };

  const handleDone = () => {
    const selectedWords = WORDS.filter((w) => selected.includes(w.text));
    const totalWeight = selectedWords.reduce((sum, w) => sum + w.weight, 0);
    // Map weight to 0-10 score (higher = worse)
    // Weight range: worst = -30 (all negative), best = +30 (all positive)
    // Normalize: -30..+30 → 10..0
    const normalized = Math.max(0, Math.min(10, Math.round(5 - totalWeight / 3)));
    onComplete({
      selectedWords: selected,
      totalWeight,
      score: normalized,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          💭 Emotion Word Cloud
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Tap the words that describe how you feel
        </h2>
        <p className="text-gray-500 text-sm">
          Select up to {MAX_SELECT} words — {selected.length}/{MAX_SELECT} selected
        </p>
      </div>

      {/* Word Cloud */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
        {WORDS.map((word, i) => {
          const isSelected = selected.includes(word.text);
          return (
            <motion.button
              key={word.text}
              onClick={() => toggleWord(word)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: isSelected ? 1.15 : 1 }}
              transition={{ delay: i * 0.03, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${getWordSize(i)} ${
                isSelected
                  ? 'text-white shadow-lg ring-2 ring-offset-2'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: word.color,
                      ringColor: word.color,
                      boxShadow: `0 4px 14px ${word.color}44`,
                    }
                  : {}
              }
            >
              {word.text}
            </motion.button>
          );
        })}
      </div>

      {/* Selected summary */}
      {selected.length > 0 && (
        <div className="text-center mb-6">
          <p className="text-xs text-gray-400">
            Selected: {selected.join(', ')}
          </p>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={handleDone}
          disabled={selected.length === 0}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-40 hover:bg-blue-500 transition"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default EmotionWordCloud;
