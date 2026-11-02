import Foundation

struct QuizQuestion {
  let answer: AITerm
  let options: [AITerm]
  let asksForTerm: Bool
}
struct QuizSession {
  let questions: [QuizQuestion]
  private(set) var index = 0
  private(set) var selection: String?
  private(set) var correct = 0
  private(set) var streak = 0
  private(set) var bestStreak = 0
  private(set) var xp = 0
  private(set) var finished = false
  init(terms: [AITerm], playableIDs: [String]) {
    let pool = terms.filter { playableIDs.contains($0.id) }
    questions = pool.shuffled().prefix(10).enumerated().map { index, answer in
      let same = pool.filter { $0.id != answer.id && $0.category == answer.category }.shuffled()
      let different = pool.filter { $0.id != answer.id && $0.category != answer.category }
        .shuffled()
      let distractors = Array(
        (Array(same.prefix(2)) + different + Array(same.dropFirst(2))).prefix(3))
      return QuizQuestion(
        answer: answer, options: ([answer] + distractors).shuffled(), asksForTerm: index % 2 == 0)
    }
  }
  mutating func choose(_ id: String) {
    guard selection == nil, !finished, index < questions.count,
      questions[index].options.contains(where: { $0.id == id })
    else { return }
    selection = id
    if id == questions[index].answer.id {
      correct += 1
      streak += 1
      bestStreak = max(bestStreak, streak)
      xp += 10 + (streak >= 3 ? 5 : 0)
    } else {
      streak = 0
    }
  }
  mutating func next() {
    guard selection != nil, !finished else { return }
    if index == questions.count - 1 {
      finished = true
    } else {
      index += 1
      selection = nil
    }
  }
}
