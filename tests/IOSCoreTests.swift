import Foundation
import SwiftUI

@main struct IOSCoreTests {
  @MainActor static func main() throws {
    let catalog = try JSONDecoder().decode(
      Catalog.self,
      from: Data(contentsOf: URL(fileURLWithPath: "AI Fact Checker/Resources/catalog.json")))
    var checks = 0
    func check(_ condition: @autoclosure () -> Bool, _ message: String) {
      checks += 1
      guard condition() else { fatalError("FAIL: \(message)") }
    }
    check(catalog.companies.count == 23 && catalog.models.count == 85, "Full model catalog decodes")
    check(
      catalog.terms.count == 86 && catalog.sources.count == 204, "Full reference catalog decodes")
    check(catalog.lessons.count == 9 && catalog.advancedLessons.count == 7, "All lessons decode")
    check(
      Set(catalog.sources.map(\.url)).count == catalog.sources.count,
      "Source identity is URL, avoiding duplicate web IDs")
    let oracle =
      try JSONSerialization.jsonObject(
        with: Data(contentsOf: URL(fileURLWithPath: ".ios-generated/web-scores.json")))
      as! [String: [String: Any]]
    for model in catalog.models {
      let actual = ModelScores(model)
      let expected = oracle[model.id]!
      for (index, dimension) in ["quality", "speed", "context", "value", "versatility"].enumerated()
      {
        if let value = expected[dimension] as? Double {
          check(
            abs(actual.values[index]! - value) < 0.00001, "\(model.id) \(dimension) matches web")
        } else {
          check(actual.values[index] == nil, "\(model.id) missing \(dimension) stays missing")
        }
      }
      check(
        abs(actual.overall - (expected["overall"] as! Double)) < 0.00001,
        "\(model.id) overall matches web")
    }
    for _ in 0..<100 {
      var quiz = QuizSession(terms: catalog.terms, playableIDs: catalog.playableTermIDs)
      check(quiz.questions.count == 10, "Ten quiz questions")
      check(Set(quiz.questions.map { $0.answer.id }).count == 10, "No repeated answers")
      for index in 0..<10 {
        let question = quiz.questions[index]
        check(
          question.options.count == 4 && Set(question.options.map(\.id)).count == 4,
          "Four unique options")
        check(question.options.contains { $0.id == question.answer.id }, "Correct answer present")
        check(question.asksForTerm == (index % 2 == 0), "Alternating question mode")
        quiz.next()
        check(quiz.index == index && !quiz.finished, "Cannot skip unanswered question")
        quiz.choose(question.answer.id)
        let xp = quiz.xp
        quiz.choose(question.answer.id)
        check(quiz.xp == xp, "Double tap cannot duplicate score")
        quiz.next()
      }
      check(
        quiz.finished && quiz.correct == 10 && quiz.xp == 140 && quiz.bestStreak == 10,
        "Correct streak bonuses and completion")
      quiz.next()
      check(quiz.xp == 140, "Completion idempotent")
    }
    var mixed = QuizSession(terms: catalog.terms, playableIDs: catalog.playableTermIDs)
    for _ in 0..<3 {
      mixed.choose(mixed.questions[mixed.index].answer.id)
      mixed.next()
    }
    mixed.choose(
      mixed.questions[mixed.index].options.first {
        $0.id != mixed.questions[mixed.index].answer.id
      }!.id)
    check(
      mixed.streak == 0 && mixed.bestStreak == 3 && mixed.xp == 35,
      "Wrong answer resets current streak only")
    let suite = "aifc-tests-\(UUID().uuidString)"
    let defaults = UserDefaults(suiteName: suite)!
    defer { defaults.removePersistentDomain(forName: suite) }
    let store = AppStore(catalog: catalog, defaults: defaults)
    store.visitLesson(0, advanced: true, complete: true)
    check(!store.advanced.completed, "Advanced course locked initially")
    store.visitLesson(4, advanced: false)
    store.visitLesson(1, advanced: false)
    check(
      store.intro.max == 4 && store.intro.current == 1, "Revisiting preserves furthest progress")
    store.visitLesson(-1, advanced: false)
    store.visitLesson(999, advanced: false)
    check(store.intro.current == 1, "Invalid lessons ignored")
    store.visitLesson(8, advanced: false, complete: true)
    store.visitLesson(6, advanced: true, complete: true)
    store.recordRound(xp: 35, streak: 3)
    let eligible = catalog.models.filter { $0.isLanguage && $0.legacy != true }
    for model in eligible.prefix(4) { store.toggleComparison(model) }
    check(store.comparedIDs.count == 3, "Comparison caps at three")
    if let nonLanguage = catalog.models.first(where: { !$0.isLanguage }) {
      store.toggleComparison(nonLanguage)
      check(!store.comparedIDs.contains(nonLanguage.id), "Non-language systems excluded")
    }
    let restored = AppStore(catalog: catalog, defaults: defaults)
    check(
      restored.intro.completed && restored.advanced.completed && restored.stats.xp == 35
        && restored.comparedIDs.count == 3, "State survives app restart")
    restored.handleURL(URL(string: "aifactchecker://learn?lesson=-10")!)
    check(restored.path == [.course(false, 0)], "Negative deep-link index clamped")
    restored.handleURL(URL(string: "aifactchecker://learn/advanced?lesson=1000")!)
    check(restored.path == [.course(true, 6)], "Advanced deep-link bounds checked")
    restored.handleURL(
      URL(
        string:
          "aifactchecker://compare?models=\(eligible[0].id),\(eligible[0].id),missing,\(eligible[1].id)"
      )!)
    check(
      restored.comparedIDs == [eligible[0].id, eligible[1].id],
      "Deep link deduplicates and validates models")
    restored.resetProgress()
    let reset = AppStore(catalog: catalog, defaults: defaults)
    check(
      !reset.intro.completed && !reset.advanced.completed && reset.stats.rounds == 0,
      "Reset persists")
    reset.handleURL(URL(string: "aifactchecker://learn/advanced")!)
    check(reset.path.isEmpty, "Deep link cannot bypass advanced lock")
    check(
      catalog.facts.first { $0.id == "fq-1" }!.match("Can AI think?") > 0,
      "Natural-language fact search")
    print(
      "Passed \(checks) checks: complete catalog, all 85 web scoring formulas, 100 randomized quizzes, persistence, course gating, and deep links."
    )
  }
}
