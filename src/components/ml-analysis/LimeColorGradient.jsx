import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Maps a normalized weight [-1, 1] to an RGB color.
 * +1 = green (positive contribution), -1 = red (negative), 0 = neutral white.
 */
function weightToColor(w) {
  const clamped = Math.max(-1, Math.min(1, w));

  if (clamped >= 0) {
    // Neutral (248,250,252) → Green (34,197,94)
    const r = Math.round(248 - clamped * (248 - 34));
    const g = Math.round(250 - clamped * (250 - 197));
    const b = Math.round(252 - clamped * (252 - 94));
    return `rgb(${r},${g},${b})`;
  } else {
    // Neutral (248,250,252) → Red (239,68,68)
    const aw = Math.abs(clamped);
    const r = Math.round(248 - aw * (248 - 239));
    const g = Math.round(250 - aw * (250 - 68));
    const b = Math.round(252 - aw * (252 - 68));
    return `rgb(${r},${g},${b})`;
  }
}

function weightToTextColor(w) {
  return Math.abs(w) > 0.5 ? "#1e293b" : "#334155";
}

const LimeColorGradient = ({ text, explanation }) => {
  const [hoveredWord, setHoveredWord] = useState(null);

  // Build word → weight lookup from LIME explanation
  const weightMap = {};
  explanation.forEach(({ word, weight }) => {
    weightMap[word.toLowerCase()] = weight;
  });

  // Find max absolute weight for normalization
  const maxAbs = Math.max(
    ...explanation.map((e) => Math.abs(e.weight)),
    0.001
  );

  // Split text into tokens
  const tokens = text.split(/(\s+)/);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6"
    >
      <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-2">
        LIME Color Gradient
      </h3>
      <p className="text-slate-500 text-xs mb-4">
        Words are colored by their influence on the prediction.
        <span className="text-green-400"> Green = supports prediction</span>,
        <span className="text-red-400"> Red = opposes prediction</span>.
      </p>

      {/* Color-coded text */}
      <div className="bg-slate-800 rounded-xl p-4 mb-4 leading-loose relative">
        {tokens.map((token, i) => {
          const cleaned = token.toLowerCase().replace(/[^a-z0-9]/g, "");
          const weight = weightMap[cleaned] ?? 0;
          const normalized = weight / maxAbs;
          const isSpace = /^\s+$/.test(token);

          if (isSpace) return <span key={i}>{token}</span>;

          return (
            <span
              key={i}
              className="relative inline-block cursor-pointer transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredWord({ token, weight, normalized, index: i })}
              onMouseLeave={() => setHoveredWord(null)}
              style={{
                backgroundColor: weightToColor(normalized),
                color: weightToTextColor(normalized),
                padding: "2px 5px",
                borderRadius: "4px",
                margin: "1px",
                fontWeight: Math.abs(normalized) > 0.3 ? "600" : "400",
                fontSize: "0.9rem",
              }}
            >
              {token}
              {/* Tooltip */}
              {hoveredWord?.index === i && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg border border-slate-600 z-10">
                  <span className="font-bold">{token}</span>
                  <br />
                  Weight: {weight.toFixed(4)}
                  <br />
                  Impact: {normalized > 0 ? "+" : ""}{(normalized * 100).toFixed(1)}%
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-red-400">Negative</span>
        <div
          className="flex-1 h-3 rounded-full"
          style={{
            background: "linear-gradient(to right, rgb(239,68,68), rgb(248,250,252), rgb(34,197,94))",
          }}
        />
        <span className="text-xs text-green-400">Positive</span>
      </div>

      {/* Top features list */}
      <div className="mt-4 pt-4 border-t border-white border-opacity-10">
        <p className="text-xs text-slate-500 mb-2">Top features by importance:</p>
        <div className="flex flex-wrap gap-1.5">
          {[...explanation]
            .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
            .slice(0, 8)
            .map((item, i) => {
              const norm = item.weight / maxAbs;
              return (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: weightToColor(norm),
                    color: weightToTextColor(norm),
                  }}
                >
                  {item.word} ({item.weight > 0 ? "+" : ""}{item.weight.toFixed(3)})
                </span>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
};

export default LimeColorGradient;
