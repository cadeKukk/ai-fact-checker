import { AILesson } from './types'

export const lessons: AILesson[] = [
  {
    category: 'Introduction',
    title: 'Why Artificial Intelligence Literacy Matters',
    subtitle: "Understanding AI helps you separate fact from fiction in today's world.",
    icon: 'Brain',
    color: '#1d4ed8',
    sections: [
      {
        content:
          "AI is everywhere—in your phone, your search results, your social media feed. Companies make bold claims about what AI can do. News headlines swing between 'AI will solve everything' and 'AI will destroy us all.'\n\nThe truth? It's somewhere in between, and understanding the basics helps you navigate this landscape.",
      },
      {
        heading: "What You'll Learn",
        content: 'This mini-course will teach you the fundamentals:',
        bullets: [
          'How AI and neural networks actually work',
          'What language models like ChatGPT really do',
          "Key terms like 'parameters' and 'tokens'",
          'What AI can and cannot do today',
          'How to spot AI misinformation',
        ],
      },
      {
        heading: 'No Technical Background Needed',
        content:
          "We'll explain everything in plain language with helpful visuals. By the end, you'll be able to evaluate AI claims critically and use this app to fact-check what you hear.",
      },
    ],
    keyTakeaway:
      "AI literacy isn't about becoming a programmer—it's about being an informed citizen in a world increasingly shaped by AI.",
  },
  {
    category: 'Fundamentals',
    title: 'What is Artificial Intelligence?',
    subtitle: 'AI is software that can learn patterns from data instead of following fixed rules.',
    icon: 'Cpu',
    color: '#00a68c',
    sections: [
      {
        heading: 'Traditional Programming vs AI',
        content:
          'Traditional software follows explicit rules written by programmers. AI systems learn patterns from examples instead.',
        visual: {
          type: 'comparison',
          elements: ['Traditional: Programmer writes rules', 'AI: System learns from examples'],
          caption: 'The key difference in approach',
        },
      },
      {
        heading: 'A Simple Example',
        content:
          "To build a spam filter the traditional way, you'd write rules like 'if email contains URGENT MONEY, mark as spam.' But spammers adapt.\n\nWith AI, you show the system thousands of spam and non-spam emails. It learns to recognize patterns humans might miss—without being told specific rules.",
      },
      {
        heading: 'What AI Is NOT',
        content:
          "Despite the name 'artificial intelligence,' current AI systems are not intelligent in the human sense:",
        bullets: [
          "They don't understand or think—they recognize patterns",
          "They don't have consciousness or feelings",
          "They don't have goals or desires",
          "They can't reason about novel situations like humans",
        ],
      },
    ],
    keyTakeaway:
      "AI systems are sophisticated pattern-matching tools, not thinking machines. They're incredibly useful but fundamentally different from human intelligence.",
  },
  {
    category: 'Fundamentals',
    title: 'Neural Networks Explained',
    subtitle: 'The building blocks of modern AI, inspired by (but very different from) the brain.',
    icon: 'Network',
    color: '#7e22ce',
    sections: [
      {
        heading: 'The Basic Idea',
        content:
          "A neural network is layers of simple mathematical operations connected together. Data flows through these layers, getting transformed at each step until it produces an output.\n\nThe 'neural' name comes from a loose inspiration from brain neurons, but modern neural networks work very differently from actual brains.",
      },
      {
        heading: 'How It Works',
        content: 'Information flows through the network in stages:',
        visual: {
          type: 'flow',
          elements: [
            'Input (text, image, etc.)',
            'Hidden layers process & transform',
            'More layers find complex patterns',
            'Output (prediction, text, etc.)',
          ],
          caption: 'Simplified view of a neural network',
        },
      },
      {
        heading: 'See It In Action',
        content:
          "The animation below shows how a neural network learns. You'll see the forward pass (data flowing through), error calculation, and the backward pass where weights get adjusted:",
        visual: {
          type: 'neuralNetwork',
          elements: [],
          caption: 'Watch the forward and backward pass',
        },
      },
      {
        heading: 'The Two Passes',
        content: 'Training involves two key phases that repeat over and over:',
        bullets: [
          'Forward Pass: Data flows from input to output. Each connection multiplies the data by its weight.',
          "Error Calculation: Compare the output to what we wanted. How wrong were we?",
          'Backward Pass: The error flows backward, telling each weight how much it contributed to the mistake.',
          "Weight Update: Each weight is adjusted slightly to reduce the error. This is the actual 'learning'!",
        ],
      },
      {
        heading: 'Scale = Intelligence?',
        content:
          "A large language model like GPT-4 has hundreds of billions of these weights—that's what 'parameters' means. Training adjusts all of them, millions of times, on trillions of examples.\n\nThe magic isn't in any single weight—it's in the patterns that emerge from billions of tiny adjustments.",
      },
    ],
    keyTakeaway:
      'Neural networks learn by adjusting billions of numerical weights through repeated forward and backward passes. Each pass makes the model slightly better at its task.',
  },
  {
    category: 'Core Concepts',
    title: 'How Language Models Work',
    subtitle: 'The technology behind ChatGPT, Claude, and other AI assistants.',
    icon: 'MessageCircle',
    color: '#c2410c',
    sections: [
      {
        heading: 'Predicting the Next Word',
        content:
          "At their core, language models do one thing: predict what word (or piece of word) comes next. Given 'The cat sat on the...', the model predicts 'mat' is likely.\n\nWatch it happen below — tap Predict to see a language model build a sentence:",
        visual: {
          type: 'nextWord',
          elements: [],
          caption: 'Watch next-word prediction in action',
        },
      },
      {
        heading: 'Training on the Internet',
        content:
          'Models learn by reading enormous amounts of text—books, websites, code, conversations. They learn patterns like:',
        bullets: [
          'Grammar and sentence structure',
          'Facts (though not always accurately)',
          'Writing styles and formats',
          'How conversations flow',
        ],
      },
      {
        heading: 'Why They Seem Smart',
        content:
          "Because they've seen so many examples of human text, language models can:",
        bullets: [
          'Write in many styles and formats',
          'Answer questions (by predicting likely answers)',
          'Follow instructions (by predicting compliance)',
          'Have conversations (by predicting responses)',
        ],
      },
      {
        heading: 'Why They Make Mistakes',
        content:
          "They predict plausible text, not true text. If a false statement sounds like something that would appear in their training data, they might generate it. This is called 'hallucination'—confident-sounding nonsense.",
      },
    ],
    keyTakeaway:
      'Language models are prediction engines, not knowledge databases. They generate text that sounds right, whether or not it is right.',
  },
  {
    category: 'Core Concepts',
    title: 'Tokens & Context Windows',
    subtitle: 'Understanding how AI models process and remember text.',
    icon: 'AlignLeft',
    color: '#0e7490',
    sections: [
      {
        heading: 'What Are Tokens?',
        content:
          "AI models don't read letters or words—they read 'tokens.' A token is a chunk of text, roughly 3-4 characters or about ¾ of a word.\n\nTap below to see tokenization in action:",
        visual: {
          type: 'tokenizer',
          elements: [],
          caption: 'Watch text get split into tokens',
        },
      },
      {
        heading: 'Tokens Are Just Numbers',
        content:
          "Under the hood, a token isn't text at all—it's an integer ID. Every model ships with a fixed vocabulary (typically 50,000 to 200,000 entries) stored in a file. The text \"hello\" might become the ID 15496; the space + word \" world\" might become 995.\n\nThat's all the model ever sees: a sequence of numbers like [15496, 995]. Letters, punctuation, and whitespace never reach the neural network directly.",
      },
      {
        heading: 'From ID to Meaning',
        content:
          "Here's where meaning comes in. Each token ID is used to look up a row in an embedding table—a giant matrix baked into the model's weights. That row is a long list of numbers (often 4,096 or 12,288 of them) called a vector.\n\nThis vector is the token's 'meaning' expressed in math. During training, the model nudges these vectors around so that related tokens end up pointing in similar directions—'dog' lands near 'puppy,' 'Paris' lands near 'France.' The model doesn't know definitions; it knows geometry.",
        bullets: [
          'Token text → integer ID (vocabulary lookup)',
          'Integer ID → vector of numbers (embedding table)',
          'Vector position → learned relationships between concepts',
        ],
        visual: {
          type: 'embedding',
          elements: [],
          caption: 'Tokens drift into clusters by meaning — a simplified view of a high-dimensional embedding space',
        },
      },
      {
        heading: 'Every Model Has Its Own Map',
        content:
          "No two models build the same map of meaning. Training data, architecture, and learning objectives all shape the geometry, so one model might place \"cat\" near \"dog\" while another places it near \"tiger.\"\n\nThese small differences in clustering are part of why two systems can interpret the same sentence in very different ways. A model trained mostly on scientific papers will cluster concepts differently than one trained on casual internet writing, even when their vocabularies overlap almost completely.",
      },
      {
        heading: 'Why Tokens Matter',
        content: 'Everything in AI is measured in tokens:',
        bullets: [
          'Pricing: APIs charge per token processed',
          'Limits: Models can only handle so many tokens',
          'Speed: Fewer tokens = faster responses',
          "Cost: Your 'prompt' uses tokens from your limit",
        ],
      },
      {
        heading: 'Context Window',
        content:
          "The 'context window' is how many tokens a model can consider at once—like its working memory. This includes your question AND the model's response.",
        visual: {
          type: 'scale',
          elements: [
            'GPT-3.5: 16K tokens (~20 pages)',
            'GPT-4: 128K tokens (~150 pages)',
            'Claude: 200K tokens (~250 pages)',
            'Gemini: 1M+ tokens (~1200 pages)',
          ],
          caption: 'Context windows have grown rapidly',
        },
      },
      {
        heading: 'The Memory Myth',
        content:
          "Important: context window is NOT memory! Once a conversation exceeds the window, earlier parts are forgotten. And between conversations, models remember nothing—each chat starts fresh.",
      },
    ],
    keyTakeaway:
      "Context window = temporary working space, not permanent memory. Models don't learn from or remember your conversations.",
  },
  {
    category: 'Core Concepts',
    title: 'Parameters & Model Size',
    subtitle: "Why '70 billion parameters' matters (and why it doesn't).",
    icon: 'Scale',
    color: '#be185d',
    sections: [
      {
        heading: 'What Are Parameters?',
        content:
          "Parameters are the numbers inside a neural network that get adjusted during training. Think of them as the 'knowledge' encoded in the model—patterns learned from training data.\n\nWhen you see 'GPT-4' or 'Llama 70B,' the number refers to billions of parameters. Explore below to see how parameter count scales:",
        visual: {
          type: 'parameterScale',
          elements: [],
          caption: 'See how parameters scale across model sizes',
        },
      },
      {
        heading: 'Bigger = Better?',
        content: 'More parameters generally means:',
        bullets: [
          'More patterns can be learned',
          'Better performance on complex tasks',
          "More 'knowledge' from training data",
          'BUT: More compute needed to run',
          'BUT: Diminishing returns at scale',
        ],
      },
      {
        heading: "Size Isn't Everything",
        content:
          'A well-trained 7B model can beat a poorly-trained 70B model. What matters:',
        bullets: [
          'Quality of training data',
          'Training techniques used',
          "How well it's fine-tuned for tasks",
          'Architecture innovations',
        ],
      },
      {
        heading: 'Running Large Models',
        content:
          'Each parameter needs memory. A 70B parameter model needs ~140GB of GPU memory at full precision—far more than any consumer graphics card. This is why most people use cloud APIs instead of running models locally.',
        visual: {
          type: 'scale',
          elements: [
            '7B params: ~14GB (high-end consumer GPU)',
            '13B params: ~26GB (workstation GPU)',
            '70B params: ~140GB (multiple professional GPUs)',
          ],
          caption: 'Memory requirements at full precision',
        },
      },
    ],
    keyTakeaway:
      "Parameter count is a rough indicator of capability, but training quality and architecture matter just as much. Bigger isn't always better.",
  },
  {
    category: 'Reality Check',
    title: "What AI Can & Can't Do",
    subtitle: 'Cutting through the hype to understand real capabilities.',
    icon: 'CheckCircle',
    color: '#15803d',
    sections: [
      {
        heading: 'What AI Does Well',
        content: 'Current language models genuinely excel at:',
        bullets: [
          'Writing and editing text in many styles',
          'Explaining concepts at different levels',
          'Translating between languages',
          'Writing and debugging code',
          'Summarizing long documents',
          'Brainstorming and generating ideas',
        ],
      },
      {
        heading: 'What AI Does Poorly',
        content: 'Despite impressive demos, models struggle with:',
        bullets: [
          'Factual accuracy (they hallucinate)',
          'Math and precise calculations',
          'Counting (even letters in words!)',
          'Real-time information (training cutoffs)',
          'Truly novel reasoning',
          'Tasks requiring physical world interaction',
        ],
      },
      {
        heading: 'The Confidence Problem',
        content:
          "AI models sound confident whether they're right or wrong. They don't say 'I don't know' naturally—they generate plausible-sounding text even when they're completely wrong.\n\nSee for yourself — can you tell which AI claims are accurate?",
        visual: {
          type: 'confidenceMeter',
          elements: [],
          caption: "See how AI confidence doesn't equal accuracy",
        },
      },
      {
        heading: 'AI is a Tool',
        content:
          "Think of AI as a powerful autocomplete that's read the internet. It's incredibly useful for drafts, explanations, and creative work—but it needs human oversight for accuracy and judgment.",
      },
    ],
    keyTakeaway:
      "AI is excellent at generating plausible text, but terrible at knowing when it's wrong. Always verify important claims.",
  },
  {
    category: 'Practical Skills',
    title: 'Spotting AI Misinformation',
    subtitle: 'How to evaluate claims about AI capabilities.',
    icon: 'ShieldAlert',
    color: '#b91c1c',
    sections: [
      {
        heading: 'Common Red Flags',
        content: 'Be skeptical when you see claims that:',
        bullets: [
          "Use vague terms like 'understands' or 'thinks'",
          "Claim AI is 'conscious' or has 'feelings'",
          "Promise AI will 'replace all jobs' soon",
          'Suggest AI can do anything humans can',
          'Come from companies selling AI products',
        ],
      },
      {
        heading: 'Questions to Ask',
        content:
          'When evaluating AI claims, consider:',
        bullets: [
          "What's the source? Company marketing vs independent testing?",
          'What were the test conditions? Cherry-picked examples?',
          'Does it work reliably or just sometimes?',
          'What are the failure modes?',
        ],
      },
      {
        heading: 'Benchmark Skepticism',
        content:
          "AI companies love to cite benchmarks showing their model is 'best.' But benchmarks have problems:",
        bullets: [
          'Models may be trained on test data',
          'Benchmarks may not reflect real-world use',
          'Companies cherry-pick favorable benchmarks',
          'Small improvements may not matter in practice',
        ],
      },
      {
        heading: 'Test Your Skills',
        content:
          "Put what you've learned into practice! Can you spot the red flags in these AI claims?",
        visual: {
          type: 'quiz',
          elements: [],
          caption: 'Test your AI misinformation detection skills',
        },
      },
      {
        heading: 'Keep Learning!',
        content:
          "That's what AI Fact Checker is for! Browse model specs with verified information. Check the Myths section for common misconceptions. Use the Fact Check tab to search for answers. And always check our Sources.",
      },
    ],
    keyTakeaway:
      'Healthy skepticism is your best tool. If a claim sounds too good (or too scary) to be true, it probably is. This app is here to help you verify.',
  },
]
