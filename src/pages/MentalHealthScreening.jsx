import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodColorPicker from '../components/screening/MoodColorPicker';
import MoodMixer from '../components/screening/MoodMixer';
import EmotionWordCloud from '../components/screening/EmotionWordCloud';
import FeelingSorter from '../components/screening/FeelingSorter';
import ReactionTimeTest from '../components/screening/ReactionTimeTest';
import FocusCatcher from '../components/screening/FocusCatcher';
import MemoryPatternGame from '../components/screening/MemoryPatternGame';
import PathfinderMaze from '../components/screening/PathfinderMaze';
import FreeTextAndQuiz from '../components/screening/FreeTextAndQuiz';
import ScenarioCards from '../components/screening/ScenarioCards';
import ScreeningResults from '../components/screening/ScreeningResults';
import { useToast } from '../components/ui/ToastProvider';

const STEPS = [
  { id: 'color', label: 'Mood Colors', icon: '🎨' },
  { id: 'mixer', label: 'Mood Mixer', icon: '🧪' },
  { id: 'words', label: 'Emotion Words', icon: '💭' },
  { id: 'sorter', label: 'Feeling Sorter', icon: '🎒' },
  { id: 'reaction', label: 'Reaction Test', icon: '⚡' },
  { id: 'catcher', label: 'Focus Catcher', icon: '🎯' },
  { id: 'memory', label: 'Memory Game', icon: '🧠' },
  { id: 'pathfinder', label: 'Pathfinder', icon: '🗺️' },
  { id: 'quiz', label: 'Quiz & Text', icon: '📋' },
  { id: 'scenarios', label: 'Scenario Cards', icon: '🃏' },
  { id: 'results', label: 'Results', icon: '📊' },
];

const STEP_INTROS = {
  color: {
    title: 'Round 1A: Mood Color Quest',
    description: 'Pick your current and target mood colors to start your screening game journey.',
  },
  mixer: {
    title: 'Round 1B: Mood Mixer',
    description: 'Drop feeling orbs into the beaker to create your emotional potion.',
  },
  words: {
    title: 'Round 2A: Emotion Word Match',
    description: 'Tap words that best match your emotional state. Up to 10 words this round.',
  },
  sorter: {
    title: 'Round 2B: Feeling Sorter',
    description: 'Sort emotion cards — keep the ones that resonate, discard the rest.',
  },
  reaction: {
    title: 'Round 3A: Reflex Challenge',
    description: 'Wait for green and click fast. Avoid false starts to keep your score clean.',
  },
  catcher: {
    title: 'Round 3B: Focus Catcher',
    description: 'Catch focus tokens and dodge distractions in this attention challenge.',
  },
  memory: {
    title: 'Round 4A: Memory Sequence',
    description: 'Memorize and replay tile patterns. Each round gets more difficult.',
  },
  pathfinder: {
    title: 'Round 4B: Pathfinder Maze',
    description: 'Memorize a hidden path on the grid and trace it from memory.',
  },
  quiz: {
    title: 'Round 5A: Quiz & Story Mode',
    description: 'Complete the questionnaire and share your thoughts for AI-assisted analysis.',
  },
  scenarios: {
    title: 'Round 5B: Scenario Cards',
    description: 'Rate how often relatable daily scenarios apply to your recent experience.',
  },
  results: {
    title: 'Final Round: Insight Board',
    description: 'Review your full profile, then save and export your PDF report.',
  },
};

function getCompletionToast(stepId, result) {
  switch (stepId) {
    case 'moodColor':
      return {
        title: 'Mood Color Activity Complete',
        description: `Distress gap: ${result?.distressGap ?? 0}/7.`,
      };
    case 'moodMixer':
      return {
        title: 'Mood Mixer Complete',
        description: `You blended ${result?.drops?.length ?? 0} feelings into your potion.`,
      };
    case 'emotionWords':
      return {
        title: 'Emotion Word Activity Complete',
        description: `${result?.selectedWords?.length ?? 0} words selected.`,
      };
    case 'feelingSorter':
      return {
        title: 'Feeling Sorter Complete',
        description: `Kept ${result?.backpackCount ?? 0} emotions. Avg decision: ${result?.avgDecisionTime ?? 0}ms.`,
      };
    case 'reactionTime':
      return {
        title: 'Reaction Test Complete',
        description: `Average response: ${result?.avgTime ?? 0}ms.`,
      };
    case 'focusCatcher':
      return {
        title: 'Focus Catcher Complete',
        description: `Caught ${result?.goodCaught ?? 0} tokens. Score: ${result?.totalPoints ?? 0}.`,
      };
    case 'memoryPattern':
      return {
        title: 'Memory Game Complete',
        description: `Max sequence reached: ${result?.maxSequence ?? 0} tiles.`,
      };
    case 'pathfinder':
      return {
        title: 'Pathfinder Complete',
        description: `Max level: ${result?.maxLevelName ?? 'N/A'} with ${result?.totalErrors ?? 0} errors.`,
      };
    case 'quiz':
      return {
        title: 'Quiz and Text Complete',
        description: `Severity level: ${result?.severityLevel || 'Not available'}.`,
      };
    case 'scenarioCards':
      return {
        title: 'Scenario Cards Complete',
        description: `Severity level: ${result?.severityLevel || 'Not available'}.`,
      };
    default:
      return {
        title: 'Activity Complete',
        description: 'Great progress. Moving to the next segment.',
      };
  }
}

const MentalHealthScreening = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    moodColor: null,
    moodMixer: null,
    emotionWords: null,
    feelingSorter: null,
    reactionTime: null,
    focusCatcher: null,
    memoryPattern: null,
    pathfinder: null,
    quiz: null,
    scenarioCards: null,
  });
  const navigate = useNavigate();
  const { showToast } = useToast();
  const shownIntroStepRef = useRef(-1);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [universityId, setUniversityId] = useState(
    user.universityId || user.uniId || user.studentId || ''
  );

  useEffect(() => {
    if (shownIntroStepRef.current === currentStep) return;
    const step = STEPS[currentStep];
    const intro = step ? STEP_INTROS[step.id] : null;
    if (!intro) return;

    shownIntroStepRef.current = currentStep;
    showToast({
      title: intro.title,
      description: intro.description,
      type: 'info',
      duration: 3500,
    });
  }, [currentStep, showToast]);

  const handleStepComplete = (stepId, result) => {
    const toastCopy = getCompletionToast(stepId, result);
    showToast({
      title: toastCopy.title,
      description: toastCopy.description,
      type: 'success',
      duration: 2600,
    });
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
          universityId,
          ...screeningData,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      return true;
    } catch (err) {
      console.error('Save error:', err);
      showToast({
        title: 'Save failed',
        description: 'Could not save screening data. Please confirm the server is running.',
        type: 'warning',
        duration: 3600,
      });
      return false;
    }
  };

  const progress = Math.round((currentStep / STEPS.length) * 100);

  // Visible stepper items — show groups of steps
  const stepGroups = [
    { label: 'Mood', steps: [0, 1], icon: '🎨', color: 'purple' },
    { label: 'Emotions', steps: [2, 3], icon: '💭', color: 'blue' },
    { label: 'Reflex', steps: [4, 5], icon: '⚡', color: 'green' },
    { label: 'Memory', steps: [6, 7], icon: '🧠', color: 'yellow' },
    { label: 'Assessment', steps: [8, 9], icon: '📋', color: 'indigo' },
    { label: 'Results', steps: [10], icon: '📊', color: 'rose' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mental Health Screening</h1>
              <p className="text-xs text-gray-500">Pre-appointment assessment • 10 interactive activities</p>
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

      {/* Stepper — Grouped */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-2">
          {stepGroups.map((group, gi) => {
            const groupDone = group.steps.every(s => s < currentStep);
            const groupActive = group.steps.some(s => s === currentStep);
            const subStep = group.steps.length > 1
              ? (groupActive ? `${group.steps.indexOf(currentStep) + 1}/${group.steps.length}` : '')
              : '';

            return (
              <div key={group.label} className="flex items-center">
                <div
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    groupDone
                      ? 'bg-green-100 text-green-700'
                      : groupActive
                      ? `bg-purple-100 text-purple-700 ring-2 ring-purple-300`
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{groupDone ? '✓' : group.icon}</span>
                    <span className="hidden sm:inline">{group.label}</span>
                  </div>
                  {subStep && (
                    <span className="text-[9px] opacity-70">{subStep}</span>
                  )}
                </div>
                {gi < stepGroups.length - 1 && (
                  <div className={`w-4 md:w-8 h-0.5 mx-1 ${groupDone ? 'bg-green-300' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-[10px] text-gray-400 mt-1">
          Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep]?.label}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        {currentStep === 0 && (
          <MoodColorPicker onComplete={(r) => handleStepComplete('moodColor', r)} />
        )}
        {currentStep === 1 && (
          <MoodMixer onComplete={(r) => handleStepComplete('moodMixer', r)} />
        )}
        {currentStep === 2 && (
          <EmotionWordCloud onComplete={(r) => handleStepComplete('emotionWords', r)} />
        )}
        {currentStep === 3 && (
          <FeelingSorter onComplete={(r) => handleStepComplete('feelingSorter', r)} />
        )}
        {currentStep === 4 && (
          <ReactionTimeTest onComplete={(r) => handleStepComplete('reactionTime', r)} />
        )}
        {currentStep === 5 && (
          <FocusCatcher onComplete={(r) => handleStepComplete('focusCatcher', r)} />
        )}
        {currentStep === 6 && (
          <MemoryPatternGame onComplete={(r) => handleStepComplete('memoryPattern', r)} />
        )}
        {currentStep === 7 && (
          <PathfinderMaze onComplete={(r) => handleStepComplete('pathfinder', r)} />
        )}
        {currentStep === 8 && (
          <FreeTextAndQuiz onComplete={(r) => handleStepComplete('quiz', r)} />
        )}
        {currentStep === 9 && (
          <ScenarioCards onComplete={(r) => handleStepComplete('scenarioCards', r)} />
        )}
        {currentStep === 10 && (
          <ScreeningResults
            data={data}
            onSave={handleSave}
            userInfo={{
              name: user.name || 'Student',
              email: user.email || '',
              universityId,
            }}
            onUniversityIdChange={setUniversityId}
          />
        )}
      </div>
    </div>
  );
};

export default MentalHealthScreening;
