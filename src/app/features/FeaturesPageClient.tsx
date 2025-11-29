"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { features } from "@/lib/features";
import { useSearchParams } from "next/navigation";

export default function FeaturesPageClient() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "drag-and-drop";

  const guideContent = features.find((f) => f.id === topic)?.content;

  if (!guideContent) {
    return (
      <div className="bg-slate-900 text-slate-50 font-sans p-4 sm:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-slate-100">
            Feature not found
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-400">
            Please select a feature from the sidebar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-50 font-sans p-4 sm:p-8 pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-slate-100">
            {guideContent.title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            {guideContent.description}
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {guideContent.steps.map((step, index) => (
            <Card
              key={index}
              className="bg-slate-800/50 border border-slate-700/50"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-headline text-cyan-300">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm md:text-base text-slate-400">
                  {step.explanation}
                </p>
                <CodeBlock code={step.code} language={step.language} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
