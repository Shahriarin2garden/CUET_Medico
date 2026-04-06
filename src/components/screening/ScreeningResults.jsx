import { useState, useEffect, useRef } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';
import { FaSave, FaSpinner, FaBrain, FaGamepad, FaClock, FaPuzzlePiece, FaClipboardList, FaPalette, FaFilePdf } from 'react-icons/fa';
import LimeColorGradient from '../ml-analysis/LimeColorGradient';
import WordPlot3D from '../ml-analysis/WordPlot3D';
import PredictionResult from '../ml-analysis/PredictionResult';
import { RISK_COLORS } from '../../constants/chartColors';
import { useToast } from '../ui/ToastProvider';
import { exportScreeningToPdf } from './ScreeningPDFExport';

function computeOverallRisk(scores) {
  // Weighted composite across all 10 activities
  // Original 5: quiz(20%), words(10%), color(8%), reaction(6%), memory(6%) = 50%
  // New 5: scenarios(12%), sorter(8%), mixer(8%), catcher(6%), pathfinder(6%) = 40%
  // Remaining 10% shared buffer
  const quizNorm = scores.quizPct != null ? scores.quizPct / 100 : 0.5;
  const wordNorm = scores.emotionWordScore != null ? scores.emotionWordScore / 10 : 0.5;
  const colorNorm = scores.moodColorScore != null ? scores.moodColorScore / 10 : 0.5;
  const reactionNorm = scores.reactionScore != null ? Math.max(0, (2 - scores.reactionScore) / 5) : 0.3;
  const memoryNorm = scores.memoryScore != null ? Math.max(0, (3 - scores.memoryScore) / 6) : 0.3;
  // New game norms (all 0-10 scores mapped to 0-1)
  const scenarioNorm = scores.scenarioPct != null ? scores.scenarioPct / 100 : 0.5;
  const sorterNorm = scores.sorterScore != null ? scores.sorterScore / 10 : 0.5;
  const mixerNorm = scores.mixerScore != null ? scores.mixerScore / 10 : 0.5;
  const catcherNorm = scores.catcherScore != null ? scores.catcherScore / 10 : 0.5;
  const pathfinderNorm = scores.pathfinderScore != null ? scores.pathfinderScore / 10 : 0.5;

  const composite =
    quizNorm * 0.20 + wordNorm * 0.10 + colorNorm * 0.08 + reactionNorm * 0.06 + memoryNorm * 0.06 +
    scenarioNorm * 0.12 + sorterNorm * 0.10 + mixerNorm * 0.08 + catcherNorm * 0.10 + pathfinderNorm * 0.10;

  if (composite <= 0.25) return { level: 'Low', color: RISK_COLORS.Low, pct: Math.round(composite * 100) };
  if (composite <= 0.50) return { level: 'Moderate', color: RISK_COLORS.Moderate, pct: Math.round(composite * 100) };
  if (composite <= 0.75) return { level: 'High', color: RISK_COLORS.High, pct: Math.round(composite * 100) };
  return { level: 'Critical', color: RISK_COLORS.Critical, pct: Math.round(composite * 100) };
}

const ScreeningResults = ({ data, onSave, userInfo, onUniversityIdChange }) => {
  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recommendationText, setRecommendationText] = useState('');
  const reportRef = useRef(null);
  const { showToast } = useToast();

  const { moodColor, moodMixer, emotionWords, feelingSorter, reactionTime, focusCatcher, memoryPattern, pathfinder, quiz, scenarioCards } = data;

  // Request ML analysis for free text
  useEffect(() => {
    if (quiz?.freeText && quiz.freeText.length >= 20) {
      setMlLoading(true);
      fetch('/api/ml/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quiz.freeText, num_features: 15 }),
      })
        .then((r) => r.json())
        .then((d) => setMlResult(d))
        .catch(() => setMlResult(null))
        .finally(() => setMlLoading(false));
    }
  }, [quiz?.freeText]);

  const risk = computeOverallRisk({
    quizPct: quiz?.pct,
    emotionWordScore: emotionWords?.score,
    moodColorScore: moodColor?.score,
    reactionScore: reactionTime?.score,
    memoryScore: memoryPattern?.score,
    scenarioPct: scenarioCards?.pct,
    sorterScore: feelingSorter?.score,
    mixerScore: moodMixer?.score,
    catcherScore: focusCatcher?.score,
    pathfinderScore: pathfinder?.score,
  });

  // Radar data: normalize all scores to 0-100 (100 = worst)
  const radarData = [
    { category: 'Mood\n(Quiz)', value: quiz?.categoryScores?.find(c => c.id === 'mood')?.pct || 0 },
    { category: 'Anxiety\n(Quiz)', value: quiz?.categoryScores?.find(c => c.id === 'anxiety')?.pct || 0 },
    { category: 'Sleep', value: quiz?.categoryScores?.find(c => c.id === 'sleep')?.pct || 0 },
    { category: 'Focus', value: quiz?.categoryScores?.find(c => c.id === 'focus')?.pct || 0 },
    { category: 'Emotion\nWords', value: (emotionWords?.score || 0) * 10 },
    { category: 'Reaction\nTime', value: Math.max(0, (2 - (reactionTime?.score || 0)) * 20) },
  ];

  // Activity scores bar
  const activityData = [
    { name: 'Color', score: moodColor?.score || 0, fill: '#8b5cf6' },
    { name: 'Mixer', score: moodMixer?.score || 0, fill: '#a855f7' },
    { name: 'Words', score: emotionWords?.score || 0, fill: '#3b82f6' },
    { name: 'Sorter', score: feelingSorter?.score || 0, fill: '#06b6d4' },
    { name: 'Reaction', score: Math.max(0, 5 - (reactionTime?.score || 0)), fill: '#10b981' },
    { name: 'Catcher', score: focusCatcher?.score || 0, fill: '#22c55e' },
    { name: 'Memory', score: Math.max(0, 5 - (memoryPattern?.score || 0)), fill: '#f59e0b' },
    { name: 'Path', score: pathfinder?.score || 0, fill: '#06b6d4' },
    { name: 'Quiz', score: Math.round((quiz?.pct || 0) / 10), fill: '#ef4444' },
    { name: 'Scenarios', score: Math.round((scenarioCards?.pct || 0) / 10), fill: '#ec4899' },
  ];

  const handleSave = async () => {
    setSaving(true);
    
    const screeningPayload = {
      moodColorScore: moodColor,
      moodMixerScore: moodMixer,
      emotionWordScore: emotionWords,
      feelingSorterScore: feelingSorter,
      reactionTimeScore: reactionTime,
      focusCatcherScore: focusCatcher,
      memoryPatternScore: memoryPattern,
      pathfinderScore: pathfinder,
      quizScore: quiz?.quizScore,
      quizScoreMax: quiz?.quizScoreMax,
      severityLevel: quiz?.severityLevel,
      categoryScores: quiz?.categoryScores,
      freeText: quiz?.freeText,
      scenarioCardsScore: scenarioCards,
      mlPrediction: mlResult?.prediction,
      mlConfidence: mlResult?.confidence,
      mlExplanation: mlResult?.explanation,
      overallRiskLevel: risk.level,
      compositeScore: risk.pct,
    };

    try {
      const recRes = await fetch('/api/recommendation/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screeningPayload),
      });
      if (recRes.ok) {
        const recData = await recRes.json();
        screeningPayload.recommendation = recData?.recommendation || recData;
        setRecommendationText(screeningPayload.recommendation);
      }
    } catch (error) {
      console.error("Failed to fetch recommendation:", error);
    }

    const ok = await onSave(screeningPayload);
    setSaving(false);
    if (ok) {
      setSaved(true);
      showToast({
        title: 'Screening saved',
        description: 'Your screening result has been saved and shared with your doctor.',
        type: 'success',
      });
    }
  };

  const handleExport = async () => {
    if (!userInfo?.universityId?.trim()) {
      showToast({
        title: 'University ID required',
        description: 'Please enter your university ID before exporting the PDF report.',
        type: 'warning',
        duration: 3600,
      });
      return;
    }

    try {
      setExporting(true);
      await exportScreeningToPdf({
        reportElement: reportRef.current,
        userInfo,
        data,
        risk,
        recommendation: recommendationText,
      });
      showToast({
        title: 'PDF exported',
        description: 'Your screening report has been downloaded successfully.',
        type: 'success',
      });
    } catch (error) {
      console.error('Export failed:', error);
      showToast({
        title: 'Export failed',
        description: 'Could not generate the PDF report. Please try again.',
        type: 'warning',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto" ref={reportRef} id="screening-report-root">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Screening Results</h2>
        <p className="text-gray-500">Comprehensive mental health assessment summary</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Identity</h3>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Name</p>
            <p className="font-medium text-slate-700">{userInfo?.name || 'N/A'}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Email</p>
            <p className="font-medium text-slate-700 break-all">{userInfo?.email || 'N/A'}</p>
          </div>
          <label className="rounded-lg bg-slate-50 p-3 block">
            <p className="text-xs text-slate-500 mb-1">University ID</p>
            <input
              value={userInfo?.universityId || ''}
              onChange={(event) => onUniversityIdChange(event.target.value)}
              placeholder="Enter university ID"
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </label>
        </div>
      </div>

      {/* Overall Risk Badge */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Overall Risk Assessment</p>
        <div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-bold text-xl"
          style={{ backgroundColor: risk.color }}
        >
          {risk.level === 'Low' ? '😊' : risk.level === 'Moderate' ? '🙂' : risk.level === 'High' ? '😐' : '😔'}
          <span>{risk.level} Risk</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Composite score: {risk.pct}%</p>
      </div>

      {/* Gauge + Radar Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Radial Gauge */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaBrain className="text-purple-500" /> Overall Severity
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart
              innerRadius="60%"
              outerRadius="90%"
              data={[{ value: risk.pct, fill: risk.color }]}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#f1f5f9' }} />
              <text x="50%" y="55%" textAnchor="middle" className="text-3xl font-bold" fill="#1e293b">
                {risk.pct}%
              </text>
              <text x="50%" y="68%" textAnchor="middle" className="text-sm" fill="#94a3b8">
                {quiz?.severityLevel || risk.level}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaGamepad className="text-blue-500" /> Category Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Score Bars */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity Scores (higher = more concern)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={activityData} layout="vertical">
            <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {activityData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activities Detail Row — Original */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Color */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <FaPalette className="text-purple-400" /> Mood Colors
          </h4>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white shadow" style={{ backgroundColor: moodColor?.currentColor }} />
            <span className="text-gray-300">→</span>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow" style={{ backgroundColor: moodColor?.desiredColor }} />
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">Distress gap: {moodColor?.distressGap?.toFixed(1)}/7</p>
        </div>

        {/* Words */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            💭 Emotion Words
          </h4>
          <div className="flex flex-wrap gap-1 justify-center">
            {(emotionWords?.selectedWords || []).slice(0, 6).map((w) => (
              <span key={w} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{w}</span>
            ))}
            {(emotionWords?.selectedWords?.length || 0) > 6 && (
              <span className="text-[10px] text-gray-400">+{emotionWords.selectedWords.length - 6}</span>
            )}
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">Weight: {emotionWords?.totalWeight}</p>
        </div>

        {/* Reaction */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <FaClock className="text-green-400" /> Reaction Time
          </h4>
          <p className="text-xl font-bold text-center text-gray-700">{reactionTime?.avgTime}ms</p>
          <p className="text-xs text-center text-gray-400">
            Variability: {reactionTime?.stdDev}ms | False: {reactionTime?.falseStarts}
          </p>
        </div>

        {/* Memory */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <FaPuzzlePiece className="text-yellow-400" /> Memory
          </h4>
          <p className="text-xl font-bold text-center text-gray-700">{memoryPattern?.maxSequence} tiles</p>
          <p className="text-xs text-center text-gray-400">
            Errors: {memoryPattern?.errors} | Hesitation: {memoryPattern?.avgHesitation}ms
          </p>
        </div>
      </div>

      {/* Activities Detail Row — New Games */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">🎮 Interactive Game Activities</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Mood Mixer */}
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-lg">🧪</p>
            <p className="text-xs font-semibold text-gray-600">Mood Mixer</p>
            <p className="text-sm font-bold text-purple-600 mt-1">{moodMixer?.drops?.length || 0} drops</p>
            <p className="text-[10px] text-gray-400">Score: {moodMixer?.score ?? 'N/A'}/10</p>
          </div>

          {/* Feeling Sorter */}
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-lg">🎒</p>
            <p className="text-xs font-semibold text-gray-600">Feeling Sorter</p>
            <p className="text-sm font-bold text-blue-600 mt-1">{feelingSorter?.backpackCount || 0} kept</p>
            <p className="text-[10px] text-gray-400">Avg: {feelingSorter?.avgDecisionTime || 0}ms</p>
          </div>

          {/* Focus Catcher */}
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-lg">🎯</p>
            <p className="text-xs font-semibold text-gray-600">Focus Catcher</p>
            <p className="text-sm font-bold text-green-600 mt-1">{focusCatcher?.goodCaught || 0} caught</p>
            <p className="text-[10px] text-gray-400">Distractions: {focusCatcher?.badCaught || 0}</p>
          </div>

          {/* Pathfinder */}
          <div className="bg-cyan-50 rounded-xl p-3 text-center">
            <p className="text-lg">🗺️</p>
            <p className="text-xs font-semibold text-gray-600">Pathfinder</p>
            <p className="text-sm font-bold text-cyan-600 mt-1">Lvl {pathfinder?.maxLevel || 0}</p>
            <p className="text-[10px] text-gray-400">Errors: {pathfinder?.totalErrors || 0}</p>
          </div>

          {/* Scenario Cards */}
          <div className="bg-indigo-50 rounded-xl p-3 text-center">
            <p className="text-lg">🃏</p>
            <p className="text-xs font-semibold text-gray-600">Scenario Cards</p>
            <p className="text-sm font-bold text-indigo-600 mt-1">{scenarioCards?.severityLevel || 'N/A'}</p>
            <p className="text-[10px] text-gray-400">Score: {scenarioCards?.quizScore || 0}/{scenarioCards?.quizScoreMax || 60}</p>
          </div>
        </div>
      </div>

      {/* Quiz Category Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaClipboardList className="text-indigo-500" /> Quiz Category Scores
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(quiz?.categoryScores || []).map((cat) => (
            <div key={cat.id} className="text-center">
              <p className="text-xs text-gray-500 mb-1">{cat.label}</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.pct}%`,
                    backgroundColor: cat.pct <= 33 ? '#22c55e' : cat.pct <= 66 ? '#eab308' : '#ef4444',
                  }}
                />
              </div>
              <p className="text-xs font-mono text-gray-600">{cat.score}/{cat.max} ({cat.pct}%)</p>
            </div>
          ))}
        </div>
      </div>

      {/* ML Analysis Section */}
      {quiz?.freeText && quiz.freeText.length >= 20 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">AI Text Analysis (LIME)</h3>
          {mlLoading ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <FaSpinner className="animate-spin text-purple-500 text-2xl mx-auto mb-2" />
              <p className="text-sm text-gray-500">Analyzing your text with AI...</p>
            </div>
          ) : mlResult ? (
            <div className="space-y-6">
              <PredictionResult prediction={mlResult.prediction} confidence={mlResult.confidence} allProbabilities={mlResult.all_probabilities} />
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <LimeColorGradient text={quiz.freeText} explanation={mlResult.explanation} />
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5" style={{ height: 450 }}>
                <WordPlot3D explanation={mlResult.explanation} text={quiz.freeText} prediction={mlResult.prediction} confidence={mlResult.confidence} />
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-xl p-4 text-center text-sm text-yellow-700">
              ML service unavailable. The LIME analysis requires the Flask server to be running.
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="text-center mt-8 mb-12">
        <div className="inline-flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-500 transition disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saved ? 'Saved' : 'Save & Share with Doctor'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-rose-500 transition disabled:opacity-50 inline-flex items-center gap-2"
          >
            {exporting ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreeningResults;
