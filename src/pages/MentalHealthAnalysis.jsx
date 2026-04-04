import { useState } from "react";
import { motion } from "framer-motion";
import { FaBrain, FaExclamationTriangle } from "react-icons/fa";
import Footer from "../components/Footer";
import TextInputPanel from "../components/ml-analysis/TextInputPanel";
import PredictionResult from "../components/ml-analysis/PredictionResult";
import LimeColorGradient from "../components/ml-analysis/LimeColorGradient";
import WordPlot3D from "../components/ml-analysis/WordPlot3D";
import AnalysisLoadingState from "../components/ml-analysis/AnalysisLoadingState";

const API_BASE = "";

const MentalHealthAnalysis = () => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (text) => {
    setInputText(text);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/ml/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, num_features: 15 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze text");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the analysis server. Make sure both the Express server (port 5000) and Flask ML service (port 5001) are running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500 opacity-5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-purple-500 bg-opacity-20 text-purple-300 text-sm font-semibold px-4 py-1 rounded-full mb-4 border border-purple-500 border-opacity-30">
              <FaBrain /> AI-Powered Analysis
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
              Mental Health Text Analysis
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Powered by a LIME (Local Interpretable Model-Agnostic Explanations) interpretability module.
              Describe how you feel and the AI model will classify your mental state and
              visually explain its reasoning through <span className="text-green-400">dynamic color gradients</span> and{" "}
              <span className="text-purple-300">3D word importance plots</span>.
            </p>
          </div>

          {/* CG Concepts Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                title: "LIME Explainability",
                desc: "Local surrogate model generates per-word feature importance scores",
                color: "border-blue-500 bg-blue-500",
              },
              {
                title: "Dynamic Color Gradients",
                desc: "RGB interpolation maps LIME weights to a red-white-green gradient",
                color: "border-green-500 bg-green-500",
              },
              {
                title: "3D Word Plot",
                desc: "Three.js interactive scatter plot with rotation, zoom, and pan controls",
                color: "border-purple-500 bg-purple-500",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`border ${item.color} border-opacity-30 bg-opacity-5 rounded-xl p-4`}
              >
                <h4 className="text-white text-sm font-bold mb-1">{item.title}</h4>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Input Panel */}
          <TextInputPanel onSubmit={handleAnalyze} loading={loading} />

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-4 flex items-start gap-3"
            >
              <FaExclamationTriangle className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-semibold">Analysis Failed</p>
                <p className="text-red-400 text-xs mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-8">
              <AnalysisLoadingState />
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-6"
            >
              {/* Prediction */}
              <PredictionResult
                prediction={result.prediction}
                confidence={result.confidence}
                allProbabilities={result.all_probabilities}
              />

              {/* Visualizations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LimeColorGradient text={inputText} explanation={result.explanation} />
                <WordPlot3D explanation={result.explanation} />
              </div>

              {/* Disclaimer */}
              <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-4 text-xs text-slate-500">
                <strong className="text-slate-400">Disclaimer:</strong> This tool is for educational
                and demonstration purposes only. It uses a machine learning model trained on public datasets
                and is not a clinical diagnostic tool. Please consult a qualified healthcare professional
                for medical advice.
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MentalHealthAnalysis;
