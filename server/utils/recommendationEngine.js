function generateRecommendation(screeningData) {
  const labels = new Set();
  const rationale = [];
  
  const {
    moodColorScore,
    emotionWordScore,
    reactionTimeScore,
    memoryPatternScore,
    quizScore,
    quizScoreMax,
    severityLevel,
    categoryScores,
    freeText,
    mlPrediction,
    mlConfidence,
    overallRiskLevel,
    compositeScore
  } = screeningData;

  // Helper to find category % safely
  const getCategoryPct = (catId) => {
    if (!categoryScores) return 0;
    const cat = categoryScores.find(c => c.id === catId);
    return cat ? cat.pct : 0;
  };

  const moodPct = getCategoryPct('mood');
  const anxietyPct = getCategoryPct('anxiety');
  const sleepPct = getCategoryPct('sleep');
  const focusPct = getCategoryPct('focus');

  // Trigger: Depressive-like
  if (moodPct > 50 || (moodColorScore && moodColorScore.score >= 7) || (emotionWordScore && emotionWordScore.score >= 7)) {
    labels.add("Depressive-like");
    rationale.push("Elevated markers for low mood indicated by quiz or visual activity scores.");
  }

  // Trigger: Anxiety-like
  if (anxietyPct > 50 || (reactionTimeScore && reactionTimeScore.falseStarts >= 3)) {
    labels.add("Anxiety-like");
    rationale.push("Elevated markers for anxiety indicated by quiz or reaction false starts.");
  }

  // Trigger: Sleep/Energy
  if (sleepPct > 50) {
    labels.add("Sleep/Energy issues");
    rationale.push("Reported difficulties with sleep quality or energy levels.");
  }

  // Trigger: Focus/Function impairment
  if (focusPct > 50 || (memoryPatternScore && (memoryPatternScore.errors >= 3 || memoryPatternScore.avgHesitation > 2000))) {
    labels.add("Focus/Function impairment");
    rationale.push("Potential concentration or memory fatigue detected during cognitive tasks.");
  }

  // Trigger: Panic-like
  if (reactionTimeScore && reactionTimeScore.stdDev > 150 && anxietyPct > 60) {
    labels.add("Panic-like");
    rationale.push("Highly variable reaction times mixed with self-reported anxiety suggests acute stress or panic symptoms.");
  }

  // Determine Severity and Urgency
  let severity = overallRiskLevel || "Moderate"; // Default to Moderate if missing
  let urgencyWindow = "next 2 weeks";
  let crisisGuidance = null;
  let recommendedDoctorType = "";

  const compScore = compositeScore || 0;

  if (compScore >= 76 || mlPrediction?.toLowerCase()?.includes("suicidal")) {
    severity = "Critical";
    urgencyWindow = "today/24–72h";
    crisisGuidance = "CRISIS ALERT: Please reach out to emergency services or an urgent crisis line immediately.";
    rationale.push("Critical distress levels detected requiring immediate attention.");
  } else if (compScore >= 51 || labels.has("Panic-like")) {
    severity = "High";
    urgencyWindow = "this week";
    rationale.push("High distress indicated. Prompt follow-up recommended this week.");
  } else if (compScore >= 26) {
    severity = "Moderate";
    urgencyWindow = "next 2 weeks";
    rationale.push("Moderate symptoms present. Suggest scheduling a consultation to review.");
  } else {
    severity = "Low";
    urgencyWindow = "optional/monitor";
    rationale.push("Metrics show general wellness or mild stress. Monitoring is sufficient.");
  }

  // Care Path Recommendation
  if (severity === "Critical" || severity === "High" || labels.has("Panic-like")) {
    recommendedDoctorType = "Psychiatrist";
    rationale.push("Recommending a Psychiatrist for higher-tier diagnostic evaluation and potential medical intervention.");
  } else if (severity === "Moderate" && (labels.has("Depressive-like") || labels.has("Anxiety-like") || labels.has("Focus/Function impairment"))) {
    recommendedDoctorType = "Counseling Psychology";
    rationale.push("Recommending a Counselor / Psychologist for therapeutic support and coping strategies.");
  } else {
    recommendedDoctorType = "General Medicine";
    rationale.push("Recommending General Medicine initially to clear any physical causes for sleep/energy symptoms or mild distress.");
  }

  // ML text auxiliary output
  let optionalMlSummary = null;
  if (mlPrediction) {
    optionalMlSummary = `ML Text Analysis detected signs of ${mlPrediction} with ${mlConfidence} certainty based on free-text input.`;
  }

  return {
    labels: Array.from(labels),
    severity,
    urgencyWindow,
    recommendedDoctorType,
    rationale,
    optionalMlSummary,
    crisisGuidance
  };
}

module.exports = {
  generateRecommendation
};
