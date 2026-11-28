import type { InterviewQuestion, QuizQuestion, Scenario, Step } from "../engine/types";

/**
 * Beginner ("Start here") topics are mostly pictures and plain words, so they share one skeleton:
 * a simple flow scene for the Flow tab and the usual trace table. A topic only supplies its story.
 */
export function beginnerTopic(o: {
  id: string;
  title: string;
  tagline: string;
  imagine: string;
  recap: [string, string, string];
  plain: string;
  definition: string;
  analogy: string;
  facts: [string, string][];
  whereUsed: string;
  steps: Step[];
  interview: InterviewQuestion[];
  quiz: QuizQuestion[];
}): Scenario {
  return {
    id: o.id,
    title: o.title,
    tagline: o.tagline,
    imagine: o.imagine,
    recap: o.recap,
    overview: { plain: o.plain, definition: o.definition, analogy: o.analogy, facts: o.facts, whereUsed: o.whereUsed },
    objects: [
      { id: "in", kind: "table", label: "What goes in", sub: "examples or a question", at: [0, 0], tone: "blue" },
      { id: "ai", kind: "box", label: "The AI", sub: "finds patterns", at: [3.6, 0], tone: "violet" },
      { id: "out", kind: "chat", label: "What comes out", sub: "an answer or a guess", at: [7.2, 0], tone: "green" },
    ],
    links: [
      { id: "l1", from: "in", to: "ai" },
      { id: "l2", from: "ai", to: "out" },
    ],
    logTitle: "Notes",
    logColumns: [
      { key: "idea", label: "Idea", width: "30%" },
      { key: "plain", label: "In plain words" },
    ],
    steps: o.steps,
    interview: o.interview,
    quiz: o.quiz,
  };
}
