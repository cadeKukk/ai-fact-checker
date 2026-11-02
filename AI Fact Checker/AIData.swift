import SwiftUI

enum AppTab: String, CaseIterable {
  case learn = "Learn"
  case companies = "Companies"
  case facts = "Fact Check"
  case compare = "Compare"
  case sources = "Sources"
  var icon: String {
    switch self {
    case .learn: "graduationcap"
    case .companies: "building.2"
    case .facts: "checkmark.shield"
    case .compare: "arrow.left.arrow.right"
    case .sources: "link"
    }
  }
}

struct CourseProgress: Codable {
  var current = 0
  var max = 0
  var completed = false
}
struct PracticeStats: Codable {
  var xp = 0
  var rounds = 0
  var bestStreak = 0
}
enum AppRoute: Hashable {
  case company(String)
  case model(String)
  case fact(String)
  case term(String)
  case benchmark(String)
  case course(Bool, Int)
  case practice, glossary, about
}
@MainActor @Observable final class AppStore {
  let catalog: Catalog
  var tab: AppTab = .learn
  var path: [AppRoute] = []
  var searchOpen = false
  var pendingReference: AppRoute?
  var popupPath: [AppRoute] = []
  var intro: CourseProgress
  var advanced: CourseProgress
  var stats: PracticeStats
  var comparedIDs: [String]
  private let defaults: UserDefaults
  init(catalog: Catalog, defaults: UserDefaults = .standard) {
    self.catalog = catalog
    self.defaults = defaults
    intro = Self.read("aifc-course-progress", defaults) ?? CourseProgress()
    advanced = Self.read("aifc-advanced-progress", defaults) ?? CourseProgress()
    stats = Self.read("aifc-practice-stats", defaults) ?? PracticeStats()
    comparedIDs = defaults.stringArray(forKey: "aifc-comparison") ?? []
    comparedIDs = Array(
      comparedIDs.filter { id in
        catalog.models.contains { $0.id == id && $0.isLanguage && $0.legacy != true }
      }.prefix(3))
  }
  private static func read<T: Decodable>(_ key: String, _ defaults: UserDefaults) -> T? {
    guard let data = defaults.data(forKey: key) else { return nil }
    return try? JSONDecoder().decode(T.self, from: data)
  }
  private func save<T: Encodable>(_ value: T, _ key: String) {
    if let data = try? JSONEncoder().encode(value) { defaults.set(data, forKey: key) }
  }
  func select(_ tab: AppTab) {
    self.tab = tab
    path = []
  }
  func visitLesson(_ index: Int, advanced isAdvanced: Bool, complete: Bool = false) {
    let count = isAdvanced ? catalog.advancedLessons.count : catalog.lessons.count
    guard index >= 0, index < count, !isAdvanced || intro.completed else { return }
    var progress = isAdvanced ? advanced : intro
    progress.current = index
    progress.max = Swift.max(progress.max, index)
    progress.completed = progress.completed || complete
    if isAdvanced { advanced = progress } else { intro = progress }
    save(progress, isAdvanced ? "aifc-advanced-progress" : "aifc-course-progress")
  }
  func recordRound(xp: Int, streak: Int) {
    stats.xp += xp
    stats.rounds += 1
    stats.bestStreak = max(stats.bestStreak, streak)
    save(stats, "aifc-practice-stats")
  }
  func toggleComparison(_ model: AIModel) {
    if comparedIDs.contains(model.id) {
      comparedIDs.removeAll { $0 == model.id }
    } else if comparedIDs.count < 3 && model.isLanguage && model.legacy != true {
      comparedIDs.append(model.id)
    }
    defaults.set(comparedIDs, forKey: "aifc-comparison")
  }
  func show(_ route: AppRoute) { popupPath.append(route) }
  func resetProgress() {
    intro = CourseProgress()
    advanced = CourseProgress()
    stats = PracticeStats()
    save(intro, "aifc-course-progress")
    save(advanced, "aifc-advanced-progress")
    save(stats, "aifc-practice-stats")
  }
  func handleURL(_ url: URL) {
    guard url.scheme == "aifactchecker" else { return }
    let parts = ([url.host].compactMap { $0 } + url.pathComponents.filter { $0 != "/" })
    let items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems ?? []
    func query(_ name: String) -> String? { items.first { $0.name == name }?.value }
    popupPath = []
    searchOpen = false
    switch parts.first {
    case "companies":
      select(.companies)
      if parts.count > 1, catalog.companies.contains(where: { $0.id == parts[1] }) {
        path.append(.company(parts[1]))
      }
      if parts.count > 2, let c = catalog.companies.first(where: { $0.id == parts[1] }),
        c.models.contains(where: { $0.id == parts[2] })
      {
        path.append(.model(parts[2]))
      }
    case "learn":
      select(.learn)
      if parts.contains("practice") {
        path = [.practice]
      } else {
        let adv = parts.contains("advanced")
        guard !adv || intro.completed else { return }
        let count = adv ? catalog.advancedLessons.count : catalog.lessons.count
        path = [.course(adv, min(max(Int(query("lesson") ?? "0") ?? 0, 0), count - 1))]
      }
    case "compare":
      select(.compare)
      if let raw = query("models") {
        var seen = Set<String>()
        comparedIDs = Array(
          raw.split(separator: ",").map(String.init).filter { id in
            seen.insert(id).inserted
              && catalog.models.contains { $0.id == id && $0.isLanguage && $0.legacy != true }
          }.prefix(3))
        defaults.set(comparedIDs, forKey: "aifc-comparison")
      }
    case "fact-check":
      select(.facts)
      if let q = query("q"),
        let fact = catalog.facts.first(where: { $0.question == q || $0.id == q })
      {
        path = [.fact(fact.id)]
      }
    default: break
    }
  }
}
