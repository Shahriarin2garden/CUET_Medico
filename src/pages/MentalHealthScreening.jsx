import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodColorPicker from '../components/screening/MoodColorPicker';
import EmotionWordCloud from '../components/screening/EmotionWordCloud';
import ReactionTimeTest from '../components/screening/ReactionTimeTest';
import MemoryPatternGame from '../components/screening/MemoryPatternGame';
import FreeTextAndQuiz from '../components/screening/FreeTextAndQuiz';
import ScreeningResults from '../components/screening/ScreeningResults';

const STEPS = [
  { id: 'color', label: 'Mood Colors', icon: '🎨' },
  { id: 'words', label: 'Emotion Words', icon: '💭' },
  { id: 'reaction', label: 'Reaction Test', icon: '⚡' },
  { id: 'memory', label: 'Memory Game', icon: '🧠' },
  { id: 'quiz', label: 'Quiz & Text', icon: '📋' },
  { id: 'results', label: 'Results', icon: '📊' },
];

const MentalHealthScreening = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    moodColor: null,
    emotionWords: null,
    reactionTime: null,
    memoryPattern: null,
    quiz: null,
  });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleStepComplete = (stepId, result) => {
    setData((prev) => ({ ...prev, [stepId]: result }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleSave = async (screeningData) => {
    try {
      const res = await fetch('/api/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: user.email,
          studentName: user.name,
          ...screeningData,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      return true;
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save screening. Make sure the server is running.');
      return false;
    }
  };

  const progress = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mental Health Screening</h1>
              <p className="text-xs text-gray-500">Pre-appointment assessment</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i < currentStep
                    ? 'bg-green-100 text-green-700'
                    : i === currentStep
                    ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <span>{i < currentStep ? '✓' : step.icon}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-4 md:w-8 h-0.5 mx-1 ${i < currentStep ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        {currentStep === 0 && (
          <MoodColorPicker onComplete={(r) => handleStepComplete('moodColor', r)} />
        )}
        {currentStep === 1 && (
          <EmotionWordCloud onComplete={(r) => handleStepComplete('emotionWords', r)} />
        )}
        {currentStep === 2 && (
          <ReactionTimeTest onComplete={(r) => handleStepComplete('reactionTime', r)} />
        )}
        {currentStep === 3 && (
          <MemoryPatternGame onComplete={(r) => handleStepComplete('memoryPattern', r)} />
        )}
        {currentStep === 4 && (
          <FreeTextAndQuiz onComplete={(r) => handleStepComplete('quiz', r)} />
        )}
        {currentStep === 5 && (
          <ScreeningResults data={data} onSave={handleSave} />
        )}
      </div>
    </div>
  );
};

export default MentalHealthScreening;
