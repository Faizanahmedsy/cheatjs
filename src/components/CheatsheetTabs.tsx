"use client";

import { CheatsheetCard } from "@/components/CheatsheetCard";
import { cheatsheets } from "@/lib/cheatsheets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function CheatsheetTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const categoryTab = searchParams.get("category") ?? "React";
  const reactTab = searchParams.get("level") ?? "Beginner";
  const dsaTab = searchParams.get("dsa") ?? "Visualizations";

  const reactCategory = cheatsheets.find((c) => c.name === "React");
  const dsaCategory = cheatsheets.find((c) => c.name === "DSA");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const setCategoryTab = (value: string) => {
    router.push(pathname + "?" + createQueryString("category", value));
  };

  const setReactTab = (value: string) => {
    router.push(pathname + "?" + createQueryString("level", value));
  };

  const setDsaTab = (value: string) => {
    router.push(pathname + "?" + createQueryString("dsa", value));
  };

  return (
    <Tabs value={categoryTab} onValueChange={setCategoryTab} className="w-full">
      <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 sm:grid-cols-4 bg-slate-800/50 border border-slate-700/50 mb-6 md:mb-8 gap-1">
        <TabsTrigger
          value="React"
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300 text-xs sm:text-sm"
        >
          React
        </TabsTrigger>
        <TabsTrigger
          value="Next.js"
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-green-300 text-xs sm:text-sm"
        >
          Next.js
        </TabsTrigger>
        <TabsTrigger
          value="Frontend Concepts"
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-yellow-300 text-xs sm:text-sm"
        >
          Frontend
        </TabsTrigger>
        <TabsTrigger
          value="DSA"
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-red-300 text-xs sm:text-sm"
        >
          DSA
        </TabsTrigger>
      </TabsList>

      <TabsContent value="React">
        {isClient && (
          <Tabs value={reactTab} onValueChange={setReactTab} className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-slate-800/50 border border-slate-700/50 mb-6 md:mb-8">
              <TabsTrigger
                value="Beginner"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300 text-xs sm:text-sm"
              >
                Beginner
              </TabsTrigger>
              <TabsTrigger
                value="Intermediate"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300 text-xs sm:text-sm"
              >
                Intermediate
              </TabsTrigger>
              <TabsTrigger
                value="Advanced"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300 text-xs sm:text-sm"
              >
                Advanced
              </TabsTrigger>
            </TabsList>
            <TabsContent value="Beginner">
              {(() => {
                const beginnerCategory = reactCategory?.subCategories?.find(
                  (sc) => sc.name === "Beginner"
                );
                if (!beginnerCategory) return null;

                if (beginnerCategory.sections) {
                  // Render sections with headings
                  return (
                    <div className="space-y-12">
                      {beginnerCategory.sections.map((section) => (
                        <div key={section.heading}>
                          <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-4 md:mb-6 text-center">
                            {section.heading}
                          </h2>
                          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                            {section.snippets.map((snippet) => (
                              <CheatsheetCard
                                key={snippet.title}
                                snippet={snippet}
                                color="cyan"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Fallback for old structure without sections
                return (
                  <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                    {beginnerCategory.snippets?.map((snippet) => (
                      <CheatsheetCard
                        key={snippet.title}
                        snippet={snippet}
                        color="cyan"
                      />
                    ))}
                  </div>
                );
              })()}
            </TabsContent>
            <TabsContent value="Intermediate">
              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                {reactCategory?.subCategories
                  ?.find((sc) => sc.name === "Intermediate")
                  ?.snippets?.map((snippet) => (
                    <CheatsheetCard
                      key={snippet.title}
                      snippet={snippet}
                      color="cyan"
                    />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="Advanced">
              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                {reactCategory?.subCategories
                  ?.find((sc) => sc.name === "Advanced")
                  ?.snippets?.map((snippet) => (
                    <CheatsheetCard
                      key={snippet.title}
                      snippet={snippet}
                      color="cyan"
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </TabsContent>

      <TabsContent value="Next.js">
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {isClient &&
            cheatsheets
              .find((c) => c.name === "Next.js")
              ?.snippets?.map((snippet) => (
                <CheatsheetCard
                  key={snippet.title}
                  snippet={snippet}
                  color="green"
                />
              ))}
        </div>
      </TabsContent>

      <TabsContent value="Frontend Concepts">
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {isClient &&
            cheatsheets
              .find((c) => c.name === "Frontend Concepts")
              ?.snippets?.map((snippet) => (
                <CheatsheetCard
                  key={snippet.title}
                  snippet={snippet}
                  color="yellow"
                />
              ))}
        </div>
      </TabsContent>

      <TabsContent value="DSA">
        {isClient && (
          <Tabs value={dsaTab} onValueChange={setDsaTab} className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-slate-800/50 border border-slate-700/50 mb-6 md:mb-8">
              <TabsTrigger
                value="Visualizations"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-red-300 text-xs sm:text-sm"
              >
                Visualizations
              </TabsTrigger>
              <TabsTrigger
                value="Algorithms"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-red-300 text-xs sm:text-sm"
              >
                Algorithms
              </TabsTrigger>
              <TabsTrigger
                value="Patterns"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-red-300 text-xs sm:text-sm"
              >
                Patterns
              </TabsTrigger>
            </TabsList>
            <TabsContent value="Visualizations">
              <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                {dsaCategory?.subCategories
                  ?.find((sc) => sc.name === "Visualizations")
                  ?.snippets?.map((snippet) => (
                    <CheatsheetCard
                      key={snippet.title}
                      snippet={snippet}
                      color="red"
                    />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="Algorithms">
              <div className="text-center text-slate-400">
                Content for Algorithms coming soon!
              </div>
            </TabsContent>
            <TabsContent value="Patterns">
              <div className="text-center text-slate-400">
                Content for Patterns coming soon!
              </div>
            </TabsContent>
          </Tabs>
        )}
      </TabsContent>
    </Tabs>
  );
}
