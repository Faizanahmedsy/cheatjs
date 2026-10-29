import type { Metadata } from "next";
import { JsVisualizer } from "@/components/visualizer/JsVisualizer";

export const metadata: Metadata = {
  title: "JS Visualizer · Cheat JS",
  description: "Step through JavaScript line by line: frames, objects, arrays with index pointers, loops and recursion.",
};

export default function VisualizerPage() {
  return (
    <main className="min-h-full bg-slate-900 font-body text-slate-50">
      <JsVisualizer />
    </main>
  );
}
