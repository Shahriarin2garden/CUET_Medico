import { useState } from "react";
import { FaBrain, FaPaperPlane } from "react-icons/fa";

const SAMPLE_TEXTS = [
  "I have been feeling very anxious lately and cannot concentrate on my studies. My sleep has been terrible and I feel restless all the time.",
  "I feel happy and motivated today. I had a great time with friends and feel energetic about my upcoming exams.",
  "I have lost interest in everything. Nothing makes me happy anymore. I feel empty and hopeless about the future.",
];

const TextInputPanel = ({ onSubmit, loading }) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim().length >= 20 && !loading) {
      onSubmit(text.trim());
    }
  };

  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FaBrain className="text-purple-400" />
        <h3 className="text-white font-bold text-lg">Describe how you are feeling</h3>
      </div>
      <p className="text-slate-400 text-sm mb-4">
        Write about your mental state, feelings, or symptoms. The AI model will analyze your text
        and explain its reasoning through visual interpretations.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g., I have been feeling very anxious lately and cannot concentrate on my studies..."
        rows={5}
        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none text-sm"
      />

      <div className="flex items-center justify-between mt-3">
        <span className={`text-xs ${text.trim().length >= 20 ? "text-green-400" : "text-slate-500"}`}>
          {text.trim().length} / 20 min characters
        </span>
        <button
          onClick={handleSubmit}
          disabled={text.trim().length < 20 || loading}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
            text.trim().length >= 20 && !loading
              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 shadow-lg cursor-pointer"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          <FaPaperPlane className="text-xs" />
          {loading ? "Analyzing..." : "Analyze Text"}
        </button>
      </div>

      {/* Sample texts */}
      <div className="mt-5 pt-4 border-t border-white border-opacity-10">
        <p className="text-xs text-slate-500 mb-2">Try a sample:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TEXTS.map((sample, i) => (
            <button
              key={i}
              onClick={() => setText(sample)}
              className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded-full hover:bg-purple-500 hover:bg-opacity-20 hover:text-purple-300 transition-colors border border-slate-700"
            >
              Sample {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextInputPanel;
