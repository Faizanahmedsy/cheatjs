# Visual Lab simplicity pass: handoff

Route: `/ai-engineering/visual-lab`. Code: `src/components/ai-lab/`.
Branch `feature/ai-visual-lab`. Author every commit as Faizan Ahmed <saiyed.faizanahmed1@gmail.com>, with no AI attribution.
Push the branch only; the coordinator pushes main.

## Goal (user feedback)
Someone with zero ML background should understand every step on first view.
Interview depth stays, but as an opt-in extra.

## Done in this WIP commit (not wired into the UI yet, and not typechecked)
- `engine/types.ts`
  - `Step.simple`: the one-line "In simple words".
  - `Step.detail`: Interview-only depth.
  - `Step.stage`: the big centre visual.
  - `Scenario.imagine` / `Scenario.recap`, and `overview.plain`.
  - `Viz.only` ("simple" | "interview").
  - Stage specs: neuron, network, tokens, fit, descent, map, cards, chat, viz.
  - All new fields are optional, so the current 8 topic files still compile.
- `engine/mode.ts`: Simple/Interview context, plus localStorage read/save wrapped in try/catch.
- `stages/common.ts`: `timing()` helper, 900×460 viewBox, `fmtNum`.
- `stages/NeuronStage.tsx`: one neuron, zoomed in.
  - Inputs → weighted lines (thickness = |w|, blue +, red −) → "× w" chips → products.
  - The body fills with the total, then the bias, the ReLU/sigmoid gate and the output.
  - Phases: inputs | sum | activate. Optional "if the total were negative" note.
- `stages/NetworkStage.tsx`: circles in layers with labels; every line drawn by weight.
  - forward: glowing dots flow, neurons fill, "gate open/shut" tags.
  - backward: red blame flows back, with per-node blame.
  - update: lines animate to the new weights, and the top-3 Δw get chips.
  - A target box shows "guess too low by …".
- `stages/TokensStage.tsx`: words as blocks.
  - Modes: split, ids, vectors, qkv (three cards per word), attention, next, generate.
  - attention: curved lines with thickness = weight and % chips; hover or tab a word to switch focus.
  - next: candidate bars.
  - generate: words appear one by one, with the KV cache shown as a notebook.
- `stages/FitStage.tsx`: the house-price scatter.
  - Modes: data (feature/label callout), split (coloured sets + counts), guess (red misses), train (the line refits per epoch next to a falling loss graph), fits (under/good/over panels), predict.

Note: framer `x`/`y` on SVG are transforms. Animate `scaleY` with `originY`, or `cx`/`cy`/`x1`/`y1` attributes, never `y`.

## Left to do
1. Remaining stages:
   - `DescentStage`: a 2D ball walking down a curve; keep the 3D `three-loss` in the panel.
   - `MapStage`: word dots with clusters + query; angle mode draws two arrows and computes the cosine from the coordinates.
   - `CardsStage`: zones with cards keyed by id. Use framer `layoutId` so cards fly between zones across steps, and keep the component mounted per scenario (do not key it by step). `[n]` in zone text renders as sticky-note citations.
   - `ChatStage`: bubbles, last message typed word by word, and an aside box.
   - `VizStage`: renders a panel `Viz` big.
   - `stages/StageView.tsx`: switches on kind with `next/dynamic` per stage. Step duration with a stage is max(5200 ms, train frames × 480 ms + 1 s, generate tokens × 700 ms + 1.5 s).
2. Shell (`VisualLab.tsx`, `parts/*`):
   - Header: Simple | Interview switch (default Simple, persisted).
   - Centre views: Visual (stage, the default; falls back to the iso scene) | Flow (iso) | Sequence.
   - Step -1 shows a centre overlay with the "Imagine…" card and a big "▶ Start" button that goes to step 0 without autoplay.
   - "Step N of M" progress bar on the centre and in the panel.
   - Panel step tab, in this order: Back/Next row + progress → "In simple words" callout (large) → explain → analogy → stage-related vizzes filtered by `only`.
     - Interview mode adds: `detail`, a "Show the maths" toggle (deeper.text + math), a "Show the code" toggle (deeper.code), and the interview tip.
   - The last step shows the "What you just learned" recap with 3 bullets, plus a "Take the quiz" button.
   - Overview tab: Simple shows imagine + plain + the list of step titles + Start; Interview shows today's overview.
   - The trace is collapsed by default in Simple mode; a slim bar keeps Start/Back/Next/progress and a "Show trace" toggle.
   - Mobile, via grid areas: topic strip → visual → panel (explanation + Next) → trace.
     - Desktop: `lg:[grid-template-areas:'list_scene_panel''list_trace_panel']`.
   - The Interview and Quiz tabs stay in both modes.
3. Topics, one idea per step (splitting is fine; ~8–10 steps).
   - Each step: `simple` (≤20 words, no jargon), `explain` (2–3 short sentences, jargon explained in brackets on first use plus a {{glossary}} tooltip), a `stage`, current long text moved to `detail`.
   - Each topic: `imagine`, `recap`, `overview.plain`.
   - Neural networks first, as the quality bar:
     1. Meet one neuron (inputs × weights; use x=[2,1,0] labelled size/floors/pool, w=[0.5,−0.3,0.8], b=0.1).
     2. Add up + bias = 0.8.
     3. The gate (ReLU passes 0.8; blockedExample −0.5).
     4. Many neurons → a network (size, rooms, age → hidden → price).
     5. Forward pass.
     6. How wrong (target).
     7. Backprop (blame).
     8. Update (newWeights, loss lower).
     9. Why depth helps (curved boundary).
     - Compute a small 3→3→1 regression net with real backprop in the topic file.
   - Then the other 7:
     - transformers: tokens/attention stages.
     - how-machines-learn: fit + descent stages.
     - embeddings: map stage (angle mode for cosine).
     - rag + advanced-rag: cards stage as library → card shelves → librarian → LLM answer with sticky notes; re-rank reorders cards A–E.
     - llm-inference + conversational-ai: tokens generate + notebook, chat stage.
   - The 7 topics can be written in parallel by subagents once the engine compiles.
4. Checks:
   - Scenario verifier: copy the scenario files to a temp dir and run them with `node --experimental-strip-types`. Check ids, glossary keys, NaN, quiz answers, object spacing, and that every step has `simple`.
   - `pnpm typecheck`, `pnpm lint`.
   - `nice -n 10 flock /tmp/iw-heavy.lock pnpm build`, run once at the end.
   - No browser automation; the user checks visually.
