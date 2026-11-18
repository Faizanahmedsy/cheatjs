"use client";

import dynamic from "next/dynamic";
import type { Stage } from "../engine/types";
import { GEN_TOKEN_S, HOP_S, MSG_S, TRAIN_FRAME_S, WORD_S } from "./common";

function Loading() {
  return <div className="grid h-full place-items-center font-labmono text-xs text-lab-muted">drawing…</div>;
}

// Each stage is its own chunk, loaded the first time a step needs it.
const NeuronStage = dynamic(() => import("./NeuronStage"), { ssr: false, loading: Loading });
const NetworkStage = dynamic(() => import("./NetworkStage"), { ssr: false, loading: Loading });
const TokensStage = dynamic(() => import("./TokensStage"), { ssr: false, loading: Loading });
const FitStage = dynamic(() => import("./FitStage"), { ssr: false, loading: Loading });
const DescentStage = dynamic(() => import("./DescentStage"), { ssr: false, loading: Loading });
const MapStage = dynamic(() => import("./MapStage"), { ssr: false, loading: Loading });
const CardsStage = dynamic(() => import("./CardsStage"), { ssr: false, loading: Loading });
const ChatStage = dynamic(() => import("./ChatStage"), { ssr: false, loading: Loading });
const VizStage = dynamic(() => import("./VizStage"), { ssr: false, loading: Loading });

/** SVG stages are drawn on a 900-wide canvas; below this width they scroll sideways instead of shrinking text to nothing. */
const SVG_MIN = "min-w-[620px]";

/** How long a step with this stage needs at 1x, in ms: at least 5.2 s, longer for walks, training and typing. */
export function stageDurationMs(stage: Stage | undefined): number {
  if (!stage) return 0;
  let s = 0;
  switch (stage.kind) {
    case "fit":
      s = stage.mode === "train" ? (stage.lines?.length ?? 0) * TRAIN_FRAME_S + 1 : 0;
      break;
    case "tokens":
      s = stage.mode === "generate" ? (stage.tokens.length - (stage.promptCount ?? stage.tokens.length)) * GEN_TOKEN_S + 1.5 : 0;
      break;
    case "descent":
      s = Math.max(stage.steps.length, ...(stage.compare ?? []).map((c) => c.steps.length)) * HOP_S + 1.5;
      break;
    case "chat": {
      const last = stage.messages[stage.messages.length - 1];
      const words = stage.streamLast && last ? last.text.split(/\s+/).length : 0;
      s = stage.messages.length * MSG_S + words * WORD_S + 1.5;
      break;
    }
    default:
      s = 0;
  }
  return Math.max(5200, Math.round(s * 1000));
}

type Props = {
  stage: Stage;
  animate: boolean;
  speed: number;
  /** Changes whenever the step should replay. */
  runKey: string;
  /** Cards stay mounted for the whole topic so they can fly between zones. */
  scenarioId: string;
};

/** The big centre visual for a step. Most stages remount per step to replay; the cards stage does not. */
export function StageView({ stage, animate, speed, runKey, scenarioId }: Props) {
  const common = { animate, speed, runKey };
  const svg = (node: React.ReactNode) => (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden">
      <div className={`h-full ${SVG_MIN} sm:min-w-0`}>{node}</div>
    </div>
  );
  switch (stage.kind) {
    case "neuron":
      return svg(<NeuronStage key={runKey} stage={stage} {...common} />);
    case "network":
      return svg(<NetworkStage key={runKey} stage={stage} {...common} />);
    case "tokens":
      return svg(<TokensStage key={runKey} stage={stage} {...common} />);
    case "fit":
      return svg(<FitStage key={runKey} stage={stage} {...common} />);
    case "descent":
      return svg(<DescentStage key={runKey} stage={stage} {...common} />);
    case "map":
      return svg(<MapStage key={runKey} stage={stage} {...common} />);
    case "cards":
      return <CardsStage key={`cards-${scenarioId}`} stage={stage} {...common} />;
    case "chat":
      return <ChatStage key={runKey} stage={stage} {...common} />;
    case "viz":
      return <VizStage key={runKey} stage={stage} {...common} />;
  }
}
