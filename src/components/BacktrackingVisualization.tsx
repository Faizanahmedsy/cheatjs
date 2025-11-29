"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";

type Step = {
  action: "explore" | "push" | "pop" | "found";
  path: number[];
  start: number;
  depth: number;
  result: number[][];
  trying: number | null;
};

export default function BacktrackingVisualization() {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const n = 4;
  const k = 2;

  // Generate all steps for combine(4, 2)
  const generateSteps = (): Step[] => {
    const steps: Step[] = [];
    const result: number[][] = [];

    const backtrack = (path: number[], start: number, depth: number) => {
      steps.push({
        action: "explore",
        path: [...path],
        start: start,
        depth: depth,
        result: [...result],
        trying: null,
      });

      if (path.length === k) {
        result.push([...path]);
        steps.push({
          action: "found",
          path: [...path],
          start: start,
          depth: depth,
          result: [...result],
          trying: null,
        });
        return;
      }

      for (let i = start; i <= n; i++) {
        steps.push({
          action: "push",
          path: [...path],
          start: start,
          depth: depth,
          result: [...result],
          trying: i,
        });

        path.push(i);
        backtrack(path, i + 1, depth + 1);
        path.pop();

        steps.push({
          action: "pop",
          path: [...path],
          start: start,
          depth: depth,
          result: [...result],
          trying: i,
        });
      }
    };

    backtrack([], 1, 0);
    return steps;
  };

  const [steps] = useState(() => generateSteps());

  useEffect(() => {
    if (isAnimating) {
      const timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev + 1 >= steps.length) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(timer);
    }
  }, [isAnimating, steps.length]);

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full bg-slate-900 text-slate-50 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-headline font-bold text-cyan-300 mb-2">
            COMBINATIONS(n={n}, k={k})
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            Finding all k-sized subsets from 1 to n
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-6 md:mb-8">
          <Button
            onClick={() => setIsAnimating(!isAnimating)}
            variant="default"
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm md:text-base"
          >
            {isAnimating ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> PAUSE
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> PLAY
              </>
            )}
          </Button>
          <Button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 text-sm md:text-base"
          >
            ← PREV
          </Button>
          <Button
            onClick={() =>
              setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
            }
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 text-sm md:text-base"
          >
            NEXT →
          </Button>
          <Button
            onClick={() => {
              setCurrentStep(0);
              setIsAnimating(false);
            }}
            variant="outline"
            className="border-purple-600 text-purple-400 hover:bg-purple-900/20 text-sm md:text-base"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> RESET
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left: Visualization */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-3 md:p-6">
              <svg
                viewBox="0 0 600 700"
                className="w-full h-auto max-h-[500px] md:max-h-none"
              >
                <defs>
                  <linearGradient
                    id="blueGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#22d3ee", stopOpacity: 0.4 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#06b6d4", stopOpacity: 0.7 }}
                    />
                  </linearGradient>
                  <linearGradient
                    id="greenGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#86efac", stopOpacity: 0.4 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#22c55e", stopOpacity: 0.7 }}
                    />
                  </linearGradient>
                </defs>

                {/* Current Path Display */}
                <g>
                  <text
                    x="300"
                    y="30"
                    fill="#22d3ee"
                    fontSize="26"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    CURRENT PATH
                  </text>
                  <rect
                    x="150"
                    y="40"
                    width="300"
                    height="60"
                    fill="url(#blueGradient)"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    rx="5"
                  />

                  {currentStepData.path.map((num, idx) => (
                    <g key={idx}>
                      <rect
                        x={180 + idx * 70}
                        y="55"
                        width="50"
                        height="30"
                        fill="#06b6d4"
                        stroke="#22d3ee"
                        strokeWidth="2"
                        rx="3"
                      >
                        <animate
                          attributeName="opacity"
                          values="1;0.7;1"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </rect>
                      <text
                        x={205 + idx * 70}
                        y="77"
                        fill="white"
                        fontSize="20"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {num}
                      </text>
                    </g>
                  ))}

                  {currentStepData.path.length === 0 && (
                    <text
                      x="300"
                      y="75"
                      fill="#64748b"
                      fontSize="16"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      [ empty ]
                    </text>
                  )}
                </g>

                {/* Action Indicator */}
                <g>
                  <rect
                    x="150"
                    y="120"
                    width="300"
                    height="50"
                    fill="#1e293b"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    rx="5"
                  />
                  <text
                    x="300"
                    y="145"
                    fill="#22d3ee"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {currentStepData.action === "push" &&
                      `path.push(${currentStepData.trying})`}
                    {currentStepData.action === "pop" &&
                      `path.pop() // removed ${currentStepData.trying}`}
                    {currentStepData.action === "explore" &&
                      `backtrack(path, ${currentStepData.start})`}
                    {currentStepData.action === "found" &&
                      `result.push([${currentStepData.path.join(", ")}])`}
                  </text>
                  <text
                    x="300"
                    y="163"
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Step {currentStep + 1} / {steps.length}
                  </text>
                </g>

                {/* For Loop Visualization */}
                <g>
                  <text
                    x="300"
                    y="200"
                    fill="#22d3ee"
                    fontSize="16"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    FOR LOOP: i = {currentStepData.start} to {n}
                  </text>
                  <rect
                    x="100"
                    y="210"
                    width="400"
                    height="80"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    rx="5"
                    strokeDasharray="5,5"
                  />

                  {/* Numbers 1 to n */}
                  {[1, 2, 3, 4].map((num) => (
                    <g key={num}>
                      <circle
                        cx={140 + (num - 1) * 90}
                        cy="250"
                        r="25"
                        fill={
                          num < currentStepData.start
                            ? "#334155"
                            : currentStepData.trying === num
                            ? "#fbbf24"
                            : currentStepData.path.includes(num)
                            ? "#8b5cf6"
                            : "#06b6d4"
                        }
                        stroke={
                          currentStepData.trying === num ? "#f59e0b" : "#22d3ee"
                        }
                        strokeWidth="3"
                        opacity={num < currentStepData.start ? 0.3 : 0.8}
                      >
                        {currentStepData.trying === num && (
                          <animate
                            attributeName="r"
                            values="25;30;25"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        )}
                      </circle>
                      <text
                        x={140 + (num - 1) * 90}
                        y="258"
                        fill="white"
                        fontSize="20"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {num}
                      </text>
                      {num < currentStepData.start && (
                        <line
                          x1={120 + (num - 1) * 90}
                          y1="230"
                          x2={160 + (num - 1) * 90}
                          y2="270"
                          stroke="#ef4444"
                          strokeWidth="3"
                        />
                      )}
                    </g>
                  ))}
                </g>

                {/* Call Stack */}
                <g>
                  <text
                    x="300"
                    y="320"
                    fill="#22d3ee"
                    fontSize="16"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    CALL STACK (Recursion Depth: {currentStepData.depth})
                  </text>
                  <rect
                    x="100"
                    y="330"
                    width="400"
                    height="250"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    rx="5"
                  />

                  {Array.from({ length: currentStepData.depth + 1 }).map(
                    (_, idx) => {
                      const isActive = idx === currentStepData.depth;
                      return (
                        <g key={idx}>
                          <rect
                            x="120"
                            y={550 - idx * 40}
                            width="360"
                            height="35"
                            fill={isActive ? "url(#blueGradient)" : "#334155"}
                            stroke={isActive ? "#22d3ee" : "#64748b"}
                            strokeWidth="2"
                            rx="3"
                          >
                            {isActive && (
                              <animate
                                attributeName="opacity"
                                values="1;0.7;1"
                                dur="1s"
                                repeatCount="indefinite"
                              />
                            )}
                          </rect>
                          <text
                            x="300"
                            y={573 - idx * 40}
                            fill={isActive ? "white" : "#94a3b8"}
                            fontSize="14"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            backtrack(depth={idx})
                          </text>
                        </g>
                      );
                    }
                  )}
                </g>

                {/* Result Array */}
                <g>
                  <text
                    x="300"
                    y="610"
                    fill="#22d3ee"
                    fontSize="16"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    RESULT = [{currentStepData.result.length} combinations
                    found]
                  </text>
                  <rect
                    x="100"
                    y="620"
                    width="400"
                    height="60"
                    fill="url(#greenGradient)"
                    stroke="#22c55e"
                    strokeWidth="3"
                    rx="5"
                  />

                  <text
                    x="300"
                    y="655"
                    fill="#065f46"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {currentStepData.result.length > 0
                      ? currentStepData.result
                          .map((arr) => `[${arr.join(",")}]`)
                          .join(", ")
                      : "[ ]"}
                  </text>
                </g>
              </svg>
            </CardContent>
          </Card>

          {/* Right: Code with highlighting */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-400 font-code text-lg">
                  combine.js
                </CardTitle>
                <div className="text-slate-500 text-sm font-code">
                  JavaScript
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-sm font-code leading-relaxed overflow-x-auto">
                <code>
                  <div className="text-slate-500">
                    var combine = function(n, k) {"{"}
                  </div>
                  <div className="ml-4 text-slate-400">let result = []</div>
                  <div className="ml-4">
                    <span className="text-purple-400">let</span>{" "}
                    <span className="text-cyan-400">backtrack</span>{" "}
                    <span className="text-slate-400">
                      = (path, start) =&gt; {"{"}
                    </span>
                  </div>

                  <div
                    className={`ml-8 ${
                      currentStepData.action === "found"
                        ? "bg-yellow-900/50"
                        : ""
                    }`}
                  >
                    <span className="text-purple-400">if</span>
                    <span className="text-slate-400">
                      (path.length === k){"{"}
                    </span>
                  </div>
                  <div
                    className={`ml-12 ${
                      currentStepData.action === "found"
                        ? "bg-green-900/50"
                        : ""
                    }`}
                  >
                    <span className="text-slate-400">
                      result.push([...path])
                    </span>
                  </div>
                  <div className="ml-12 text-purple-400">return;</div>
                  <div className="ml-8 text-slate-400">{"}"}</div>

                  <div
                    className={`ml-8 ${
                      currentStepData.action === "explore"
                        ? "bg-cyan-900/30"
                        : ""
                    }`}
                  >
                    <span className="text-purple-400">for</span>
                    <span className="text-slate-400">(</span>
                    <span className="text-purple-400">let</span>
                    <span className="text-slate-400">
                      {" "}
                      i = start; i &lt;= n; i++){"{"}
                    </span>
                  </div>

                  <div
                    className={`ml-12 ${
                      currentStepData.action === "push"
                        ? "bg-yellow-900/50 border-l-4 border-yellow-400"
                        : ""
                    }`}
                  >
                    <span className="text-slate-400">path.</span>
                    <span className="text-cyan-400">push</span>
                    <span className="text-slate-400">(i);</span>
                    {currentStepData.action === "push" && (
                      <span className="ml-2 text-yellow-400">← executing</span>
                    )}
                  </div>

                  <div
                    className={`ml-12 ${
                      currentStepData.action === "explore" &&
                      currentStepData.depth > 0
                        ? "bg-purple-900/50"
                        : ""
                    }`}
                  >
                    <span className="text-cyan-400">backtrack</span>
                    <span className="text-slate-400">(path, i+1)</span>
                  </div>

                  <div
                    className={`ml-12 ${
                      currentStepData.action === "pop"
                        ? "bg-red-900/50 border-l-4 border-red-400"
                        : ""
                    }`}
                  >
                    <span className="text-slate-400">path.</span>
                    <span className="text-cyan-400">pop</span>
                    <span className="text-slate-400">()</span>
                    {currentStepData.action === "pop" && (
                      <span className="ml-2 text-red-400">← executing</span>
                    )}
                  </div>

                  <div className="ml-8 text-slate-400">{"}"}</div>
                  <div className="ml-4 text-slate-400">{"}"}</div>

                  <div className="ml-4 text-cyan-400">backtrack([], 1)</div>
                  <div className="ml-4 text-purple-400">
                    return <span className="text-slate-400">result</span>
                  </div>
                  <div className="text-slate-500">{"}"}</div>
                </code>
              </pre>

              {/* Legend */}
              <div className="mt-6 space-y-2 text-sm font-code">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-900/50 border border-yellow-400"></div>
                  <span className="text-slate-300">Current execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-900/50 border border-green-400"></div>
                  <span className="text-slate-300">Solution found</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-900/50 border border-red-400"></div>
                  <span className="text-slate-300">Backtracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="mt-6 bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="font-code text-cyan-400">
              <h3 className="text-xl font-bold mb-2">
                {currentStepData.action === "push" && "📥 PUSHING TO PATH"}
                {currentStepData.action === "pop" && "📤 BACKTRACKING (POP)"}
                {currentStepData.action === "explore" && "🔍 EXPLORING BRANCH"}
                {currentStepData.action === "found" && "✅ COMBINATION FOUND!"}
              </h3>
              <p className="text-slate-300">
                {currentStepData.action === "push" &&
                  `Adding ${
                    currentStepData.trying
                  } to path. Will explore deeper with start=${
                    currentStepData.trying! + 1
                  }.`}
                {currentStepData.action === "pop" &&
                  `Removing ${currentStepData.trying} from path. Trying next number in for loop.`}
                {currentStepData.action === "explore" &&
                  `Checking if path length (${
                    currentStepData.path.length
                  }) equals k (${k}). ${
                    currentStepData.path.length === k
                      ? "Yes! Adding to result."
                      : `No, continuing for loop from ${currentStepData.start} to ${n}.`
                  }`}
                {currentStepData.action === "found" &&
                  `Path [${currentStepData.path.join(
                    ", "
                  )}] has ${k} elements! Adding to result array.`}
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div>
                  <span className="text-slate-500">Path length:</span>
                  <span className="ml-2 font-bold text-cyan-300">
                    {currentStepData.path.length} / {k}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Combinations found:</span>
                  <span className="ml-2 font-bold text-cyan-300">
                    {currentStepData.result.length} / 6
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">For loop start:</span>
                  <span className="ml-2 font-bold text-cyan-300">
                    i = {currentStepData.start}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Recursion depth:</span>
                  <span className="ml-2 font-bold text-cyan-300">
                    {currentStepData.depth}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Result */}
        {currentStep === steps.length - 1 && (
          <Card className="mt-4 bg-green-900/20 border-green-600">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-green-400 font-code mb-2">
                🎉 ALGORITHM COMPLETE!
              </h3>
              <p className="text-green-300 font-code">
                Found all {currentStepData.result.length} combinations:{" "}
                {currentStepData.result
                  .map((arr) => `[${arr.join(",")}]`)
                  .join(", ")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
