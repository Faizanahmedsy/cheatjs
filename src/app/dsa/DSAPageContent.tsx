"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { allDSATopics } from "@/lib/dsa";
import { useSearchParams } from "next/navigation";
import BacktrackingVisualization from "@/components/BacktrackingVisualization";
import PermutationsVisualization from "@/components/PermutationsVisualization";

export default function DSAPageContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "visualizations";

  const currentTopic = allDSATopics.find((t) => t.id === topic);

  if (!currentTopic) {
    return (
      <div className="bg-slate-900 text-slate-50 font-sans p-4 sm:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-headline text-5xl font-bold text-slate-100">
            Topic not found
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Please select a topic from the sidebar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-50 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-headline text-5xl font-bold text-slate-100">
            {currentTopic.content.title}
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            {currentTopic.content.description}
          </p>
        </div>

        {/* Show interactive visualization for backtracking topic */}
        {topic === "backtracking" && (
          <div className="mb-12">
            <BacktrackingVisualization />
          </div>
        )}

        {currentTopic.content.steps.length > 0 ? (
          <div className="space-y-8">
            {currentTopic.content.steps.map((step, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border border-slate-700/50"
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-headline text-cyan-300">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-400">{step.explanation}</p>
                  <CodeBlock code={step.code} language={step.language} />

                  {/* Show PermutationsVisualization after the permutations example */}
                  {topic === "backtracking" &&
                    step.title === "Permutations - Complete Example" && (
                      <div className="mt-8">
                        <PermutationsVisualization />
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            <p className="text-lg">Content for this topic is coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
