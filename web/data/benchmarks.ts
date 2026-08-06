// Curated list of well-known AI benchmarks. Each entry powers two things:
// 1) Inline highlighting in body copy (via TermHighlight.tsx) — only entries
//    NOT marked excludeFromInlineHighlight are matched there. We exclude
//    names that are common English words (e.g. "MATH") so we don't false-
//    positive in normal prose.
// 2) Auto-detected benchmark chips on capability cards (ModelDetail.tsx),
//    which use the full list since context there is unambiguous.

export type BenchmarkCategory =
  | 'reasoning'
  | 'coding'
  | 'agent'
  | 'multimodal'
  | 'knowledge'
  | 'language'
  | 'safety'
  | 'general'

export interface Benchmark {
  id: string
  name: string
  /** Alternate names that should also match this benchmark. */
  aliases?: string[]
  category: BenchmarkCategory
  /** One-line summary shown as the popup subtitle. */
  shortDescription: string
  /** Multi-sentence "what it tests" body. */
  details: string
  /** How the benchmark is scored. */
  metric?: string
  releaseYear?: number
  /** Org or first-author group. */
  source?: string
  /** Official link (paper, leaderboard, or repo). */
  url?: string
  /** When true, do NOT highlight this name inline (avoids false positives in prose). */
  excludeFromInlineHighlight?: boolean
}

export const benchmarks: Benchmark[] = [
  // ---------- Knowledge / General ----------
  {
    id: 'mmlu',
    name: 'MMLU',
    aliases: ['Massive Multitask Language Understanding'],
    category: 'knowledge',
    shortDescription: 'Massive Multitask Language Understanding (57 subjects).',
    details:
      'A 57-subject multiple-choice test spanning STEM, humanities, social sciences, and professional exams (law, medicine, accounting). Measures broad knowledge and reasoning. Score is overall accuracy across roughly 14,000 questions. Largely saturated by frontier models, which is why MMLU-Pro was created as a successor.',
    metric: 'Accuracy %',
    releaseYear: 2020,
    source: 'Hendrycks et al.',
    url: 'https://arxiv.org/abs/2009.03300',
  },
  {
    id: 'mmlu-pro',
    name: 'MMLU-Pro',
    category: 'knowledge',
    shortDescription: 'Harder, reasoning-heavy successor to MMLU.',
    details:
      'A more challenging successor to MMLU with 10 answer choices instead of 4 and questions filtered to require multi-step reasoning rather than memorization. About 12,000 questions across 14 subjects. Standard frontier-model headline benchmark.',
    metric: 'Accuracy %',
    releaseYear: 2024,
    source: 'TIGER-Lab',
    url: 'https://arxiv.org/abs/2406.01574',
  },
  {
    id: 'agieval',
    name: 'AGIEval',
    category: 'knowledge',
    shortDescription: 'Human standardized exams (SAT, LSAT, civil service, gaokao).',
    details:
      'Curated questions drawn from human standardized exams — SAT, GRE, LSAT, US civil-service tests, and the Chinese gaokao — used to compare LLMs against actual human exam-takers across reasoning-heavy domains.',
    metric: 'Accuracy %',
    releaseYear: 2023,
    source: 'Microsoft',
    url: 'https://arxiv.org/abs/2304.06364',
  },

  // ---------- Reasoning ----------
  {
    id: 'gpqa',
    name: 'GPQA',
    aliases: ['Graduate-Level Google-Proof Q&A'],
    category: 'reasoning',
    shortDescription: 'Graduate-level science questions designed to be Google-proof.',
    details:
      'Hard multiple-choice questions in physics, chemistry, and biology written by domain experts and verified to be unanswerable by web search. Tests deep scientific reasoning without retrieval shortcuts.',
    metric: 'Accuracy %',
    releaseYear: 2023,
    source: 'Rein et al.',
    url: 'https://arxiv.org/abs/2311.12022',
  },
  {
    id: 'gpqa-diamond',
    name: 'GPQA Diamond',
    category: 'reasoning',
    shortDescription: 'The hardest 198-question subset of GPQA.',
    details:
      'The most difficult subset of GPQA: 198 questions where roughly two-thirds of expert PhDs in the relevant field still get them wrong without tools. The standard frontier-model benchmark for graduate-level scientific reasoning.',
    metric: 'Accuracy %',
    releaseYear: 2023,
    source: 'Rein et al.',
    url: 'https://arxiv.org/abs/2311.12022',
  },
  {
    id: 'aime',
    name: 'AIME',
    aliases: ['American Invitational Mathematics Examination'],
    category: 'reasoning',
    shortDescription: 'Elite high-school competition math (15 problems, 3 hours).',
    details:
      'The American Invitational Mathematics Examination — a 15-problem, 3-hour competition for the top US high-school math students. Each answer is an integer from 0–999. Used as an LLM benchmark because it requires multi-step proof-style problem solving.',
    metric: 'Problems solved',
    releaseYear: 1983,
  },
  {
    id: 'aime-2024',
    name: 'AIME 2024',
    category: 'reasoning',
    shortDescription: 'AIME I + II 2024 (30 problems total).',
    details:
      'The AIME I and II competitions held in 2024, totaling 30 problems. A common math-reasoning benchmark for LLMs because it postdates many models\u2019 training cutoffs and is hard to memorize.',
    metric: 'Problems solved (out of 30)',
    releaseYear: 2024,
  },
  {
    id: 'aime-2025',
    name: 'AIME 2025',
    category: 'reasoning',
    shortDescription: 'AIME I + II 2025 (30 problems total).',
    details:
      'The 2025 American Invitational Mathematics Examination, used as a fresh, contamination-free reasoning benchmark for the latest frontier models.',
    metric: 'Problems solved (out of 30)',
    releaseYear: 2025,
  },
  {
    id: 'math',
    name: 'MATH',
    category: 'reasoning',
    shortDescription: 'Competition-style math problems with worked solutions.',
    details:
      '12,500 problems from US high-school math competitions (AMC 10/12, AIME, etc.) graded 1\u20135 by difficulty, with full worked-out solutions. Tests symbolic and step-by-step reasoning.',
    metric: 'Accuracy %',
    releaseYear: 2021,
    source: 'Hendrycks et al.',
    url: 'https://arxiv.org/abs/2103.03874',
    excludeFromInlineHighlight: true,
  },
  {
    id: 'gsm8k',
    name: 'GSM8K',
    category: 'reasoning',
    shortDescription: 'Grade-school math word problems (2\u20138 reasoning steps).',
    details:
      '8,500 grade-school-level math word problems requiring 2\u20138 reasoning steps. Now considered saturated by frontier models, but still a useful sanity check and historically important.',
    metric: 'Accuracy %',
    releaseYear: 2021,
    source: 'OpenAI',
    url: 'https://arxiv.org/abs/2110.14168',
  },
  {
    id: 'bbh',
    name: 'BBH',
    aliases: ['BIG-Bench Hard'],
    category: 'reasoning',
    shortDescription: 'BIG-Bench Hard \u2014 23 tasks where pre-2022 LLMs failed.',
    details:
      'A 23-task subset of BIG-Bench specifically chosen because earlier LLMs failed on them. Tests multi-step logical, causal, and structured reasoning.',
    metric: 'Accuracy %',
    releaseYear: 2022,
    source: 'Suzgun et al.',
    url: 'https://arxiv.org/abs/2210.09261',
  },
  {
    id: 'arc-agi',
    name: 'ARC-AGI',
    aliases: ['ARC-AGI-2', 'ARC-AGI 2', 'ARC-AGI-3', 'ARC-AGI 3'],
    category: 'reasoning',
    shortDescription: 'Visual abstraction & reasoning corpus (Chollet).',
    details:
      'A grid-based visual reasoning challenge designed by Fran\u00e7ois Chollet to test abstraction and skill acquisition rather than memorization. Each task gives a few input/output examples; the model must infer the rule and apply it to a new input. The basis of the ARC Prize. Successors ARC-AGI-2 (harder static tasks) and ARC-AGI-3 (interactive game environments) keep the frontier unsaturated — in July 2026, GPT-5.6 Sol became the first model to beat a public ARC-AGI-3 game.',
    metric: 'Accuracy %',
    releaseYear: 2019,
    source: 'Chollet / ARC Prize',
    url: 'https://arcprize.org/',
  },
  {
    id: 'hle',
    name: "Humanity's Last Exam",
    aliases: ['HLE'],
    category: 'knowledge',
    shortDescription: 'Expert-written questions at the frontier of human knowledge.',
    details:
      'Thousands of questions written by subject-matter experts across dozens of fields, designed to be the hardest broad academic benchmark available — questions that even domain PhDs find difficult. Created as a successor to saturated benchmarks like MMLU. Frontier models still score well below expert-human level, making it a common headline number for new releases.',
    metric: 'Accuracy %',
    releaseYear: 2025,
    source: 'CAIS / Scale AI',
    url: 'https://lastexam.ai/',
  },

  // ---------- Coding ----------
  {
    id: 'humaneval',
    name: 'HumanEval',
    category: 'coding',
    shortDescription: 'Hand-written Python coding problems with unit tests.',
    details:
      '164 hand-written Python programming problems with unit tests. Score is pass@1 (whether the first generated solution passes all tests). Largely saturated by modern frontier models but historically important.',
    metric: 'Pass@1 %',
    releaseYear: 2021,
    source: 'OpenAI',
    url: 'https://arxiv.org/abs/2107.03374',
  },
  {
    id: 'mbpp',
    name: 'MBPP',
    aliases: ['Mostly Basic Python Problems'],
    category: 'coding',
    shortDescription: 'Mostly Basic Python Problems (~1K crowdsourced tasks).',
    details:
      'About 1,000 crowdsourced entry-level Python problems with three test cases each. Tests basic code generation against a natural-language problem description.',
    metric: 'Pass@1 %',
    releaseYear: 2021,
    source: 'Google',
    url: 'https://arxiv.org/abs/2108.07732',
  },
  {
    id: 'swe-bench',
    name: 'SWE-Bench',
    aliases: ['SWE Bench'],
    category: 'coding',
    shortDescription: 'Real GitHub issues from popular Python repos.',
    details:
      '2,294 real-world software-engineering tasks pulled from GitHub issues across 12 popular Python repositories. The model must produce a patch that resolves the issue and passes the original test suite \u2014 much harder than function-level coding because it requires navigating real codebases.',
    metric: 'Resolved %',
    releaseYear: 2023,
    source: 'Princeton NLP',
    url: 'https://www.swebench.com/',
  },
  {
    id: 'swe-bench-verified',
    name: 'SWE-Bench Verified',
    category: 'coding',
    shortDescription: 'Human-validated 500-problem subset of SWE-Bench.',
    details:
      'A 500-problem subset of SWE-Bench where every task was human-reviewed to confirm it is solvable and fairly scored, removing broken or underspecified issues from the original set. The most commonly cited SWE-Bench variant for headline coding-agent numbers.',
    metric: 'Resolved %',
    releaseYear: 2024,
    source: 'OpenAI / Princeton NLP',
    url: 'https://www.swebench.com/',
  },
  {
    id: 'swe-bench-pro',
    name: 'SWE-Bench Pro',
    category: 'coding',
    shortDescription: 'Harder, contamination-resistant successor to SWE-Bench.',
    details:
      'A harder, contamination-resistant successor to SWE-Bench using more diverse codebases (including non-Python and proprietary repos). Often cited as the headline benchmark for autonomous coding agents.',
    metric: 'Resolved %',
    releaseYear: 2025,
  },
  {
    id: 'terminal-bench',
    name: 'Terminal-Bench',
    aliases: ['Terminal-Bench 2.1', 'Terminal-Bench 2'],
    category: 'coding',
    shortDescription: 'Real command-line tasks executed in a live terminal.',
    details:
      'Evaluates AI agents on realistic tasks carried out in a live terminal environment — compiling code, wrangling data, administering systems, and debugging — scored by whether the end state is correct. Because tasks execute in a real sandbox, it is harder to game than static Q&A benchmarks. Version 2.x is the standard agentic-coding headline number in 2026; Grok 4.5 posted 83.3% on Terminal-Bench 2.1 at launch.',
    metric: 'Success rate %',
    releaseYear: 2025,
    source: 'Stanford / Laude Institute',
    url: 'https://www.tbench.ai/',
  },
  {
    id: 'cursorbench',
    name: 'CursorBench',
    aliases: ['CursorBench 3.2'],
    category: 'coding',
    shortDescription: 'Agentic coding evaluated in real IDE-style sessions.',
    details:
      'Measures how well a model completes end-to-end coding tasks in realistic editor/agent sessions, weighing both task success and cost per task. Widely cited in 2026 frontier releases: Claude Opus 5 landed within 0.5% of Fable 5\u2019s peak at half the per-task cost. Also a cautionary tale — SpaceXAI disclosed that a Cursor codebase snapshot contaminated Grok 4.5\u2019s training and inflated its score.',
    metric: 'Task success % / cost per task',
    releaseYear: 2025,
  },
  {
    id: 'frontier-bench',
    name: 'Frontier-Bench',
    aliases: ['Frontier-Bench v0.1'],
    category: 'general',
    shortDescription: 'Cross-domain evaluation suite for 2026 frontier models.',
    details:
      'A 2026 evaluation suite designed to separate frontier models on hard, cross-domain professional work after older benchmarks saturated. Scores both accuracy and cost per task. Claude Opus 5 led all models on v0.1 at release, more than doubling Opus 4.8\u2019s score at lower cost per task.',
    metric: 'Composite score',
    releaseYear: 2026,
  },
  {
    id: 'livebench',
    name: 'LiveBench',
    category: 'general',
    shortDescription: 'Frequently-refreshed contamination-free benchmark.',
    details:
      'A multi-domain benchmark whose questions are continuously refreshed (math, reasoning, coding, language, instruction-following, data analysis) to avoid training-set contamination. Each model is scored against the latest version of the test set.',
    metric: 'Average score',
    releaseYear: 2024,
    source: 'Abacus AI / LeCun et al.',
    url: 'https://livebench.ai/',
  },

  // ---------- Agent / Tool-use ----------
  // Note: per the app's glossary, "agentic" describes a theoretical
  // self-directed AI that does not yet exist. Today's frontier models are
  // AI agents (they execute tasks a human assigns), so we categorize these
  // benchmarks under 'agent' rather than 'agentic'.
  {
    id: 'osworld',
    name: 'OSWorld',
    category: 'agent',
    shortDescription: 'Real desktop tasks across Ubuntu, Windows, and macOS.',
    details:
      '369 real-world computer-use tasks (file management, web browsing, multi-app workflows) executable in a real OS environment. Tests whether an agent can drive a desktop with mouse, keyboard, and the file system. The "average human" baseline is roughly 72%.',
    metric: 'Success rate %',
    releaseYear: 2024,
    source: 'HKU NLP',
    url: 'https://os-world.github.io/',
  },
  {
    id: 'tau-bench',
    name: 'TAU-Bench',
    category: 'agent',
    shortDescription: 'Multi-turn tool-use evaluation (retail, airline).',
    details:
      'Evaluates how well an agent can complete realistic multi-turn tasks (retail customer service, airline bookings) using a defined toolset under strict policy compliance. Tests both action accuracy and conversational dynamics.',
    metric: 'Success rate %',
    releaseYear: 2024,
    source: 'Sierra',
    url: 'https://github.com/sierra-research/tau-bench',
  },
  {
    id: 'bfcl',
    name: 'BFCL',
    aliases: ['Berkeley Function Calling Leaderboard'],
    category: 'agent',
    shortDescription: 'Berkeley Function-Calling Leaderboard.',
    details:
      'Evaluates whether a model can correctly call APIs given a natural-language request and an OpenAPI-style spec. Covers simple, multiple, parallel, and nested tool-call scenarios.',
    metric: 'Accuracy %',
    releaseYear: 2024,
    source: 'UC Berkeley',
    url: 'https://gorilla.cs.berkeley.edu/leaderboard.html',
  },

  {
    id: 'frontend-code-arena',
    name: 'Frontend Code Arena',
    category: 'coding',
    shortDescription: 'Head-to-head human voting on generated frontend UIs.',
    details:
      'A live arena where models generate working frontend interfaces from the same prompt and humans vote on the better result, producing Elo-style rankings. Because judging rendered UIs is hard to game with memorization, it became a closely watched coding leaderboard in 2026 — Kimi K3 debuted at #1, above Claude Fable 5.',
    metric: 'Elo rating',
    releaseYear: 2025,
  },
  {
    id: 'mcp-atlas',
    name: 'MCP Atlas',
    category: 'agent',
    shortDescription: 'Tool-use evaluation across real MCP servers.',
    details:
      'Evaluates agents on multi-step tasks that require discovering and correctly using tools exposed over the Model Context Protocol (MCP) — the open standard for connecting AI models to external services. Tests tool discovery, argument construction, and multi-server orchestration. Meta claimed the #1 spot with Muse Spark 1.1 in July 2026.',
    metric: 'Task success %',
    releaseYear: 2026,
  },

  // ---------- Multimodal ----------
  {
    id: 'mmmu',
    name: 'MMMU',
    aliases: ['Massive Multi-discipline Multimodal Understanding'],
    category: 'multimodal',
    shortDescription: 'College-level multimodal questions across 30 subjects.',
    details:
      '11,500 college-level multimodal questions (charts, figures, schematics, diagrams) spanning 30 academic subjects. The standard headline benchmark for visual reasoning.',
    metric: 'Accuracy %',
    releaseYear: 2024,
    source: 'IN.AI Research',
    url: 'https://mmmu-benchmark.github.io/',
  },
  {
    id: 'mmvet',
    name: 'MMVet',
    category: 'multimodal',
    shortDescription: '6-capability vision-language evaluation.',
    details:
      'Evaluates vision-language models across 6 core capabilities (recognition, OCR, knowledge, language generation, spatial awareness, math) requiring integrated reasoning over images and text.',
    metric: 'GPT-4 judged %',
    releaseYear: 2023,
  },
  {
    id: 'mathvista',
    name: 'MathVista',
    category: 'multimodal',
    shortDescription: 'Visual math reasoning across diagrams and figures.',
    details:
      'About 6,000 visual math questions covering diagrams, plots, scientific figures, and geometric drawings. Tests integrated visual + symbolic reasoning end-to-end.',
    metric: 'Accuracy %',
    releaseYear: 2023,
    url: 'https://mathvista.github.io/',
  },
  {
    id: 'chartqa',
    name: 'ChartQA',
    category: 'multimodal',
    shortDescription: 'Question answering over charts and graphs.',
    details:
      'About 32,000 human-authored questions about real charts and graphs, requiring visual reasoning and arithmetic over the rendered figure (not just OCR).',
    metric: 'Relaxed accuracy %',
    releaseYear: 2022,
  },
  {
    id: 'docvqa',
    name: 'DocVQA',
    category: 'multimodal',
    shortDescription: 'Document visual question answering.',
    details:
      '50,000 questions over 12,767 document images (forms, receipts, letters). Tests OCR + layout understanding + reasoning together.',
    metric: 'ANLS score',
    releaseYear: 2020,
  },

  // ---------- Language / Conversational ----------
  {
    id: 'chatbot-arena',
    name: 'Chatbot Arena',
    category: 'language',
    shortDescription: 'Crowdsourced blind side-by-side preference voting.',
    details:
      'A live leaderboard where users blind-compare two anonymous model responses to the same prompt and vote for the better one. Computes Elo-style ratings from millions of head-to-head matchups. Maintained by LMSYS.',
    metric: 'Elo rating',
    releaseYear: 2023,
    source: 'LMSYS',
    url: 'https://chat.lmsys.org/',
  },
  {
    id: 'mt-bench',
    name: 'MT-Bench',
    category: 'language',
    shortDescription: 'Multi-turn instruction-following judged by GPT-4.',
    details:
      '80 multi-turn conversation prompts across 8 categories, judged by GPT-4 on a 1\u201310 scale. A quick proxy for conversational quality, though limited by judge bias.',
    metric: 'GPT-4 judge (1\u201310)',
    releaseYear: 2023,
    source: 'LMSYS',
  },
  {
    id: 'ifeval',
    name: 'IFEval',
    category: 'language',
    shortDescription: 'Verifiable instruction-following.',
    details:
      'About 500 prompts with verifiable instructions (e.g. "respond in exactly 3 bullet points", "include the word \u2018apple\u2019 twice"). Scored deterministically without an LLM judge.',
    metric: 'Strict accuracy %',
    releaseYear: 2023,
    source: 'Google',
    url: 'https://arxiv.org/abs/2311.07911',
  },
  {
    id: 'hellaswag',
    name: 'HellaSwag',
    category: 'language',
    shortDescription: 'Adversarial sentence-completion commonsense reasoning.',
    details:
      'Adversarially-filtered sentence-completion benchmark for commonsense reasoning. Mostly saturated by modern models but historically important and still cited.',
    metric: 'Accuracy %',
    releaseYear: 2019,
  },
  {
    id: 'winogrande',
    name: 'WinoGrande',
    category: 'language',
    shortDescription: 'Pronoun-resolution commonsense reasoning at scale.',
    details:
      '44,000 Winograd-schema-style commonsense pronoun-resolution problems, scaled and adversarially filtered. Largely saturated.',
    metric: 'Accuracy %',
    releaseYear: 2019,
  },

  // ---------- Safety ----------
  {
    id: 'truthfulqa',
    name: 'TruthfulQA',
    category: 'safety',
    shortDescription: 'Resistance to common misconceptions and falsehoods.',
    details:
      '817 questions across 38 categories targeting common human misconceptions (e.g. health myths, urban legends). Tests whether the model echoes popular falsehoods or gives the truthful answer.',
    metric: 'Truthful + informative %',
    releaseYear: 2021,
    source: 'OpenAI / Oxford',
    url: 'https://arxiv.org/abs/2109.07958',
  },
]

export const benchmarkCategoryLabel: Record<BenchmarkCategory, string> = {
  reasoning: 'Reasoning',
  coding: 'Coding',
  agent: 'Agent',
  multimodal: 'Multimodal',
  knowledge: 'Knowledge',
  language: 'Language',
  safety: 'Safety',
  general: 'General',
}

export const benchmarkCategoryColor: Record<BenchmarkCategory, string> = {
  reasoning: '#a855f7',
  coding: '#22c55e',
  agent: '#f97316',
  multimodal: '#06b6d4',
  knowledge: '#3b82f6',
  language: '#ec4899',
  safety: '#ef4444',
  general: '#a855f7',
}

const BENCHMARK_LOOKUP: Map<string, Benchmark> = (() => {
  const m = new Map<string, Benchmark>()
  for (const b of benchmarks) {
    m.set(b.name.toLowerCase(), b)
    if (b.aliases) {
      for (const a of b.aliases) m.set(a.toLowerCase(), b)
    }
  }
  return m
})()

export function findBenchmark(query: string): Benchmark | undefined {
  return BENCHMARK_LOOKUP.get(query.toLowerCase().trim())
}

/** All (benchmark, pattern) pairs sorted longest-first so e.g. "SWE-Bench Pro" matches before "SWE-Bench". */
export const BENCHMARK_PATTERNS_ALL: { benchmark: Benchmark; pattern: string }[] = (() => {
  const list: { benchmark: Benchmark; pattern: string }[] = []
  for (const b of benchmarks) {
    list.push({ benchmark: b, pattern: b.name })
    if (b.aliases) {
      for (const a of b.aliases) list.push({ benchmark: b, pattern: a })
    }
  }
  return list.sort((a, b) => b.pattern.length - a.pattern.length)
})()

/** Subset safe to use for inline highlighting (excludes ambiguous English-word names like "MATH"). */
export const BENCHMARK_PATTERNS_FOR_HIGHLIGHT: { benchmark: Benchmark; pattern: string }[] =
  BENCHMARK_PATTERNS_ALL.filter((p) => !p.benchmark.excludeFromInlineHighlight)
