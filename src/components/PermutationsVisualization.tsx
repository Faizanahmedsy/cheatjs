"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";

type Step = {
  action: "push" | "pop" | "found" | "skip" | "explore";
  path: number[];
  depth: number;
  result: number[][];
  trying: number | null;
  loopIndex: number;
  isResuming: boolean; // true when executing path.pop() after backtrack returns
};

export default function PermutationsVisualization() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const nums = [1, 2, 3];

  // Generate all steps for permute([1, 2, 3])
  const generateSteps = (): Step[] => {
    const steps: Step[] = [];
    const result: number[][] = [];

    const backtrack = (path: number[], depth: number) => {
      steps.push({
        action: "explore",
        path: [...path],
        depth: depth,
        result: [...result],
        trying: null,
        loopIndex: -1,
        isResuming: false,
      });

      if (path.length === nums.length) {
        result.push([...path]);
        steps.push({
          action: "found",
          path: [...path],
          depth: depth,
          result: [...result],
          trying: null,
          loopIndex: -1,
          isResuming: false,
        });
        return;
      }

      for (let i = 0; i < nums.length; i++) {
        if (!path.includes(nums[i])) {
          steps.push({
            action: "push",
            path: [...path],
            depth: depth,
            result: [...result],
            trying: nums[i],
            loopIndex: i,
            isResuming: false,
          });

          path.push(nums[i]);
          backtrack(path, depth + 1);
          path.pop();

          // CRITICAL: This step shows path.pop() executing AFTER backtrack returns
          steps.push({
            action: "pop",
            path: [...path],
            depth: depth,
            result: [...result],
            trying: nums[i],
            loopIndex: i,
            isResuming: true, // Highlight that we're resuming after recursive call
          });
        } else {
          steps.push({
            action: "skip",
            path: [...path],
            depth: depth,
            result: [...result],
            trying: nums[i],
            loopIndex: i,
            isResuming: false,
          });
        }
      }
    };

    backtrack([], 0);
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
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [isAnimating, steps.length]);

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full bg-slate-900 text-slate-50 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-headline font-bold text-cyan-300 mb-2">
            PERMUTATIONS([{nums.join(", ")}])
          </h2>
          <p className="text-slate-400">
            Generating all possible orderings - Order matters!
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Button
            onClick={() => setIsAnimating(!isAnimating)}
            variant="default"
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
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
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            ← PREV
          </Button>
          <Button
            onClick={() =>
              setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
            }
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            NEXT →
          </Button>
          <Button
            onClick={() => {
              setCurrentStep(0);
              setIsAnimating(false);
            }}
            variant="outline"
            className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> RESET
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Visualization */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              <svg viewBox="0 0 600 750" className="w-full">
                <defs>
                  <linearGradient
                    id="cyanGradient"
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
                    fontSize="16"
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
                    fill="url(#cyanGradient)"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    rx="5"
                  />

                  {currentStepData.path.map((num, idx) => (
                    <g key={idx}>
                      <rect
                        x={180 + idx * 80}
                        y="55"
                        width="60"
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
                        x={210 + idx * 80}
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
                    x="100"
                    y="120"
                    width="400"
                    height="60"
                    fill={currentStepData.isResuming ? "#7c2d12" : "#1e293b"}
                    stroke={currentStepData.isResuming ? "#f97316" : "#22d3ee"}
                    strokeWidth="3"
                    rx="5"
                  />
                  <text
                    x="300"
                    y="145"
                    fill={currentStepData.isResuming ? "#fb923c" : "#22d3ee"}
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {currentStepData.action === "push" &&
                      `path.push(${currentStepData.trying})`}
                    {currentStepData.action === "pop" &&
                      `⚠️ path.pop() - AFTER backtrack() returns`}
                    {currentStepData.action === "explore" &&
                      `backtrack(path) - depth ${currentStepData.depth}`}
                    {currentStepData.action === "found" &&
                      `✅ result.push([${currentStepData.path.join(", ")}])`}
                    {currentStepData.action === "skip" &&
                      `Skip ${currentStepData.trying} (already in path)`}
                  </text>
                  <text
                    x="300"
                    y="165"
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Step {currentStep + 1} / {steps.length}
                    {currentStepData.isResuming &&
                      " - RESUMING after recursive call"}
                  </text>
                </g>

                {/* For Loop State */}
                <g>
                  <text
                    x="300"
                    y="210"
                    fill="#22d3ee"
                    fontSize="16"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    FOR LOOP: i ={" "}
                    {currentStepData.loopIndex >= 0
                      ? currentStepData.loopIndex
                      : 0}{" "}
                    (nums[i] = {currentStepData.trying || "?"})
                  </text>
                  <rect
                    x="100"
                    y="220"
                    width="400"
                    height="100"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    rx="5"
                    strokeDasharray="5,5"
                  />

                  {nums.map((num, idx) => (
                    <g key={num}>
                      <circle
                        cx={150 + idx * 150}
                        cy="270"
                        r="30"
                        fill={
                          currentStepData.path.includes(num)
                            ? "#8b5cf6"
                            : currentStepData.trying === num &&
                              currentStepData.action === "skip"
                            ? "#64748b"
                            : currentStepData.trying === num
                            ? "#fbbf24"
                            : "#06b6d4"
                        }
                        stroke={
                          currentStepData.trying === num ? "#f59e0b" : "#22d3ee"
                        }
                        strokeWidth="3"
                        opacity={currentStepData.path.includes(num) ? 0.5 : 0.9}
                      >
                        {currentStepData.trying === num && (
                          <animate
                            attributeName="r"
                            values="30;35;30"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        )}
                      </circle>
                      <text
                        x={150 + idx * 150}
                        y="280"
                        fill="white"
                        fontSize="24"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {num}
                      </text>
                      {currentStepData.path.includes(num) && (
                        <>
                          <line
                            x1={125 + idx * 150}
                            y1="245"
                            x2={175 + idx * 150}
                            y2="295"
                            stroke="#ef4444"
                            strokeWidth="4"
                          />
                          <text
                            x={150 + idx * 150}
                            y="315"
                            fill="#ef4444"
                            fontSize="11"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            USED
                          </text>
                        </>
                      )}
                    </g>
                  ))}
                </g>

                {/* Call Stack */}
                <g>
                  <text
                    x="300"
                    y="350"
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
                    y="360"
                    width="400"
                    height="200"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    rx="5"
                  />

                  {Array.from({
                    length: Math.min(currentStepData.depth + 1, 4),
                  }).map((_, idx) => {
                    const isActive = idx === currentStepData.depth;
                    return (
                      <g key={idx}>
                        <rect
                          x="120"
                          y={530 - idx * 45}
                          width="360"
                          height="40"
                          fill={isActive ? "url(#cyanGradient)" : "#334155"}
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
                          y={555 - idx * 45}
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
                  })}
                </g>

                {/* Result Array */}
                <g>
                  <text
                    x="300"
                    y="590"
                    fill="#22d3ee"
                    fontSize="16"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    RESULT = [{currentStepData.result.length} permutations
                    found]
                  </text>
                  <rect
                    x="50"
                    y="600"
                    width="500"
                    height="130"
                    fill="url(#greenGradient)"
                    stroke="#22c55e"
                    strokeWidth="3"
                    rx="5"
                  />

                  <foreignObject x="60" y="610" width="480" height="110">
                    <div className="text-green-900 font-code text-xs font-bold p-2 overflow-y-auto max-h-[110px]">
                      {currentStepData.result.length > 0
                        ? currentStepData.result.map((arr, idx) => (
                            <div key={idx} className="inline-block mr-2 mb-1">
                              [{arr.join(",")}]
                            </div>
                          ))
                        : "[ ]"}
                    </div>
                  </foreignObject>
                </g>
              </svg>
            </CardContent>
          </Card>

          {/* Right: Code with highlighting */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-400 font-code text-lg">
                  permute.js
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
                    var permute = function(nums) {"{"}
                  </div>
                  <div className="ml-4 text-slate-400">let result = []</div>
                  <div className="ml-4 text-slate-400">let path = []</div>
                  <div className="ml-4"></div>
                  <div className="ml-4">
                    <span className="text-purple-400">function</span>{" "}
                    <span className="text-cyan-400">backtrack</span>
                    <span className="text-slate-400">() {"{"}</span>
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
                      (path.length === nums.length){"{"}
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
                  <div className="ml-12 text-purple-400">return</div>
                  <div className="ml-8 text-slate-400">{"}"}</div>
                  <div className="ml-8"></div>

                  <div
                    className={`ml-8 ${
                      currentStepData.action === "explore" ||
                      currentStepData.action === "skip"
                        ? "bg-cyan-900/30"
                        : ""
                    }`}
                  >
                    <span className="text-purple-400">for</span>
                    <span className="text-slate-400">(</span>
                    <span className="text-purple-400">let</span>
                    <span className="text-slate-400">
                      {" "}
                      i = 0; i &lt; nums.length; i++){"{"}
                    </span>
                  </div>

                  <div
                    className={`ml-12 ${
                      currentStepData.action === "skip" ? "bg-slate-700/50" : ""
                    }`}
                  >
                    <span className="text-purple-400">if</span>
                    <span className="text-slate-400">
                      (!path.includes(nums[i])){"{"}
                    </span>
                  </div>

                  <div
                    className={`ml-16 ${
                      currentStepData.action === "push"
                        ? "bg-yellow-900/50 border-l-4 border-yellow-400"
                        : ""
                    }`}
                  >
                    <span className="text-slate-400">path.</span>
                    <span className="text-cyan-400">push</span>
                    <span className="text-slate-400">(nums[i])</span>
                    {currentStepData.action === "push" && (
                      <span className="ml-2 text-yellow-400">← executing</span>
                    )}
                  </div>

                  <div
                    className={`ml-16 ${
                      currentStepData.action === "explore" &&
                      currentStepData.depth > 0
                        ? "bg-purple-900/50"
                        : ""
                    }`}
                  >
                    <span className="text-cyan-400">backtrack</span>
                    <span className="text-slate-400">()</span>
                  </div>

                  <div
                    className={`ml-16 ${
                      currentStepData.action === "pop" &&
                      currentStepData.isResuming
                        ? "bg-orange-900/70 border-l-4 border-orange-400"
                        : ""
                    }`}
                  >
                    <span className="text-slate-400">path.</span>
                    <span className="text-cyan-400">pop</span>
                    <span className="text-slate-400">()</span>
                    {currentStepData.action === "pop" &&
                      currentStepData.isResuming && (
                        <span className="ml-2 text-orange-400">
                          ← RESUMING! Runs AFTER backtrack()
                        </span>
                      )}
                  </div>

                  <div className="ml-12 text-slate-400">{"}"}</div>
                  <div className="ml-8 text-slate-400">{"}"}</div>
                  <div className="ml-4 text-slate-400">{"}"}</div>
                  <div className="ml-4"></div>
                  <div className="ml-4 text-cyan-400">backtrack()</div>
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
                  <span className="text-slate-300">Executing push</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-900/70 border border-orange-400"></div>
                  <span className="text-slate-300">
                    Executing pop (AFTER return)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-900/50 border border-green-400"></div>
                  <span className="text-slate-300">Solution found</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="mt-6 bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="font-code">
              <h3 className="text-xl font-bold mb-2 text-cyan-400">
                {currentStepData.action === "push" &&
                  "📥 CHOOSING: Adding to path"}
                {currentStepData.action === "pop" &&
                  "🔙 UNCHOOSING: path.pop() executes"}
                {currentStepData.action === "explore" &&
                  "🔍 EXPLORING: Recursive call"}
                {currentStepData.action === "found" && "✅ PERMUTATION FOUND!"}
                {currentStepData.action === "skip" &&
                  "⏭️ SKIPPING: Already used"}
              </h3>
              <p className="text-slate-300 mb-4">
                {currentStepData.action === "push" &&
                  `Adding ${currentStepData.trying} to path. Next, we'll recursively explore with this choice.`}
                {currentStepData.action === "pop" &&
                  `⚠️ CRITICAL: path.pop() runs AFTER backtrack() returns! We're removing ${currentStepData.trying} to try the next number in the for loop. This is the "backtracking" step.`}
                {currentStepData.action === "explore" &&
                  `Checking if we have a complete permutation (length ${
                    currentStepData.path.length
                  } vs ${nums.length}). ${
                    currentStepData.path.length === nums.length
                      ? "Yes! Saving it."
                      : "No, continuing to build."
                  }`}
                {currentStepData.action === "found" &&
                  `Path [${currentStepData.path.join(
                    ", "
                  )}] is a complete permutation! Adding to result array.`}
                {currentStepData.action === "skip" &&
                  `Number ${
                    currentStepData.trying
                  } is already in path [${currentStepData.path.join(
                    ", "
                  )}]. Skipping to next iteration.`}
              </p>

              {currentStepData.isResuming && (
                <div className="bg-orange-900/30 border-l-4 border-orange-400 p-3 mb-4">
                  <p className="text-orange-300 font-bold text-sm">
                    🎯 KEY MOMENT: The recursive backtrack() call has returned.
                    Now path.pop() executes to "undo" our choice before trying
                    the next option in the for loop.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Path length:</span>
                  <span className="ml-2 font-bold text-cyan-300">
                    {currentStepData.path.length} / {nums.length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Permutations found:</span>
                  <span className="ml-2 font-bold text-cyan-300">
                    {currentStepData.result.length} / 6
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Current trying:</span>
                  <span className="ml-2 font-bold text-cyan-300">
                    {currentStepData.trying || "N/A"}
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
                Found all {currentStepData.result.length} permutations:{" "}
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
