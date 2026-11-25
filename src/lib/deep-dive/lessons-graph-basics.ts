import type { Lesson, StateRow } from "./types";
import { Recorder, lesson } from "./recorder";

const G = "Graph search";

function bfsDfs(kind: "bfs" | "dfs"): Lesson {
  const r = new Recorder(
    [["A", 4, 0], ["B", 1.5, 2.5], ["C", 6.5, 2.5], ["D", 0, 5], ["E", 3, 5], ["F", 6.5, 5.5], ["G", 2, 8]],
    [["A", "B"], ["A", "C"], ["B", "D"], ["B", "E"], ["C", "F"], ["E", "G"], ["F", "E"]],
  );
  const bag = ["A"];
  const seen = new Set(["A"]);
  const order: string[] = [];
  const st = (): StateRow[] => [{ label: kind === "bfs" ? "Queue (front first)" : "Stack (top last)", value: bag.length ? [...bag] : ["empty"] }, { label: "Visit order", value: order.length ? [...order] : ["none"] }];
  r.node("A", { state: "frontier" });
  r.snap(kind === "bfs" ? "Breadth first" : "Depth first", kind === "bfs" ? "BFS explores in rings: all neighbours first, then their neighbours. A queue (first in, first out) does that. It finds shortest paths when every road costs the same." : "DFS goes as deep as it can, then backs up. A stack (last in, first out) or recursion does that. Great for exploring everything, cycles and connected parts.", [1, 2], st());
  while (bag.length) {
    const node = kind === "bfs" ? bag.shift()! : bag.pop()!;
    order.push(node);
    r.node(node, { state: "current" });
    const fresh = r.adj(node).map(([n]) => n).filter((n) => !seen.has(n)).sort();
    fresh.forEach((n) => (seen.add(n), r.node(n, { state: "frontier" }), r.edge(node, n, "chosen")));
    bag.push(...(kind === "bfs" ? fresh : [...fresh].reverse()));
    r.snap(`Visit ${node}`, fresh.length ? `Take ${node} from the ${kind === "bfs" ? "front of the queue" : "top of the stack"}. New neighbours ${fresh.join(", ")} are marked seen and added.` : `Take ${node}. No new neighbours.`, [4, 5, 6, 7], st());
    r.node(node, { state: "done" });
  }
  r.snap(`Order: ${order.join(" ")}`, "Both are O(V + E). Mark nodes seen when you ADD them, not when you visit, or they get added twice.", [9], st());
  const bfs = kind === "bfs";
  return lesson(
    { slug: bfs ? "graph-bfs" : "graph-dfs", title: bfs ? "Graph BFS" : "Graph DFS", question: bfs ? "Graph basics: BFS" : "Graph basics: DFS", group: G, blurb: bfs ? "A queue explores in rings." : "A stack dives deep first.", problem: bfs ? "Visit every node of a graph level by level." : "Visit every node of a graph going deep first." },
    `function ${bfs ? "bfs" : "dfs"}(graph, start) {
  const ${bfs ? "queue" : "stack"} = [start], seen = new Set([start]), order = [];
  while (${bfs ? "queue" : "stack"}.length) {
    const node = ${bfs ? "queue.shift(); // oldest first" : "stack.pop(); // newest first"}
    order.push(node);
    for (const next of graph[node]) {
      if (!seen.has(next)) { seen.add(next); ${bfs ? "queue" : "stack"}.push(next); }
    }
  }
  return order;
}`,
    r,
  );
}

function islands(): Lesson {
  const g = [
    [1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1],
    [0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1],
  ];
  const r = new Recorder([]);
  g.forEach((line, ro) => line.forEach((v, c) => r.add(`g${ro}_${c}`, c * 1.6, ro * 1.6, v ? "1" : "", { state: v ? "idle" : "dim" })));
  let count = 0;
  const st = (): StateRow[] => [{ label: "Islands", value: [String(count)] }];
  r.snap("Count the islands", "1 is land, blank is water. Land touching up, down, left or right is one island. Scan every cell; when you find unvisited land, count an island and flood-fill it so it isn't counted again.", [1, 2], st());
  const sink = (ro: number, c: number) => {
    if (ro < 0 || c < 0 || ro >= g.length || c >= g[0].length || g[ro][c] !== 1) return;
    g[ro][c] = 2;
    r.node(`g${ro}_${c}`, { state: "current", tag: String(count) });
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => sink(ro + a, c + b));
  };
  g.forEach((line, ro) => line.forEach((v, c) => {
    if (v !== 1) return;
    count++;
    sink(ro, c);
    r.snap(`Island ${count}`, `Found new land at (${ro}, ${c}). DFS floods every connected land cell and marks it visited.`, [4, 5, 6, 7], st());
    g.forEach((l, a) => l.forEach((x, b) => x === 2 && r.node(`g${a}_${b}`, { state: "done" })));
  }));
  r.snap(`Answer: ${count}`, "Each cell is touched a constant number of times: O(rows × cols). Union-Find also works and helps when land is added over time (Number of Islands II).", [9], st());
  return lesson(
    { slug: "number-of-islands", title: "Number of Islands", question: "200. Number of Islands", group: G, blurb: "Count, then flood-fill.", problem: "Count groups of connected land cells in a grid." },
    `function numIslands(grid) {
  let count = 0;
  const sink = (r, c) => {
    if (grid[r]?.[c] !== "1") return;
    grid[r][c] = "0"; // visited
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++)
    if (grid[r][c] === "1") { count++; sink(r, c); }
  return count;
}`,
    r,
  );
}

function floyd(): Lesson {
  const names = ["A", "B", "C", "D"];
  const INF = Infinity;
  const d = [
    [0, 3, INF, 7],
    [8, 0, 2, INF],
    [5, INF, 0, 1],
    [2, INF, INF, 0],
  ];
  const r = new Recorder([]);
  const G2 = 1.6;
  names.forEach((n, j) => r.add(`ch${j}`, (j + 1) * G2, 0, n, { state: "done" }));
  names.forEach((n, i) => r.add(`rh${i}`, 0, (i + 1) * G2, n, { state: "done" }));
  const fmt = (v: number) => (v === INF ? "∞" : String(v));
  d.forEach((line, i) => line.forEach((v, j) => r.add(`c${i}_${j}`, (j + 1) * G2, (i + 1) * G2, fmt(v))));
  r.snap("All pairs shortest paths", "The table holds the direct road time from each row city to each column city. Floyd-Warshall lets each city in turn act as a stop-over: is going through it faster?", [1, 2], []);
  names.forEach((via, k) => {
    const better: string[] = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      if (d[i][k] + d[k][j] < d[i][j]) {
        d[i][j] = d[i][k] + d[k][j];
        better.push(`${names[i]}→${names[j]}`);
        r.node(`c${i}_${j}`, { label: fmt(d[i][j]), state: "current" });
      } else r.node(`c${i}_${j}`, { state: i === k || j === k ? "frontier" : "idle" });
    }
    r.node(`rh${k}`, { state: "current" });
    r.node(`ch${k}`, { state: "current" });
    r.snap(`Stop over at ${via}`, better.length ? `Through ${via}, these got faster: ${better.join(", ")}. Each uses row ${via} + column ${via}.` : `Going through ${via} doesn't help anyone.`, [4, 5, 6], []);
    r.node(`rh${k}`, { state: "done" });
    r.node(`ch${k}`, { state: "done" });
  });
  r.snap("Every pair done", "Three nested loops: O(V³). Fine for a few hundred nodes; for one start node, Dijkstra is faster.", [8], []);
  return lesson(
    { slug: "floyd-warshall", title: "Floyd-Warshall", question: "1334. Find the City With the Smallest Number of Neighbors", group: "Shortest paths", blurb: "Every city as a stop-over.", problem: "Find the shortest distance between every pair of nodes." },
    `function floydWarshall(dist) { // dist[i][j] = direct road or Infinity
  const n = dist.length;
  for (let via = 0; via < n; via++)
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
      if (dist[i][via] + dist[via][j] < dist[i][j])
        dist[i][j] = dist[i][via] + dist[via][j]; // faster through via
  return dist;
}
`,
    r,
  );
}

export const GRAPH_BASIC_LESSONS: Lesson[] = [bfsDfs("bfs"), bfsDfs("dfs"), islands(), floyd()];
