import type { Scenario } from "../engine/types";
import { f } from "../engine/math";

/* ------------------------------------------------------------------ *
 * Fine-tuning a support model for "Chai Point" (a made-up tea brand).
 * LoRA numbers are computed from real layer sizes, never typed in.
 * ------------------------------------------------------------------ */

const D = 4096; // hidden size of a 7B-class model
const RANK = 8;
const FULL = D * D; // one weight matrix
const LORA = 2 * D * RANK; // A (D×r) + B (r×D)
const LORA_PCT = (LORA / FULL) * 100;

// Memory to train a 7B model (rough rules of thumb, check current docs)
const PARAMS_B = 7;
const FULL_GB = PARAMS_B * 16; // fp16 weights + grads + Adam states ≈ 16 bytes / param
const LORA_GB = PARAMS_B * 2 + 2; // frozen fp16 weights + small adapter states
const QLORA_GB = PARAMS_B * 0.5 + 2; // 4-bit frozen weights + adapter

const TRAIN_LOSS = [2.1, 1.6, 1.25, 1.02, 0.86, 0.74, 0.64, 0.55, 0.47, 0.4];
const VAL_LOSS = [2.15, 1.68, 1.36, 1.17, 1.07, 1.03, 1.02, 1.05, 1.11, 1.19];
const BEST_EPOCH = VAL_LOSS.indexOf(Math.min(...VAL_LOSS)) + 1;

const scenario: Scenario = {
  id: "fine-tuning",
  title: "Fine-tuning & LoRA",
  tagline: "Teach a model a habit, not a fact.",
  imagine:
    "Imagine hiring a brilliant graduate for your tea shop's support desk. They already speak perfect English. You don't teach them English again: you sit with them for a week, show them 500 of your best replies, and they pick up your tone and your rules. That week of practice is fine-tuning.",
  recap: [
    "Fine-tuning keeps training a ready model on **your own examples**, so it picks up a style, format or narrow skill.",
    "**LoRA** freezes the big model and trains two tiny matrices beside it: well under 1% of the numbers, a fraction of the memory.",
    "Use RAG for **facts that change**, fine-tuning for **behaviour that repeats**, and always watch validation loss to stop before it memorises.",
  ],
  overview: {
    plain:
      "Fine-tuning means taking a model that already knows language and training it a little more on your own examples, so it answers the way you want. It is good for teaching a tone, a format or a narrow task. It is a poor way to teach new facts.",
    definition:
      "{{fine-tuning|Fine-tuning}} continues training a pre-trained model on a small, task-specific dataset of input → ideal-output pairs. **Full fine-tuning** updates every weight. **Parameter-efficient** methods such as {{lora|LoRA}} freeze the base model and train small add-on matrices, and {{qlora|QLoRA}} does the same on a 4-bit compressed base. Preference tuning ({{dpo|DPO}}, RLHF) then teaches which of two answers is better.",
    analogy: "A new hire who already speaks the language, trained for a week on your company's best past replies.",
    facts: [
      ["Good for", "tone, output format, narrow classification, shorter prompts"],
      ["Bad for", "facts that change (use RAG)"],
      ["Data", "hundreds to a few thousand high-quality pairs usually beat lots of messy ones"],
      ["LoRA", `rank ${RANK} on a ${D}×${D} layer trains ${f(LORA_PCT, 2)}% of its numbers`],
      ["Memory (7B)", `full ≈ ${FULL_GB} GB, LoRA ≈ ${LORA_GB} GB, QLoRA ≈ ${f(QLORA_GB, 1)} GB (rough)`],
      ["Watch", "validation loss, and a held-out eval set, not only training loss"],
    ],
    whereUsed: "Support bots with a house style, JSON extraction models, small cheap classifiers that replace a big model, and domain wording (legal, medical) on top of RAG.",
  },
  objects: [
    { id: "base", kind: "llm", label: "Base model", sub: "already knows language", at: [0, 0], tone: "slate" },
    { id: "data", kind: "table", label: "Your examples", sub: "prompt → ideal reply", at: [0, 3.6], tone: "blue" },
    { id: "trainer", kind: "gear", label: "Trainer", sub: "loss → small nudges", at: [3, 1.8], tone: "amber" },
    { id: "adapter", kind: "matrix", label: "LoRA adapter", sub: `rank ${RANK}`, at: [6, 0], tone: "violet" },
    { id: "eval", kind: "gauge", label: "Eval set", sub: "held-out checks", at: [6, 3.6], tone: "green" },
    { id: "tuned", kind: "llm", label: "Tuned model", sub: "base + adapter", at: [9, 1.8], tone: "green" },
  ],
  links: [
    { id: "l1", from: "base", to: "trainer" },
    { id: "l2", from: "data", to: "trainer" },
    { id: "l3", from: "trainer", to: "adapter" },
    { id: "l4", from: "adapter", to: "tuned" },
    { id: "l5", from: "eval", to: "tuned" },
  ],
  logTitle: "Fine-tuning log",
  logColumns: [
    { key: "stage", label: "Stage", width: "18%" },
    { key: "item", label: "What happened" },
    { key: "value", label: "Number", align: "right", width: "18%" },
  ],
  steps: [
    {
      id: "why",
      title: "Same question, two styles",
      simple: "A general model answers fine, but not in your shop's voice or format.",
      easy: "Ask a general AI model a support question and the answer is **correct but long, generic and in the wrong format**. Your team wants short, friendly replies that always end with an order number line. You could write those rules into every prompt. Or you could **train the habit into the model** once. That is fine-tuning.",
      explain:
        "A general model gives a correct but generic answer. You want a fixed tone and a fixed format every time. Long rules in every prompt cost tokens and still slip. {{fine-tuning|Fine-tuning}} bakes the habit into the model's weights.",
      detail:
        "The base model already has language and world knowledge from pre-training. Fine-tuning moves it a little towards **your** distribution of inputs and outputs. It shines when the behaviour is consistent and easy to show by example, and when you want shorter prompts or a smaller, cheaper model to match a bigger one on one task.",
      stage: {
        kind: "cards",
        zones: [
          { id: "q", label: "customer asks", icon: "person", tone: "cyan", text: "My masala chai order is late, where is it?" },
          { id: "base", label: "general model", icon: "llm", tone: "slate", text: "I'm sorry to hear that your order is delayed. Delivery times can vary due to several factors such as traffic, weather and order volume. I recommend checking the tracking page or contacting the restaurant directly…" },
          { id: "tuned", label: "after fine-tuning", icon: "answer", tone: "green", text: "Sorry for the wait! Your chai left the shop 8 min ago and reaches you in about 10 min.\nOrder: #CP-2481" },
        ],
        note: "same facts, different habit: short, warm, always the order line",
      },
      highlight: ["base", "tuned"],
      log: [{ tone: "slate", cells: { stage: "goal", item: "short replies + order line every time", value: "style" } }],
    },
    {
      id: "choose",
      title: "Prompt, RAG or fine-tune?",
      simple: "Try a better prompt first. Use RAG for facts. Fine-tune only for habits.",
      easy: "Three tools, three jobs. A **better prompt** is free and instant, so always try it first. **RAG** looks things up in your documents, so use it for **facts**, especially facts that change. **Fine-tuning** is for **habits**: a tone, a format, or one narrow job done the same way thousands of times.",
      explain:
        "Start with prompting. Add {{rag|RAG}} when the model needs your **facts**. Fine-tune when you need a repeated **behaviour** that prompts can't hold, or a smaller model for one task. They combine: many products fine-tune for format and use RAG for facts.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Which tool for which job",
          columns: ["Need", "Use", "Why"],
          rows: [
            ["New tone or format", "Prompt first, then fine-tune", "Habit, shown by examples"],
            ["Private or fresh facts", "RAG", "Update the documents, not the model"],
            ["One narrow task, high volume", "Fine-tune a small model", "Cheaper and faster per call"],
            ["Take actions", "Tools / agents", "The model decides, your code acts"],
            ["Teach new facts", "Not fine-tuning", "It memorises badly and goes stale"],
          ],
          highlightRow: 0,
        },
        note: "the most asked GenAI interview question",
      },
      interviewTip: "Say “facts → RAG, behaviour → fine-tune, try prompting first”, then give one example of each.",
    },
    {
      id: "data",
      title: "Collect good examples",
      simple: "Training data is a list of questions with the perfect reply written next to each one.",
      easy: "The model learns by copying examples, so **the examples are everything**. Each one is a customer message and the **perfect reply** your best agent would write. A few hundred clean, varied examples beat ten thousand messy ones. Also keep some examples **aside** that the model never trains on, to test it later.",
      explain:
        "Each training row is a prompt and the ideal completion, usually in chat format (system, user, assistant). Quality beats size: a few hundred to a few thousand clean, diverse rows is typical. Hold out 10–20% as a {{validation|validation}} set the model never trains on.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "train.jsonl (3 of 600 rows)",
          columns: ["user", "assistant (ideal)", "split"],
          rows: [
            ["Where is my order?", "Sorry for the wait! It reaches you in ~10 min.\\nOrder: #CP-2481", "train"],
            ["Can I change milk to oat?", "Yes! Oat milk added, no extra charge.\\nOrder: #CP-2490", "train"],
            ["Refund for a spilled cup?", "So sorry! Refund of ₹120 started, 2–3 days.\\nOrder: #CP-2502", "validation"],
          ],
        },
        note: "clean, varied, and some kept aside",
      },
      highlight: ["data"],
      log: [{ tone: "blue", cells: { stage: "data", item: "600 rows: 510 train, 90 validation", value: "600" } }],
      deeper: {
        code: {
          lang: "json",
          src: '{"messages":[\n  {"role":"system","content":"You are Chai Point support."},\n  {"role":"user","content":"Where is my order?"},\n  {"role":"assistant","content":"Sorry for the wait! It reaches you in ~10 min.\\nOrder: #CP-2481"}\n]}',
        },
      },
    },
    {
      id: "full",
      title: "Full fine-tuning moves every weight",
      simple: "Full fine-tuning changes all of the model's billions of numbers, so it needs huge memory.",
      easy: "A 7-billion-number model is like a giant control panel with 7 billion knobs. **Full fine-tuning turns every knob a little.** To do that the computer must also remember, for each knob, which way it was moving. That needs roughly **16 bytes per knob**, so about " +
        `${FULL_GB} GB of GPU memory for a 7B model. That is several expensive GPUs.`,
      explain: `Full fine-tuning updates all weights. With the Adam optimiser in mixed precision you store weights, gradients and two optimiser states, about 16 bytes per parameter: ≈ ${FULL_GB} GB for a 7B model. It also risks {{forgetting|catastrophic forgetting}} of general skills.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "GPU memory to train a 7B model (rough, GB)",
          items: [
            { label: "Full fine-tune", value: FULL_GB, tone: "rose" },
            { label: "LoRA", value: LORA_GB, tone: "amber" },
            { label: "QLoRA (4-bit base)", value: QLORA_GB, tone: "green" },
          ],
          format: "int",
          caption: "Rules of thumb; real numbers depend on sequence length and batch size.",
        },
      },
      highlight: ["base", "trainer"],
    },
    {
      id: "lora",
      title: "LoRA: freeze the big layer, train two thin ones",
      simple: "LoRA leaves the big model untouched and trains a tiny add-on beside each layer.",
      easy: `Instead of turning all the knobs, **LoRA freezes the big model** and bolts a tiny extra part beside some layers. The extra part is two thin tables of numbers that multiply together. For one ${D}×${D} layer that is ${(LORA / 1000).toFixed(0)} thousand numbers instead of ${(FULL / 1e6).toFixed(1)} million: just **${f(LORA_PCT, 2)}%**. Training is cheaper, and you can swap adapters like phone covers.`,
      explain: `{{lora|LoRA}} keeps W frozen and learns ΔW = B·A, where A is r×${D} and B is ${D}×r with a small rank r (here ${RANK}). Trainable numbers per layer: 2·${D}·${RANK} = ${LORA.toLocaleString()} vs ${FULL.toLocaleString()} (${f(LORA_PCT, 2)}%). At serving time the adapter can be merged into W, so there is no extra latency.`,
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "matrices",
            title: "W stays frozen; only B and A learn (toy 4×4, rank 1)",
            items: [
              { name: "W (frozen)", values: [[0.2, -0.1, 0.4, 0.0], [0.1, 0.3, -0.2, 0.5], [-0.3, 0.0, 0.1, 0.2], [0.4, 0.2, 0.0, -0.1]], tone: "slate" },
              { name: "B", values: [[0.5], [0.0], [-0.5], [1.0]], tone: "violet" },
              { name: "A", values: [[0.2, 0.0, -0.2, 0.4]], tone: "violet" },
            ],
            ops: ["+", "×"],
            format: "fixed1",
          },
          {
            kind: "bars",
            title: `Numbers trained in one ${D}×${D} layer`,
            items: [
              { label: "Full", value: FULL, tone: "rose" },
              { label: `LoRA r=${RANK}`, value: LORA, tone: "green" },
            ],
            format: "int",
          },
        ],
      },
      highlight: ["adapter"],
      packets: [{ from: "trainer", to: "adapter", label: "only A and B change", tone: "violet" }],
      log: [{ tone: "violet", cells: { stage: "LoRA", item: `rank ${RANK} on q and v projections`, value: `${f(LORA_PCT, 2)}%` } }],
      deeper: {
        math: ["h = W·x + (α / r) · B·A·x", "trainable per layer = r·(d_in + d_out)"],
        code: {
          lang: "python",
          src: 'from peft import LoraConfig, get_peft_model\n\nconfig = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05,\n                    target_modules=["q_proj", "v_proj"])\nmodel = get_peft_model(base_model, config)\nmodel.print_trainable_parameters()  # well under 1%',
        },
      },
      interviewTip: "Name the knobs: rank r, alpha, which modules (q, v or all linear), and that adapters merge for zero extra latency.",
    },
    {
      id: "qlora",
      title: "QLoRA: squeeze the frozen base to 4 bits",
      simple: "QLoRA stores the frozen model in a tiny 4-bit format, so it fits on one ordinary GPU.",
      easy: `The frozen big model still takes memory. **QLoRA** stores it in a **4-bit** compressed form (like a smaller photo file) while the little LoRA parts still train in normal precision. A 7B model then trains in roughly ${f(QLORA_GB, 0)} GB, which fits on a single gaming-class GPU.`,
      explain: `{{qlora|QLoRA}} quantises the frozen base to 4-bit (NF4), keeps LoRA adapters in 16-bit, and uses paged optimisers to survive memory spikes. A 7B model drops to roughly ${f(QLORA_GB, 0)} GB. Quality is usually close to 16-bit LoRA, at some speed cost.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "stack",
          title: "Where the memory goes (QLoRA, 7B, rough GB)",
          segments: [
            { label: "4-bit frozen weights", value: PARAMS_B * 0.5, tone: "slate" },
            { label: "adapter + optimiser", value: 1, tone: "violet" },
            { label: "activations", value: 1, tone: "amber" },
          ],
        },
      },
      highlight: ["base", "adapter"],
    },
    {
      id: "curve",
      title: "Watch the validation line",
      simple: "Stop training when the held-out score stops improving, or the model starts memorising.",
      easy: `While training, two lines are drawn. **Training loss** keeps falling because the model gets better at the examples it sees. **Validation loss** uses the examples kept aside. It falls, then **turns back up** at epoch ${BEST_EPOCH}: the model has started memorising instead of learning. Keep the checkpoint from the lowest point.`,
      explain: `Training loss always falls; {{validation|validation}} loss shows real learning. Here it bottoms out at epoch ${BEST_EPOCH} and rises after: {{overfitting}}. Keep that checkpoint (early stopping), or lower the learning rate, epochs or rank, or add data.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "plot",
          title: "Loss per epoch",
          series: [
            { label: "training", points: TRAIN_LOSS.map((v, i) => [i + 1, v]), tone: "blue" },
            { label: "validation", points: VAL_LOSS.map((v, i) => [i + 1, v]), tone: "rose" },
          ],
          x: [1, 10],
          y: [0, 2.4],
          xLabel: "epoch",
          yLabel: "loss",
          markers: [{ x: BEST_EPOCH, y: Math.min(...VAL_LOSS), label: "keep this one", tone: "green" }],
        },
      },
      highlight: ["trainer", "eval"],
      log: [{ tone: "green", cells: { stage: "train", item: `best validation loss at epoch ${BEST_EPOCH}`, value: f(Math.min(...VAL_LOSS), 2) } }],
    },
    {
      id: "dpo",
      title: "Preference tuning: this answer, not that one",
      simple: "After learning by example, the model learns which of two answers people liked more.",
      easy: "Copying examples teaches a format. To teach **judgement**, show the model pairs: the same question with a **better** and a **worse** reply. The model is nudged to make the better one more likely. That is how chat models learn to be helpful and polite. **DPO** does this directly from the pairs; older **RLHF** first trains a separate scoring model.",
      explain:
        "Supervised fine-tuning ({{sft|SFT}}) copies ideal answers. Preference tuning uses (prompt, chosen, rejected) pairs. {{rlhf|RLHF}} trains a reward model and optimises against it with PPO; {{dpo|DPO}} skips the reward model and pushes up the chosen answer's likelihood relative to the rejected one.",
      stage: {
        kind: "cards",
        zones: [
          { id: "p", label: "prompt", icon: "person", tone: "cyan", text: "My tea arrived cold." },
          { id: "good", label: "chosen", icon: "check", tone: "green", cards: [{ id: "a", title: "“So sorry! A fresh hot cup is on its way, free.”", tone: "green", badge: "preferred" }] },
          { id: "bad", label: "rejected", icon: "box", tone: "rose", cards: [{ id: "b", title: "“Tea cools down during delivery. This is normal.”", tone: "rose", struck: true }] },
        ],
        note: "the model learns to make the left answer more likely than the right",
      },
      interviewTip: "Order matters: pre-training → SFT → preference tuning (RLHF or DPO).",
    },
    {
      id: "ship",
      title: "Test it, then serve base + adapter",
      simple: "Check the tuned model on held-out questions before using it, then load the small add-on at serving time.",
      easy: "Before shipping, run the tuned model on the **eval questions** and compare with the old one: is the format right, did accuracy hold, did it forget anything general? If it passes, you serve the **base model plus the small adapter file** (a few MB). One base can carry many adapters, one per customer or task.",
      explain:
        "Evaluate on a held-out set against the base model: task metrics, format pass rate, and a few general prompts to catch forgetting. Serve by merging the adapter or by hot-swapping adapters on one base (multi-LoRA serving). Version the dataset and the adapter together.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Eval before release (90 held-out rows)",
          columns: ["check", "base + long prompt", "tuned"],
          rows: [
            ["ends with order line", "71%", "99%"],
            ["avg reply length (words)", "64", "22"],
            ["correct refund amount", "93%", "94%"],
            ["general maths sanity set", "88%", "86%"],
          ],
          highlightRow: 0,
          caption: "Example numbers. Watch the last row: a small drop is fine, a big one means forgetting.",
        },
      },
      highlight: ["eval", "tuned"],
      packets: [{ from: "adapter", to: "tuned", label: "adapter ≈ a few MB", tone: "green" }],
    },
  ],
  interview: [
    {
      id: "ft-1",
      level: "fresher",
      q: "When would you fine-tune instead of using RAG?",
      answer: "Fine-tune for behaviour: a consistent tone, output format or narrow task, or to get a small cheap model to match a big one on one job. Use RAG for knowledge, especially private or changing facts. Try prompting first, and combine them when you need both.",
      lookFor: "Facts vs behaviour split, prompting first, the combination.",
      wrong: "“Fine-tune it on our documents so it knows them.” Facts memorised this way are unreliable and go stale.",
    },
    {
      id: "ft-2",
      level: "mid",
      q: "Explain LoRA. Why does it save memory?",
      answer: "LoRA freezes the base weights and learns a low-rank update ΔW = B·A with small rank r. Only A and B get gradients and optimiser states, which is well under 1% of the parameters, so memory and checkpoint size drop sharply. The adapter can be merged into W for zero extra inference latency.",
      lookFor: "Frozen W, low-rank B·A, optimiser state savings, merge at inference.",
      wrong: "“LoRA compresses the model.” That is quantisation; LoRA reduces what is trained.",
    },
    {
      id: "ft-3",
      level: "mid",
      q: "Training loss keeps going down but validation loss rises. What do you do?",
      answer: "That is overfitting. Keep the checkpoint at the lowest validation loss (early stopping), then reduce epochs or learning rate, lower LoRA rank, add dropout, and add more varied data. Confirm with the task eval, not only the loss.",
      lookFor: "Names overfitting, early stopping, concrete levers, task eval.",
      wrong: "“Train longer until validation catches up.”",
    },
    {
      id: "ft-4",
      level: "senior",
      q: "What is the difference between SFT, RLHF and DPO?",
      answer: "SFT trains on ideal outputs by next-token loss. RLHF collects human preferences, trains a reward model, then optimises the policy with RL (PPO) under a KL penalty to the SFT model. DPO uses the same preference pairs but optimises a closed-form loss directly, no reward model or RL loop, so it is simpler and more stable.",
      lookFor: "Pipeline order, reward model, KL constraint, why DPO is simpler.",
      wrong: "“They are three names for the same thing.”",
    },
    {
      id: "ft-5",
      level: "senior",
      design: true,
      q: "Your support bot must use house style and know today's prices. Design it.",
      answer: "LoRA fine-tune a mid-size model on a few thousand curated replies for style and format, and use RAG or a price tool for prices so they stay fresh. Hold out an eval set covering style, correctness and safety, compare to a prompted baseline, version data and adapter together, and retrain when the style guide changes, not when prices do.",
      lookFor: "Splits style (fine-tune) from facts (RAG/tool), eval and versioning plan.",
      wrong: "“Fine-tune weekly on the latest price list.”",
    },
  ],
  quiz: [
    {
      id: "ftq-1",
      q: "Which job is the best fit for fine-tuning?",
      options: ["Answering from this week's policy PDF", "Always replying in a fixed JSON format", "Looking up live stock prices", "Adding new product facts daily"],
      correct: 1,
      explain: "A repeated format is a behaviour. The others are facts that change, which RAG or tools handle better.",
    },
    {
      id: "ftq-2",
      q: `With LoRA rank ${RANK} on a ${D}×${D} layer, roughly what share of that layer's numbers is trained?`,
      options: ["100%", "25%", `${f(LORA_PCT, 2)}%`, "0%"],
      correct: 2,
      explain: `2 × ${D} × ${RANK} = ${LORA.toLocaleString()} of ${FULL.toLocaleString()}.`,
    },
    {
      id: "ftq-3",
      q: "What does QLoRA add on top of LoRA?",
      options: ["A reward model", "A 4-bit compressed frozen base", "More attention heads", "Retrieval"],
      correct: 1,
      explain: "The frozen base is stored in 4-bit; the adapters still train in 16-bit.",
    },
    {
      id: "ftq-4",
      q: "Which checkpoint should you keep?",
      options: ["The last epoch", "Lowest training loss", "Lowest validation loss", "The first epoch"],
      correct: 2,
      explain: `Validation loss is lowest at epoch ${BEST_EPOCH}; after that the model memorises.`,
    },
  ],
};

export default scenario;
