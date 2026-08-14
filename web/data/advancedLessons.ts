import { AILesson } from './types'

// "AI in Depth" — the advanced course, unlocked after completing AI Fundamentals.
// Goes one level deeper: architecture, training pipeline, reasoning, agents,
// evaluation literacy, security, and the open-weight ecosystem.
export const advancedLessons: AILesson[] = [
  {
    category: 'Architecture',
    title: 'Inside the Transformer',
    subtitle: 'What actually happens between your prompt and the answer.',
    icon: 'Layers',
    color: '#8b5cf6',
    sections: [
      {
        content:
          "In the fundamentals course you learned that models read tokens and predict the next one. This lesson opens the box: nearly every model in this app — GPT, Claude, Gemini, Kimi, DeepSeek — is a transformer, an architecture introduced in the 2017 paper 'Attention Is All You Need.' Understanding its three moving parts explains many model behaviors that otherwise seem mysterious.",
      },
      {
        heading: 'The Assembly Line',
        content:
          'A transformer processes your text in a repeating cycle. Each token becomes a vector (a long list of numbers), and then dozens of identical layers refine those vectors, each layer mixing in more context. Run a forward pass through the stack:',
        visual: {
          type: 'layerStack',
          elements: [],
          caption: 'One forward pass — this whole climb happens once per generated token',
        },
      },
      {
        heading: 'Attention, Without the Math',
        content:
          "Attention is the transformer's signature move. For every token, the model asks: which other tokens in the context matter for understanding this one? Attention computes a relevance score between every pair of tokens and blends information accordingly — in parallel, across many independent 'heads' that each learn different relationship types: grammar, coreference, topic, position. Explore a real example:",
        visual: {
          type: 'attention',
          elements: [],
          caption: 'Simplified single-head view — real models run dozens of heads like this in parallel, per layer',
        },
      },
      {
        heading: 'Why Long Context Costs More',
        content:
          'You just saw one word compare itself against seven others. Attention does that for every token against every other token — so the work grows quadratically. Doubling the context roughly quadruples the attention computation, which is why long-context requests cost more and why models can get less precise in the middle of very long inputs.',
      },
      {
        heading: 'Dense vs Mixture-of-Experts',
        content:
          "A dense model activates every parameter for every token. A Mixture of Experts (MoE) model stores many specialized 'expert' blocks and routes each token through only a few of them — so a model can have trillions of parameters while only using a fraction per token. This is how Kimi K3 ships 2.8 trillion parameters at a workable serving cost. Route some tokens yourself:",
        visual: {
          type: 'moeRouter',
          elements: [],
          caption: 'Total parameters ≠ active parameters — check both in model specs',
        },
      },
      {
        heading: 'What This Explains',
        content: 'Three behaviors you can now account for:',
        bullets: [
          'Why generation is word-by-word: each new token requires a full pass through every layer',
          "Why long documents cost more and degrade retrieval quality — attention's quadratic cost",
          "Why 'trillions of parameters' headlines need the active-parameter number next to them",
        ],
      },
    ],
    keyTakeaway:
      'A transformer is an embedding step plus a tall stack of attention-and-transform layers. Attention is pairwise context-gathering — powerful, but its cost grows quadratically with context length.',
  },
  {
    category: 'Training',
    title: 'The Training Pipeline',
    subtitle: 'From raw internet text to a helpful assistant — in three stages.',
    icon: 'Database',
    color: '#06b6d4',
    sections: [
      {
        content:
          "A frontier model is not trained in one step. It goes through a pipeline where each stage has a different goal, different data, and wildly different cost. Knowing the stages lets you decode phrases in model announcements like 'post-trained for agentic tasks' — and understand where model behavior actually comes from.",
      },
      {
        heading: 'The Three Stages',
        content:
          'Every major model follows some version of this pipeline: pre-training on trillions of tokens, supervised fine-tuning on curated examples, then preference training (RLHF). The best way to feel the difference is to ask the same model the same question at each stage:',
        visual: {
          type: 'trainingStages',
          elements: [],
          caption: 'Capability comes from stage 1 — personality and safety mostly from stages 2-3',
        },
      },
      {
        heading: 'Where the Behavior Comes From',
        content:
          "This division of labor explains a lot. Pre-training gives the model its knowledge and its flaws (training-data bias, cutoff dates). Fine-tuning teaches the chat format. Preference training — RLHF — is where refusals, hedging, tone, and sycophancy get dialed in. When two models built on similar data feel completely different to talk to, you're mostly feeling different preference training, not different intelligence.",
        bullets: [
          'Knowledge and hallucination tendencies → pre-training',
          'Answer format and instruction-following → fine-tuning',
          'Refusals, tone, agreeableness → preference training',
        ],
      },
      {
        heading: 'Synthetic Data & Distillation',
        content:
          "Labs increasingly generate training data with AI itself: a strong model produces worked solutions that are filtered — kept only if the code runs or the math checks out — then used to train the next model. Distillation is the targeted version: a large 'teacher' model generates data to train a small 'student,' which is how sub-$1 models got near-frontier quality in 2025-2026. Done with filtering, this works; done indiscriminately and recursively, it degrades models (the 'model collapse' result). The difference is curation, not the synthetic data itself.",
      },
      {
        heading: 'The Cost Ladder',
        content: 'Rough orders of magnitude, which explain who can play at each level:',
        visual: {
          type: 'scale',
          elements: [
            'Fine-tune a small open model: hundreds of dollars',
            'Train a competitive 7B model: millions',
            'Frontier pre-training run: tens to hundreds of millions',
          ],
          caption: 'Compute cost is why open-weight releases from funded labs matter so much',
        },
      },
    ],
    keyTakeaway:
      "Pre-training builds capability; post-training shapes behavior. When you evaluate a model's 'personality' or safety, you are evaluating choices made in preference training — by people.",
  },
  {
    category: 'Frontier',
    title: 'Reasoning & Test-Time Compute',
    subtitle: 'Why modern models "think" before answering — and when that helps.',
    icon: 'BrainCircuit',
    color: '#f59e0b',
    sections: [
      {
        content:
          "Around 2024, progress shifted from making models bigger to letting them think longer. Instead of answering immediately, reasoning models generate internal work first — exploring approaches, catching their own errors — and only then write the reply. This 'test-time compute' is the single biggest change in how frontier AI works since this app's fundamentals course was written.",
      },
      {
        heading: 'Two Budgets, Not One',
        content:
          "A model's quality used to be fixed at training time. Now there are two dials: what was learned during training, and how much compute is spent on your specific question. The same model with a larger thinking budget solves measurably harder problems — which is why 2026 flagships expose effort controls, like the five-level toggle on Claude Opus 5. Try the dial yourself:",
        visual: {
          type: 'thinkingBudget',
          elements: [],
          caption: 'Same weights, different answer-time budget — accuracy climbs, then flattens while cost keeps rising',
        },
      },
      {
        heading: 'Where Thinking Pays Off',
        content: 'The gains are large exactly where single-pass models were weakest:',
        bullets: [
          'Math and formal logic — models reached IMO gold-medal level in 2025',
          'Multi-file coding tasks and debugging',
          'Planning problems with constraints and tradeoffs',
          'NOT: casual writing, summaries, simple facts — there it mostly adds cost and latency',
        ],
      },
      {
        heading: 'Two Honest Caveats',
        content:
          "First: the 'thought process' apps display is a cleaned-up summary, not a faithful transcript — research shows the visible reasoning doesn't always match what drove the answer. Second: thinking raises the ceiling on hard problems but does not install a fact-checker. A model can reason for thousands of tokens and still build carefully on a hallucinated premise. Verify conclusions, not effort.",
      },
    ],
    keyTakeaway:
      "Test-time compute made 'how long should the model think?' a setting you control and pay for. Use it for math, code, and planning; skip it for lookups — and never mistake visible effort for verified truth.",
  },
  {
    category: 'Frontier',
    title: 'Agents, Tools & MCP',
    subtitle: 'What happens when a model can act, not just answer.',
    icon: 'Bot',
    color: '#22c55e',
    sections: [
      {
        content:
          "An agent is a model in a loop: read the situation, choose an action, observe the result, repeat until the goal is met. The 'actions' are tool calls — run code, search the web, click a button, edit a file. This loop is behind coding agents, computer-use assistants, and most of what 2026 marketing calls 'agentic AI.' Watch one work:",
        visual: {
          type: 'agentLoop',
          elements: [],
          caption: 'The agent loop — the model never leaves this think → act → observe cycle',
        },
      },
      {
        heading: 'MCP: The Universal Adapter',
        content:
          "Until recently, every tool integration was custom-built. The Model Context Protocol (MCP), introduced by Anthropic in late 2024 and since adopted across the industry, standardizes how models discover and call tools — one protocol connects a model to databases, browsers, calendars, codebases. This is why agent capabilities expanded so fast: the ecosystem stopped rebuilding plumbing and started sharing it.",
      },
      {
        heading: 'Why Agents Fail Differently',
        content:
          'A chatbot mistake produces one wrong paragraph. An agent mistake compounds:',
        bullets: [
          'Errors stack across steps — a misread file in step 2 corrupts every step after it',
          'Confident goal misinterpretation: the agent optimizes for what it thought you meant',
          'Prompt injection: instructions hidden in a webpage or document can hijack the loop from inside',
          "Over-permission: the July 2026 $HOME deletion incident happened with sandbox and approvals disabled",
        ],
      },
      {
        heading: 'The Safety Playbook',
        content:
          "The working rules that came out of the 2026 incidents are simple: least privilege (give the agent only the access the task needs), approval gates on destructive actions, sandboxes on by default, and backups that the agent cannot touch. 'Fully autonomous' is a risk setting, not a feature tier.",
      },
    ],
    keyTakeaway:
      'Agents are models in an act-observe loop, standardized by MCP. Their power and their risk come from the same place — every tool they can use is a tool they can misuse, so scope access like it matters.',
  },
  {
    category: 'Evaluation',
    title: 'Benchmarks & How to Read Model Claims',
    subtitle: 'The skeptic\'s toolkit for "our new model beats everything."',
    icon: 'BarChart3',
    color: '#ec4899',
    sections: [
      {
        content:
          "Every model release arrives with a chart where the new model wins. Sometimes it's real progress; sometimes it's chart engineering. This lesson is the applied version of everything in this course: how to read an AI capability claim like a fact-checker.",
      },
      {
        heading: 'How Benchmarks Break',
        content: 'Four failure modes account for most misleading scores:',
        bullets: [
          'Contamination: test questions leaked into training data — the model memorized, not solved (the documented CursorBench 3.2 case)',
          'Saturation: when every frontier model scores 90%+, the benchmark stops discriminating',
          'Selection: releases cite the benchmarks they win and omit the ones they lose',
          'Setup gaming: best-of-N sampling, special prompting, or extra compute reported as if standard',
        ],
      },
      {
        heading: 'Try It: The Launch-Day Chart',
        content:
          "And then there's the oldest trick of all — one that isn't even about the benchmark. Here's a chart pattern you will recognize from real model launches. Look at it, form an impression, then press the button:",
        visual: {
          type: 'chartCrime',
          elements: [],
          caption: 'Every time you see a bar chart in a model announcement, find the y-axis first.',
        },
      },
      {
        heading: 'The Questions That Cut Through',
        content: 'When you see "X beats Y," ask:',
        visual: {
          type: 'diagram',
          elements: [
            'Who ran the evaluation — the vendor or an independent party?',
            'Is the benchmark public (contaminable) or held-out?',
            'What was the compute setup — one attempt or best of many?',
            'How big is the gap — 0.5% is noise, not news',
            'Does it show up in benchmarks the vendor did not choose?',
          ],
          caption: 'Five questions that deflate most misleading charts',
        },
      },
      {
        heading: 'What Actually Predicts Usefulness',
        content:
          "Benchmark scores correlate with capability, but the correlation weakens exactly where marketing is strongest — at the frontier, between close competitors. Better signals: independent leaderboards with held-out tasks, head-to-head blind preference rankings, and above all, performance on your task. That's why this app's Compare section shows multiple dimensions instead of one number, and why every model page lists limitations next to capabilities.",
      },
    ],
    keyTakeaway:
      "A benchmark score is a measurement of one thing under one setup — never 'how good the model is.' The five questions (who ran it, held-out?, what setup, gap size, cherry-picked?) will serve you longer than any leaderboard.",
  },
  {
    category: 'Safety',
    title: 'AI Security: Jailbreaks & Prompt Injection',
    subtitle: 'The two attacks that matter — and why one is much harder to fix.',
    icon: 'Lock',
    color: '#ef4444',
    sections: [
      {
        content:
          "As AI moved from chat windows into email clients, browsers, and codebases, it acquired a security problem. Two attack families dominate, they're constantly confused with each other, and the distinction determines what can actually be defended.",
      },
      {
        heading: 'Jailbreak vs Prompt Injection',
        content:
          'A jailbreak is the user attacking the model — crafting prompts (roleplay framing, encoding tricks, many-shot examples) to get around safety training. Prompt injection is a third party attacking the user through the model: malicious instructions hidden in content the AI processes — a webpage, an email, a PDF, a calendar invite — that the model then follows as if they came from you.',
        visual: {
          type: 'comparison',
          elements: [
            'Jailbreak: user vs model — user wants the restricted output',
            'Injection: attacker vs user — the model is the weapon, you are the target',
          ],
          caption: 'Different attacker, different victim, different defenses',
        },
      },
      {
        heading: 'Why Injection Is the Hard One',
        content:
          "Jailbreaks are an arms race the defenders are slowly winning — safety classifiers like those on Claude Fable 5 add a screening layer independent of the model. Injection is structurally harder: transformers have no built-in separation between 'instructions to follow' and 'content to read.' Both arrive as tokens in the same context window. Run the attack yourself — then run it again with a defense on:",
        visual: {
          type: 'injectionDemo',
          elements: [],
          caption: 'Indirect prompt injection — no hacking of the model required, and the fix is permissions, not intelligence',
        },
      },
      {
        heading: 'The Defense Stack',
        content: 'No single fix exists; real defenses layer:',
        bullets: [
          'Input/output classifiers screening for attack patterns',
          'Privilege separation: content-reading agents should not hold send/delete/pay permissions',
          'Human approval gates on consequential actions',
          'Treating every external document an agent reads as untrusted input',
        ],
      },
    ],
    keyTakeaway:
      "Jailbreaks target the model; injections target you through the model. Injection is unsolved at the architecture level — which is why an agent's permissions matter more than its intelligence.",
  },
  {
    category: 'Ecosystem',
    title: 'Open Weights & Running Models Yourself',
    subtitle: 'The other half of the AI world — licenses, quantization, and local AI.',
    icon: 'HardDrive',
    color: '#60a5fa',
    sections: [
      {
        content:
          "Half the models in this app's catalog can be downloaded and run on your own hardware. That half — DeepSeek, Kimi, Muse, Mistral, Command — works on different economics and different rules than the closed APIs, and 2025-2026 made it competitive at the frontier for the first time.",
      },
      {
        heading: "'Open' Comes in Degrees",
        content:
          "Precision matters here, because 'open source AI' is used loosely:",
        bullets: [
          'Open weights: the trained parameters are downloadable — but check the license (Kimi K3 requires attribution above 100M monthly users; resellers need agreements)',
          'Open source (strict): weights, training code, and data recipe all published — rare at the frontier',
          'Open API only: you can call it, but nothing is downloadable (GPT-5.6, Claude, Gemini)',
        ],
      },
      {
        heading: 'Quantization: The Enabler',
        content:
          "Model weights are stored as high-precision numbers. Quantization rounds them to lower precision — 8-bit, 4-bit, even lower — shrinking memory needs by 2-4x with a small quality cost. It's the reason a model that nominally needs 140GB can run on a 48GB machine, and the reason local AI is practical at all. Squeeze a 70B model yourself and watch what happens:",
        visual: {
          type: 'quantizeSlider',
          elements: [],
          caption: 'The 4-bit sweet spot is what local tools like Ollama actually run',
        },
      },
      {
        heading: 'Why This Half Matters',
        content:
          "Open weights are the reason API prices keep falling (closed labs price against free alternatives), the reason researchers can study how models work internally, and the reason AI capability can't be fully centralized or fully recalled. They're also the reason watermarking and content-policy enforcement have limits — an open model runs wherever someone has the hardware. Every debate about AI control eventually runs through this fact.",
      },
    ],
    keyTakeaway:
      "Open weights changed AI's power structure: frontier-adjacent capability now runs on hardware you can own, under licenses you should actually read. Quantization is what makes it fit.",
  },
]
