import type { Lesson, StateRow } from "./types";
import { Recorder } from "./recorder";

/* Hard graph questions that Google and Microsoft like to ask. */

/* ---------------------------------------------- Course Schedule: find a loop */
function courseCycle(): Lesson {
  const r = new Recorder(
    [["A", 1, 2.5], ["B", 4, 0.5], ["C", 7.5, 0.5], ["D", 6, 4], ["E", 2.5, 5.5]],
    [["A", "B"], ["B", "C"], ["C", "D"], ["D", "B"], ["A", "E"]],
    true,
  );
  const status: Record<string, number> = {};
  const path: string[] = [];
  const st = (): StateRow[] => [
    { label: "On my current path", value: path.length ? [...path] : ["empty"] },
    { label: "Finished (safe)", value: Object.keys(status).filter((k) => status[k] === 2).concat().length ? Object.keys(status).filter((k) => status[k] === 2) : ["none yet"] },
  ];
  r.snap(
    "Can you finish every course?",
    "An arrow A → B means A leads into B. If the arrows ever go round in a loop, nobody can finish those courses. DFS finds a loop by remembering which courses are on the path it is walking right now.",
    [1, 2],
    st(),
  );
  let found = false;
  const walk = (c: string, from?: string): boolean => {
    if (from) r.edge(from, c, "active");
    if (status[c] === 1) {
      r.node(c, { state: "current" });
      r.snap(`Back to ${c}: loop!`, `${c} is already on the path we are walking (${path.join(" → ")}). We came back to it, so the arrows form a loop. Answer: false.`, [4], st());
      return true;
    }
    if (status[c] === 2) return false;
    status[c] = 1;
    path.push(c);
    r.node(c, { state: "frontier", tag: "on path" });
    r.snap(`Walk into ${c}`, `Mark ${c} as "on my path", then follow its arrows.`, [6, 7], st());
    for (const [n] of r.adj(c)) if (walk(n, c)) return true;
    status[c] = 2;
    path.pop();
    r.node(c, { state: "done", tag: "safe" });
    r.snap(`${c} is safe`, `Every arrow out of ${c} ended without a loop. Mark it finished, so we never check it again.`, [8, 9], st());
    return false;
  };
  found = walk("A");
  if (!found) r.snap("No loop", "Every course finished cleanly.", [11], st());
  r.snap(
    "Why three states?",
    "A plain \"seen\" flag is not enough: a course seen in an older, finished walk is safe, but a course on the current path means a loop. That's the trick. Cost: O(V + E).",
    [2, 11],
    st(),
  );
  return {
    slug: "course-schedule-cycle",
    title: "Cycle in a Directed Graph",
    question: "207. Course Schedule",
    group: "Ordering",
    blurb: "DFS with three states finds loops.",
    problem: "Courses depend on other courses. Can you finish all of them? Only if the dependency arrows never form a loop. DFS with three states (new, on path, finished) finds a loop.",
    code: [
      "function canFinish(courses, needs) {",
      "  const status = {}; // undefined new, 1 on my path, 2 finished",
      "  function hasLoop(course) {",
      "    if (status[course] === 1) return true; // back on my own path",
      "    if (status[course] === 2) return false; // checked before, safe",
      "    status[course] = 1;",
      "    for (const next of needs[course]) if (hasLoop(next)) return true;",
      "    status[course] = 2;",
      "    return false;",
      "  }",
      "  return courses.every((course) => !hasLoop(course));",
      "}",
    ],
    steps: r.steps,
  };
}

/* -------------------------------------------------------------- Bipartite */
function bipartite(): Lesson {
  const r = new Recorder(
    [["A", 1, 1], ["B", 4, 0.5], ["C", 4, 4], ["D", 1, 4.5], ["E", 7.5, 2.5], ["F", 7, 6]],
    [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["C", "E"], ["E", "F"], ["F", "C"]],
  );
  const team: Record<string, number> = {};
  const queue: string[] = [];
  const st = (): StateRow[] => [
    { label: "Team", value: Object.entries(team).map(([k, v]) => `${k} ${v === 0 ? "orange" : "grey"}`) },
    { label: "Queue", value: queue.length ? [...queue] : ["empty"] },
  ];
  const paint = (n: string) => r.node(n, { state: team[n] === 0 ? "frontier" : "done", tag: team[n] === 0 ? "orange" : "grey" });
  r.snap(
    "Split into two teams",
    "Can we split the nodes into two teams so every line joins two different teams? Think of it as rivals who must never be on the same team.",
    [1],
    st(),
  );
  team.A = 0;
  queue.push("A");
  paint("A");
  r.snap("A joins orange", "Start anywhere. A goes to team orange.", [5], st());
  let ok = true;
  while (queue.length && ok) {
    const node = queue.shift()!;
    for (const [next] of r.adj(node)) {
      r.edge(node, next, "active");
      if (team[next] === undefined) {
        team[next] = 1 - team[node];
        queue.push(next);
        paint(next);
        r.snap(`${next} goes ${team[next] === 0 ? "orange" : "grey"}`, `${next} is ${node}'s rival, so it must join the other team.`, [8, 9], st());
        r.edge(node, next, "chosen");
      } else if (team[next] === team[node]) {
        r.node(node, { state: "current" });
        r.node(next, { state: "current" });
        r.snap(`${node} and ${next} clash`, `${node} and ${next} are joined by a line but both are ${team[node] === 0 ? "orange" : "grey"}. C, E and F form a triangle: an odd loop can never alternate two teams. Answer: false.`, [10], st());
        ok = false;
        break;
      } else r.edge(node, next, "chosen");
    }
  }
  r.snap(
    "Odd loops break it",
    "The square A-B-C-D splits fine because it has an even number of sides. Any loop with an odd number of sides makes two rivals share a team. Cost: O(V + E).",
    [14],
    st(),
  );
  return {
    slug: "is-graph-bipartite",
    title: "Is Graph Bipartite",
    question: "785. Is Graph Bipartite?",
    group: "Graph search",
    blurb: "Two teams, rivals never together.",
    problem: "Split every node into two groups so that every edge goes between the groups. BFS paints each neighbour the opposite colour and stops if two neighbours ever share one.",
    code: [
      "function isBipartite(graph) {",
      "  const team = {};",
      "  for (const start of Object.keys(graph)) {",
      "    if (team[start] !== undefined) continue;",
      "    team[start] = 0; const queue = [start];",
      "    while (queue.length) {",
      "      const node = queue.shift();",
      "      for (const next of graph[node]) {",
      "        if (team[next] === undefined) { team[next] = 1 - team[node]; queue.push(next); }",
      "        else if (team[next] === team[node]) return false; // rivals on one team",
      "      }",
      "    }",
      "  }",
      "  return true;",
      "}",
    ],
    steps: r.steps,
  };
}

/* ------------------------------------------------------- Alien Dictionary */
function alienDictionary(): Lesson {
  const words = ["wrt", "wrf", "er", "ett", "rftt"];
  const r = new Recorder(
    [["w", 1, 1], ["e", 3.5, 0], ["r", 6, 1], ["t", 7, 4], ["f", 4, 5]],
    [["t", "f"], ["w", "e"], ["r", "t"], ["e", "r"]],
    true,
  );
  r.edges.forEach((e) => (e.state = "hidden"));
  const rules: string[] = [];
  const order: string[] = [];
  const st = (): StateRow[] => [
    { label: "Dictionary", value: words },
    { label: "Rules found", value: rules.length ? [...rules] : ["none yet"] },
    { label: "Alphabet", value: order.length ? [...order] : ["unknown"] },
  ];
  r.snap(
    "An alien dictionary",
    "These words are sorted in an alien alphabet we don't know. The job: work out the letter order. Each pair of neighbouring words hides one rule.",
    [1],
    st(),
  );
  for (let i = 0; i + 1 < words.length; i++) {
    const [a, b] = [words[i], words[i + 1]];
    const k = [...a].findIndex((ch, j) => ch !== b[j]);
    rules.push(`${a[k]} before ${b[k]}`);
    r.edge(a[k], b[k], "chosen");
    r.node(a[k], { state: "frontier" });
    r.node(b[k], { state: "frontier" });
    r.snap(
      `${a} vs ${b}: ${a[k]} < ${b[k]}`,
      `Read both words from the left. The first letter that differs is at position ${k}: ${a[k]} and ${b[k]}. Since ${a} comes first, ${a[k]} comes before ${b[k]} in the alphabet. Letters after that tell us nothing.`,
      [3, 4, 5, 6],
      st(),
    );
    r.node(a[k], { state: "idle" });
    r.node(b[k], { state: "idle" });
  }
  r.snap("Now it's Course Schedule", "The rules are arrows. Ordering letters with arrows is exactly topological sort: take a letter with nothing before it, then unlock the next.", [8], st());
  for (const ch of ["w", "e", "r", "t", "f"]) {
    order.push(ch);
    r.node(ch, { state: "done" });
    r.snap(`Next letter: ${ch}`, `${ch} has no letters left in front of it, so it goes next.`, [8], st());
  }
  r.snap(
    "Watch the traps",
    "Two traps interviewers check: if a longer word comes before its own prefix (\"abc\" before \"ab\"), the input is invalid. And if the rules form a loop, return \"\". Cost: O(total letters).",
    [5, 8],
    st(),
  );
  return {
    slug: "alien-dictionary",
    title: "Alien Dictionary",
    question: "269. Alien Dictionary",
    group: "Ordering",
    blurb: "Rules from word pairs, then topo sort.",
    problem: "You get a list of words sorted in an unknown alphabet. Work out the order of its letters. Comparing neighbouring words gives rules, and a topological sort turns the rules into an order.",
    code: [
      "function alienOrder(words) {",
      "  const after = {}; // letter: letters that come after it",
      "  for (let i = 0; i + 1 < words.length; i++) {",
      "    const [first, second] = [words[i], words[i + 1]];",
      "    const spot = firstDifference(first, second);",
      "    if (spot !== -1) after[first[spot]].add(second[spot]);",
      "  }",
      "  return topologicalSort(after); // same as Course Schedule II",
      "}",
    ],
    steps: r.steps,
  };
}

/* ------------------------------------------------- Swim in Rising Water */
function swimInWater(): Lesson {
  const grid = [
    [0, 2, 7],
    [6, 1, 8],
    [3, 4, 5],
  ];
  const id = (row: number, col: number) => `${row}${col}`;
  const nodes: [string, number, number, string][] = [];
  const edges: [string, string][] = [];
  grid.forEach((line, row) =>
    line.forEach((h, col) => {
      nodes.push([id(row, col), col * 2.8, row * 2.8, String(h)]);
      if (col < 2) edges.push([id(row, col), id(row, col + 1)]);
      if (row < 2) edges.push([id(row, col), id(row + 1, col)]);
    }),
  );
  const r = new Recorder(nodes, edges);
  const h = (k: string) => grid[+k[0]][+k[1]];
  let queue: [number, string][] = [[0, "00"]];
  const seen = new Set(["00"]);
  const from: Record<string, string> = {};
  const st = (): StateRow[] => [
    { label: "Queue, lowest water first", value: [...queue].sort((a, b) => a[0] - b[0]).map(([l, k]) => `${h(k)}·wait ${l}`) },
    { label: "Reached", value: [...seen].map((k) => String(h(k))) },
  ];
  r.node("00", { state: "frontier", tag: "0" });
  r.snap(
    "Swim when the water rises",
    "Each number is the height of a square. At time t the water is at level t, and you can swim into any square at or below the water. When can you get from the top corner to the bottom corner?",
    [1, 2, 3],
    st(),
  );
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [level, k] = queue.shift()!;
    r.node(k, { state: "current" });
    if (k === "22") {
      r.snap(`Reached the end at ${level}`, `The bottom corner came out of the queue with level ${level}. Because the queue always gives the lowest water first, nothing cheaper is left.`, [5, 6], st());
      break;
    }
    const added: string[] = [];
    for (const [n] of r.adj(k)) {
      if (seen.has(n)) continue;
      seen.add(n);
      from[n] = k;
      const need = Math.max(level, h(n));
      queue.push([need, n]);
      added.push(`${h(n)} (wait ${need})`);
      r.node(n, { state: "frontier", tag: String(need) });
      r.edge(k, n, "active");
    }
    r.snap(
      `Swim from ${h(k)}`,
      `Lowest-water square in the queue: height ${h(k)}, reachable at time ${level}. Its neighbours go in the queue with the higher of the two levels: ${added.join(", ") || "none new"}. A path is only as good as its highest square.`,
      [5, 7, 8, 9, 10],
      st(),
    );
    r.node(k, { state: "done" });
  }
  r.edges.forEach((e) => (e.state = "dim"));
  for (let k = "22"; from[k]; k = from[k]) r.edge(from[k], k, "chosen");
  r.snap(
    "Answer: 5",
    "The white path 0 → 2 → 1 → 4 → 5 never touches 6, 7 or 8. This is Dijkstra where a path costs its highest square, not the sum. Cost: O(n² log n).",
    [6],
    st(),
  );
  return {
    slug: "swim-in-rising-water",
    title: "Swim in Rising Water",
    question: "778. Swim in Rising Water",
    group: "Shortest paths",
    blurb: "Dijkstra where cost is the highest step.",
    problem: "A grid of heights fills with water, one level per second. Find the earliest time you can swim from the top-left to the bottom-right. It is Dijkstra, but a path's cost is its highest square.",
    code: [
      "function swimInWater(grid) {",
      "  const queue = new MinQueue([[grid[0][0], 0, 0]]); // lowest water first",
      "  const seen = new Set([\"0,0\"]);",
      "  while (queue.size) {",
      "    const [level, row, col] = queue.popSmallest();",
      "    if (row === grid.length - 1 && col === grid.length - 1) return level;",
      "    for (const [r, c] of neighbours(row, col)) {",
      "      if (seen.has(`${r},${c}`)) continue;",
      "      seen.add(`${r},${c}`);",
      "      queue.push([Math.max(level, grid[r][c]), r, c]);",
      "    }",
      "  }",
      "}",
    ],
    steps: r.steps,
  };
}

/* -------------------------------------------------- Minimum Height Trees */
function minHeightTrees(): Lesson {
  const r = new Recorder(
    [["A", 1, 0.5], ["B", 0.5, 3.5], ["C", 3, 6], ["D", 3.5, 2.8], ["E", 6.5, 2.8], ["F", 9, 2.8]],
    [["A", "D"], ["B", "D"], ["C", "D"], ["D", "E"], ["E", "F"]],
  );
  const ids = ["A", "B", "C", "D", "E", "F"];
  const degree: Record<string, number> = Object.fromEntries(ids.map((i) => [i, r.adj(i).length]));
  let leaves = ids.filter((i) => degree[i] === 1);
  let remaining = ids.length;
  const st = (): StateRow[] => [
    { label: "Neighbours left", value: ids.filter((i) => degree[i] >= 0).map((i) => `${i} ${degree[i]}`) },
    { label: "Leaves to peel", value: [...leaves] },
    { label: "Nodes left", value: [String(remaining)] },
  ];
  ids.forEach((i) => r.node(i, { tag: String(degree[i]) }));
  r.snap(
    "Pick the best root",
    "Hang this tree from any node and it has some height. Which roots give the shortest tree? Trying every root is slow. Instead, peel the tree like an onion from the outside in.",
    [1, 2],
    st(),
  );
  leaves.forEach((l) => r.node(l, { state: "frontier" }));
  r.snap("Outer layer", `Leaves have only one neighbour: ${leaves.join(", ")}. They can never be the middle.`, [3], st());
  while (remaining > 2) {
    remaining -= leaves.length;
    const next: string[] = [];
    for (const leaf of leaves) {
      r.node(leaf, { state: "dim" });
      for (const [n] of r.adj(leaf)) {
        if (degree[n] <= 0) continue;
        r.edge(leaf, n, "dim");
        if (--degree[n] === 1) next.push(n);
        r.node(n, { tag: String(degree[n]) });
      }
      degree[leaf] = -1;
      r.node(leaf, { tag: undefined });
    }
    leaves = next;
    leaves.forEach((l) => r.node(l, { state: "frontier" }));
    r.snap(`Peel a layer: ${remaining} left`, `Remove the leaves. Their neighbours lose one connection each, and ${next.join(", ")} become the new leaves.`, [5, 6, 8, 9, 10, 11], st());
  }
  leaves.forEach((l) => r.node(l, { state: "current" }));
  r.snap(
    `Roots: ${leaves.join(" and ")}`,
    `Only ${leaves.length} nodes are left, so these are the centres. A tree always has 1 or 2 centres: they sit in the middle of its longest path. Cost: O(n).`,
    [13],
    st(),
  );
  return {
    slug: "minimum-height-trees",
    title: "Minimum Height Trees",
    question: "310. Minimum Height Trees",
    group: "Graph search",
    blurb: "Peel leaves until the centre is left.",
    problem: "Choose the root that makes a tree as short as possible. Peeling the leaves layer by layer leaves the 1 or 2 centre nodes, which are the answer.",
    code: [
      "function findMinHeightTrees(n, edges) {",
      "  const degree = countNeighbours(edges);",
      "  let leaves = nodes.filter((node) => degree[node] === 1);",
      "  let remaining = n;",
      "  while (remaining > 2) {",
      "    remaining -= leaves.length;",
      "    const nextLeaves = [];",
      "    for (const leaf of leaves)",
      "      for (const next of graph[leaf])",
      "        if (--degree[next] === 1) nextLeaves.push(next);",
      "    leaves = nextLeaves; // the next layer in",
      "  }",
      "  return leaves;",
      "}",
    ],
    steps: r.steps,
  };
}

/* ----------------------------------------------------- Rotting Oranges */
function rottingOranges(): Lesson {
  const grid = [
    [2, 1, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  const nodes: [string, number, number, string][] = [];
  const edges: [string, string][] = [];
  const id = (row: number, col: number) => `${row}${col}`;
  grid.forEach((line, row) =>
    line.forEach((v, col) => {
      if (!v) return;
      nodes.push([id(row, col), col * 2.8, row * 2.8, v === 2 ? "R" : "F"]);
      if (grid[row][col + 1]) edges.push([id(row, col), id(row, col + 1)]);
      if (grid[row + 1]?.[col]) edges.push([id(row, col), id(row + 1, col)]);
    }),
  );
  const r = new Recorder(nodes, edges);
  let queue = ["00"];
  let fresh = nodes.length - 1;
  let minutes = 0;
  const st = (): StateRow[] => [
    { label: "Rotten this minute", value: [...queue] .map((k) => `(${k[0]},${k[1]})`) },
    { label: "Fresh left", value: [String(fresh)] },
    { label: "Minutes", value: [String(minutes)] },
  ];
  r.node("00", { state: "current", tag: "0" });
  r.snap(
    "Rot spreads",
    "R is a rotten orange, F is fresh. Every minute, rot spreads to fresh oranges right next to a rotten one (up, down, left, right). How many minutes until none are fresh?",
    [1, 2, 3],
    st(),
  );
  while (queue.length && fresh > 0) {
    const next: string[] = [];
    for (const k of queue) {
      r.node(k, { state: "done" });
      for (const [n] of r.adj(k)) {
        const [row, col] = [+n[0], +n[1]];
        if (grid[row][col] !== 1) continue;
        grid[row][col] = 2;
        fresh--;
        next.push(n);
        r.edge(k, n, "chosen");
        r.node(n, { state: "current", label: "R", tag: String(minutes + 1) });
      }
    }
    queue = next;
    minutes++;
    r.snap(
      `Minute ${minutes}`,
      `All oranges that turned rotten last minute spread at the same time, not one by one. ${next.length} more go rotten. ${fresh} fresh left.`,
      [5, 6, 7, 8, 9, 10],
      st(),
    );
  }
  r.snap(
    `Answer: ${minutes}`,
    `No fresh oranges left after ${minutes} minutes. The trick is to start BFS from every rotten orange at once (multi-source BFS) and count layers. If any orange could never be reached, return -1. Cost: O(rows × cols).`,
    [12],
    st(),
  );
  return {
    slug: "rotting-oranges",
    title: "Rotting Oranges",
    question: "994. Rotting Oranges",
    group: "Graph search",
    blurb: "Multi-source BFS, one layer a minute.",
    problem: "Rotten oranges spread to fresh neighbours every minute. Find how long until no fresh orange is left. Start BFS from all rotten oranges together and count the layers.",
    code: [
      "function orangesRotting(grid) {",
      "  let queue = allRottenCells(grid);",
      "  let fresh = countFresh(grid), minutes = 0;",
      "  while (queue.length && fresh > 0) {",
      "    const nextQueue = [];",
      "    for (const [row, col] of queue)",
      "      for (const [r, c] of neighbours(row, col))",
      "        if (grid[r][c] === 1) { grid[r][c] = 2; fresh--; nextQueue.push([r, c]); }",
      "    queue = nextQueue;",
      "    minutes++;",
      "  }",
      "  return fresh === 0 ? minutes : -1;",
      "}",
    ],
    steps: r.steps,
  };
}

export const MORE_LESSONS: Lesson[] = [swimInWater(), alienDictionary(), courseCycle(), bipartite(), minHeightTrees(), rottingOranges()];
