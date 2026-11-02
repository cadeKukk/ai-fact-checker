import SwiftUI

struct PracticeView: View {
  @Environment(AppStore.self) private var store
  @Environment(\.dismiss) private var dismiss
  @State private var session: QuizSession?
  @State private var height: CGFloat = 220
  var body: some View {
    Group {
      if let quiz = session {
        if quiz.finished {
          result(quiz)
        } else if !quiz.questions.isEmpty {
          question(quiz)
        } else {
          ContentUnavailableView("Quiz unavailable", systemImage: "questionmark.circle")
        }
      } else {
        ProgressView()
      }
    }.background(AppTheme.background).navigationTitle("Knowledge Check")
      .onAppear { if session == nil { restart() } }
  }
  private func question(_ quiz: QuizSession) -> some View {
    let q = quiz.questions[quiz.index]
    return ScrollViewReader { proxy in
      Page {
        HStack {
          Kicker(text: "Knowledge Check")
          Spacer()
          Label("\(quiz.streak)", systemImage: "flame").foregroundStyle(.orange)
          Text("\(quiz.xp) pts").foregroundStyle(AppTheme.light)
        }.id("quiz-top")
        ProgressView(value: Double(quiz.index + 1), total: Double(quiz.questions.count)).tint(
          AppTheme.accent)
        Text("QUESTION \(quiz.index + 1) OF \(quiz.questions.count)").font(
          AppTheme.font(11, .medium)
        ).tracking(1.5).foregroundStyle(AppTheme.muted)
        Text(q.asksForTerm ? "Which term describes this concept?" : "What does this term refer to?")
          .font(AppTheme.font(28, .semibold))
        OfflineIllustration(type: "term", termID: q.answer.id, height: $height).frame(
          height: min(height, 310)
        ).clipShape(RoundedRectangle(cornerRadius: 14)).id(q.answer.id)
        Text(q.asksForTerm ? q.answer.shortDefinition : q.answer.term).font(
          AppTheme.font(20, .medium)
        ).fixedSize(horizontal: false, vertical: true)
        VStack(spacing: 10) {
          ForEach(Array(q.options.enumerated()), id: \.element.id) { index, option in
            Button {
              session?.choose(option.id)
            } label: {
              HStack(alignment: .top, spacing: 12) {
                Text(String(UnicodeScalar(65 + index)!)).font(AppTheme.font(12, .semibold)).frame(
                  width: 26, height: 26
                ).background(Color.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 6))
                Text(q.asksForTerm ? option.term : option.shortDefinition).font(AppTheme.font(15))
                  .frame(maxWidth: .infinity, alignment: .leading)
                if quiz.selection != nil && option.id == q.answer.id {
                  Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                }
              }
              .padding(16).background(
                optionColor(option.id, quiz: quiz).opacity(0.10),
                in: RoundedRectangle(cornerRadius: 10)
              ).overlay(
                RoundedRectangle(cornerRadius: 10).stroke(
                  optionColor(option.id, quiz: quiz).opacity(0.5)))
            }.buttonStyle(.plain).disabled(quiz.selection != nil).accessibilityIdentifier(
              "quiz-option-\(index)")
          }
        }
        if let selection = quiz.selection {
          Card(color: (selection == q.answer.id ? Color.green : Color.orange).opacity(0.07)) {
            VStack(alignment: .leading, spacing: 12) {
              Text(selection == q.answer.id ? "Correct!" : "Not quite — \(q.answer.term)").font(
                AppTheme.font(20, .semibold)
              ).foregroundStyle(selection == q.answer.id ? .green : .orange)
              ReferenceText(text: q.answer.fullExplanation)
              if let example = q.answer.example {
                Kicker(text: "Example")
                ReferenceText(text: example, size: 13)
              }
            }
          }
          PrimaryButton(
            title: quiz.index == quiz.questions.count - 1 ? "See results" : "Next question"
          ) {
            session?.next()
            if let finished = session, finished.finished {
              store.recordRound(xp: finished.xp, streak: finished.bestStreak)
            }
            proxy.scrollTo("quiz-top", anchor: .top)
          }
        }
      }
    }
  }
  private func optionColor(_ id: String, quiz: QuizSession) -> Color {
    guard let selection = quiz.selection else { return AppTheme.muted }
    if id == quiz.questions[quiz.index].answer.id { return .green }
    return selection == id ? .orange : AppTheme.muted
  }
  private func result(_ quiz: QuizSession) -> some View {
    Page {
      VStack(spacing: 22) {
        Image(systemName: "trophy").font(.system(size: 64)).foregroundStyle(AppTheme.light)
        Kicker(text: "Quiz complete")
        Text("\(quiz.correct) / \(quiz.questions.count)").font(AppTheme.font(58, .semibold))
        Text(quiz.correct >= 8 ? "You know your AI." : "Every question is a chance to learn.").font(
          AppTheme.font(24, .semibold)
        ).multilineTextAlignment(.center)
      }.frame(maxWidth: .infinity).padding(.top, 24)
      Card {
        VStack(spacing: 12) {
          SpecRow(label: "Accuracy", value: "\(quiz.correct * 100 / max(quiz.questions.count, 1))%")
          SpecRow(label: "Points earned", value: "+\(quiz.xp)")
          SpecRow(label: "Best streak", value: "\(quiz.bestStreak)")
          SpecRow(label: "Lifetime points", value: "\(store.stats.xp)")
        }
      }
      PrimaryButton(title: "Play again", icon: "arrow.clockwise") { restart() }
      Button("Back to Learn") { dismiss() }.font(AppTheme.font(16)).frame(maxWidth: .infinity)
    }
  }
  private func restart() {
    session = QuizSession(terms: store.catalog.terms, playableIDs: store.catalog.playableTermIDs)
  }
}
