"use client";

import { motion } from "framer-motion";
import type { NeuronStage as NeuronStageSpec } from "../engine/types";
import { relu, sigmoid } from "../engine/math";
import { toneFill, toneVar } from "../engine/tones";
import { fmtNum, H, timing, W, type StageProps } from "./common";

/**
 * One neuron, zoomed in: inputs on the left, each line's thickness and colour
 * is its weight (blue = positive, red = negative), the body adds everything up
 * with the bias, then the activation gate decides what comes out.
 */
export default function NeuronStage({ stage, animate, speed }: StageProps<NeuronStageSpec>) {
  const t = timing(animate, speed);
  const { inputs, weights, bias, activation, phase } = stage;
  const products = inputs.map((x, i) => x.value * weights[i]);
  const z = products.reduce((s, p) => s + p, 0) + bias;
  const out = activation === "relu" ? relu(z) : sigmoid(z);
  const showSum = phase === "sum" || phase === "activate";
  const showOut = phase === "activate";

  const IN_X = 120;
  const BODY = { x: 470, y: 225, r: 74 };
  const GATE = { x: 660, y: 225 };
  const OUT = { x: 815, y: 225, r: 44 };
  const ys = inputs.map((_, i) => 225 + (i - (inputs.length - 1) / 2) * 120);
  const maxW = Math.max(...weights.map(Math.abs), 1e-9);
  const fillLevel = Math.max(0, Math.min(1, Math.abs(z) / Math.max(1.5, Math.abs(z))));
  const gateOpen = activation === "relu" ? z > 0 : true;

  const eq = `${products.map((p, i) => (i === 0 ? fmtNum(p, 1) : p < 0 ? ` − ${fmtNum(-p, 1)}` : ` + ${fmtNum(p, 1)}`)).join("")} ${bias < 0 ? "−" : "+"} ${fmtNum(Math.abs(bias), 1)} = ${fmtNum(z, 1)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`One neuron: ${eq}, output ${fmtNum(out)}`}>
      {/* column titles */}
      {[
        [IN_X, "INPUTS"],
        [BODY.x, "NEURON (adds up)"],
        [GATE.x, "GATE"],
        [OUT.x, "OUTPUT"],
      ].map(([x, label]) => (
        <text key={label as string} x={x as number} y={34} textAnchor="middle" fontSize={13} fontWeight={700} letterSpacing={1.5} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
          {label}
        </text>
      ))}

      {/* weighted lines */}
      {inputs.map((inp, i) => {
        const w = weights[i];
        const tone = w >= 0 ? "blue" : "rose";
        const width = 2 + (Math.abs(w) / maxW) * 9;
        const x1 = IN_X + 36;
        const y1 = ys[i];
        const x2 = BODY.x - BODY.r;
        const y2 = BODY.y + (ys[i] - BODY.y) * 0.35;
        // Weight chip a third of the way along, so it never meets the product text near the body.
        const mx = x1 + (x2 - x1) * 0.33;
        const my = y1 + (y2 - y1) * 0.33;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={width} strokeLinecap="round" style={{ stroke: toneVar(tone), opacity: 0.55 }}>
              <title>{`weight ${fmtNum(w, 2)}`}</title>
            </line>
            {/* weight chip */}
            <g transform={`translate(${mx - 34} ${my - 34})`}>
              <rect width={68} height={22} rx={11} style={{ fill: toneFill(tone, 18), stroke: toneVar(tone) }} />
              <text x={34} y={15} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: toneVar(tone), fontFamily: "var(--lab-mono)" }}>
                × {fmtNum(w, 1)}
              </text>
            </g>
            {/* the input travelling along the line */}
            {animate && phase === "inputs" && (
              <motion.circle
                r={7}
                initial={{ cx: x1, cy: y1, opacity: 0 }}
                animate={{ cx: x2, cy: y2, opacity: [0, 1, 1, 0.9] }}
                transition={t(1.1, 0.3 + i * 0.35)}
                style={{ fill: toneVar(tone), filter: `drop-shadow(0 0 6px ${toneVar(tone)})` }}
              />
            )}
            {/* product chip near the body */}
            <motion.g initial={{ opacity: animate && phase === "inputs" ? 0 : 1 }} animate={{ opacity: 1 }} transition={t(0.4, phase === "inputs" ? 1.2 + i * 0.35 : 0)}>
                <text x={x2 - 14} y={y2 + (i === 0 ? -14 : i === inputs.length - 1 ? 26 : -12)} textAnchor="end" fontSize={13} fontWeight={700} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                  {fmtNum(inp.value, Number.isInteger(inp.value) ? 0 : 1)} × {fmtNum(w, 1)} = {fmtNum(products[i], 1)}
                </text>
              </motion.g>
          </g>
        );
      })}

      {/* inputs */}
      {inputs.map((inp, i) => (
        <g key={inp.label}>
          <circle cx={IN_X} cy={ys[i]} r={36} strokeWidth={2} style={{ fill: toneFill("cyan", phase === "inputs" ? 26 : 14), stroke: toneVar("cyan") }} />
          <text x={IN_X} y={ys[i] + 7} textAnchor="middle" fontSize={20} fontWeight={700} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
            {fmtNum(inp.value, Number.isInteger(inp.value) ? 0 : 1)}
          </text>
          <text x={IN_X - 46} y={ys[i] + 5} textAnchor="end" fontSize={14} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
            {inp.label}
          </text>
        </g>
      ))}

      {/* bias */}
      <line x1={BODY.x} y1={BODY.y + BODY.r} x2={BODY.x} y2={368} strokeWidth={3} strokeDasharray="5 5" style={{ stroke: toneVar("amber"), opacity: 0.7 }} />
      <g transform={`translate(${BODY.x - 62} 366)`}>
        <rect width={124} height={30} rx={15} style={{ fill: toneFill("amber", showSum ? 26 : 12), stroke: toneVar("amber") }} />
        <text x={62} y={20} textAnchor="middle" fontSize={13} fontWeight={700} style={{ fill: toneVar("amber"), fontFamily: "var(--lab-mono)" }}>
          bias {bias < 0 ? "−" : "+"}
          {fmtNum(Math.abs(bias), 1)}
        </text>
      </g>

      {/* body, filling up as the sum builds */}
      <defs>
        <clipPath id="neuron-body-clip">
          <circle cx={BODY.x} cy={BODY.y} r={BODY.r - 3} />
        </clipPath>
      </defs>
      <circle cx={BODY.x} cy={BODY.y} r={BODY.r} strokeWidth={3} style={{ fill: toneFill("violet", 10), stroke: toneVar("violet") }} />
      <g clipPath="url(#neuron-body-clip)">
        {/* scaleY from the bottom edge (framer's x/y on SVG are transforms, so animate scale instead of the y attribute) */}
        <motion.rect
          x={BODY.x - BODY.r}
          y={BODY.y + BODY.r - 2 * BODY.r * fillLevel}
          width={BODY.r * 2}
          height={2 * BODY.r * fillLevel}
          initial={{ scaleY: animate && phase === "sum" ? 0 : showSum ? 1 : 0 }}
          animate={{ scaleY: showSum ? 1 : 0 }}
          transition={t(1.2, phase === "sum" ? 0.2 : 0)}
          style={{ fill: toneFill("violet", 45), originY: 1 }}
        />
      </g>
      <text x={BODY.x} y={BODY.y + (showSum ? -6 : 14)} textAnchor="middle" fontSize={showSum ? 18 : 44} fontWeight={700} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
        {showSum ? "total" : "Σ"}
      </text>
      {showSum && (
        <motion.text x={BODY.x} y={BODY.y + 26} textAnchor="middle" fontSize={28} fontWeight={700} initial={{ opacity: animate ? 0 : 1 }} animate={{ opacity: 1 }} transition={t(0.4, 1.1)} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
          {fmtNum(z, 1)}
        </motion.text>
      )}
      {showSum && (
        <motion.text x={BODY.x} y={BODY.y - BODY.r - 16} textAnchor="middle" fontSize={14} fontWeight={600} initial={{ opacity: animate ? 0 : 1 }} animate={{ opacity: 1 }} transition={t(0.4, 0.8)} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
          {eq}
        </motion.text>
      )}

      {/* body → gate → output */}
      <line x1={BODY.x + BODY.r} y1={BODY.y} x2={GATE.x - 52} y2={GATE.y} strokeWidth={4} style={{ stroke: toneVar(showOut ? "violet" : "slate"), opacity: showOut ? 0.9 : 0.35 }} />
      <line x1={GATE.x + 52} y1={GATE.y} x2={OUT.x - OUT.r} y2={OUT.y} strokeWidth={4} style={{ stroke: toneVar(showOut && gateOpen ? "green" : "slate"), opacity: showOut ? 0.9 : 0.35 }} />
      {showOut && animate && (
        <motion.circle
          r={8}
          initial={{ cx: BODY.x + BODY.r, cy: BODY.y, opacity: 0 }}
          animate={{ cx: [BODY.x + BODY.r, GATE.x, OUT.x - OUT.r], cy: BODY.y, opacity: [0, 1, 1] }}
          transition={t(1.4, 0.3)}
          style={{ fill: toneVar("green"), filter: `drop-shadow(0 0 6px ${toneVar("green")})` }}
        />
      )}

      {/* the gate */}
      <g transform={`translate(${GATE.x - 52} ${GATE.y - 48})`}>
        <rect width={104} height={96} rx={12} strokeWidth={2} style={{ fill: toneFill(showOut ? (gateOpen ? "green" : "rose") : "slate", 14), stroke: toneVar(showOut ? (gateOpen ? "green" : "rose") : "slate") }} />
        <text x={52} y={20} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
          {activation === "relu" ? "ReLU" : "sigmoid"}
        </text>
        {/* tiny graph of the gate */}
        <g transform="translate(18 30)">
          <line x1={0} y1={44} x2={68} y2={44} strokeWidth={1} style={{ stroke: "var(--lab-border)" }} />
          <line x1={34} y1={0} x2={34} y2={56} strokeWidth={1} style={{ stroke: "var(--lab-border)" }} />
          <polyline
            points={activation === "relu" ? "0,44 34,44 68,8" : Array.from({ length: 18 }, (_, k) => `${(k / 17) * 68},${44 - sigmoid((k / 17) * 10 - 5) * 40}`).join(" ")}
            fill="none"
            strokeWidth={2.5}
            style={{ stroke: toneVar("green") }}
          />
        </g>
      </g>
      <text x={GATE.x} y={GATE.y + 70} textAnchor="middle" fontSize={12} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
        {activation === "relu" ? "negative → 0, positive passes" : "squashes to 0…1"}
      </text>

      {/* output: lights up when the neuron fires */}
      {showOut && gateOpen && out > 0 && (
        <motion.circle
          cx={OUT.x}
          cy={OUT.y}
          r={OUT.r + 9}
          fill="none"
          strokeWidth={4}
          initial={{ opacity: animate ? 0 : 0.9 }}
          animate={{ opacity: 0.9 }}
          transition={t(0.5, 1.5)}
          style={{ stroke: toneVar("green"), filter: `drop-shadow(0 0 10px ${toneVar("green")})` }}
        />
      )}
      <circle cx={OUT.x} cy={OUT.y} r={OUT.r} strokeWidth={3} style={{ fill: toneFill("green", showOut ? 30 : 8), stroke: toneVar(showOut ? "green" : "slate") }} />
      <motion.text
        x={OUT.x}
        y={OUT.y + 8}
        textAnchor="middle"
        fontSize={24}
        fontWeight={700}
        initial={false}
        animate={{ opacity: showOut ? 1 : 0.35 }}
        transition={t(0.4, showOut ? 1.4 : 0)}
        style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}
      >
        {showOut ? fmtNum(out, activation === "relu" ? 1 : 2) : "?"}
      </motion.text>
      {stage.outputLabel && (
        <text x={OUT.x} y={OUT.y + OUT.r + 22} textAnchor="middle" fontSize={13} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
          {stage.outputLabel}
        </text>
      )}

      {showOut && stage.blockedExample !== undefined && (
        <motion.g initial={{ opacity: animate ? 0 : 1 }} animate={{ opacity: 1 }} transition={t(0.5, 2)}>
          <rect x={590} y={330} width={290} height={52} rx={8} style={{ fill: toneFill("rose", 10), stroke: toneVar("rose") }} />
          <text x={735} y={351} textAnchor="middle" fontSize={12.5} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
            If the total were {fmtNum(stage.blockedExample, 1)},
          </text>
          <text x={735} y={370} textAnchor="middle" fontSize={12.5} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
            the gate shuts → output {fmtNum(activation === "relu" ? relu(stage.blockedExample) : sigmoid(stage.blockedExample), activation === "relu" ? 0 : 2)}
          </text>
        </motion.g>
      )}

      {/* legend */}
      <g transform="translate(24 450)" fontSize={12} style={{ fontFamily: "var(--lab-mono)" }}>
        <line x1={0} y1={-4} x2={26} y2={-4} strokeWidth={5} style={{ stroke: toneVar("blue") }} />
        <text x={34} y={0} style={{ fill: "var(--lab-muted)" }}>
          positive weight
        </text>
        <line x1={170} y1={-4} x2={196} y2={-4} strokeWidth={5} style={{ stroke: toneVar("rose") }} />
        <text x={204} y={0} style={{ fill: "var(--lab-muted)" }}>
          negative weight · thicker = matters more
        </text>
      </g>
    </svg>
  );
}
