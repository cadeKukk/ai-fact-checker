//
//  Models.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import Foundation
import SwiftUI

// MARK: - AI Company

struct AICompany: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let shortName: String
    let description: String
    let foundedYear: Int
    let headquarters: String
    let website: String
    let logoSystemImage: String
    let accentColor: Color
    let models: [AIModel]
    let sources: [Source]
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: AICompany, rhs: AICompany) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - AI Model

struct AIModel: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let version: String
    let releaseDate: Date
    let description: String
    let specs: ModelSpecs
    let capabilities: [Capability]
    let limitations: [String]
    let myths: [Myth]
    let pricing: Pricing?
    let sources: [Source]
    let isOpenSource: Bool
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: AIModel, rhs: AIModel) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Model Specifications

struct ModelSpecs: Hashable {
    let parameterCount: String? // e.g., "175B", "70B", "Unknown"
    let contextWindow: Int // in tokens
    let trainingDataCutoff: Date?
    let architecture: String
    let inputModalities: [Modality]
    let outputModalities: [Modality]
    let averageLatency: String? // e.g., "~500ms"
    let tokensPerSecond: String? // e.g., "~100 tokens/s"
    let resourceRequirements: String? // For open source models
}

enum Modality: String, CaseIterable, Hashable {
    case text = "Text"
    case image = "Image"
    case audio = "Audio"
    case video = "Video"
    case code = "Code"
    
    var icon: String {
        switch self {
        case .text: return "text.alignleft"
        case .image: return "photo"
        case .audio: return "waveform"
        case .video: return "video"
        case .code: return "chevron.left.forwardslash.chevron.right"
        }
    }
}

// MARK: - Capabilities

struct Capability: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let description: String
    let rating: CapabilityRating // 1-5
    let isVerified: Bool
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Capability, rhs: Capability) -> Bool {
        lhs.id == rhs.id
    }
}

enum CapabilityRating: Int, CaseIterable {
    case poor = 1
    case fair = 2
    case good = 3
    case excellent = 4
    case exceptional = 5
    
    var label: String {
        switch self {
        case .poor: return "Poor"
        case .fair: return "Fair"
        case .good: return "Good"
        case .excellent: return "Excellent"
        case .exceptional: return "Exceptional"
        }
    }
    
    var color: Color {
        switch self {
        case .poor: return .red
        case .fair: return .orange
        case .good: return .yellow
        case .excellent: return .green
        case .exceptional: return .mint
        }
    }
}

// MARK: - Myths

struct Myth: Identifiable, Hashable {
    let id = UUID()
    let claim: String
    let verdict: MythVerdict
    let explanation: String
    let source: Source?
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Myth, rhs: Myth) -> Bool {
        lhs.id == rhs.id
    }
}

enum MythVerdict: String, CaseIterable {
    case confirmed = "Confirmed"
    case busted = "Busted"
    case plausible = "Plausible"
    case misleading = "Misleading"
    case exaggerated = "Exaggerated"
    
    var color: Color {
        switch self {
        case .confirmed: return .green
        case .busted: return .red
        case .plausible: return .yellow
        case .misleading: return .orange
        case .exaggerated: return .purple
        }
    }
    
    var icon: String {
        switch self {
        case .confirmed: return "checkmark.circle.fill"
        case .busted: return "xmark.circle.fill"
        case .plausible: return "questionmark.circle.fill"
        case .misleading: return "exclamationmark.triangle.fill"
        case .exaggerated: return "arrow.up.circle.fill"
        }
    }
}

// MARK: - Pricing

struct Pricing: Hashable {
    let inputPricePerMillionTokens: Double?
    let outputPricePerMillionTokens: Double?
    let freeTierAvailable: Bool
    let notes: String?
}

// MARK: - Sources

struct Source: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let url: String
    let type: SourceType
    let dateAccessed: Date
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Source, rhs: Source) -> Bool {
        lhs.id == rhs.id
    }
}

enum SourceType: String, CaseIterable {
    case officialDocs = "Official Documentation"
    case github = "GitHub"
    case researchPaper = "Research Paper"
    case blogPost = "Blog Post"
    case newsArticle = "News Article"
    case apiReference = "API Reference"
    
    var icon: String {
        switch self {
        case .officialDocs: return "doc.text"
        case .github: return "chevron.left.forwardslash.chevron.right"
        case .researchPaper: return "doc.richtext"
        case .blogPost: return "newspaper"
        case .newsArticle: return "globe"
        case .apiReference: return "curlybraces"
        }
    }
}

// MARK: - Fact Check Question/Answer

struct FactCheckQA: Identifiable {
    let id = UUID()
    let question: String
    let answer: String
    let confidence: ConfidenceLevel
    let relatedModels: [String]
    let sources: [Source]
}

enum ConfidenceLevel: String, CaseIterable {
    case high = "High Confidence"
    case medium = "Medium Confidence"
    case low = "Low Confidence"
    
    var color: Color {
        switch self {
        case .high: return .green
        case .medium: return .yellow
        case .low: return .orange
        }
    }
    
    var icon: String {
        switch self {
        case .high: return "checkmark.shield.fill"
        case .medium: return "shield.fill"
        case .low: return "exclamationmark.shield.fill"
        }
    }
}

// MARK: - Comparison

struct ModelComparison {
    let models: [AIModel]
    let comparisonPoints: [ComparisonPoint]
}

struct ComparisonPoint: Identifiable {
    let id = UUID()
    let category: String
    let values: [String] // One value per model being compared
}
