"use client";

import { motion } from "framer-motion";
import type { VizStage as VizStageSpec } from "../engine/types";
import { VizView } from "../viz/VizView";
import type { StageProps } from "./common";

/** One panel visual drawn big in the centre, or two or three side by side to compare. */
export default function VizStage({ stage, animate, speed }: StageProps<VizStageSpec>) {
  const list = Array.isArray(stage.viz) ? stage.viz : [stage.viz];
  const cols = list.length >= 3 ? "md:grid-cols-3 max-w-5xl" : list.length === 2 ? "md:grid-cols-2 max-w-4xl" : "max-w-xl";
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-3 sm:p-4">
      <div className={`m-auto grid w-full gap-3 ${cols}`}>
        {list.map((v, i) => (
          <motion.div key={i} initial={animate ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: animate ? 0.4 / speed : 0, delay: animate ? (0.2 + i * 0.5) / speed : 0 }}>
            <VizView viz={v} big />
          </motion.div>
        ))}
      </div>
      {stage.note && <p className="mt-2 text-center font-labmono text-[12px] text-lab-muted">{stage.note}</p>}
    </div>
  );
}
