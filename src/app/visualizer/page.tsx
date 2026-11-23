import type { Metadata } from "next";
import { JsVisualizer } from "@/components/visualizer/JsVisualizer";

export const metadata: Metadata = {
  title: "DSA Visualizer · Cheat JS",
  description: "Watch DSA questions run line by line: every variable, every loop pass and every yes / no check, in plain words.",
};

export default function VisualizerPage() {
  return (
    <main className="min-h-full bg-slate-900 font-body text-slate-50">
      <JsVisualizer />
    </main>
  );
}
