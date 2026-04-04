import { useState } from "react";
import { FaBrain, FaSpinner } from "react-icons/fa";
import PredictionResult from "../ml-analysis/PredictionResult";
import LimeColorGradient from "../ml-analysis/LimeColorGradient";
import WordPlot3D from "../ml-analysis/WordPlot3D";

const TranscriptAnalysis = ({ sessionId, messages, existingAnalysis }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(existingAnalysis || null);

  const patientMessages = messages
    .filter((m) => m.sender === "patient")
    .map((m) => m.text);
  const patientText = patientMessages.join(". ");

  const handleAnalyze = async () => {
    if (patientText.length < 10) {
      setError("Not enough patient messages to analyze. Need at least a few sentences.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/analyze/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 bg-purple-500 bg-opacity-20 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full border border-purple-500 border-opacity-30">
          <FaBrain /> LIME Transcript Analysis
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{patientMessages.length}</p>
          <p className="text-[10px] text-slate-500">Patient Messages</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{patientText.split(/\s+/).length}</p>
          <p className="text-[10px] text-slate-500">Total Words</p>
        </div>
      </div>

      {/* Analyze button */}
      {!analysis && (
        <button
          onClick={handleAnalyze}
          disabled={loading || patientMessages.length === 0}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            loading || patientMessages.length === 0
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 shadow-lg"
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Analyzing Transcript...
            </>
          ) : (
            <>
              <FaBrain /> Analyze Patient Transcript
            </>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-4">
          <PredictionResult
            prediction={analysis.prediction}
            confidence={analysis.confidence}
            allProbabilities={analysis.all_probabilities}
          />
          <LimeColorGradient text={patientText} explanation={analysis.explanation} />
          <WordPlot3D explanation={analysis.explanation} />

          {/* Re-analyze button */}
          <button
            onClick={() => { setAnalysis(null); handleAnalyze(); }}
            className="w-full text-xs text-purple-300 bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-20 rounded-lg py-2 hover:bg-opacity-20 transition-colors"
          >
            Re-analyze with updated transcript
          </button>
        </div>
      )}

      {/* Empty state */}
      {!analysis && patientMessages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">
            Waiting for patient messages...
          </p>
          <p className="text-slate-600 text-xs mt-1">
            The analysis will use the patient's text and voice messages.
          </p>
        </div>
      )}
    </div>
  );
};

export default TranscriptAnalysis;
