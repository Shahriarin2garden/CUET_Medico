import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line, Html } from "@react-three/drei";
import { motion } from "framer-motion";
import {
  FaMousePointer,
  FaSearchPlus,
  FaArrowsAlt,
  FaCircle,
  FaArrowUp,
  FaArrowDown,
  FaExpand,
} from "react-icons/fa";

/**
 * Animated sphere with always-visible word label, stem line, and hover detail.
 */
function WordSphere({ position, color, size, word, weight, showLabel }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        hovered ? 1.3 : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      );
    }
  });

  const [x, y, z] = position;
  const labelSize = Math.min(0.15, 0.08 + Math.abs(weight) * 0.5);

  return (
    <group>
      {/* Stem line from baseline (y=0) to sphere */}
      <Line
        points={[
          [x, 0, z],
          [x, y, z],
        ]}
        color={color}
        lineWidth={1.5}
        transparent
        opacity={0.4}
      />
      {/* Small dot at baseline */}
      <mesh position={[x, 0, z]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Main sphere */}
      <group position={position}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[size, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.4 : 0.15}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Always-visible word label */}
        {showLabel && (
          <Text
            position={[0, size + 0.12, 0]}
            fontSize={labelSize}
            color="white"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.015}
            outlineColor="#000000"
          >
            {word}
          </Text>
        )}

        {/* Hover detail */}
        {hovered && (
          <Html distanceFactor={5} style={{ pointerEvents: "none" }}>
            <div className="bg-slate-900 bg-opacity-95 border border-slate-600 rounded-lg px-3 py-2 text-center whitespace-nowrap">
              <p className="text-white text-xs font-bold">{word}</p>
              <p className="text-xs" style={{ color }}>
                Weight: {weight > 0 ? "+" : ""}{weight.toFixed(4)}
              </p>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

/**
 * Flow lines connecting sequential words to show text order.
 */
function FlowLines({ data }) {
  if (data.length < 2) return null;
  const points = data.map((d) => d.position);
  return (
    <Line
      points={points}
      color="#6366f1"
      lineWidth={1}
      transparent
      opacity={0.2}
      dashed
      dashSize={0.1}
      gapSize={0.08}
    />
  );
}

/**
 * Ground plane with color-coded risk zones at Y=0.
 */
function GroundPlane({ length }) {
  return (
    <group position={[length / 2, -0.01, 0.5]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length + 1, 3]} />
        <meshStandardMaterial
          color="#1e293b"
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Risk zone indicators */}
      <Text position={[-length / 2 - 0.2, 0.01, -1.2]} fontSize={0.08} color="#22c55e" rotation={[-Math.PI / 2, 0, 0]}>
        Safe Zone
      </Text>
      <Text position={[-length / 2 - 0.2, 0.01, 1.2]} fontSize={0.08} color="#ef4444" rotation={[-Math.PI / 2, 0, 0]}>
        Risk Zone
      </Text>
    </group>
  );
}

/**
 * Axis lines with tick marks and labels.
 */
function Axes({ length }) {
  const ticks = [-2, -1, 0, 1, 2];

  return (
    <group>
      {/* X axis - Word Position */}
      <Line points={[[-0.3, 0, 0], [length + 0.5, 0, 0]]} color="#64748b" lineWidth={1.5} />
      <Text position={[length + 0.8, 0, 0]} fontSize={0.12} color="#94a3b8">
        Word Order →
      </Text>

      {/* Y axis - LIME Weight */}
      <Line points={[[0, -2.5, 0], [0, 2.5, 0]]} color="#64748b" lineWidth={1.5} />
      <Text position={[0, 2.9, 0]} fontSize={0.12} color="#94a3b8">
        Importance ↑
      </Text>
      <Text position={[-0.6, 2.3, 0]} fontSize={0.09} color="#22c55e">
        + Supports
      </Text>
      <Text position={[-0.6, -2.3, 0]} fontSize={0.09} color="#ef4444">
        − Opposes
      </Text>

      {/* Y-axis tick marks */}
      {ticks.map((y) => (
        <group key={`tick-${y}`}>
          <Line points={[[-0.1, y, 0], [0.1, y, 0]]} color="#94a3b8" lineWidth={1} />
          <Text position={[-0.25, y, 0]} fontSize={0.07} color="#64748b" anchorX="right">
            {y}
          </Text>
          {/* Grid lines */}
          {y !== 0 && (
            <Line
              points={[[0, y, 0], [length, y, 0]]}
              color="#334155"
              lineWidth={0.5}
              transparent
              opacity={0.15}
            />
          )}
        </group>
      ))}

      {/* Z axis - Magnitude */}
      <Line points={[[0, 0, -0.3], [0, 0, 2.5]]} color="#64748b" lineWidth={1.5} />
      <Text position={[0, 0, 2.9]} fontSize={0.12} color="#94a3b8">
        Strength →
      </Text>

      {/* Zero baseline - dashed horizontal reference */}
      <Line
        points={[[0, 0, 0], [length, 0, 0]]}
        color="#475569"
        lineWidth={2}
        dashed
        dashSize={0.15}
        gapSize={0.1}
      />
    </group>
  );
}

/**
 * 3D summary overlay inside the canvas.
 */
function SummaryOverlay({ prediction, confidence, topPositive, topNegative }) {
  return (
    <Html position={[-1.5, 2.5, 0]} style={{ pointerEvents: "none" }}>
      <div className="bg-slate-900 bg-opacity-80 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 w-44 text-[10px]">
        {prediction && (
          <p className="text-purple-300 font-bold text-xs mb-1">{prediction} ({Math.round((confidence || 0) * 100)}%)</p>
        )}
        {topPositive.length > 0 && (
          <div className="mb-1">
            <p className="text-green-400 font-semibold">Key drivers:</p>
            {topPositive.map((w, i) => (
              <span key={i} className="text-white">{w.word}{i < topPositive.length - 1 ? ", " : ""}</span>
            ))}
          </div>
        )}
        {topNegative.length > 0 && (
          <div>
            <p className="text-red-400 font-semibold">Opposing:</p>
            {topNegative.map((w, i) => (
              <span key={i} className="text-white">{w.word}{i < topNegative.length - 1 ? ", " : ""}</span>
            ))}
          </div>
        )}
      </div>
    </Html>
  );
}

/**
 * 3D Word Plot scene content.
 */
function Scene({ explanation, prediction, confidence }) {
  const data = useMemo(() => {
    const maxAbs = Math.max(...explanation.map((e) => Math.abs(e.weight)), 0.001);
    const spacing = 0.55;

    return explanation.map((item, i) => {
      const normWeight = item.weight / maxAbs;
      return {
        word: item.word,
        weight: item.weight,
        position: [
          i * spacing,
          normWeight * 2,
          Math.abs(normWeight) * 1.5,
        ],
        color: normWeight >= 0 ? "#22c55e" : "#ef4444",
        size: 0.06 + Math.abs(normWeight) * 0.14,
      };
    });
  }, [explanation]);

  const stats = useMemo(() => {
    const sorted = [...explanation].sort((a, b) => b.weight - a.weight);
    return {
      topPositive: sorted.filter((e) => e.weight > 0).slice(0, 3),
      topNegative: sorted.filter((e) => e.weight < 0).slice(-3).reverse(),
    };
  }, [explanation]);

  const axisLength = explanation.length * 0.55;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#8b5cf6" />

      <OrbitControls
        enableZoom
        enablePan
        enableRotate
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={2}
        maxDistance={20}
      />

      <Axes length={axisLength} />
      <GroundPlane length={axisLength} />
      <FlowLines data={data} />

      <SummaryOverlay
        prediction={prediction}
        confidence={confidence}
        topPositive={stats.topPositive}
        topNegative={stats.topNegative}
      />

      {data.map((item, i) => (
        <WordSphere
          key={i}
          position={item.position}
          color={item.color}
          size={item.size}
          word={item.word}
          weight={item.weight}
          showLabel={true}
        />
      ))}
    </>
  );
}

const WordPlot3D = ({ explanation, text, prediction, confidence }) => {
  const [showGuide, setShowGuide] = useState(false);

  // Transform explanation data if needed
  const explanationData = useMemo(() => {
    if (!explanation || explanation.length === 0) return [];
    // Handle both array of arrays [[word, weight]] and array of objects [{word, weight}]
    return explanation.map((item) => {
      if (Array.isArray(item)) return { word: item[0], weight: item[1] };
      return item;
    });
  }, [explanation]);

  const cameraPos = useMemo(() => {
    const spread = explanationData.length * 0.55;
    return [spread / 2, 3.5, spread * 0.6 + 4];
  }, [explanationData]);

  const stats = useMemo(() => {
    const sorted = [...explanationData].sort((a, b) => b.weight - a.weight);
    return {
      topPositive: sorted.filter((e) => e.weight > 0).slice(0, 3),
      topNegative: sorted.filter((e) => e.weight < 0).slice(-3).reverse(),
    };
  }, [explanationData]);

  if (explanationData.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
        No word importance data available for 3D visualization.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6"
    >
      <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-2">
        3D Word Importance Plot
      </h3>
      <p className="text-slate-500 text-xs mb-4">
        Each word is plotted as a sphere — size and position show LIME importance. Drag to rotate, scroll to zoom.
      </p>

      <div className="w-full h-[450px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative">
        <Canvas
          camera={{
            position: cameraPos,
            fov: 50,
            near: 0.1,
            far: 100,
          }}
        >
          <Scene explanation={explanationData} prediction={prediction} confidence={confidence} />
        </Canvas>

        {/* Color legend overlay */}
        <div className="absolute bottom-3 left-3 flex gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-green-400">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Supports prediction
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Opposes prediction
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-5 h-0.5 bg-indigo-500 inline-block" style={{ borderStyle: 'dashed' }} /> Word flow
          </span>
        </div>
      </div>

      {/* Axis Legend */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="bg-slate-800 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">X Axis</p>
          <p className="text-xs text-slate-300 font-medium">Word Order</p>
          <p className="text-[10px] text-slate-500">Left → Right in text</p>
        </div>
        <div className="bg-slate-800 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Y Axis</p>
          <p className="text-xs text-slate-300 font-medium">LIME Weight</p>
          <p className="text-[10px] text-slate-500">Up = supports, Down = opposes</p>
        </div>
        <div className="bg-slate-800 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Z Axis</p>
          <p className="text-xs text-slate-300 font-medium">Strength</p>
          <p className="text-[10px] text-slate-500">Closer = more impactful</p>
        </div>
      </div>

      {/* Toggle Guide Button */}
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="mt-4 w-full text-xs text-purple-300 hover:text-purple-200 bg-purple-500 bg-opacity-10 hover:bg-opacity-20 border border-purple-500 border-opacity-20 rounded-lg px-4 py-2 transition-colors font-medium"
      >
        {showGuide ? "Hide" : "Show"} Interpretation Guide
      </button>

      {/* Interpretation Guide Panel */}
      {showGuide && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-4"
        >
          {/* How to Read */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h4 className="text-white text-xs font-bold uppercase tracking-wide mb-3">
              How to Read This Plot
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <FaArrowUp className="text-green-400 mt-0.5 shrink-0 text-xs" />
                <p className="text-xs text-slate-400">
                  <span className="text-green-400 font-semibold">Green spheres above baseline</span> — words
                  that strongly support the prediction. Higher position = stronger influence.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <FaArrowDown className="text-red-400 mt-0.5 shrink-0 text-xs" />
                <p className="text-xs text-slate-400">
                  <span className="text-red-400 font-semibold">Red spheres below baseline</span> — words
                  that oppose the prediction, suggesting a different classification.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <FaExpand className="text-purple-400 mt-0.5 shrink-0 text-xs" />
                <p className="text-xs text-slate-400">
                  <span className="text-purple-300 font-semibold">Bigger spheres</span> = more influential.
                  The <span className="text-indigo-300">dashed purple line</span> shows the reading order (text flow).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <FaCircle className="text-slate-500 mt-0.5 shrink-0 text-[8px]" />
                <p className="text-xs text-slate-400">
                  The <span className="text-slate-300">dark ground plane</span> at Y=0 marks the neutral baseline.
                  Words near it have minimal impact on the prediction.
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h4 className="text-white text-xs font-bold uppercase tracking-wide mb-3">
              Controls
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <FaMousePointer className="text-slate-400 text-xs shrink-0" />
                <span className="text-xs text-slate-400">Left-drag to rotate</span>
              </div>
              <div className="flex items-center gap-2">
                <FaSearchPlus className="text-slate-400 text-xs shrink-0" />
                <span className="text-xs text-slate-400">Scroll to zoom</span>
              </div>
              <div className="flex items-center gap-2">
                <FaArrowsAlt className="text-slate-400 text-xs shrink-0" />
                <span className="text-xs text-slate-400">Right-drag to pan</span>
              </div>
            </div>
          </div>

          {/* Key Words Summary */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h4 className="text-white text-xs font-bold uppercase tracking-wide mb-3">
              Key Words at a Glance
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-2">
                  Supporting Prediction
                </p>
                {stats.topPositive.length > 0 ? (
                  <div className="space-y-1.5">
                    {stats.topPositive.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-white font-medium">{item.word}</span>
                        <span className="text-[10px] text-green-400 font-mono">
                          +{item.weight.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">None found</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mb-2">
                  Opposing Prediction
                </p>
                {stats.topNegative.length > 0 ? (
                  <div className="space-y-1.5">
                    {stats.topNegative.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-white font-medium">{item.word}</span>
                        <span className="text-[10px] text-red-400 font-mono">
                          {item.weight.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">None found</p>
                )}
              </div>
            </div>
          </div>

          {/* CG Concepts Note */}
          <div className="bg-indigo-500 bg-opacity-10 border border-indigo-500 border-opacity-20 rounded-xl p-4">
            <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wide mb-2">
              Computer Graphics Concepts Used
            </h4>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• <span className="text-indigo-300">3D Coordinate System</span> — Mapping abstract ML data (word importance) into spatial X, Y, Z positions</li>
              <li>• <span className="text-indigo-300">Geometric Primitives</span> — Sphere geometry with variable radius encoding data magnitude</li>
              <li>• <span className="text-indigo-300">Color Mapping</span> — RGB values derived from LIME weights (green/red gradient)</li>
              <li>• <span className="text-indigo-300">Camera & Projection</span> — Perspective camera with FOV, near/far clipping planes</li>
              <li>• <span className="text-indigo-300">Interactive Transforms</span> — Orbit controls enabling real-time rotation, zoom, and pan</li>
              <li>• <span className="text-indigo-300">Lighting Model</span> — Ambient + point lights with emissive materials for visual depth</li>
              <li>• <span className="text-indigo-300">Ground Plane & Risk Zones</span> — Flat geometry at Y=0 showing safe/risk region labels</li>
              <li>• <span className="text-indigo-300">Flow Visualization</span> — Dashed line connecting sequential words showing text reading order</li>
              <li>• <span className="text-indigo-300">Billboard Text</span> — 3D text labels that face the camera for readability from any angle</li>
              <li>• <span className="text-indigo-300">HTML Overlay (HUD)</span> — Summary panel rendered as HTML inside WebGL scene</li>
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WordPlot3D;
