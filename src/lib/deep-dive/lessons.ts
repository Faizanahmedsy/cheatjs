import type { EdgeState, Lesson, NodeState, SceneEdge, SceneNode, StateRow, Step } from "./types";

/** Records the scene as an algorithm runs; every snap() becomes one step. */
class Recorder {
  nodes = new Map<string, SceneNode>();
  edges: SceneEdge[] = [];
  steps: Step[] = [];

  constructor(nodes: [string, number, number, string?][], edges: [string, string, number?][] = [], directed = false) {
    for (const [id, x, y, label] of nodes) this.nodes.set(id, { id, label: label ?? id, x, y, state: "idle" });
    this.edges = edges.map(([a, b, weight]) => ({ a, b, weight, directed, state: "idle" as EdgeState }));
  }

  node(id: string, patch: Partial<SceneNode>) {
    const n = this.nodes.get(id)!;
    this.nodes.set(id, { ...n, ...patch });
  }

  all(state: NodeState) {
    this.nodes.forEach((n, id) => this.nodes.set(id, { ...n, state }));
  }

  edge(a: string, b: string, state: EdgeState) {
    for (const e of this.edges) if ((e.a === a && e.b === b) || (!e.directed && e.a === b && e.b === a)) e.state = state;
  }

  /** Neighbours with weights, following edge direction when the graph is directed. */
  adj(id: string): [string, number][] {
    const out: [string, number][] = [];
    for (const e of this.edges) {
      if (e.a === id) out.push([e.b, e.weight ?? 1]);
      else if (!e.directed && e.b === id) out.push([e.a, e.weight ?? 1]);
    }
    return out;
  }

  snap(title: string, text: string, lines: number[], state: StateRow[]) {
    this.steps.push({
      title,
      text,
      lines,
      nodes: [...this.nodes.values()].map((n) => ({ ...n })),
      edges: this.edges.map((e) => ({ ...e })),
      state,
    });
  }
}

const inf = (v: number | undefined) => (v === undefined || v === Infinity ? "∞" : String(v));

/* ------------------------------------------------------------------ Dijkstra */
function dijkstra(): Lesson {
  const r = new Recorder(
    [["A", 1, 1], ["B", 4, 0], ["C", 1, 4], ["D", 5.2, 3.6], ["E", 7.8, 1], ["F", 7.5, 4.5]],
    [["A", "B", 4], ["A", "C", 2], ["C", "B", 1], ["B", "D", 5], ["C", "D", 8], ["B", "E", 10], ["D", "E", 3], ["D", "F", 6], ["E", "F", 2]],
  );
  const ids = ["A", "B", "C", "D", "E", "F"];
  const best: Record<string, number> = { A: 0 };
  const parent: Record<string, string> = {};
  let queue: [number, string][] = [[0, "A"]];
  const settled: string[] = [];
  const st = (): StateRow[] => [
    { label: "Best time", value: ids.map((i) => `${i} ${inf(best[i])}`) },
    { label: "Queue, smallest first", value: [...queue].sort((p, q) => p[0] - q[0]).map(([d, n]) => `${n}·${d}`) },
    { label: "Final", value: settled.length ? settled : ["none yet"] },
  ];
  ids.forEach((i) => r.node(i, { tag: "∞" }));
  r.node("A", { tag: "0", state: "frontier" });
  r.snap(
    "A signal from A",
    "A signal starts at A. The numbers on the roads are travel times. We want the fastest time to reach every node. A starts at 0, everything else at ∞ (not reached yet). A waits in the queue.",
    [1, 2, 3, 4],
    st(),
  );
  while (queue.length) {
    queue.sort((p, q) => p[0] - q[0]);
    const [time, node] = queue.shift()!;
    if (settled.includes(node)) {
      r.snap(`Old ticket for ${node}`, `${node} came out again with time ${time}, but it is already final with a faster time. This is an old, slower entry, so we just throw it away.`, [6, 7], st());
      continue;
    }
    settled.push(node);
    r.node(node, { state: "current" });
    r.snap(
      `Lock ${node} at ${time}`,
      `${node} has the smallest time in the queue (${time}). No other route can beat it, because every other route starts from something that is already slower. So ${node}'s time is now final.`,
      [6, 8],
      st(),
    );
    for (const [next, road] of r.adj(node)) {
      if (settled.includes(next)) continue;
      const newTime = time + road;
      r.edge(node, next, "active");
      if (newTime < (best[next] ?? Infinity)) {
        const old = best[next];
        if (parent[next]) r.edge(parent[next], next, "idle");
        best[next] = newTime;
        parent[next] = node;
        queue.push([newTime, next]);
        r.node(next, { tag: String(newTime), state: "frontier" });
        r.snap(
          `${node} to ${next}: ${newTime}`,
          old === undefined
            ? `Going through ${node}: ${time} + ${road} = ${newTime}. That is the first way we found to reach ${next}, so we write it down and put ${next} in the queue.`
            : `Going through ${node}: ${time} + ${road} = ${newTime}. That beats the old ${old}, so we replace it and add ${next} to the queue again.`,
          [9, 10, 11, 12, 13],
          st(),
        );
        r.edge(node, next, "chosen");
      } else {
        r.snap(
          `${node} to ${next}: no help`,
          `Going through ${node} gives ${time} + ${road} = ${newTime}, but ${next} already has ${best[next]}. Slower, so we change nothing.`,
          [10, 11],
          st(),
        );
        r.edge(node, next, parent[next] === node ? "chosen" : "idle");
      }
    }
    r.node(node, { state: "done" });
  }
  r.all("done");
  const answer = Math.max(...ids.map((i) => best[i]));
  r.snap(
    `Every node in ${answer}`,
    `The queue is empty and every node is final. The white roads are the fastest routes. The signal reaches the last node at time ${answer}, so that is the answer. Each node was locked once, which is why Dijkstra is fast: O((V + E) log V).`,
    [17],
    st(),
  );
  return {
    slug: "dijkstra",
    title: "Dijkstra's Algorithm",
    question: "743. Network Delay Time",
    group: "Shortest paths",
    blurb: "Always lock the closest node next.",
    problem:
      "A signal leaves node A and travels along roads, each with a travel time. How long until every node has the signal? Dijkstra answers this by always locking in the closest node next.",
    code: [
      "function networkDelay(graph, start) {",
      "  const bestTime = { [start]: 0 };",
      "  const queue = new MinQueue([[0, start]]); // smallest time comes out first",
      "  const final = new Set();",
      "  while (queue.size) {",
      "    const [time, node] = queue.popSmallest();",
      "    if (final.has(node)) continue; // old, slower entry",
      "    final.add(node); // nothing can beat this time now",
      "    for (const [next, road] of graph[node]) {",
      "      const newTime = time + road;",
      "      if (newTime < (bestTime[next] ?? Infinity)) {",
      "        bestTime[next] = newTime;",
      "        queue.push([newTime, next]);",
      "      }",
      "    }",
      "  }",
      "  return Math.max(...Object.values(bestTime));",
      "}",
    ],
    steps: r.steps,
  };
}

/* ------------------------------------------------- Bellman-Ford (K stops) */
function cheapestFlights(): Lesson {
  const r = new Recorder(
    [["S", 1, 2.5, "Src"], ["A", 4, 0.5], ["B", 4, 4.5], ["D", 7.5, 2.5, "Dst"]],
    [["S", "A", 100], ["S", "B", 450], ["A", "B", 100], ["A", "D", 600], ["B", "D", 200]],
    true,
  );
  const ids = ["S", "A", "B", "D"];
  const name = (i: string) => (i === "S" ? "Src" : i === "D" ? "Dst" : i);
  let price: Record<string, number> = { S: 0 };
  const maxStops = 1;
  const st = (round: number, next?: Record<string, number>): StateRow[] => [
    { label: "Price before this round", value: ids.map((i) => `${name(i)} ${inf(price[i])}`) },
    ...(next ? [{ label: "Price after this round", value: ids.map((i) => `${name(i)} ${inf(next[i])}`) }] : []),
    { label: "Round", value: [`${round} of ${maxStops + 1}`, `flights allowed: ${round}`] },
  ];
  r.node("S", { tag: "0", state: "frontier" });
  ids.slice(1).forEach((i) => r.node(i, { tag: "∞" }));
  r.snap(
    "At most 1 stop",
    "Find the cheapest trip from Src to Dst with at most 1 stop, so at most 2 flights. The cheapest trip overall is Src → A → B → Dst (400), but that has 2 stops, so it is not allowed. Watch how the rounds make sure of that.",
    [1, 2],
    st(0),
  );
  for (let round = 1; round <= maxStops + 1; round++) {
    const next = { ...price };
    r.snap(
      `Round ${round}: copy prices`,
      `Each round allows one more flight. We copy the prices first and only read from the old copy. That way a price found this round cannot be used again in the same round, so nobody sneaks in an extra flight.`,
      [3, 4],
      st(round, next),
    );
    for (const e of r.edges) {
      if (price[e.a] === undefined) continue;
      const total = price[e.a] + (e.weight ?? 0);
      r.edge(e.a, e.b, "active");
      if (total < (next[e.b] ?? Infinity)) {
        const old = next[e.b];
        next[e.b] = total;
        r.node(e.b, { tag: String(total), state: "frontier" });
        r.snap(
          `${name(e.a)} → ${name(e.b)}: ${total}`,
          `${name(e.a)} cost ${price[e.a]} (old copy) + flight ${e.weight} = ${total}. ${old === undefined ? `First price for ${name(e.b)}.` : `Cheaper than ${old}, so we keep ${total}.`}`,
          [5, 6, 7, 8],
          st(round, next),
        );
        r.edge(e.a, e.b, "chosen");
      } else {
        r.snap(
          `${name(e.a)} → ${name(e.b)}: no help`,
          `${name(e.a)} ${price[e.a]} + ${e.weight} = ${total}, not cheaper than ${next[e.b]}. Skip.`,
          [7, 8],
          st(round, next),
        );
        r.edge(e.a, e.b, "idle");
      }
    }
    price = next;
  }
  r.edges.forEach((e) => (e.state = "dim"));
  r.edge("S", "B", "chosen");
  r.edge("B", "D", "chosen");
  r.node("D", { state: "current" });
  r.snap(
    "Answer: 650",
    "Two rounds done, so trips have at most 2 flights. Dst costs 650 (Src → B → Dst). The 400 trip never showed up, because it needs 3 flights and we only ran 2 rounds. Cost: O(K × flights).",
    [10, 12],
    st(maxStops + 1),
  );
  return {
    slug: "cheapest-flights",
    title: "Bellman-Ford with K stops",
    question: "787. Cheapest Flights Within K Stops",
    group: "Shortest paths",
    blurb: "One round adds one more flight.",
    problem:
      "Flights have prices. Find the cheapest way from Src to Dst using at most K stops. Plain Dijkstra fails here, because the cheapest path may use too many stops. Bellman-Ford with rounds counts the flights for us.",
    code: [
      "function cheapestFlight(flights, from, to, maxStops) {",
      "  let price = { [from]: 0 };",
      "  for (let round = 0; round <= maxStops; round++) {",
      "    const nextPrice = { ...price }; // read old, write new",
      "    for (const [start, end, cost] of flights) {",
      "      if (price[start] === undefined) continue;",
      "      const total = price[start] + cost;",
      "      if (total < (nextPrice[end] ?? Infinity)) nextPrice[end] = total;",
      "    }",
      "    price = nextPrice;",
      "  }",
      "  return price[to] ?? -1;",
      "}",
    ],
    steps: r.steps,
  };
}

/* ------------------------------------------------------- Topological sort */
function courseSchedule(): Lesson {
  const r = new Recorder(
    [["A", 1, 0.5], ["B", 1, 4], ["C", 4, 1.5], ["E", 4, 5], ["D", 7, 0.5], ["F", 7.5, 4]],
    [["A", "C"], ["B", "C"], ["C", "D"], ["B", "E"], ["D", "F"], ["E", "F"], ["C", "F"]],
    true,
  );
  const ids = ["A", "B", "C", "D", "E", "F"];
  const waiting: Record<string, number> = Object.fromEntries(ids.map((i) => [i, 0]));
  r.edges.forEach((e) => waiting[e.b]++);
  const ready = ids.filter((i) => waiting[i] === 0);
  const order: string[] = [];
  const st = (): StateRow[] => [
    { label: "Still waiting on", value: ids.map((i) => `${i} ${waiting[i]}`) },
    { label: "Ready to take", value: ready.length ? [...ready] : ["empty"] },
    { label: "Order", value: order.length ? [...order] : ["empty"] },
  ];
  ids.forEach((i) => r.node(i, { tag: String(waiting[i]) }));
  r.snap(
    "Courses with arrows",
    "An arrow A → C means: finish A before C. We need an order to take every course. The number on each block is how many courses it still waits for.",
    [1, 2, 3],
    st(),
  );
  ready.forEach((i) => r.node(i, { state: "frontier" }));
  r.snap("Who can start now?", `Courses waiting on 0 can be taken right away: ${ready.join(" and ")}. They go into the ready line.`, [4], st());
  while (ready.length) {
    const course = ready.shift()!;
    order.push(course);
    r.node(course, { state: "current" });
    r.snap(`Take ${course}`, `${course} is first in line, so we take it and add it to the order.`, [7, 8], st());
    for (const [next] of r.adj(course)) {
      waiting[next]--;
      r.edge(course, next, "chosen");
      r.node(next, { tag: String(waiting[next]) });
      if (waiting[next] === 0) {
        ready.push(next);
        r.node(next, { state: "frontier" });
      }
      r.snap(
        `${next} waits on ${waiting[next]}`,
        waiting[next] === 0 ? `${course} was the last thing ${next} needed. ${next} is now ready, so it joins the line.` : `${course} is done, so ${next} waits on one less course. Still ${waiting[next]} to go.`,
        [9, 10, 11],
        st(),
      );
    }
    r.node(course, { state: "done" });
  }
  r.snap(
    `Order: ${order.join(" ")}`,
    `All ${ids.length} courses made it into the order, so a valid plan exists. If some course never reached 0, there would be a loop (A needs B, B needs A) and we would return an empty list. Cost: O(V + E).`,
    [14],
    st(),
  );
  return {
    slug: "course-schedule",
    title: "Topological Sort",
    question: "210. Course Schedule II",
    group: "Ordering",
    blurb: "Take what's ready, unlock what's next.",
    problem:
      "Some courses must be finished before others. Find an order that takes every course, or report that it's impossible. This is a topological sort, using Kahn's method of counting what each course is waiting on.",
    code: [
      "function courseOrder(courses, needs) {",
      "  const waitingOn = countIncomingArrows(courses, needs);",
      "  const unlocks = arrowsLeaving(courses, needs);",
      "  const ready = courses.filter((c) => waitingOn[c] === 0);",
      "  const order = [];",
      "  while (ready.length) {",
      "    const course = ready.shift();",
      "    order.push(course);",
      "    for (const next of unlocks[course]) {",
      "      waitingOn[next]--;",
      "      if (waitingOn[next] === 0) ready.push(next);",
      "    }",
      "  }",
      "  return order.length === courses.length ? order : [];",
      "}",
    ],
    steps: r.steps,
  };
}

/* -------------------------------------------- Shared graph for the MST pair */
const MST_NODES: [string, number, number][] = [["A", 1, 1], ["B", 4.5, 0], ["C", 1, 4.5], ["D", 4.5, 3], ["E", 8, 1], ["F", 7.5, 5]];
const MST_EDGES: [string, string, number][] = [["A", "B", 4], ["A", "C", 3], ["B", "D", 2], ["C", "D", 5], ["A", "D", 6], ["B", "E", 7], ["D", "E", 8], ["D", "F", 4], ["E", "F", 1], ["C", "F", 9]];

/* ------------------------------------------------------------- Kruskal */
function kruskal(): Lesson {
  const r = new Recorder(MST_NODES, MST_EDGES);
  const ids = MST_NODES.map((n) => n[0]);
  const leader: Record<string, string> = Object.fromEntries(ids.map((i) => [i, i]));
  const find = (x: string): string => (leader[x] === x ? x : (leader[x] = find(leader[x])));
  const sorted = [...MST_EDGES].sort((p, q) => p[2] - q[2]);
  let total = 0;
  const picked: string[] = [];
  const st = (): StateRow[] => [
    { label: "Group leader", value: ids.map((i) => `${i}→${find(i)}`) },
    { label: "Roads kept", value: picked.length ? [...picked] : ["none yet"] },
    { label: "Total cost", value: [String(total)] },
  ];
  ids.forEach((i) => r.node(i, { tag: i }));
  r.snap(
    "Connect every city",
    "Connect all 6 cities using the cheapest total road cost. You never need a loop: a loop always has one road you can remove. The tag on each block shows which group it is in. Right now every city is its own group.",
    [1, 2, 3],
    st(),
  );
  r.snap("Cheapest roads first", `Sort the roads by cost: ${sorted.map((e) => `${e[0]}${e[1]}·${e[2]}`).join(", ")}. Then try them one by one.`, [4], st());
  for (const [a, b, w] of sorted) {
    if (picked.length === ids.length - 1) break;
    const ga = find(a);
    const gb = find(b);
    r.edge(a, b, "active");
    r.node(a, { state: "current" });
    r.node(b, { state: "current" });
    if (ga === gb) {
      r.snap(`${a}–${b} makes a loop`, `${a} and ${b} already share the leader ${ga}, so they are connected. Adding this road would make a loop, so we skip it.`, [7, 8], st());
      r.edge(a, b, "dim");
    } else {
      leader[ga] = gb;
      total += w;
      picked.push(`${a}${b}`);
      ids.forEach((i) => r.node(i, { tag: find(i) }));
      r.snap(`Keep ${a}–${b} (${w})`, `${a} is in group ${ga}, ${b} is in group ${gb}. Different groups, so the road joins them without a loop. Merge: ${ga}'s leader is now ${gb}. Total = ${total}.`, [7, 9, 10], st());
      r.edge(a, b, "chosen");
    }
    r.node(a, { state: "done" });
    r.node(b, { state: "done" });
  }
  r.edges.forEach((e) => e.state !== "chosen" && (e.state = "dim"));
  r.snap(
    `Total: ${total}`,
    `${ids.length - 1} roads join ${ids.length} cities, so we can stop. All cities share one leader. Cost: sorting the roads, O(E log E). Union-Find makes each "same group?" check almost instant.`,
    [12],
    st(),
  );
  return {
    slug: "kruskal",
    title: "Kruskal + Union-Find",
    question: "1584. Min Cost to Connect All Points",
    group: "Spanning trees",
    blurb: "Cheapest road first, skip loops.",
    problem:
      "Join every city with roads so the total cost is as small as possible. Kruskal sorts the roads and keeps each one that joins two different groups. Union-Find tells us which group a city is in.",
    code: [
      "function cheapestNetwork(cities, roads) {",
      "  const leader = Object.fromEntries(cities.map((c) => [c, c]));",
      "  const findLeader = (c) => (leader[c] === c ? c : (leader[c] = findLeader(leader[c])));",
      "  roads.sort((a, b) => a.cost - b.cost);",
      "  let total = 0;",
      "  for (const { from, to, cost } of roads) {",
      "    const groupA = findLeader(from), groupB = findLeader(to);",
      "    if (groupA === groupB) continue; // would make a loop",
      "    leader[groupA] = groupB; // merge the two groups",
      "    total += cost;",
      "  }",
      "  return total;",
      "}",
    ],
    steps: r.steps,
  };
}

/* ---------------------------------------------------------------- Prim */
function prim(): Lesson {
  const r = new Recorder(MST_NODES, MST_EDGES);
  const joined: string[] = ["A"];
  let total = 0;
  let pool: [number, string, string][] = [];
  const push = (n: string) => r.adj(n).forEach(([to, w]) => !joined.includes(to) && pool.push([w, n, to]));
  const st = (): StateRow[] => [
    { label: "Joined", value: [...joined] },
    { label: "Roads leaving the group", value: [...pool].sort((p, q) => p[0] - q[0]).map(([w, a, b]) => `${a}${b}·${w}`) },
    { label: "Total cost", value: [String(total)] },
  ];
  r.node("A", { state: "done" });
  r.snap("Start at A", "Same job as Kruskal: connect every city as cheaply as possible. Prim grows one group outward from A, like a puddle spreading.", [1, 2], st());
  push("A");
  pool.forEach(([, a, b]) => r.edge(a, b, "active"));
  r.snap("Roads out of A", "Every road leaving the group goes into a min-queue, so the cheapest one is always on top.", [3], st());
  while (pool.length) {
    pool.sort((p, q) => p[0] - q[0]);
    const [w, from, to] = pool.shift()!;
    if (joined.includes(to)) {
      r.edge(from, to, "dim");
      r.snap(`${from}–${to}: both inside`, `${to} already joined the group, so this road would only make a loop. Throw it away.`, [6, 7], st());
      continue;
    }
    joined.push(to);
    total += w;
    r.edge(from, to, "chosen");
    r.node(to, { state: "current" });
    push(to);
    pool.forEach(([, a, b]) => r.edges.find((e) => ((e.a === a && e.b === b) || (e.a === b && e.b === a)) && e.state === "idle") && r.edge(a, b, "active"));
    r.snap(`Add ${to} (${w})`, `${from}–${to} at ${w} is the cheapest road leaving the group. ${to} joins and its roads go into the queue. Total = ${total}.`, [6, 8, 9, 10], st());
    r.node(to, { state: "done" });
  }
  r.edges.forEach((e) => e.state !== "chosen" && (e.state = "dim"));
  r.snap(
    `Total: ${total}`,
    `Same total as Kruskal (${total}), found in a different order. Prim fits crowded graphs with many roads; Kruskal fits sparse ones. Cost: O(E log V).`,
    [12],
    st(),
  );
  return {
    slug: "prim",
    title: "Prim's Algorithm",
    question: "1584. Min Cost to Connect All Points",
    group: "Spanning trees",
    blurb: "Grow one group, cheapest edge out.",
    problem: "Connect every city with the cheapest total road cost, this time by growing one connected group from a start city, always taking the cheapest road that leaves it.",
    code: [
      "function cheapestNetwork(graph, start) {",
      "  const joined = new Set([start]);",
      "  const roads = new MinQueue(graph[start]); // roads leaving the group",
      "  let total = 0;",
      "  while (roads.size) {",
      "    const { to, cost } = roads.popSmallest();",
      "    if (joined.has(to)) continue; // both ends inside",
      "    joined.add(to);",
      "    total += cost;",
      "    for (const road of graph[to]) roads.push(road);",
      "  }",
      "  return total;",
      "}",
    ],
    steps: r.steps,
  };
}

/* --------------------------------------------------------- Word Ladder */
function wordLadder(): Lesson {
  const words: [string, number, number][] = [["hit", 0.5, 2.5], ["hot", 3, 2.5], ["dot", 5.5, 0.5], ["lot", 5.5, 4.5], ["dog", 8, 0.5], ["log", 8, 4.5], ["cog", 10, 2.5]];
  const oneOff = (a: string, b: string) => [...a].filter((ch, i) => ch !== b[i]).length === 1;
  const pairs: [string, string][] = [];
  words.forEach(([a], i) => words.slice(i + 1).forEach(([b]) => oneOff(a, b) && pairs.push([a, b])));
  const r = new Recorder(words.map(([w, x, y]) => [w, x, y]), pairs);
  const queue: [string, number][] = [["hit", 1]];
  const seen = ["hit"];
  const st = (): StateRow[] => [
    { label: "Queue (word, length)", value: queue.length ? queue.map(([w, n]) => `${w}·${n}`) : ["empty"] },
    { label: "Seen", value: [...seen] },
  ];
  r.snap(
    "hit to cog",
    "Change hit into cog one letter at a time, and every word on the way must be in the list. Lines join words that differ by one letter. We want the shortest chain. Shortest + same cost per step = BFS.",
    [1, 2],
    st(),
  );
  r.node("hit", { state: "frontier", tag: "1" });
  r.snap("Start the queue", "hit goes into the queue with length 1 (one word used so far).", [3, 4], st());
  let answer = 0;
  while (queue.length && !answer) {
    const [word, len] = queue.shift()!;
    r.node(word, { state: "current" });
    if (word === "cog") {
      answer = len;
      r.snap(`Reached cog: ${len}`, `cog came out of the queue with length ${len}. BFS visits words in order of distance, so the first time we reach cog is the shortest chain.`, [6, 7], st());
      break;
    }
    r.snap(`Open ${word}`, `${word} is first in the queue (length ${len}). Look at every word one letter away from it.`, [6, 8], st());
    for (const [next] of r.adj(word)) {
      if (seen.includes(next)) continue;
      seen.push(next);
      queue.push([next, len + 1]);
      r.edge(word, next, "chosen");
      r.node(next, { state: "frontier", tag: String(len + 1) });
    }
    r.snap(`New words from ${word}`, `Every unseen neighbour joins the queue with length ${len + 1}. We mark them seen now, so no word is added twice.`, [9, 10, 11], st());
    r.node(word, { state: "done" });
  }
  r.edges.forEach((e) => e.state !== "chosen" && (e.state = "dim"));
  r.snap(
    `Answer: ${answer}`,
    `hit → hot → dot → dog → cog is ${answer} words. In the real question we don't have the lines drawn, so for each word we try all 26 letters in each position. Cost: O(words × length × 26).`,
    [7],
    st(),
  );
  return {
    slug: "word-ladder",
    title: "Word Ladder (BFS)",
    question: "127. Word Ladder",
    group: "Graph search",
    blurb: "A hidden graph, solved with BFS.",
    problem: "Turn one word into another by changing one letter at a time, using only words from a list. Find the shortest chain. The words form a hidden graph, and BFS finds the shortest path in it.",
    code: [
      "function ladderLength(startWord, endWord, wordList) {",
      "  const words = new Set(wordList);",
      "  const queue = [[startWord, 1]];",
      "  const seen = new Set([startWord]);",
      "  while (queue.length) {",
      "    const [word, length] = queue.shift();",
      "    if (word === endWord) return length;",
      "    for (const nextWord of oneLetterAway(word, words)) {",
      "      if (seen.has(nextWord)) continue;",
      "      seen.add(nextWord);",
      "      queue.push([nextWord, length + 1]);",
      "    }",
      "  }",
      "  return 0;",
      "}",
    ],
    steps: r.steps,
  };
}

/* ------------------------------------------------ Tarjan: bridges */
function bridges(): Lesson {
  const r = new Recorder(
    [["A", 1, 1], ["B", 4, 2.5], ["C", 1, 4.5], ["D", 7, 2.5], ["E", 9.5, 1], ["F", 9.5, 4.5]],
    [["A", "B"], ["B", "C"], ["C", "A"], ["B", "D"], ["D", "E"], ["E", "F"], ["F", "D"]],
  );
  const visit: Record<string, number> = {};
  const low: Record<string, number> = {};
  const found: string[] = [];
  let clock = 0;
  const ids = ["A", "B", "C", "D", "E", "F"];
  const tag = (n: string) => r.node(n, { tag: `${visit[n]}/${low[n]}` });
  const st = (): StateRow[] => [
    { label: "visit / lowest", value: ids.filter((i) => visit[i] !== undefined).map((i) => `${i} ${visit[i]}/${low[i]}`) },
    { label: "Bridges", value: found.length ? [...found] : ["none yet"] },
  ];
  r.snap(
    "Which roads are critical?",
    "A critical road (a bridge) is one that splits the network in two if it breaks. Roads inside a loop are safe, because there is another way around. We walk with DFS and give each node two numbers.",
    [1, 2],
    st(),
  );
  const explore = (node: string, parent: string | null) => {
    visit[node] = low[node] = clock++;
    r.node(node, { state: "current" });
    tag(node);
    r.snap(`Visit ${node} at ${visit[node]}`, `${node} gets visit time ${visit[node]}. Its "lowest" number starts the same. Lowest means: the earliest node I can reach without using the road I came in on.`, [3, 4], st());
    for (const [next] of r.adj(node)) {
      if (next === parent) continue;
      if (visit[next] === undefined) {
        r.edge(node, next, "active");
        explore(next, node);
        r.node(node, { state: "current" });
        const before = low[node];
        low[node] = Math.min(low[node], low[next]);
        tag(node);
        if (low[next] > visit[node]) {
          found.push(`${node}–${next}`);
          r.edge(node, next, "chosen");
          r.snap(
            `${node}–${next} is a bridge`,
            `Back at ${node}. ${next}'s lowest (${low[next]}) is bigger than ${node}'s visit time (${visit[node]}). So nothing below ${next} can climb back above it. Cut this road and they are cut off.`,
            [8, 9, 10],
            st(),
          );
        } else {
          r.edge(node, next, "dim");
          r.snap(
            `${node}–${next} is safe`,
            `Back at ${node}. ${next} can climb back to time ${low[next]}, which is not after ${node} (time ${visit[node]}), so a loop goes around this road. ${node}'s lowest ${before === low[node] ? `stays ${low[node]}` : `drops to ${low[node]}`}.`,
            [8, 9, 10],
            st(),
          );
        }
      } else if (visit[next] < visit[node]) {
        low[node] = Math.min(low[node], visit[next]);
        tag(node);
        r.edge(node, next, "dim");
        r.snap(`Back road ${node}–${next}`, `${next} was visited earlier (time ${visit[next]}). This road is a shortcut back up, so ${node}'s lowest becomes ${low[node]}. That's how loops get found.`, [11], st());
      }
    }
    r.node(node, { state: "done" });
  };
  explore("A", null);
  r.snap(
    `Bridges: ${found.join(", ")}`,
    `B–D is the only road joining the two loops, so it is the one critical connection. Every node and road is checked once: O(V + E). This is Tarjan's method.`,
    [15],
    st(),
  );
  return {
    slug: "critical-connections",
    title: "Bridges (Tarjan)",
    question: "1192. Critical Connections in a Network",
    group: "Graph search",
    blurb: "DFS with visit time and lowest reach.",
    problem: "Find every road whose loss would split the network into two parts. One DFS works this out by tracking how far back up each part of the graph can reach.",
    code: [
      "function criticalConnections(graph, start) {",
      "  const visitTime = {}, lowest = {}, bridges = []; let clock = 0;",
      "  function explore(node, parent) {",
      "    visitTime[node] = lowest[node] = clock++;",
      "    for (const next of graph[node]) {",
      "      if (next === parent) continue;",
      "      if (visitTime[next] === undefined) {",
      "        explore(next, node);",
      "        lowest[node] = Math.min(lowest[node], lowest[next]);",
      "        if (lowest[next] > visitTime[node]) bridges.push([node, next]);",
      "      } else lowest[node] = Math.min(lowest[node], visitTime[next]); // road back up",
      "    }",
      "  }",
      "  explore(start, null);",
      "  return bridges;",
      "}",
    ],
    steps: r.steps,
  };
}

/* ---------------------------------------------------------------- LRU */
function lru(): Lesson {
  const keys = ["A", "B", "C", "D"];
  const r = new Recorder(keys.map((k) => [k, 1.5, 2.5]));
  const capacity = 3;
  let list: string[] = []; // newest first
  const place = (hot?: string) => {
    keys.forEach((k) => {
      const i = list.indexOf(k);
      if (i < 0) r.node(k, { state: "hidden", tag: undefined });
      else r.node(k, { x: 1.5 + i * 2.8, y: 2.5 - i * 0.4, state: k === hot ? "current" : "idle", tag: i === 0 ? "newest" : i === list.length - 1 && list.length > 1 ? "oldest" : undefined });
    });
    r.edges = list.slice(1).map((k, i) => ({ a: list[i], b: k, state: "idle" as EdgeState }));
  };
  const st = (): StateRow[] => [
    { label: "In the map", value: list.length ? [...list].sort() : ["empty"] },
    { label: "Recently used, newest first", value: list.length ? [...list] : ["empty"] },
    { label: "Room", value: [`${list.length} of ${capacity}`] },
  ];
  place();
  r.snap(
    "A cache with a limit",
    "A cache keeps recent answers close so we don't work them out again. It holds only 3. When it's full, something must go: we throw out whatever was used least recently.",
    [1, 2],
    st(),
  );
  for (const k of ["A", "B", "C"]) {
    list = [k, ...list];
    place(k);
    r.snap(`put ${k}`, `${k} is new, so it goes to the front of the list (newest) and into the map. The map points straight at its block in the list.`, [9, 15], st());
  }
  list = ["A", ...list.filter((k) => k !== "A")];
  place("A");
  r.snap(
    "get A",
    "Find A through the map in one step, no searching. A was just used, so we unhook it and move it to the front. Each block knows the one before and after it, so unhooking is also one step.",
    [3, 4, 6, 7],
    st(),
  );
  const oldest = list[list.length - 1];
  r.node(oldest, { state: "dim" });
  r.snap(`put D: full`, `D is new but there is no room (3 of 3). The oldest block is at the back: ${oldest}. It goes, from both the list and the map.`, [11, 12, 13], st());
  list = ["D", ...list.slice(0, -1)];
  place("D");
  r.snap("D at the front", `${oldest} is gone and D sits at the front. Every operation took one step: O(1) for both get and put.`, [15], st());
  list = ["C", ...list.filter((k) => k !== "C")];
  place("C");
  r.snap(
    "Two structures, one job",
    "get C moves C to the front again. The map answers \"where is it?\", the list answers \"who is oldest?\". Neither can do both alone, which is why LRU uses both.",
    [3, 6],
    st(),
  );
  return {
    slug: "lru-cache",
    title: "LRU Cache",
    question: "146. LRU Cache",
    group: "Design",
    blurb: "A map plus a doubly linked list.",
    problem: "Build a cache with a size limit where get and put both take O(1). When it's full, remove the entry used least recently. A hash map gives fast lookup; a doubly linked list keeps the order of use.",
    code: [
      "class LRUCache {",
      "  constructor(capacity) { this.capacity = capacity; this.map = new Map(); this.list = new DoublyLinkedList(); }",
      "  get(key) {",
      "    const node = this.map.get(key); // straight to it",
      "    if (!node) return -1;",
      "    this.list.moveToFront(node); // just used, so newest",
      "    return node.value;",
      "  }",
      "  put(key, value) {",
      "    if (this.map.has(key)) this.list.remove(this.map.get(key));",
      "    else if (this.map.size === this.capacity) {",
      "      const oldest = this.list.removeLast();",
      "      this.map.delete(oldest.key);",
      "    }",
      "    this.map.set(key, this.list.addToFront(key, value));",
      "  }",
      "}",
    ],
    steps: r.steps,
  };
}

export const LESSONS: Lesson[] = [dijkstra(), cheapestFlights(), courseSchedule(), kruskal(), prim(), wordLadder(), bridges(), lru()];

export const findLesson = (slug: string) => LESSONS.find((l) => l.slug === slug);
