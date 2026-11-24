"use client";

import { CheatsheetCard } from "@/components/CheatsheetCard";
import { cheatsheets, type Snippet } from "@/lib/cheatsheets";
import { ALGORITHM_CATEGORIES, PATTERN_CATEGORIES } from "@/lib/dsa-interview";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function FilteredGrid({
  snippets,
  categories,
  param,
}: {
  snippets: Snippet[];
  categories: readonly string[];
  param: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get(param) ?? "All";
  const counts = new Map<string, number>();
  snippets.forEach((sn) => counts.set(sn.category ?? "", (counts.get(sn.category ?? "") ?? 0) + 1));
  const shown = active === "All" ? snippets : snippets.filter((sn) => sn.category === active);
  const pick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete(param);
    else params.set(param, value);
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };
  const chip = (on: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
      on ? "border-red-300 bg-red-400/15 text-red-200" : "border-slate-600 text-slate-300 hover:border-slate-400"
    );
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
        <button type="button" onClick={() => pick("All")} className={chip(active === "All")}>All ({snippets.length})</button>
        {categories.filter((c) => counts.get(c)).map((c) => (
          <button key={c} type="button" onClick={() => pick(c)} className={chip(active === c)}>
            {c} ({counts.get(c)})
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {shown.map((snippet) => (
          <CheatsheetCard key={snippet.title} snippet={snippet} color="red" />
        ))}
      </div>
    </div>
  );
}

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
      <TabsList className="grid h-auto w-full max-w-2xl mx-auto grid-cols-2 sm:grid-cols-4 bg-slate-800/50 border border-slate-700/50 mb-6 md:mb-8 gap-1">
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
            <TabsList className="grid h-auto w-full max-w-lg mx-auto grid-cols-3 bg-slate-800/50 border border-slate-700/50 mb-6 md:mb-8">
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
            <TabsList className="grid h-auto w-full max-w-lg mx-auto grid-cols-3 bg-slate-800/50 border border-slate-700/50 mb-6 md:mb-8">
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
              <FilteredGrid
                snippets={dsaCategory?.subCategories?.find((sc) => sc.name === "Algorithms")?.snippets ?? []}
                categories={ALGORITHM_CATEGORIES}
                param="topic"
              />
            </TabsContent>
            <TabsContent value="Patterns">
              <FilteredGrid
                snippets={dsaCategory?.subCategories?.find((sc) => sc.name === "Patterns")?.snippets ?? []}
                categories={PATTERN_CATEGORIES}
                param="ptopic"
              />
            </TabsContent>
          </Tabs>
        )}
      </TabsContent>
    </Tabs>
  );
}
