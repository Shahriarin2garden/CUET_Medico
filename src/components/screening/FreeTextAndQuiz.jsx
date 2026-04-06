import { useState } from 'react';

const CATEGORIES = [
  {
    id: 'mood', label: 'Mood', emoji: '😔',
    questions: [
      'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?',
      'How often have you felt little interest or pleasure in doing things you usually enjoy?',
      'How often have you felt worthless or like a burden to others?',
    ],
  },
  {
    id: 'anxiety', label: 'Anxiety', emoji: '😰',
    questions: [
      'How often have you felt nervous, anxious, or on edge?',
      'How often have you felt unable to stop or control worrying?',
      'How often have you experienced sudden feelings of panic or dread?',
    ],
  },
  {
    id: 'sleep', label: 'Sleep & Energy', emoji: '😴',
    questions: [
      'How often have you had trouble falling or staying asleep, or slept too much?',
      'How often have you felt tired or had little energy throughout the day?',
    ],
  },
  {
    id: 'focus', label: 'Focus & Daily Life', emoji: '🧠',
    questions: [
      'How often have you had difficulty concentrating on studying or daily tasks?',
      'How often have you withdrawn from friends, family, or activities you care about?',
    ],
  },
];

const OPTIONS = [
  { label: 'Not at all', score: 0, emoji: '🟢' },
  { label: 'Several days', score: 1, emoji: '🟡' },
  { label: 'More than half the days', score: 2, emoji: '🟠' },
  { label: 'Nearly every day', score: 3, emoji: '🔴' },
];

const ALL_QUESTIONS = CATEGORIES.flatMap((cat) =>
  cat.questions.map((q) => ({ question: q, categoryId: cat.id }))
);
const MAX_SCORE = ALL_QUESTIONS.length * 3;

function getSeverity(pct) {
  if (pct <= 20) return 'Minimal';
  if (pct <= 45) return 'Mild';
  if (pct <= 70) return 'Moderate';
  return 'Severe';
}

const FreeTextAndQuiz = ({ onComplete }) => {
  const [subPhase, setSubPhase] = useState('quiz'); // quiz | text
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [freeText, setFreeText] = useState('');

  // Quiz data computed when quiz is done
  const [quizData, setQuizData] = useState(null);

  const handleAnswer = (optionScore) => {
    setSelected(optionScore);
    setTimeout(() => {
      const newAnswers = [...answers, { questionIndex: currentQ, score: optionScore, categoryId: ALL_QUESTIONS[currentQ].categoryId }];
      setAnswers(newAnswers);
      setSelected(null);

      if (currentQ + 1 >= ALL_QUESTIONS.length) {
        // Quiz done — compute scores
        const totalScore = newAnswers.reduce((s, a) => s + a.score, 0);
        const pct = Math.round((totalScore / MAX_SCORE) * 100);
        const categoryScores = CATEGORIES.map((cat) => {
          const catAnswers = newAnswers.filter((a) => a.categoryId === cat.id);
          const catScore = catAnswers.reduce((s, a) => s + a.score, 0);
          const catMax = cat.questions.length * 3;
          return { id: cat.id, label: cat.label, score: catScore, max: catMax, pct: Math.round((catScore / catMax) * 100) };
        });
        setQuizData({ quizScore: totalScore, quizScoreMax: MAX_SCORE, severityLevel: getSeverity(pct), categoryScores, pct });
        setSubPhase('text');
      } else {
        setCurrentQ(currentQ + 1);
      }
    }, 300);
  };

  const handleSubmit = () => {
    onComplete({
      ...quizData,
      freeText: freeText.trim(),
    });
  };

  const progress = Math.round((currentQ / ALL_QUESTIONS.length) * 100);
  const currentCat = CATEGORIES.find((c) => c.id === ALL_QUESTIONS[currentQ]?.categoryId);
  const experiencePoints = answers.length * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {subPhase === 'quiz' && (
        <div>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              🎮 Round 5: Clinical Questionnaire Mode
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Mental Health Assessment Mission
            </h2>
            <p className="text-gray-500 text-sm">Based on PHQ-9 & GAD-7 clinical scales</p>
            <p className="text-xs text-gray-400 mt-1">XP earned: {experiencePoints}</p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{currentCat?.emoji} {currentCat?.label}</span>
              <span>{currentQ + 1} / {ALL_QUESTIONS.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <p className="text-lg font-medium text-gray-800 mb-6">
              {ALL_QUESTIONS[currentQ].question}
            </p>
            <p className="text-xs text-gray-400 mb-4">Checkpoint: answer carefully to unlock your final insight board.</p>
            <div className="space-y-3">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  onClick={() => handleAnswer(opt.score)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selected === opt.score
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="font-medium text-gray-700">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {subPhase === 'text' && (
        <div>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              🎮 Story Mode: Express Yourself
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              In your own words...
            </h2>
            <p className="text-gray-500 text-sm">
              Describe how you've been feeling. This will be analyzed by our AI for deeper insights.
            </p>
          </div>

          {/* Quiz summary badge */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">
              {quizData.severityLevel === 'Minimal' ? '😊' : quizData.severityLevel === 'Mild' ? '🙂' : quizData.severityLevel === 'Moderate' ? '😐' : '😔'}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Quiz Score: {quizData.quizScore}/{quizData.quizScoreMax} — <span className="font-bold">{quizData.severityLevel}</span>
              </p>
              <p className="text-xs text-gray-400">Questionnaire completed</p>
            </div>
          </div>

          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="I've been feeling... (Write at least 20 characters for AI analysis)"
            rows={5}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none text-gray-700 mb-4"
          />

          <p className="text-xs text-gray-400 mb-4">
            {freeText.length < 20
              ? `${20 - freeText.length} more characters needed for AI analysis`
              : '✓ Ready for AI analysis'}
          </p>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-500 transition"
            >
              See My Results →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeTextAndQuiz;
