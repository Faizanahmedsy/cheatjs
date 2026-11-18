# Visual Lab simplicity pass: handoff

Route: `/ai-engineering/visual-lab`. Code: `src/components/ai-lab/`.
Branch `feature/ai-visual-lab`. Author every commit as Faizan Ahmed <saiyed.faizanahmed1@gmail.com>, with no AI attribution.
Push the branch only; Faizan merges to main.

## Goal (user feedback)
Someone with zero ML background should understand every step on first view.
Interview depth stays, but as an opt-in extra (fresher to 3 years of AI-engineer interviews).

## Status: done, not yet checked in a browser
Typecheck, lint and the production build pass, and the verifier reports 0 errors and 0 warnings on all 8 topics.
Nobody has looked at it in a browser yet (no browser automation, by rule). See "Check by eye" below.

### Engine and stages (`engine/`, `stages/`)
- `types.ts`:
  - Steps have `simple`, `detail` and `stage`; scenarios have `imagine`, `recap` and `overview.plain`; vizzes have `only`.
  - Network stage: an `error` mode, `target.was`, and `[]` blame rows.
  - Descent stage: `label` and `compare`.
  - Viz stage: takes 1–3 vizzes.
- `mode.ts`: the Simple/Interview context, saved to localStorage inside try/catch.
- Stages, one chunk each, all lazy through `StageView.tsx`:
  - **Neuron**: the output glows when the neuron fires.
  - **Network**: neurons light up when they fire and dim when their gate is shut; no dots leave a zero; the error box shows before and after; the lines that changed most glow in update mode.
  - **Tokens** and **Fit**: built in the WIP commit, unchanged.
  - **Descent**: a 2D ball walks down the curve; extra balls compare learning rates.
  - **Map**: word dots with group halos and a query star with ranked neighbours. Angle mode draws two arrows and computes the cosine from the coordinates.
  - **Cards**: zones of cards keyed by id. Cards fly between zones and reorder, because the stage stays mounted per topic. `[n]` in zone text becomes a sticky-note citation.
  - **Chat**: bubbles by role, the last message typed word by word, and an aside box.
  - **Viz**: any panel viz drawn big, up to 3 side by side.
- `StageView.stageDurationMs`: at least 5.2 s, longer for training, generation, the descent walk and chat typing.
- SVG stages keep a 620 px minimum width on phones and scroll sideways rather than shrink the text to nothing.

### Shell (`VisualLab.tsx`, `parts/*`)
- Header:
  - Simple | Interview switch: Simple by default, remembered.
  - Visual | Flow | Sequence view switch: Visual is the default; Flow is the old iso scene.
- Before step 1, an "Imagine…" card sits over the stage, with a big Start button (goes to step 1, no autoplay) and a "play them all" link.
- "Step N of M" bar on the stage and in the panel. Below `lg`, the step's plain sentence sits right above the picture.
- Explain tab, in this order:
  - Back / progress / Next.
  - "In simple words".
  - Explain, then the analogy.
  - Vizzes filtered by `only`.
  - Interview mode adds the depth box, "Show the maths", "Show the code" and the interview tip.
  - A big "Next step: <title>" button. The last step shows "What you just learned" (3 bullets) and "Take the quiz".
- Overview tab:
  - Simple: imagine, plain words, a clickable step list and Start.
  - Interview: the full overview.
- Trace: collapsed to a slim control bar in Simple mode (with a "Show trace" toggle) and open in Interview mode.
- Grid areas:
  - Phones: topics → visual → explanation → trace.
  - Desktop: topics | visual over trace | panel.

### Topics (all 8 rewritten: one idea per step, a `simple` and a `stage` on every step)
- **Neural networks** (the quality bar), 10 steps:
  1. Meet one neuron.
  2. Add up plus the bias (0.8).
  3. The ReLU gate (a total of −0.5 is blocked).
  4. A 3 → 3 → 1 house-price network; its neuron A is the same neuron.
  5. The forward pass (guess 0.68).
  6. How wrong (loss 0.10).
  7. Blame flows back; the shut neuron and the pool input get none.
  8. Nudge the weights (α 0.05: 0.68 → 0.85).
  9. Repeat over 6 houses.
  10. Line vs curve.

  Backprop and the updates are computed in the file.
- **How machines learn**: fit stage (data, split, first guess, MSE), descent stage (one ball, then three learning rates), the training loop, under/good/over fit, predict.
- **Transformers**: tokens split, ids, vectors, Q/K/V, attention (hover to switch the word), blending the values, two heads, the block, the next word.
- **LLM inference**: tokens, prefill, next-word chances, temperature and top-p, decode, the KV cache notebook, where models run, GPU memory, speed-ups, cost.
- **Conversational AI**: the chat stage throughout: roles, a stateless model, resending history, SSE, sliding window, summary, memory, tools.
- **Embeddings**: token vectors, pooling, a meaning map, cosine angles, nearest neighbours, keyword vs meaning search, chunking, ANN, a full scored search.
- **RAG**: one library story on the cards stage (PDF → cards → shelves → librarian → prompt tray → answer with sticky notes), plus the "not in the handbook" case.
  - Citation numbers now follow the prompt order; the old file cited the wrong card.
- **Advanced RAG**:
  - Rewrite and HyDE, then hybrid search.
  - The metadata filter, then RRF into a shortlist A–E.
  - A cross-encoder re-rank that reorders the cards.
  - Context packing, then claim checks.
  - Metrics, then the feedback loop.

Interview questions and quizzes are kept in every topic, and every number is still computed in its file.

## Checks
- `node scripts/verify-visual-lab.mjs [topic…] [--text]`
  - Imports the topic files with Node's type stripping, so no build is needed.
  - Checks ids, links, glossary keys, NaN, quiz answers, object spacing, `simple`/`stage` on every step, imagine/recap/plain, and each stage's shape.
  - `--text` prints every step's words with the real numbers, for proofreading.
- `pnpm typecheck`, `pnpm lint`.
- `nice -n 10 flock /tmp/iw-heavy.lock pnpm build`, run once at the end.

## Left to do / check by eye
1. **Browser pass**, light and dark, desktop and phone. Look at:
   - The start card on a short phone screen (it scrolls inside the stage).
   - Cards stage with 4–5 zones at `md` widths, and cards flying and reordering (rag 3→8, advanced-rag 4→6).
   - Map angle mode with 3 pairs: labels may crowd the next panel.
   - Descent readouts, and the network update chips (they sit at 35/50/65% along their lines).
   - The chat aside on phones.
2. Auto-play waits `stageDurationMs` per step. If Simple-mode readers find it fast, add reading time per word of `simple` + `explain`.
3. The Tokens stage draws attention lines only for the first row of blocks. Keep attention sentences to one row (≤ ~8 short tokens), as all current topics do.
4. Optional: the Sequence view is unchanged. It still lists packets, which only matter for the Flow view.
