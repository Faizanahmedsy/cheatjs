import type { Tone } from "@/components/ai-lab/engine/types";

export type { Tone };

export type NodeKind =
  | "user" | "internet" | "server" | "lb" | "db" | "replica" | "cache" | "bucket" | "file" | "queue" | "topic"
  | "lambda" | "cdn" | "dns" | "gateway" | "firewall" | "key" | "table" | "autoscale" | "disk" | "nat" | "role"
  | "policy" | "monitor" | "box";

export type AwsNode = {
  id: string;
  kind: NodeKind;
  label: string;
  sub?: string;
  /** Position on a 1000 × 500 canvas (the middle of the card). */
  x: number;
  y: number;
  tone?: Tone;
  /** The thing the whole app exists for. If nothing can reach it, the app is down. */
  goal?: boolean;
  /** Which zone box (an Availability Zone, a Region…) the node lives in, so a whole zone can fail at once. */
  zone?: string;
};

export type AwsLink = {
  id: string;
  from: string;
  to: string;
  label?: string;
  /** Moving dots show traffic on this line. */
  flow?: boolean;
  dashed?: boolean;
  tone?: Tone;
};

export type AwsZone = { id: string; label: string; x: number; y: number; w: number; h: number; tone?: Tone };

export type AwsScene = { nodes: AwsNode[]; links: AwsLink[]; zones: AwsZone[] };

/** The "break it" button: press it and watch what survives. */
export type Chaos = {
  label: string;
  /** Node ids or zone ids that stop working. */
  down: string[];
  /** Nodes and links that appear when the button is pressed (autoscaling adds servers on a spike). */
  add?: { nodes?: AwsNode[]; links?: AwsLink[] };
  /** Show a lot more traffic. */
  spike?: boolean;
  /** Hide the green/red "app works" badge (for security lessons where "works" is the wrong question). */
  noStatus?: boolean;
  /** Plain words: what just happened and why. */
  result: string;
};

export type AwsStep = {
  id: string;
  title: string;
  /** One plain sentence. */
  simple: string;
  /** Two or three short everyday sentences for someone who has never heard of the service. */
  easy: string;
  /** Interview mode: the real terms and limits. */
  detail?: string;
  analogy?: string;
  tip?: string;
  scene: AwsScene;
  chaos?: Chaos;
};

export type AwsQuiz = { id: string; q: string; options: string[]; correct: number; explain: string };

export type AwsLesson = {
  id: string;
  num: number;
  title: string;
  short: string;
  tagline: string;
  /** Starts with "Imagine". */
  imagine: string;
  recap: [string, string, string];
  steps: AwsStep[];
  quiz: AwsQuiz[];
  /** Matching study notes. */
  notes?: { label: string; href: string };
};

/** One step written as a change to the scene before it, so lessons stay short. */
export type StepDef = Omit<AwsStep, "scene"> & {
  add?: { nodes?: AwsNode[]; links?: AwsLink[]; zones?: AwsZone[] };
  remove?: string[];
  update?: Record<string, Partial<AwsNode>>;
};
