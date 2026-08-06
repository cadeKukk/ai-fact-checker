//
//  AIData.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import Foundation
import SwiftUI

// MARK: - Data Provider

class AIDataProvider {
    static let shared = AIDataProvider()
    
    private init() {}
    
    // MARK: - Helper Date Creation
    
    private func date(_ year: Int, _ month: Int, _ day: Int) -> Date {
        var components = DateComponents()
        components.year = year
        components.month = month
        components.day = day
        return Calendar.current.date(from: components) ?? Date()
    }
    
    // MARK: - All Companies
    
    lazy var companies: [AICompany] = [
        openAI,
        anthropic,
        google,
        meta,
        xAI,
        mistral,
        cohere
    ]
    
    // MARK: - All Models (flattened)
    
    var allModels: [AIModel] {
        companies.flatMap { $0.models }
    }
    
    // MARK: - All Sources (flattened)
    
    var allSources: [Source] {
        var sources: [Source] = []
        for company in companies {
            sources.append(contentsOf: company.sources)
            for model in company.models {
                sources.append(contentsOf: model.sources)
            }
        }
        // Remove duplicates by URL
        var seenURLs = Set<String>()
        return sources.filter { source in
            if seenURLs.contains(source.url) {
                return false
            }
            seenURLs.insert(source.url)
            return true
        }
    }
    
    // MARK: - OpenAI
    
    lazy var openAI: AICompany = {
        let openAISource = Source(
            title: "OpenAI Official Website",
            url: "https://openai.com",
            type: .officialDocs,
            dateAccessed: date(2026, 2, 1)
        )
        
        let gpt4Source = Source(
            title: "GPT-4 Technical Report",
            url: "https://arxiv.org/abs/2303.08774",
            type: .researchPaper,
            dateAccessed: date(2026, 2, 1)
        )
        
        let openAIAPISource = Source(
            title: "OpenAI API Documentation",
            url: "https://platform.openai.com/docs",
            type: .apiReference,
            dateAccessed: date(2026, 2, 1)
        )
        
        return AICompany(
            name: "OpenAI",
            shortName: "OpenAI",
            description: "OpenAI is an AI research laboratory consisting of the for-profit corporation OpenAI LP and its parent company, the non-profit OpenAI Inc. The company conducts research in the field of artificial intelligence with the stated goal of promoting and developing friendly AI.",
            foundedYear: 2015,
            headquarters: "San Francisco, California",
            website: "https://openai.com",
            logoSystemImage: "brain",
            accentColor: Color(red: 0.0, green: 0.65, blue: 0.55),
            models: [
                AIModel(
                    name: "GPT-4o",
                    version: "gpt-4o-2024-11-20",
                    releaseDate: date(2024, 5, 13),
                    description: "GPT-4o is OpenAI's flagship multimodal model that can reason across audio, vision, and text in real time. The 'o' stands for 'omni', referring to its multimodal capabilities.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed",
                        contextWindow: 128000,
                        trainingDataCutoff: date(2023, 10, 1),
                        architecture: "Transformer (Multimodal)",
                        inputModalities: [.text, .image, .audio],
                        outputModalities: [.text, .audio],
                        averageLatency: "~300ms",
                        tokensPerSecond: "~100 tokens/s",
                        resourceRequirements: "API only - not available for local deployment"
                    ),
                    capabilities: [
                        Capability(name: "Text Generation", description: "High-quality text generation for various tasks", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Writing and debugging code across many languages", rating: .exceptional, isVerified: true),
                        Capability(name: "Image Understanding", description: "Analyzing and describing images", rating: .excellent, isVerified: true),
                        Capability(name: "Reasoning", description: "Complex multi-step reasoning", rating: .excellent, isVerified: true),
                        Capability(name: "Multilingual", description: "Understanding and generating text in many languages", rating: .excellent, isVerified: true)
                    ],
                    limitations: [
                        "Cannot access real-time information or browse the internet without tools",
                        "May produce incorrect or fabricated information (hallucinations)",
                        "Cannot learn or remember information between conversations",
                        "Limited ability to perform precise mathematical calculations",
                        "Cannot execute code or interact with external systems directly"
                    ],
                    myths: [
                        Myth(claim: "GPT-4o is sentient or conscious", verdict: .busted, explanation: "GPT-4o is a statistical model that predicts likely text outputs. It has no consciousness, feelings, or self-awareness. Its responses that seem emotional are pattern matching from training data.", source: nil),
                        Myth(claim: "GPT-4o has 1.8 trillion parameters", verdict: .misleading, explanation: "OpenAI has never officially disclosed GPT-4o's parameter count. The 1.8T figure is speculation. The actual architecture and size remain proprietary.", source: gpt4Source),
                        Myth(claim: "GPT-4o can replace software engineers", verdict: .exaggerated, explanation: "While GPT-4o excels at code generation, it cannot replace engineers. It lacks understanding of system architecture, business context, and makes errors that require expert review.", source: nil)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: 2.50, outputPricePerMillionTokens: 10.00, freeTierAvailable: true, notes: "Free tier available through ChatGPT with usage limits"),
                    sources: [gpt4Source, openAIAPISource],
                    isOpenSource: false
                ),
                AIModel(
                    name: "GPT-4 Turbo",
                    version: "gpt-4-turbo-2024-04-09",
                    releaseDate: date(2024, 4, 9),
                    description: "GPT-4 Turbo is an optimized version of GPT-4 with a larger context window and improved instruction following at a lower cost.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed",
                        contextWindow: 128000,
                        trainingDataCutoff: date(2023, 12, 1),
                        architecture: "Transformer",
                        inputModalities: [.text, .image],
                        outputModalities: [.text],
                        averageLatency: "~500ms",
                        tokensPerSecond: "~80 tokens/s",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "Text Generation", description: "High-quality text generation", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Code writing and analysis", rating: .exceptional, isVerified: true),
                        Capability(name: "Long Context", description: "Processing very long documents", rating: .exceptional, isVerified: true),
                        Capability(name: "Reasoning", description: "Complex logical reasoning", rating: .excellent, isVerified: true)
                    ],
                    limitations: [
                        "Higher latency compared to GPT-4o",
                        "No native audio capabilities",
                        "Cannot learn from conversations",
                        "May hallucinate facts"
                    ],
                    myths: [
                        Myth(claim: "GPT-4 Turbo is just GPT-4 made faster", verdict: .misleading, explanation: "GPT-4 Turbo includes significant improvements beyond speed, including a larger context window (128K vs 8K), updated training data, and better instruction following.", source: nil)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: 10.00, outputPricePerMillionTokens: 30.00, freeTierAvailable: false, notes: nil),
                    sources: [openAIAPISource],
                    isOpenSource: false
                ),
                AIModel(
                    name: "o1",
                    version: "o1-2024-12-17",
                    releaseDate: date(2024, 12, 17),
                    description: "o1 is OpenAI's reasoning model designed to spend more time thinking before responding. It excels at complex reasoning tasks like math, science, and coding.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed",
                        contextWindow: 200000,
                        trainingDataCutoff: date(2023, 10, 1),
                        architecture: "Transformer with Chain-of-Thought",
                        inputModalities: [.text, .image],
                        outputModalities: [.text],
                        averageLatency: "10-60 seconds",
                        tokensPerSecond: "Variable (thinking time)",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "Mathematical Reasoning", description: "Complex math problem solving", rating: .exceptional, isVerified: true),
                        Capability(name: "Scientific Reasoning", description: "Physics, chemistry, biology problems", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Complex algorithmic problems", rating: .exceptional, isVerified: true),
                        Capability(name: "Multi-step Reasoning", description: "Breaking down complex problems", rating: .exceptional, isVerified: true)
                    ],
                    limitations: [
                        "Significantly slower than other models (intentional for reasoning)",
                        "More expensive than GPT-4o",
                        "Overkill for simple tasks",
                        "Cannot stream thinking process",
                        "Still can make reasoning errors"
                    ],
                    myths: [
                        Myth(claim: "o1 achieves AGI-level reasoning", verdict: .exaggerated, explanation: "While o1 shows impressive reasoning on benchmarks, it still makes fundamental errors and lacks the generalization capability of human intelligence.", source: nil),
                        Myth(claim: "o1 can solve any math problem", verdict: .busted, explanation: "o1 performs well on competition math but struggles with novel problems outside its training distribution and can still make calculation errors.", source: nil)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: 15.00, outputPricePerMillionTokens: 60.00, freeTierAvailable: false, notes: "Reasoning tokens also charged"),
                    sources: [openAIAPISource],
                    isOpenSource: false
                ),
                AIModel(
                    name: "GPT-3.5 Turbo",
                    version: "gpt-3.5-turbo-0125",
                    releaseDate: date(2024, 1, 25),
                    description: "GPT-3.5 Turbo is a fast, cost-effective model suitable for many tasks. It's the model that originally powered ChatGPT.",
                    specs: ModelSpecs(
                        parameterCount: "~175B (estimated)",
                        contextWindow: 16385,
                        trainingDataCutoff: date(2021, 9, 1),
                        architecture: "Transformer",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "~200ms",
                        tokensPerSecond: "~150 tokens/s",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "Text Generation", description: "General text generation", rating: .good, isVerified: true),
                        Capability(name: "Code Generation", description: "Basic coding tasks", rating: .good, isVerified: true),
                        Capability(name: "Speed", description: "Fast response times", rating: .exceptional, isVerified: true),
                        Capability(name: "Cost Efficiency", description: "Low cost per token", rating: .exceptional, isVerified: true)
                    ],
                    limitations: [
                        "Lower reasoning ability than GPT-4",
                        "More prone to hallucinations",
                        "Older training data cutoff",
                        "No multimodal capabilities"
                    ],
                    myths: [],
                    pricing: Pricing(inputPricePerMillionTokens: 0.50, outputPricePerMillionTokens: 1.50, freeTierAvailable: true, notes: "Very cost-effective for high-volume applications"),
                    sources: [openAIAPISource],
                    isOpenSource: false
                )
            ],
            sources: [openAISource, openAIAPISource, gpt4Source]
        )
    }()
    
    // MARK: - Anthropic
    
    lazy var anthropic: AICompany = {
        let anthropicSource = Source(
            title: "Anthropic Official Website",
            url: "https://anthropic.com",
            type: .officialDocs,
            dateAccessed: date(2026, 2, 1)
        )
        
        let claudeModelCard = Source(
            title: "Claude Model Card",
            url: "https://anthropic.com/claude",
            type: .officialDocs,
            dateAccessed: date(2026, 2, 1)
        )
        
        let anthropicAPISource = Source(
            title: "Anthropic API Documentation",
            url: "https://docs.anthropic.com",
            type: .apiReference,
            dateAccessed: date(2026, 2, 1)
        )
        
        return AICompany(
            name: "Anthropic",
            shortName: "Anthropic",
            description: "Anthropic is an AI safety company founded by former OpenAI researchers. They focus on developing AI systems that are reliable, interpretable, and steerable, with a strong emphasis on AI safety research.",
            foundedYear: 2021,
            headquarters: "San Francisco, California",
            website: "https://anthropic.com",
            logoSystemImage: "shield.checkered",
            accentColor: Color(red: 0.85, green: 0.55, blue: 0.35),
            models: [
                AIModel(
                    name: "Claude 3.5 Sonnet",
                    version: "claude-3-5-sonnet-20241022",
                    releaseDate: date(2024, 10, 22),
                    description: "Claude 3.5 Sonnet is Anthropic's most intelligent model, offering strong performance across coding, analysis, and creative tasks while maintaining their signature safety features.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed",
                        contextWindow: 200000,
                        trainingDataCutoff: date(2024, 4, 1),
                        architecture: "Transformer",
                        inputModalities: [.text, .image],
                        outputModalities: [.text],
                        averageLatency: "~400ms",
                        tokensPerSecond: "~90 tokens/s",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "Code Generation", description: "Excellent at writing and analyzing code", rating: .exceptional, isVerified: true),
                        Capability(name: "Analysis", description: "Deep analysis of complex documents", rating: .exceptional, isVerified: true),
                        Capability(name: "Creative Writing", description: "High-quality creative content", rating: .excellent, isVerified: true),
                        Capability(name: "Instruction Following", description: "Precise adherence to instructions", rating: .exceptional, isVerified: true),
                        Capability(name: "Long Context", description: "Processing very long documents", rating: .exceptional, isVerified: true)
                    ],
                    limitations: [
                        "Cannot access the internet or external tools without integration",
                        "May refuse certain requests due to safety training",
                        "Cannot execute code directly",
                        "No memory between conversations",
                        "May occasionally be overly cautious"
                    ],
                    myths: [
                        Myth(claim: "Claude is more ethical than other AI models", verdict: .plausible, explanation: "Anthropic places strong emphasis on Constitutional AI and safety. However, 'ethics' in AI is about training choices, not inherent morality. Claude follows different guidelines, not necessarily 'better' ones.", source: anthropicSource),
                        Myth(claim: "Claude has a 'soul' or consciousness", verdict: .busted, explanation: "Despite Anthropic's focus on AI safety and Claude's sometimes philosophical responses, it remains a language model with no consciousness, subjective experience, or self-awareness.", source: nil),
                        Myth(claim: "Claude 3.5 Sonnet is the best model for coding", verdict: .plausible, explanation: "Claude 3.5 Sonnet performs exceptionally well on coding benchmarks and is highly regarded by developers. However, 'best' depends on specific use cases and preferences.", source: claudeModelCard)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: 3.00, outputPricePerMillionTokens: 15.00, freeTierAvailable: true, notes: "Free tier available through claude.ai"),
                    sources: [claudeModelCard, anthropicAPISource],
                    isOpenSource: false
                ),
                AIModel(
                    name: "Claude 3.5 Haiku",
                    version: "claude-3-5-haiku-20241022",
                    releaseDate: date(2024, 10, 22),
                    description: "Claude 3.5 Haiku is Anthropic's fastest model, optimized for speed and efficiency while maintaining strong capabilities.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed",
                        contextWindow: 200000,
                        trainingDataCutoff: date(2024, 4, 1),
                        architecture: "Transformer",
                        inputModalities: [.text, .image],
                        outputModalities: [.text],
                        averageLatency: "~150ms",
                        tokensPerSecond: "~150 tokens/s",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "Speed", description: "Very fast response times", rating: .exceptional, isVerified: true),
                        Capability(name: "Cost Efficiency", description: "Low cost per token", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Good coding capabilities", rating: .excellent, isVerified: true),
                        Capability(name: "Text Generation", description: "Quality text output", rating: .excellent, isVerified: true)
                    ],
                    limitations: [
                        "Less capable than Sonnet on complex reasoning",
                        "May make more errors on nuanced tasks",
                        "Still requires API access"
                    ],
                    myths: [],
                    pricing: Pricing(inputPricePerMillionTokens: 0.80, outputPricePerMillionTokens: 4.00, freeTierAvailable: false, notes: "Great for high-volume, cost-sensitive applications"),
                    sources: [anthropicAPISource],
                    isOpenSource: false
                ),
                AIModel(
                    name: "Claude 3 Opus",
                    version: "claude-3-opus-20240229",
                    releaseDate: date(2024, 2, 29),
                    description: "Claude 3 Opus is Anthropic's most powerful model from the Claude 3 family, designed for complex tasks requiring deep analysis.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed",
                        contextWindow: 200000,
                        trainingDataCutoff: date(2023, 8, 1),
                        architecture: "Transformer",
                        inputModalities: [.text, .image],
                        outputModalities: [.text],
                        averageLatency: "~800ms",
                        tokensPerSecond: "~50 tokens/s",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "Complex Reasoning", description: "Deep analytical thinking", rating: .exceptional, isVerified: true),
                        Capability(name: "Research", description: "Comprehensive research tasks", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Complex coding tasks", rating: .excellent, isVerified: true),
                        Capability(name: "Writing", description: "High-quality long-form content", rating: .exceptional, isVerified: true)
                    ],
                    limitations: [
                        "Slower than Sonnet and Haiku",
                        "More expensive",
                        "Being superseded by Claude 3.5 Sonnet for many tasks"
                    ],
                    myths: [],
                    pricing: Pricing(inputPricePerMillionTokens: 15.00, outputPricePerMillionTokens: 75.00, freeTierAvailable: false, notes: "Premium pricing for most complex tasks"),
                    sources: [anthropicAPISource, claudeModelCard],
                    isOpenSource: false
                )
            ],
            sources: [anthropicSource, claudeModelCard, anthropicAPISource]
        )
    }()
    
    // MARK: - Google
    
    lazy var google: AICompany = {
        let googleAISource = Source(
            title: "Google AI Official Website",
            url: "https://ai.google",
            type: .officialDocs,
            dateAccessed: date(2026, 2, 1)
        )
        
        let geminiSource = Source(
            title: "Gemini Documentation",
            url: "https://ai.google.dev/docs",
            type: .apiReference,
            dateAccessed: date(2026, 2, 1)
        )
        
        let notebookLMSource = Source(
            title: "NotebookLM",
            url: "https://notebooklm.google.com",
            type: .officialDocs,
            dateAccessed: date(2026, 2, 1)
        )
        
        return AICompany(
            name: "Google DeepMind",
            shortName: "Google",
            description: "Google DeepMind is an AI research laboratory that develops the Gemini family of models. Formed from the merger of Google Brain and DeepMind, it's one of the largest AI research organizations in the world.",
            foundedYear: 2023,
            headquarters: "Mountain View, California / London, UK",
            website: "https://deepmind.google",
            logoSystemImage: "sparkles",
            accentColor: Color(red: 0.26, green: 0.52, blue: 0.96),
            models: [
                AIModel(
                    name: "Gemini 2.0 Flash",
                    version: "gemini-2.0-flash",
                    releaseDate: date(2024, 12, 11),
                    description: "Gemini 2.0 Flash is Google's latest multimodal model with native image and audio output, optimized for speed and agentic capabilities.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed",
                        contextWindow: 1000000,
                        trainingDataCutoff: date(2024, 6, 1),
                        architecture: "Multimodal Transformer",
                        inputModalities: [.text, .image, .audio, .video],
                        outputModalities: [.text, .image, .audio],
                        averageLatency: "~200ms",
                        tokensPerSecond: "~120 tokens/s",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "Multimodal", description: "Native image, audio, video understanding", rating: .exceptional, isVerified: true),
                        Capability(name: "Long Context", description: "1 million token context window", rating: .exceptional, isVerified: true),
                        Capability(name: "Speed", description: "Fast inference times", rating: .exceptional, isVerified: true),
                        Capability(name: "Agentic Tasks", description: "Tool use and function calling", rating: .excellent, isVerified: true)
                    ],
                    limitations: [
                        "Some features still in preview",
                        "Image generation quality varies",
                        "May have regional availability restrictions"
                    ],
                    myths: [
                        Myth(claim: "Gemini can process unlimited context", verdict: .exaggerated, explanation: "While 1M tokens is impressive, there are still practical limits and quality degrades with extremely long contexts. Processing such lengths also has cost implications.", source: nil)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: 0.10, outputPricePerMillionTokens: 0.40, freeTierAvailable: true, notes: "Very competitive pricing, free tier in AI Studio"),
                    sources: [geminiSource],
                    isOpenSource: false
                ),
                AIModel(
                    name: "Gemini 1.5 Pro",
                    version: "gemini-1.5-pro",
                    releaseDate: date(2024, 2, 15),
                    description: "Gemini 1.5 Pro is Google's flagship production model with exceptional long-context capabilities and strong multimodal performance.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed (Mixture of Experts)",
                        contextWindow: 2000000,
                        trainingDataCutoff: date(2024, 1, 1),
                        architecture: "Multimodal Transformer (MoE)",
                        inputModalities: [.text, .image, .audio, .video],
                        outputModalities: [.text],
                        averageLatency: "~500ms",
                        tokensPerSecond: "~80 tokens/s",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "Long Context", description: "Up to 2M token context", rating: .exceptional, isVerified: true),
                        Capability(name: "Video Understanding", description: "Process and analyze videos", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Strong coding capabilities", rating: .excellent, isVerified: true),
                        Capability(name: "Reasoning", description: "Complex analytical tasks", rating: .excellent, isVerified: true)
                    ],
                    limitations: [
                        "2M context has higher costs",
                        "Video processing can be slow",
                        "Some latency on complex queries"
                    ],
                    myths: [
                        Myth(claim: "Gemini 1.5 Pro uses 1 trillion parameters", verdict: .misleading, explanation: "Google hasn't disclosed exact parameter counts. The MoE architecture means only a subset of parameters are active for each query, making raw parameter counts misleading.", source: nil)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: 1.25, outputPricePerMillionTokens: 5.00, freeTierAvailable: true, notes: "Pricing varies by context length used"),
                    sources: [geminiSource, googleAISource],
                    isOpenSource: false
                ),
                AIModel(
                    name: "NotebookLM",
                    version: "NotebookLM Plus",
                    releaseDate: date(2024, 12, 1),
                    description: "NotebookLM is Google's AI-powered research assistant that grounds responses in user-provided sources. It's designed to help users understand and synthesize information from uploaded documents.",
                    specs: ModelSpecs(
                        parameterCount: "Based on Gemini (Undisclosed)",
                        contextWindow: 500000,
                        trainingDataCutoff: nil,
                        architecture: "Gemini-based with RAG",
                        inputModalities: [.text, .audio],
                        outputModalities: [.text, .audio],
                        averageLatency: "~1-2s",
                        tokensPerSecond: "~60 tokens/s",
                        resourceRequirements: "Web application"
                    ),
                    capabilities: [
                        Capability(name: "Source Grounding", description: "Answers grounded in uploaded documents", rating: .exceptional, isVerified: true),
                        Capability(name: "Audio Overviews", description: "Generate podcast-style summaries", rating: .excellent, isVerified: true),
                        Capability(name: "Research Synthesis", description: "Combine information from multiple sources", rating: .excellent, isVerified: true),
                        Capability(name: "Citation", description: "Provides citations for claims", rating: .exceptional, isVerified: true)
                    ],
                    limitations: [
                        "Only works with uploaded content (by design)",
                        "Cannot access external websites",
                        "Limited to supported file formats",
                        "Audio overview voices are AI-generated"
                    ],
                    myths: [
                        Myth(claim: "NotebookLM podcasts are real people", verdict: .busted, explanation: "The Audio Overview feature generates AI voices that sound remarkably human, but they are entirely synthetic. There are no real podcast hosts.", source: notebookLMSource),
                        Myth(claim: "NotebookLM can access the internet", verdict: .busted, explanation: "NotebookLM is intentionally designed to ONLY use sources you provide. It cannot search the web or access external information.", source: notebookLMSource)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: nil, outputPricePerMillionTokens: nil, freeTierAvailable: true, notes: "Free tier available; Plus tier for business features"),
                    sources: [notebookLMSource],
                    isOpenSource: false
                )
            ],
            sources: [googleAISource, geminiSource, notebookLMSource]
        )
    }()
    
    // MARK: - Meta
    
    lazy var meta: AICompany = {
        let metaAISource = Source(
            title: "Meta AI",
            url: "https://ai.meta.com",
            type: .officialDocs,
            dateAccessed: date(2026, 2, 1)
        )
        
        let llamaGithub = Source(
            title: "Llama GitHub Repository",
            url: "https://github.com/meta-llama/llama",
            type: .github,
            dateAccessed: date(2026, 2, 1)
        )
        
        let llamaPaper = Source(
            title: "Llama 3 Research Paper",
            url: "https://arxiv.org/abs/2407.21783",
            type: .researchPaper,
            dateAccessed: date(2026, 2, 1)
        )
        
        return AICompany(
            name: "Meta AI",
            shortName: "Meta",
            description: "Meta AI is Meta's artificial intelligence research division. They are notable for releasing the Llama family of models as open-weight models, significantly advancing open-source AI development.",
            foundedYear: 2013,
            headquarters: "Menlo Park, California",
            website: "https://ai.meta.com",
            logoSystemImage: "infinity",
            accentColor: Color(red: 0.0, green: 0.47, blue: 1.0),
            models: [
                AIModel(
                    name: "Llama 3.3 70B",
                    version: "Llama-3.3-70B-Instruct",
                    releaseDate: date(2024, 12, 6),
                    description: "Llama 3.3 70B is Meta's latest open-weight model, offering performance comparable to Llama 3.1 405B but at a fraction of the cost and compute requirements.",
                    specs: ModelSpecs(
                        parameterCount: "70B",
                        contextWindow: 128000,
                        trainingDataCutoff: date(2023, 12, 1),
                        architecture: "Transformer (Decoder-only)",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "Varies by deployment",
                        tokensPerSecond: "~30-50 tokens/s (local)",
                        resourceRequirements: "Minimum 140GB VRAM for full precision, ~40GB with quantization"
                    ),
                    capabilities: [
                        Capability(name: "Open Source", description: "Fully open weights for local deployment", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Strong coding capabilities", rating: .excellent, isVerified: true),
                        Capability(name: "Reasoning", description: "Complex analytical tasks", rating: .excellent, isVerified: true),
                        Capability(name: "Multilingual", description: "Support for many languages", rating: .good, isVerified: true)
                    ],
                    limitations: [
                        "Requires significant hardware for local deployment",
                        "Text-only (no multimodal capabilities)",
                        "May require fine-tuning for specific use cases",
                        "Smaller context window than some competitors"
                    ],
                    myths: [
                        Myth(claim: "Llama models are completely free to use commercially", verdict: .plausible, explanation: "Llama models are free for most commercial uses under Meta's license. However, companies with >700M monthly users need a special license.", source: llamaGithub),
                        Myth(claim: "Llama 3.3 70B matches GPT-4 in all tasks", verdict: .exaggerated, explanation: "While Llama 3.3 70B performs impressively on benchmarks, it doesn't match GPT-4/Claude 3.5 on all tasks, particularly complex reasoning and instruction following.", source: llamaPaper)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: nil, outputPricePerMillionTokens: nil, freeTierAvailable: true, notes: "Free to download and run locally. Various API providers offer hosted versions at different prices."),
                    sources: [llamaGithub, llamaPaper],
                    isOpenSource: true
                ),
                AIModel(
                    name: "Llama 3.1 405B",
                    version: "Llama-3.1-405B-Instruct",
                    releaseDate: date(2024, 7, 23),
                    description: "Llama 3.1 405B is Meta's largest open model, designed to compete with frontier closed models while being fully open-weight.",
                    specs: ModelSpecs(
                        parameterCount: "405B",
                        contextWindow: 128000,
                        trainingDataCutoff: date(2023, 12, 1),
                        architecture: "Transformer (Decoder-only)",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "Varies significantly",
                        tokensPerSecond: "~10-20 tokens/s (optimized)",
                        resourceRequirements: "Requires 800GB+ VRAM or distributed inference across multiple GPUs"
                    ),
                    capabilities: [
                        Capability(name: "Complex Reasoning", description: "High-level analytical tasks", rating: .excellent, isVerified: true),
                        Capability(name: "Code Generation", description: "Strong coding across languages", rating: .excellent, isVerified: true),
                        Capability(name: "Open Source", description: "Full weights available", rating: .exceptional, isVerified: true),
                        Capability(name: "Research", description: "Suitable for AI research", rating: .exceptional, isVerified: true)
                    ],
                    limitations: [
                        "Extremely resource-intensive",
                        "Impractical for most local deployments",
                        "Text-only",
                        "Slower inference than smaller models"
                    ],
                    myths: [
                        Myth(claim: "405B is too large to run locally", verdict: .confirmed, explanation: "For most users, this is true. Running 405B requires specialized hardware costing tens of thousands of dollars or distributed computing infrastructure.", source: llamaGithub)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: nil, outputPricePerMillionTokens: nil, freeTierAvailable: true, notes: "Free weights, but hosting costs are significant"),
                    sources: [llamaGithub, llamaPaper, metaAISource],
                    isOpenSource: true
                ),
                AIModel(
                    name: "Llama 3.2 Vision",
                    version: "Llama-3.2-90B-Vision-Instruct",
                    releaseDate: date(2024, 9, 25),
                    description: "Llama 3.2 Vision brings multimodal capabilities to the open Llama family, enabling image understanding alongside text.",
                    specs: ModelSpecs(
                        parameterCount: "90B",
                        contextWindow: 128000,
                        trainingDataCutoff: date(2023, 12, 1),
                        architecture: "Multimodal Transformer",
                        inputModalities: [.text, .image],
                        outputModalities: [.text],
                        averageLatency: "Varies by deployment",
                        tokensPerSecond: "~20-40 tokens/s",
                        resourceRequirements: "~180GB VRAM full precision"
                    ),
                    capabilities: [
                        Capability(name: "Image Understanding", description: "Analyze and describe images", rating: .good, isVerified: true),
                        Capability(name: "Visual Q&A", description: "Answer questions about images", rating: .good, isVerified: true),
                        Capability(name: "Open Source", description: "Open weights for vision models", rating: .exceptional, isVerified: true)
                    ],
                    limitations: [
                        "Vision capabilities not as strong as GPT-4V or Claude",
                        "Resource intensive",
                        "Some edge cases in image interpretation"
                    ],
                    myths: [],
                    pricing: Pricing(inputPricePerMillionTokens: nil, outputPricePerMillionTokens: nil, freeTierAvailable: true, notes: "Free open weights"),
                    sources: [llamaGithub, metaAISource],
                    isOpenSource: true
                )
            ],
            sources: [metaAISource, llamaGithub, llamaPaper]
        )
    }()
    
    // MARK: - xAI (Grok)
    
    lazy var xAI: AICompany = {
        let xAISource = Source(
            title: "xAI Official Website",
            url: "https://x.ai",
            type: .officialDocs,
            dateAccessed: date(2026, 2, 1)
        )
        
        let grokGithub = Source(
            title: "Grok-1 GitHub",
            url: "https://github.com/xai-org/grok-1",
            type: .github,
            dateAccessed: date(2026, 2, 1)
        )
        
        return AICompany(
            name: "xAI",
            shortName: "xAI",
            description: "xAI is an AI company founded by Elon Musk with the mission to understand the true nature of the universe. They develop the Grok family of models, which are integrated into the X (formerly Twitter) platform.",
            foundedYear: 2023,
            headquarters: "San Francisco Bay Area",
            website: "https://x.ai",
            logoSystemImage: "x.circle",
            accentColor: Color(red: 0.1, green: 0.1, blue: 0.1),
            models: [
                AIModel(
                    name: "Grok-2",
                    version: "grok-2-1212",
                    releaseDate: date(2024, 8, 13),
                    description: "Grok-2 is xAI's flagship model with strong reasoning and coding capabilities. It's known for its integration with X and real-time information access.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed",
                        contextWindow: 131072,
                        trainingDataCutoff: nil,
                        architecture: "Transformer",
                        inputModalities: [.text, .image],
                        outputModalities: [.text],
                        averageLatency: "~400ms",
                        tokensPerSecond: "~80 tokens/s",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "Real-time Information", description: "Access to X posts and news", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Strong coding capabilities", rating: .excellent, isVerified: true),
                        Capability(name: "Reasoning", description: "Complex analytical tasks", rating: .excellent, isVerified: true),
                        Capability(name: "Image Understanding", description: "Analyze images", rating: .good, isVerified: true)
                    ],
                    limitations: [
                        "Primarily available through X Premium subscription",
                        "Real-time info can include misinformation from X",
                        "Less safety filtering than some competitors",
                        "API access is limited"
                    ],
                    myths: [
                        Myth(claim: "Grok has no content restrictions", verdict: .exaggerated, explanation: "While Grok has fewer restrictions than some models and a 'fun mode', it still has safety measures. It's not completely unrestricted.", source: nil),
                        Myth(claim: "Grok has real-time access to all internet", verdict: .misleading, explanation: "Grok has real-time access to X (Twitter) data and some web search, but not unrestricted access to 'all' internet information.", source: xAISource)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: 2.00, outputPricePerMillionTokens: 10.00, freeTierAvailable: false, notes: "Available through X Premium+ subscription or API"),
                    sources: [xAISource],
                    isOpenSource: false
                ),
                AIModel(
                    name: "Grok-1",
                    version: "grok-1",
                    releaseDate: date(2024, 3, 17),
                    description: "Grok-1 is xAI's first model, released as open weights. It's a 314B parameter mixture-of-experts model.",
                    specs: ModelSpecs(
                        parameterCount: "314B (MoE, 25% active)",
                        contextWindow: 8192,
                        trainingDataCutoff: date(2023, 10, 1),
                        architecture: "Mixture of Experts Transformer",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "Varies",
                        tokensPerSecond: "~30 tokens/s",
                        resourceRequirements: "~600GB+ for full model"
                    ),
                    capabilities: [
                        Capability(name: "Open Source", description: "Full weights released", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Decent coding abilities", rating: .good, isVerified: true),
                        Capability(name: "Reasoning", description: "Basic reasoning", rating: .good, isVerified: true)
                    ],
                    limitations: [
                        "Superseded by Grok-2",
                        "Smaller context window",
                        "Requires massive compute for local inference",
                        "No multimodal capabilities"
                    ],
                    myths: [],
                    pricing: Pricing(inputPricePerMillionTokens: nil, outputPricePerMillionTokens: nil, freeTierAvailable: true, notes: "Free open weights, but hosting is expensive"),
                    sources: [grokGithub, xAISource],
                    isOpenSource: true
                )
            ],
            sources: [xAISource, grokGithub]
        )
    }()
    
    // MARK: - Mistral
    
    lazy var mistral: AICompany = {
        let mistralSource = Source(
            title: "Mistral AI Official Website",
            url: "https://mistral.ai",
            type: .officialDocs,
            dateAccessed: date(2026, 2, 1)
        )
        
        let mistralGithub = Source(
            title: "Mistral GitHub",
            url: "https://github.com/mistralai",
            type: .github,
            dateAccessed: date(2026, 2, 1)
        )
        
        let mistralDocs = Source(
            title: "Mistral Documentation",
            url: "https://docs.mistral.ai",
            type: .apiReference,
            dateAccessed: date(2026, 2, 1)
        )
        
        return AICompany(
            name: "Mistral AI",
            shortName: "Mistral",
            description: "Mistral AI is a French AI company founded by former DeepMind and Meta researchers. They focus on creating efficient, high-performance open-source models and have quickly become a leader in the European AI landscape.",
            foundedYear: 2023,
            headquarters: "Paris, France",
            website: "https://mistral.ai",
            logoSystemImage: "wind",
            accentColor: Color(red: 1.0, green: 0.4, blue: 0.0),
            models: [
                AIModel(
                    name: "Mistral Large 2",
                    version: "mistral-large-2411",
                    releaseDate: date(2024, 11, 18),
                    description: "Mistral Large 2 is Mistral's most capable model, designed to compete with frontier models while maintaining efficiency.",
                    specs: ModelSpecs(
                        parameterCount: "123B",
                        contextWindow: 128000,
                        trainingDataCutoff: date(2024, 6, 1),
                        architecture: "Transformer",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "~400ms",
                        tokensPerSecond: "~70 tokens/s",
                        resourceRequirements: "API or ~250GB VRAM"
                    ),
                    capabilities: [
                        Capability(name: "Code Generation", description: "Excellent coding capabilities", rating: .excellent, isVerified: true),
                        Capability(name: "Reasoning", description: "Strong analytical abilities", rating: .excellent, isVerified: true),
                        Capability(name: "Multilingual", description: "Strong in European languages", rating: .exceptional, isVerified: true),
                        Capability(name: "Function Calling", description: "Native tool use support", rating: .excellent, isVerified: true)
                    ],
                    limitations: [
                        "Large resource requirements for self-hosting",
                        "Text-only (no multimodal)",
                        "Less widely deployed than OpenAI/Anthropic"
                    ],
                    myths: [],
                    pricing: Pricing(inputPricePerMillionTokens: 2.00, outputPricePerMillionTokens: 6.00, freeTierAvailable: false, notes: "Competitive pricing for frontier capabilities"),
                    sources: [mistralDocs],
                    isOpenSource: false
                ),
                AIModel(
                    name: "Mixtral 8x22B",
                    version: "open-mixtral-8x22b",
                    releaseDate: date(2024, 4, 17),
                    description: "Mixtral 8x22B is a large mixture-of-experts model that combines efficiency with strong performance, available as open weights.",
                    specs: ModelSpecs(
                        parameterCount: "176B total (44B active)",
                        contextWindow: 65536,
                        trainingDataCutoff: date(2024, 1, 1),
                        architecture: "Mixture of Experts",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "~300ms",
                        tokensPerSecond: "~80 tokens/s",
                        resourceRequirements: "~90GB VRAM for full model"
                    ),
                    capabilities: [
                        Capability(name: "Open Source", description: "Apache 2.0 licensed", rating: .exceptional, isVerified: true),
                        Capability(name: "Efficiency", description: "Good performance per compute", rating: .excellent, isVerified: true),
                        Capability(name: "Code Generation", description: "Strong coding abilities", rating: .excellent, isVerified: true),
                        Capability(name: "Math", description: "Good mathematical reasoning", rating: .good, isVerified: true)
                    ],
                    limitations: [
                        "Still requires significant GPU resources",
                        "Text-only",
                        "MoE can have inconsistent latency"
                    ],
                    myths: [
                        Myth(claim: "Mixtral only uses 44B parameters so it's as fast as a 44B model", verdict: .misleading, explanation: "While only ~44B parameters are active per forward pass, the full model still needs to be loaded into memory, and routing adds overhead.", source: mistralGithub)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: 2.00, outputPricePerMillionTokens: 6.00, freeTierAvailable: true, notes: "Free to run locally, API available"),
                    sources: [mistralGithub, mistralDocs],
                    isOpenSource: true
                ),
                AIModel(
                    name: "Mistral 7B",
                    version: "open-mistral-7b",
                    releaseDate: date(2023, 9, 27),
                    description: "Mistral 7B is a highly efficient small model that punches above its weight class, demonstrating that smaller models can be very capable.",
                    specs: ModelSpecs(
                        parameterCount: "7B",
                        contextWindow: 32768,
                        trainingDataCutoff: date(2023, 9, 1),
                        architecture: "Transformer with Sliding Window Attention",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "~100ms",
                        tokensPerSecond: "~150 tokens/s",
                        resourceRequirements: "~14GB VRAM (full precision), ~4GB quantized"
                    ),
                    capabilities: [
                        Capability(name: "Efficiency", description: "Runs on consumer hardware", rating: .exceptional, isVerified: true),
                        Capability(name: "Speed", description: "Very fast inference", rating: .exceptional, isVerified: true),
                        Capability(name: "Open Source", description: "Apache 2.0 licensed", rating: .exceptional, isVerified: true),
                        Capability(name: "Code Generation", description: "Decent for a 7B model", rating: .good, isVerified: true)
                    ],
                    limitations: [
                        "Limited complex reasoning compared to larger models",
                        "More prone to hallucinations",
                        "Text-only"
                    ],
                    myths: [
                        Myth(claim: "Mistral 7B beats GPT-3.5", verdict: .plausible, explanation: "On certain benchmarks, Mistral 7B does outperform GPT-3.5. However, overall capability comparisons depend heavily on the specific task.", source: mistralSource)
                    ],
                    pricing: Pricing(inputPricePerMillionTokens: 0.25, outputPricePerMillionTokens: 0.25, freeTierAvailable: true, notes: "Can run on consumer GPUs or even CPUs"),
                    sources: [mistralGithub, mistralSource],
                    isOpenSource: true
                )
            ],
            sources: [mistralSource, mistralGithub, mistralDocs]
        )
    }()
    
    // MARK: - Cohere
    
    lazy var cohere: AICompany = {
        let cohereSource = Source(
            title: "Cohere Official Website",
            url: "https://cohere.com",
            type: .officialDocs,
            dateAccessed: date(2026, 2, 1)
        )
        
        let cohereDocs = Source(
            title: "Cohere Documentation",
            url: "https://docs.cohere.com",
            type: .apiReference,
            dateAccessed: date(2026, 2, 1)
        )
        
        return AICompany(
            name: "Cohere",
            shortName: "Cohere",
            description: "Cohere is an enterprise AI company focused on large language models for business applications. They specialize in retrieval-augmented generation (RAG) and enterprise search solutions.",
            foundedYear: 2019,
            headquarters: "Toronto, Canada",
            website: "https://cohere.com",
            logoSystemImage: "link.circle",
            accentColor: Color(red: 0.4, green: 0.2, blue: 0.6),
            models: [
                AIModel(
                    name: "Command R+",
                    version: "command-r-plus",
                    releaseDate: date(2024, 4, 4),
                    description: "Command R+ is Cohere's most capable model, optimized for enterprise workloads including RAG, multi-step tool use, and complex workflows.",
                    specs: ModelSpecs(
                        parameterCount: "104B",
                        contextWindow: 128000,
                        trainingDataCutoff: date(2024, 3, 1),
                        architecture: "Transformer",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "~500ms",
                        tokensPerSecond: "~60 tokens/s",
                        resourceRequirements: "API only"
                    ),
                    capabilities: [
                        Capability(name: "RAG", description: "Excellent retrieval-augmented generation", rating: .exceptional, isVerified: true),
                        Capability(name: "Enterprise Search", description: "Optimized for business documents", rating: .exceptional, isVerified: true),
                        Capability(name: "Tool Use", description: "Strong function calling", rating: .excellent, isVerified: true),
                        Capability(name: "Multilingual", description: "10+ language support", rating: .excellent, isVerified: true)
                    ],
                    limitations: [
                        "Less well-known than OpenAI/Anthropic",
                        "Text-only",
                        "Primarily enterprise-focused"
                    ],
                    myths: [],
                    pricing: Pricing(inputPricePerMillionTokens: 2.50, outputPricePerMillionTokens: 10.00, freeTierAvailable: true, notes: "Enterprise pricing available"),
                    sources: [cohereDocs],
                    isOpenSource: false
                ),
                AIModel(
                    name: "Command R",
                    version: "command-r",
                    releaseDate: date(2024, 3, 11),
                    description: "Command R is a scalable, efficient model optimized for RAG and tool use, available both via API and as open weights.",
                    specs: ModelSpecs(
                        parameterCount: "35B",
                        contextWindow: 128000,
                        trainingDataCutoff: date(2024, 1, 1),
                        architecture: "Transformer",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "~200ms",
                        tokensPerSecond: "~100 tokens/s",
                        resourceRequirements: "~70GB VRAM or API"
                    ),
                    capabilities: [
                        Capability(name: "RAG", description: "Optimized for retrieval tasks", rating: .excellent, isVerified: true),
                        Capability(name: "Efficiency", description: "Good performance-to-size ratio", rating: .excellent, isVerified: true),
                        Capability(name: "Open Weights", description: "Can be self-hosted", rating: .excellent, isVerified: true),
                        Capability(name: "Tool Use", description: "Native function calling", rating: .good, isVerified: true)
                    ],
                    limitations: [
                        "Less capable than Command R+ on complex tasks",
                        "Text-only"
                    ],
                    myths: [],
                    pricing: Pricing(inputPricePerMillionTokens: 0.15, outputPricePerMillionTokens: 0.60, freeTierAvailable: true, notes: "Very cost-effective, open weights available"),
                    sources: [cohereDocs, cohereSource],
                    isOpenSource: true
                ),
                AIModel(
                    name: "Embed v3",
                    version: "embed-english-v3.0",
                    releaseDate: date(2023, 11, 2),
                    description: "Embed v3 is Cohere's state-of-the-art embedding model for semantic search and retrieval applications.",
                    specs: ModelSpecs(
                        parameterCount: "Undisclosed",
                        contextWindow: 512,
                        trainingDataCutoff: date(2023, 10, 1),
                        architecture: "Embedding Model",
                        inputModalities: [.text],
                        outputModalities: [.text],
                        averageLatency: "~50ms",
                        tokensPerSecond: "N/A (embedding)",
                        resourceRequirements: "API or lightweight local"
                    ),
                    capabilities: [
                        Capability(name: "Semantic Search", description: "High-quality embeddings for search", rating: .exceptional, isVerified: true),
                        Capability(name: "Clustering", description: "Document clustering and organization", rating: .excellent, isVerified: true),
                        Capability(name: "Speed", description: "Very fast inference", rating: .exceptional, isVerified: true)
                    ],
                    limitations: [
                        "Not a generative model",
                        "Limited context per embedding",
                        "Requires chunking for long documents"
                    ],
                    myths: [],
                    pricing: Pricing(inputPricePerMillionTokens: 0.10, outputPricePerMillionTokens: nil, freeTierAvailable: true, notes: "Very affordable for high-volume embedding"),
                    sources: [cohereDocs],
                    isOpenSource: false
                )
            ],
            sources: [cohereSource, cohereDocs]
        )
    }()
    
    // MARK: - Fact Check Q&A Database
    
    lazy var factCheckQAs: [FactCheckQA] = [
        FactCheckQA(
            question: "Can AI models actually think or understand?",
            answer: "No. Current AI language models, including GPT-4, Claude, and Gemini, do not 'think' or 'understand' in any human sense. They are sophisticated pattern matching systems that predict likely outputs based on statistical patterns learned from training data. They have no consciousness, subjective experience, or genuine comprehension. When a model appears to 'reason,' it's applying patterns from similar examples in its training, not engaging in genuine cognition.",
            confidence: .high,
            relatedModels: ["GPT-4o", "Claude 3.5 Sonnet", "Gemini 2.0 Flash"],
            sources: []
        ),
        FactCheckQA(
            question: "Can AI replace programmers?",
            answer: "No, AI cannot replace programmers. While AI coding assistants are powerful productivity tools, they lack understanding of business requirements, system architecture, and long-term maintenance considerations. AI-generated code often contains subtle bugs, security vulnerabilities, and may not follow best practices. Professional programmers are needed to architect systems, review AI output, handle edge cases, and make judgment calls about tradeoffs. AI changes the nature of programming work but doesn't eliminate the need for skilled developers.",
            confidence: .high,
            relatedModels: ["GPT-4o", "Claude 3.5 Sonnet"],
            sources: []
        ),
        FactCheckQA(
            question: "Do AI models learn from my conversations?",
            answer: "Generally no, not in real-time. Most commercial AI models (ChatGPT, Claude, etc.) do not learn or update their weights from individual conversations. Each conversation starts fresh with no memory of previous sessions. However, companies may use anonymized conversation data to train future model versions, subject to their privacy policies. Some systems offer 'memory' features that store conversation summaries, but this is different from the model actually learning.",
            confidence: .high,
            relatedModels: ["GPT-4o", "Claude 3.5 Sonnet", "Gemini 2.0 Flash"],
            sources: []
        ),
        FactCheckQA(
            question: "Is bigger always better for AI models?",
            answer: "Not necessarily. While larger models often perform better on benchmarks, the relationship isn't linear. Smaller, well-trained models can outperform larger ones on specific tasks. Mistral 7B, for example, rivals much larger models on certain benchmarks. Additionally, larger models have higher latency, costs, and environmental impact. The trend is toward more efficient architectures (like Mixture of Experts) and better training data rather than just scaling parameters.",
            confidence: .high,
            relatedModels: ["Mistral 7B", "Llama 3.3 70B", "Mixtral 8x22B"],
            sources: []
        ),
        FactCheckQA(
            question: "Can AI models access the internet?",
            answer: "Base AI models cannot inherently access the internet. They only have knowledge from their training data, which has a cutoff date. However, some AI systems integrate web search tools (like ChatGPT with browsing, Grok with X data) that allow them to fetch current information. It's important to distinguish between the model's built-in knowledge and information retrieved through tools. Even with search, AI can misinterpret or misrepresent retrieved information.",
            confidence: .high,
            relatedModels: ["Grok-2", "GPT-4o"],
            sources: []
        ),
        FactCheckQA(
            question: "Are open-source AI models as good as proprietary ones?",
            answer: "The gap is closing rapidly. Models like Llama 3.3 70B and Mixtral 8x22B approach the capabilities of proprietary models for many tasks. However, frontier proprietary models (GPT-4, Claude 3.5 Sonnet) still generally lead on complex reasoning, instruction following, and safety. Open models offer advantages in customization, privacy, and cost for high-volume applications. The 'best' choice depends on specific use cases, budget, and deployment requirements.",
            confidence: .high,
            relatedModels: ["Llama 3.3 70B", "Mixtral 8x22B", "GPT-4o", "Claude 3.5 Sonnet"],
            sources: []
        ),
        FactCheckQA(
            question: "Will AI become sentient or conscious?",
            answer: "There is no scientific evidence that current AI systems are sentient or conscious, and no clear path to achieving this. Current systems are mathematical functions that process inputs and produce outputs without any inner experience. Claims of AI sentience (like the 2022 Google engineer incident) have been thoroughly debunked. While we can't definitively prove machines will never be conscious, there's no reason to believe current architectures can achieve this.",
            confidence: .high,
            relatedModels: ["GPT-4o", "Claude 3.5 Sonnet"],
            sources: []
        ),
        FactCheckQA(
            question: "How accurate are AI benchmarks?",
            answer: "AI benchmarks have significant limitations. Models may be trained on benchmark test sets (data contamination), inflating scores. Benchmarks often test narrow capabilities that don't reflect real-world performance. Companies cherry-pick favorable benchmarks. Additionally, benchmark performance doesn't capture important qualities like reliability, safety, and instruction following. Treat benchmarks as rough indicators, not definitive measures of capability.",
            confidence: .high,
            relatedModels: [],
            sources: []
        )
    ]
}
