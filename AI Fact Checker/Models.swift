import Foundation

struct Catalog: Decodable {
  let companies: [AICompany]
  let sources: [Source]
  let facts: [FactCheckQA]
  let terms: [AITerm]
  let lessons: [AILesson]
  let advancedLessons: [AILesson]
  let benchmarks: [Benchmark]
  let playableTermIDs: [String]
  let version: String
  let lastUpdated: String
  let dataSnapshot: String
  var models: [AIModel] { companies.flatMap(\.models) }
  func company(for model: AIModel) -> AICompany? {
    companies.first { $0.models.contains { $0.id == model.id } }
  }
  static func load() throws -> Catalog {
    guard let url = Bundle.main.url(forResource: "catalog", withExtension: "json") else {
      throw CocoaError(.fileNoSuchFile)
    }
    return try JSONDecoder().decode(Catalog.self, from: Data(contentsOf: url))
  }
}
struct AICompany: Decodable, Identifiable, Hashable {
  let id, name, shortName, description: String
  let foundedYear: Int
  let headquarters: String
  let metadataVerified: Bool?
  let website, logoIcon, accentColor: String
  let models: [AIModel]
  let sources: [Source]
}
struct AIModel: Decodable, Identifiable, Hashable {
  let id, name, version, releaseDate: String
  let releaseDateVerified: Bool?
  let verification: Verification?
  let description: String
  let specs: ModelSpecs
  let capabilities: [Capability]
  let limitations: [String]
  let myths: [Myth]
  let pricing: Pricing?
  let sources: [Source]
  let isOpenSource: Bool
  let category: String?
  let legacy: Bool?
  var isLanguage: Bool { category == nil || category == "language" }
  var categoryName: String { Labels.categories[category ?? "language"] ?? "Language Model" }
}
struct Verification: Decodable, Hashable {
  let checkedAt: String
  let notes: [String]
}
struct ModelSpecs: Decodable, Hashable {
  let parameterCount: String?
  let contextWindow: Int
  let trainingDataCutoff: String?
  let architecture: String
  let inputModalities, outputModalities: [String]
  let averageLatency, tokensPerSecond, resourceRequirements: String?
}
struct Capability: Decodable, Identifiable, Hashable {
  let id, name, description, rating: String
  let isVerified: Bool
  let sources: [Source]?
  var ratingValue: Double {
    ["poor": 1, "fair": 2, "good": 3, "excellent": 4, "exceptional": 5][rating] ?? 0
  }
}
struct Myth: Decodable, Identifiable, Hashable {
  let id, claim, verdict, explanation: String
  let source: Source?
}
struct Pricing: Decodable, Hashable {
  let inputPricePerMillionTokens, outputPricePerMillionTokens: Double?
  let freeTierAvailable: Bool
  let notes: String?
}
struct Source: Decodable, Identifiable, Hashable {
  // The web catalog reuses some source IDs for different URLs. URL is the identity.
  var id: String { url }
  let title, url, type, dateAccessed: String
  var typeName: String { Labels.sources[type] ?? type }
}
struct FactCheckQA: Decodable, Identifiable, Hashable {
  let id, question, answer, confidence: String
  let relatedModels: [String]
  let sources: [Source]
  let tags: [String]
  func match(_ query: String) -> Int {
    let words = query.lowercased().components(separatedBy: CharacterSet.alphanumerics.inverted)
      .filter { !$0.isEmpty }
    return words.reduce(0) { score, word in
      score + (question.lowercased().contains(word) ? 3 : 0)
        + (tags.contains { $0.lowercased().contains(word) || word.contains($0.lowercased()) }
          ? 2 : 0) + (answer.lowercased().contains(word) ? 1 : 0)
        + (relatedModels.contains { $0.lowercased().contains(word) } ? 1 : 0)
    }
  }
}
struct AITerm: Decodable, Identifiable, Hashable {
  let id, term, shortDefinition, fullExplanation, category: String
  let relatedTerms: [String]
  let example: String?
}
struct AILesson: Decodable, Hashable {
  let category, title, subtitle, icon, color: String
  let sections: [LessonSection]
  let keyTakeaway: String?
}
struct LessonSection: Decodable, Hashable {
  let heading: String?
  let content: String
  let visual: LessonVisual?
  let bullets: [String]?
  let sources: [Source]?
}
struct LessonVisual: Decodable, Hashable {
  let type: String
  let elements: [String]
  let caption: String?
}
struct Benchmark: Decodable, Identifiable, Hashable {
  let id, name, category, shortDescription, details: String
  let aliases: [String]?
  let metric, source, url: String?
  let releaseYear: Int?
  let excludeFromInlineHighlight: Bool?
}
enum Labels {
  static let categories = [
    "language": "Language Model", "image": "Image Generation", "video": "Video Generation",
    "audio": "Audio & Music", "science": "Scientific AI", "perception": "Computer Vision",
    "product": "AI Product", "harness": "Agent Harness", "runtime": "Local Runtime",
  ]
  static let sources = [
    "officialDocs": "Official Documentation", "github": "GitHub", "researchPaper": "Research Paper",
    "blogPost": "Blog Post", "newsArticle": "News Article", "apiReference": "API Reference",
  ]
  static let termCategories = [
    "fundamentals": "Fundamentals", "architecture": "Architecture", "training": "Training",
    "inference": "Inference", "performance": "Performance", "safety": "Safety & Ethics",
    "practical": "Practical Usage",
  ]
}
