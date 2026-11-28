import { beginnerTopic } from "./_beginner";

/* Topic 1 (Start here): what AI is, in pictures. No maths. */

const scenario = beginnerTopic({
  id: "what-is-ai",
  title: "What is AI?",
  tagline: "A program that finds its own rules from examples.",
  imagine:
    "Imagine teaching a small child to spot a dog. You don't hand over a rulebook about ears and tails. You point at dogs and say “dog”, point at cats and say “not dog”. After enough pointing, the child just knows. Modern AI is taught the same way: by examples, not by rules.",
  recap: [
    "A normal program follows **rules a person wrote**. AI **finds the rules itself** by studying many examples.",
    "**AI** is the big idea. **Machine learning** is AI that learns from data. **Deep learning** is machine learning with big neural networks. **Generative AI** is deep learning that creates new text, images or code.",
    "Today's AI is very good at **narrow jobs** and needs good examples. It is a pattern finder, not a thinking person.",
  ],
  plain:
    "AI is software that learns a skill from examples instead of being given step-by-step instructions. Show it thousands of spam and normal emails and it works out what spam looks like. This lab starts here, so you can follow everything after it.",
  definition:
    "{{ai|Artificial intelligence}} is any computer system doing a task that normally needs human judgement. Almost all of it today is {{machine-learning|machine learning}}: instead of programmers writing rules, a {{model}} is {{training|trained}} on {{dataset|data}} until it finds the rules itself. {{deep-learning|Deep learning}} uses large neural networks, and {{generative-ai|generative AI}} is deep learning that produces new content.",
  analogy: "Teaching a child to spot dogs by pointing, not by handing over a rulebook.",
  facts: [
    ["Normal program", "People write the rules, the computer follows them"],
    ["AI / machine learning", "People give examples, the computer finds the rules"],
    ["Good at", "Patterns in lots of examples: photos, speech, text, recommendations"],
    ["Not good at", "Things never seen before, common sense, knowing when it is wrong"],
  ],
  whereUsed: "Your phone's face unlock, spam filter, Google Maps traffic, Netflix and YouTube suggestions, voice assistants, translation and chatbots like ChatGPT.",
  steps: [
    {
      id: "rules",
      title: "A normal program follows rules",
      simple: "In a normal program, a person writes every rule and the computer just follows them.",
      easy: "Think of a spam filter written the old way. A programmer writes a rule: **if the email says “free money”, it is spam.** The computer follows it exactly. This works until the spammer writes “fr33 m0ney”. Now the rule doesn't match and the spam gets through. The programmer must write another rule, then another, forever.",
      explain: "Classic software is explicit logic: input + rules written by a person = output. Every case must be anticipated by hand, so it breaks on anything the author didn't foresee.",
      stage: {
        kind: "cards",
        zones: [
          { id: "z1", label: "A person writes the rules", icon: "person", tone: "blue", cards: [{ id: "r1", title: "If email says “free money”", sub: "then it is SPAM", tone: "blue" }] },
          {
            id: "z2",
            label: "The computer follows them",
            icon: "box",
            tone: "slate",
            cards: [
              { id: "e1", title: "“Free money now!!!”", sub: "matches the rule → spam", tone: "green", badge: "caught" },
              { id: "e2", title: "“fr33 m0ney now!!!”", sub: "no match → inbox", tone: "rose", badge: "missed" },
            ],
          },
        ],
        note: "Every new trick needs a new rule written by hand",
      },
      analogy: "A recipe: it only works exactly as written.",
    },
    {
      id: "learn-rules",
      title: "AI finds the rules itself",
      simple: "With AI, you show many examples with answers, and the computer works out the rules on its own.",
      easy: "Now flip it. Instead of writing rules, give the computer **thousands of real emails, each marked “spam” or “not spam”**. It studies them and **discovers its own rules**: lots of exclamation marks, money words from an unknown sender, and so on. It even catches “fr33 m0ney”, because it learned the pattern and not one fixed phrase.",
      explain: "Machine learning inverts the setup: input + correct answers (examples) = the rules (a trained model). The rules are numbers inside the model, found by an algorithm, not typed by a person.",
      stage: {
        kind: "cards",
        zones: [
          {
            id: "z1",
            label: "Examples with answers",
            icon: "doc",
            tone: "blue",
            cards: [
              { id: "a", title: "“Win a free phone!!!”", sub: "answer: spam", tone: "rose" },
              { id: "b", title: "“Lunch at 1 pm?”", sub: "answer: not spam", tone: "green" },
              { id: "c", title: "“fr33 m0ney, click”", sub: "answer: spam", tone: "rose" },
            ],
          },
          { id: "z2", label: "The machine studies them", icon: "box", tone: "violet", cards: [{ id: "m", title: "Learning…", sub: "thousands of emails", tone: "violet" }] },
          {
            id: "z3",
            label: "Rules it found",
            icon: "answer",
            tone: "amber",
            cards: [
              { id: "k1", title: "Many ! marks look spammy", tone: "amber" },
              { id: "k2", title: "Money words + stranger = spam", tone: "amber" },
              { id: "k3", title: "Your friend's name = fine", tone: "amber" },
            ],
          },
        ],
        note: "Nobody typed these rules. The machine found them.",
      },
      analogy: "The child who learned “dog” from pointing, not from a rulebook.",
    },
    {
      id: "why",
      title: "Why not just write rules?",
      simple: "Some jobs have rules too hard to write, like telling a cat from a dog in a photo.",
      easy: "For easy jobs, rules are fine: adding two numbers, working out GST. But try writing the rules for **recognising a cat in a photo**. Which pixels make an ear? What about a cat sleeping, or half hidden behind a sofa? Nobody can write those rules. But show a computer a million cat photos and it finds the pattern itself. That is why AI took off.",
      explain: "ML is the tool for tasks where the rules are unknown, too many, or too fuzzy to write: vision, speech, language, recommendations. For well-defined logic (tax, sorting) plain code is better, cheaper and exact.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Can you write the rules by hand?",
          columns: ["Task", "Rules by hand?", "So use"],
          rows: [
            ["Add two numbers", "Yes, easy", "normal code"],
            ["Work out GST on a bill", "Yes, clear formula", "normal code"],
            ["Sort names A to Z", "Yes", "normal code"],
            ["Spot a cat in any photo", "Practically impossible", "AI"],
            ["Turn speech into text", "Practically impossible", "AI"],
            ["Suggest the next video you'll like", "No clear rule exists", "AI"],
          ],
          highlightRow: 3,
        },
      },
      interviewTip: "A good answer to “when would you NOT use ML?” is: when a simple rule solves it exactly.",
    },
    {
      id: "circles",
      title: "AI, machine learning, deep learning, generative AI",
      simple: "These four terms nest like boxes: AI is the biggest, and generative AI sits inside deep learning.",
      easy: "People mix these words up, but they are boxes inside boxes. **AI** is the biggest box: any machine doing smart tasks. Inside it is **machine learning**: AI that learns from examples. Inside that is **deep learning**: machine learning using big layered “neural networks”. Inside that is **generative AI**: deep learning that *creates* new things, like ChatGPT writing or an app drawing a picture.",
      explain: "Nested sets: AI ⊃ machine learning ⊃ deep learning ⊃ generative AI. Rule-based expert systems are AI but not ML. Decision trees are ML but not deep learning. Image classifiers are deep learning but not generative.",
      stage: {
        kind: "cards",
        zones: [
          { id: "ai", label: "1. AI", icon: "box", tone: "slate", cards: [{ id: "ai1", title: "Any smart machine", sub: "chess engine, route planner", tone: "slate" }] },
          { id: "ml", label: "2. Machine learning", icon: "box", tone: "blue", cards: [{ id: "ml1", title: "Learns from examples", sub: "spam filter, price guesser", tone: "blue" }] },
          { id: "dl", label: "3. Deep learning", icon: "box", tone: "violet", cards: [{ id: "dl1", title: "Big neural networks", sub: "face unlock, speech to text", tone: "violet" }] },
          { id: "gen", label: "4. Generative AI", icon: "llm", tone: "green", cards: [{ id: "g1", title: "Creates new things", sub: "ChatGPT, image makers", tone: "green" }] },
        ],
        note: "Each one sits inside the one on its left",
      },
    },
    {
      id: "limits",
      title: "What AI is good at, and what it is not",
      simple: "AI is great at narrow pattern jobs, but it does not truly understand or think like a person.",
      easy: "Today's AI is **very good at one narrow job at a time**: spotting spam, translating, suggesting videos, writing a draft. It is **not** a thinking being. It doesn't know what words *mean* the way you do, it can be confidently wrong, and it struggles with situations unlike its examples. The best use is AI plus a human who checks the result.",
      explain: "Current systems are narrow, statistical pattern learners. They generalise within the distribution of their training data, can hallucinate, and have no grounded understanding or goals of their own.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "A fair scorecard",
          columns: ["AI is good at", "AI is poor at"],
          rows: [
            ["Patterns in huge amounts of data", "Things unlike its examples"],
            ["Doing one job fast, again and again", "Common sense and real-world judgement"],
            ["Drafting, summarising, translating", "Knowing when it is wrong"],
            ["Recognising faces, speech, objects", "Explaining why it decided something"],
          ],
        },
      },
    },
    {
      id: "examples",
      title: "More good examples, better AI",
      simple: "The more good examples an AI sees, the better it gets, up to a point.",
      easy: "An AI is only as good as the examples it learned from. A spam filter shown 10 emails is barely better than guessing. Shown 100 it improves, with 1,000 it is good, and with 100,000 it is excellent. Gains slow down at the end: going from 1,000 to 100,000 helps less than going from 10 to 1,000. And **bad or unfair examples teach bad habits**, which the next topic covers.",
      explain: "Performance rises with data and flattens (diminishing returns, roughly a power law). Data quality and coverage matter as much as quantity. The numbers below are an illustration, not a measurement.",
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Illustration: spam-filter accuracy vs examples seen (%)",
          items: [
            { label: "10 examples", value: 58, tone: "rose" },
            { label: "100 examples", value: 78, tone: "amber" },
            { label: "1,000 examples", value: 91, tone: "cyan" },
            { label: "100,000 examples", value: 98, tone: "green" },
          ],
          max: 100,
          format: "fixed1",
          caption: "Made-up numbers to show the shape: big jumps early, small gains later.",
        },
      },
    },
    {
      id: "everyday",
      title: "AI you already use every day",
      simple: "You meet AI all day: unlocking your phone, maps, suggestions, search and chat.",
      easy: "You already use AI without noticing. Your phone **recognises your face**. Maps **predicts traffic**. YouTube and Netflix **guess what you'll enjoy**. Your keyboard **predicts the next word**. Chatbots like ChatGPT **write and answer**. Each one learned from a huge pile of examples. The rest of this lab shows how, step by step.",
      explain: "Most consumer AI is a trained model behind a product: vision (face unlock), ranking (feeds), sequence prediction (keyboards), and generation (chatbots).",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Everyday AI and what it learned from",
          columns: ["You use…", "The AI does…", "It learned from…"],
          rows: [
            ["Face unlock", "recognises your face", "millions of face photos"],
            ["Google Maps", "predicts travel time", "past trips and live phone data"],
            ["YouTube / Netflix", "picks what to show next", "what people watched and skipped"],
            ["Phone keyboard", "suggests the next word", "lots of typed text"],
            ["ChatGPT", "writes answers", "a huge amount of text"],
          ],
        },
      },
    },
  ],
  interview: [
    {
      id: "wa-1",
      level: "fresher",
      q: "What is the difference between traditional programming and machine learning?",
      answer: "In traditional programming a person writes the rules and the program applies them to data to give answers. In machine learning we give the computer data together with the answers, and the learning algorithm works out the rules, which we then use on new data.",
      lookFor: "Rules written by hand vs rules learned from examples.",
      wrong: "“Machine learning is just faster programming.”",
    },
    {
      id: "wa-2",
      level: "fresher",
      q: "How are AI, machine learning, deep learning and generative AI related?",
      answer: "They nest: AI is the broad field, machine learning is AI that learns from data, deep learning is machine learning with large neural networks, and generative AI is deep learning that produces new content such as text or images.",
      lookFor: "Correct nesting, and an example for each level.",
      wrong: "Treating them as four unrelated things, or as synonyms.",
    },
  ],
  quiz: [
    {
      id: "wa-q1",
      q: "In machine learning, who writes the rules?",
      options: ["A programmer, line by line", "The computer finds them from examples", "The user, at run time", "Nobody, there are no rules"],
      correct: 1,
      explain: "The learning algorithm discovers the rules (numbers inside the model) from the examples.",
    },
    {
      id: "wa-q2",
      q: "Which job is best done with plain code, not AI?",
      options: ["Spotting a cat in a photo", "Calculating GST on a bill", "Understanding speech", "Recommending a movie"],
      correct: 1,
      explain: "GST has an exact formula. When a clear rule exists, normal code is simpler and exact.",
    },
    {
      id: "wa-q3",
      q: "Which term is the largest box?",
      options: ["Deep learning", "Generative AI", "Artificial intelligence", "Machine learning"],
      correct: 2,
      explain: "AI contains machine learning, which contains deep learning, which contains generative AI.",
    },
    {
      id: "wa-q4",
      q: "What best describes today's AI?",
      options: ["A thinking mind like a person", "A narrow pattern finder that can be confidently wrong", "A program with no examples behind it", "Always right if it sounds sure"],
      correct: 1,
      explain: "Current AI learns patterns from data. It does not understand like a person and can be wrong while sounding confident.",
    },
  ],
});

export default scenario;
