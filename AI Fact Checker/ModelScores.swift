import Foundation

struct ModelScores {
  let values: [Double?]
  var overall: Double {
    let weights = [0.4, 0.15, 0.15, 0.2, 0.1]
    var total = 0.0
    var weight = 0.0
    for (index, value) in values.enumerated() {
      if let value {
        total += value * weights[index]
        weight += weights[index]
      }
    }
    return weight > 0 ? total / weight : 0
  }
  init(_ model: AIModel) {
    func clamp(_ n: Double) -> Double { min(max(n, 0), 100) }
    let ratings = model.capabilities.map(\.ratingValue)
    let quality = ratings.isEmpty ? 0 : ratings.reduce(0, +) / Double(ratings.count) / 5 * 100
    let speed = Self.parseSpeed(model.specs.tokensPerSecond).map {
      clamp((log10(max($0, 0.1)) - log10(5)) / (log10(250) - log10(5)) * 100)
    }
    let context =
      model.specs.contextWindow > 0
      ? clamp(
        (log10(Double(model.specs.contextWindow)) - log10(8000)) / (log10(1_000_000) - log10(8000))
          * 100) : 0
    let free = model.pricing?.freeTierAvailable == true
    let value: Double? =
      model.pricing?.inputPricePerMillionTokens.map {
        clamp(clamp(100 - 35 * log10($0 + 0.1) - 30) + (free ? 10 : 0))
      } ?? (free ? 70 : nil)
    let versatility = clamp(
      Double(model.specs.inputModalities.count + model.specs.outputModalities.count) / 8 * 100)
    values = [quality, speed, context, value, versatility]
  }
  static func parseSpeed(_ text: String?) -> Double? {
    guard let text, let regex = try? NSRegularExpression(pattern: "([\\d.]+)\\s*tokens?/s"),
      let match = regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)),
      let range = Range(match.range(at: 1), in: text)
    else { return nil }
    return Double(text[range])
  }
}
