import { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const CLASS_COLORS = {
  Normal: { bg: "bg-green-500", text: "text-green-400", bar: "bg-green-400" },
  Anxiety: { bg: "bg-yellow-500", text: "text-yellow-400", bar: "bg-yellow-400" },
  Depression: { bg: "bg-blue-500", text: "text-blue-400", bar: "bg-blue-400" },
  "Bipolar": { bg: "bg-purple-500", text: "text-purple-400", bar: "bg-purple-400" },
  Stress: { bg: "bg-orange-500", text: "text-orange-400", bar: "bg-orange-400" },
  Suicidal: { bg: "bg-red-500", text: "text-red-400", bar: "bg-red-400" },
  "Personality disorder": { bg: "bg-pink-500", text: "text-pink-400", bar: "bg-pink-400" },
};

const getColor = (label) =>
  CLASS_COLORS[label] || { bg: "bg-slate-500", text: "text-slate-400", bar: "bg-slate-400" };

const PredictionResult = ({ prediction, confidence, allProbabilities }) => {
  const [expanded, setExpanded] = useState(false);
  const color = getColor(prediction);

  const sortedProbs = Object.entries(allProbabilities).sort((a, b) => b[1] - a[1]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6"
    >
      <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-4">
        Prediction Result
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <span className={`${color.bg} text-white text-lg font-bold px-5 py-2 rounded-full`}>
          {prediction}
        </span>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Confidence</span>
            <span className={`${color.text} font-bold`}>{(confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`${color.bar} h-3 rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Expandable all-class probabilities */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-purple-300 transition-colors"
      >
        {expanded ? <FaChevronUp /> : <FaChevronDown />}
        {expanded ? "Hide" : "Show"} all class probabilities
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-2"
        >
          {sortedProbs.map(([label, prob]) => {
            const c = getColor(label);
            return (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-36 truncate">{label}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${c.bar} h-2 rounded-full transition-all`}
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-14 text-right">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PredictionResult;
