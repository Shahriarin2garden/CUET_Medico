import { useState, useRef, useEffect } from 'react';

const COLORS = [
  // Row 1: Reds/warm
  '#ff0000', '#ff3333', '#ff6666', '#ff4500', '#ff6347', '#ff7f50', '#ff8c00', '#ffa500',
  // Row 2: Yellows/greens
  '#ffd700', '#ffff00', '#adff2f', '#7cfc00', '#00ff00', '#32cd32', '#228b22', '#006400',
  // Row 3: Cyans/blues
  '#00ffff', '#00ced1', '#1e90ff', '#4169e1', '#0000ff', '#0000cd', '#00008b', '#191970',
  // Row 4: Purples/pinks
  '#9370db', '#8b5cf6', '#7b2d8b', '#800080', '#ff69b4', '#ff1493', '#c71585', '#8b0000',
  // Row 5: Neutrals
  '#ffffff', '#f5f5f5', '#d3d3d3', '#a9a9a9', '#808080', '#696969', '#333333', '#000000',
];

// Color psychology: map hue + brightness to a mood indicator
function analyzeColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const brightness = (r + g + b) / 3;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  let hue = 0;
  if (max !== min) {
    if (max === r) hue = ((g - b) / (max - min)) % 6;
    else if (max === g) hue = (b - r) / (max - min) + 2;
    else hue = (r - g) / (max - min) + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }

  return { hue, saturation, brightness };
}

function colorDistance(hex1, hex2) {
  const c1 = analyzeColor(hex1);
  const c2 = analyzeColor(hex2);
  const hueDiff = Math.min(Math.abs(c1.hue - c2.hue), 360 - Math.abs(c1.hue - c2.hue)) / 180;
  const satDiff = Math.abs(c1.saturation - c2.saturation);
  const brightDiff = Math.abs(c1.brightness - c2.brightness);
  return Math.sqrt(hueDiff ** 2 + satDiff ** 2 + brightDiff ** 2);
}

function computeScore(current, desired) {
  if (!current || !desired) return { score: 5, distressGap: 0 };
  const dist = colorDistance(current, desired);
  const currentAnalysis = analyzeColor(current);

  // Dark colors = depression indicator
  let darknessPenalty = currentAnalysis.brightness < 0.2 ? 3 : currentAnalysis.brightness < 0.4 ? 1 : 0;
  // Low saturation + low brightness = emotional numbness
  if (currentAnalysis.saturation < 0.2 && currentAnalysis.brightness < 0.5) darknessPenalty += 1;

  const distressGap = Math.min(dist * 7, 7);
  const score = Math.min(Math.round(distressGap + darknessPenalty), 10);
  return { score, distressGap: Math.round(distressGap * 10) / 10 };
}

function getMoodLabel(hex) {
  if (!hex) return '';
  const { hue, saturation, brightness } = analyzeColor(hex);
  if (brightness < 0.15) return 'Very dark — may indicate sadness or hopelessness';
  if (brightness > 0.9 && saturation < 0.1) return 'Bright neutral — openness or emptiness';
  if (hue >= 0 && hue < 30) return 'Red — energy, anger, or passion';
  if (hue >= 30 && hue < 70) return 'Orange/Yellow — warmth, anxiety, or hope';
  if (hue >= 70 && hue < 170) return 'Green — balance, calm, or growth';
  if (hue >= 170 && hue < 260) return 'Blue — sadness, calm, or introspection';
  if (hue >= 260 && hue < 330) return 'Purple — creativity, confusion, or spirituality';
  return 'Pink/Red — love, excitement, or agitation';
}

const MoodColorPicker = ({ onComplete }) => {
  const [phase, setPhase] = useState('current'); // 'current' | 'desired' | 'done'
  const [currentColor, setCurrentColor] = useState(null);
  const [desiredColor, setDesiredColor] = useState(null);
  const missionProgress = phase === 'current' ? 50 : phase === 'desired' ? 85 : 100;

  const handlePick = (color) => {
    if (phase === 'current') {
      setCurrentColor(color);
    } else if (phase === 'desired') {
      setDesiredColor(color);
    }
  };

  const handleNext = () => {
    if (phase === 'current' && currentColor) {
      setPhase('desired');
    } else if (phase === 'desired' && desiredColor) {
      setPhase('done');
      const result = computeScore(currentColor, desiredColor);
      setTimeout(() => {
        onComplete({
          currentColor,
          desiredColor,
          ...result,
        });
      }, 700);
    }
  };

  const selectedColor = phase === 'current' ? currentColor : desiredColor;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          🎮 Round 1: Mood Color Activity
        </div>
        <div className="w-full max-w-sm mx-auto bg-slate-200 rounded-full h-2 mb-4">
          <div
            className="h-2 rounded-full bg-purple-500 transition-all duration-500"
            style={{ width: `${missionProgress}%` }}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {phase === 'current'
            ? 'Mission 1: Pick the color that matches how you feel RIGHT NOW'
            : phase === 'desired'
            ? 'Mission 2: Pick the color that represents how you WANT to feel'
            : 'Round Complete! Color Analysis Ready'}
        </h2>
        <p className="text-gray-500 text-sm">
          {phase !== 'done' ? 'Trust your instinct. Every pick gives insight points.' : 'Preparing next activity...'}
        </p>
      </div>

      {phase !== 'done' && (
        <>
          {/* Color Grid */}
          <div className="grid grid-cols-8 gap-2 mb-6 max-w-md mx-auto">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handlePick(color)}
                className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                  selectedColor === color
                    ? 'border-gray-800 scale-110 ring-2 ring-purple-400 ring-offset-2'
                    : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Selected color preview */}
          {selectedColor && (
            <div className="text-center mb-6">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-white shadow-lg"
                style={{ backgroundColor: selectedColor }}
              />
              <p className="text-xs text-gray-500">{getMoodLabel(selectedColor)}</p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleNext}
              disabled={!selectedColor}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-40 hover:bg-purple-500 transition"
            >
              {phase === 'current' ? 'Next →' : 'See Results →'}
            </button>
          </div>
        </>
      )}

      {/* Results preview */}
      {phase === 'done' && (
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">How you feel</p>
            <div
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto"
              style={{ backgroundColor: currentColor }}
            />
            <p className="text-xs text-gray-400 mt-2 max-w-[140px]">{getMoodLabel(currentColor)}</p>
          </div>
          <div className="text-3xl text-gray-300">→</div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">How you want to feel</p>
            <div
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto"
              style={{ backgroundColor: desiredColor }}
            />
            <p className="text-xs text-gray-400 mt-2 max-w-[140px]">{getMoodLabel(desiredColor)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodColorPicker;
