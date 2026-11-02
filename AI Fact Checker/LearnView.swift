import SwiftUI

struct LearnHomeView: View {
  @Environment(AppStore.self) private var store
  var body: some View {
    Page {
      PageHeader(
        kicker: "Start here", title: "AI Fundamentals",
        subtitle:
          "9 short lessons on how AI actually works — starting with a guided tour of this app, no technical background needed"
      )
      VStack(spacing: 12) {
        PrimaryButton(
          title: store.intro.completed
            ? "Review the course"
            : store.intro.max > 0
              ? "Continue — Lesson \(store.intro.current + 1) of 9" : "Start the course"
        ) {
          store.path.append(
            .course(false, min(store.intro.current, store.catalog.lessons.count - 1)))
        }
        if store.intro.completed {
          Label("Course completed — nice work", systemImage: "checkmark").font(AppTheme.font(12))
            .foregroundStyle(.green)
        } else if store.intro.max > 0 {
          HStack {
            ProgressView(value: Double(store.intro.max), total: Double(store.catalog.lessons.count))
              .tint(AppTheme.accent)
            Text("\(store.intro.max) of 9 lessons").font(AppTheme.font(11)).foregroundStyle(
              AppTheme.muted)
          }
        }
      }
      VStack(alignment: .leading, spacing: 12) {
        SectionTitle(text: "Lessons")
        ForEach(Array(store.catalog.lessons.enumerated()), id: \.offset) { index, lesson in
          Button {
            store.path.append(.course(false, index))
          } label: {
            Card {
              HStack(spacing: 16) {
                IconTile(icon: AppTheme.icon(lesson.icon), color: Color(hex: lesson.color))
                VStack(alignment: .leading, spacing: 4) {
                  Text("LESSON \(index + 1) · \(lesson.category.uppercased())").font(
                    AppTheme.font(11, .medium)
                  ).tracking(1).foregroundStyle(AppTheme.muted)
                  Text(lesson.title).font(AppTheme.font(15, .semibold)).lineLimit(1)
                    .multilineTextAlignment(.leading)
                }
                Spacer(minLength: 0)
                if store.intro.completed || index < store.intro.max {
                  Image(systemName: "checkmark.circle.fill").foregroundStyle(.green).font(
                    .system(size: 17))
                }
              }
            }
          }.buttonStyle(.plain)
        }
      }
      VStack(alignment: .leading, spacing: 12) {
        SectionTitle(text: "Go deeper")
        if store.intro.completed {
          Button {
            store.path.append(
              .course(true, min(store.advanced.current, store.catalog.advancedLessons.count - 1)))
          } label: {
            Card(
              color: Color(hex: "8b5cf6").opacity(0.08), border: Color(hex: "8b5cf6").opacity(0.3)
            ) {
              VStack(alignment: .leading, spacing: 10) {
                Kicker(text: "Advanced course")
                Text("AI in Depth").font(AppTheme.font(22, .semibold))
                Text(
                  "7 lessons that open the black box: transformers and attention, the training pipeline, reasoning modes, agents & MCP, benchmark literacy, AI security, and open weights."
                ).font(AppTheme.font(14)).foregroundStyle(AppTheme.muted)
                Label(
                  store.advanced.completed ? "Review the advanced course" : "Continue learning",
                  systemImage: "arrow.right"
                ).font(AppTheme.font(13, .semibold)).foregroundStyle(AppTheme.light)
              }
            }
          }.buttonStyle(.plain)
        } else {
          Card(color: Color(hex: "131315"), border: Color.white.opacity(0.07)) {
            HStack(alignment: .top, spacing: 16) {
              IconTile(icon: "lock", color: AppTheme.muted)
              VStack(alignment: .leading, spacing: 7) {
                Kicker(text: "Advanced course", color: AppTheme.muted)
                Text("AI in Depth").font(AppTheme.font(20, .semibold)).foregroundStyle(
                  AppTheme.soft)
                Text(
                  "7 lessons on transformers, training, reasoning, agents, benchmarks, security, and open weights. Finish AI Fundamentals above to unlock it."
                ).font(AppTheme.font(14)).foregroundStyle(AppTheme.muted)
              }
            }
          }
        }
      }
      VStack(alignment: .leading, spacing: 12) {
        SectionTitle(text: "Test your knowledge")
        Button {
          store.path.append(.practice)
        } label: {
          Card(color: AppTheme.accent.opacity(0.08), border: AppTheme.accent.opacity(0.3)) {
            VStack(alignment: .leading, spacing: 10) {
              Kicker(text: "Quiz")
              Text("Knowledge Check").font(AppTheme.font(22, .semibold))
              Text(
                "A quick 10-question quiz covering 46 key AI terms. Animated visuals illustrate each concept, and every answer comes with an explanation."
              ).font(AppTheme.font(14)).foregroundStyle(AppTheme.muted)
              if store.stats.rounds > 0 {
                Text(
                  "\(store.stats.xp) pts earned · Best streak \(store.stats.bestStreak) · \(store.stats.rounds) quizzes taken"
                ).font(AppTheme.font(12, .medium)).foregroundStyle(AppTheme.light)
              } else {
                Label("Start the quiz", systemImage: "arrow.right").font(
                  AppTheme.font(13, .semibold)
                ).foregroundStyle(AppTheme.light)
              }
            }
          }
        }.buttonStyle(.plain)
      }
      VStack(alignment: .leading, spacing: 12) {
        SectionTitle(text: "Then explore")
        ForEach(AppTab.allCases.filter { $0 != .learn }, id: \.self) { tab in
          Button {
            store.select(tab)
          } label: {
            Card {
              HStack(spacing: 14) {
                Image(systemName: tab.icon).foregroundStyle(AppTheme.light)
                VStack(alignment: .leading, spacing: 4) {
                  Text(tab.rawValue).font(AppTheme.font(14, .semibold))
                  Text(note(tab)).font(AppTheme.font(12)).foregroundStyle(AppTheme.muted)
                }
                Spacer()
                Image(systemName: "arrow.right").foregroundStyle(AppTheme.muted)
              }
            }
          }.buttonStyle(.plain)
        }
        NavigationLink(value: AppRoute.glossary) {
          Label("Browse the AI glossary", systemImage: "text.book.closed").font(AppTheme.font(14))
        }
      }
      Text(
        "v\(store.catalog.version) · Model & company data current as of \(store.catalog.dataSnapshot) · Updated \(store.catalog.lastUpdated)"
      ).font(AppTheme.font(11)).foregroundStyle(AppTheme.muted).multilineTextAlignment(.center)
        .frame(maxWidth: .infinity)
    }
  }
  private func note(_ tab: AppTab) -> String {
    switch tab {
    case .companies:
      "\(store.catalog.companies.count) companies · \(store.catalog.models.count) models"
    case .facts: "\(store.catalog.facts.count) verified answers"
    case .compare: "Models side by side"
    case .sources: "\(store.catalog.sources.count) primary sources"
    default: ""
    }
  }
}

struct CourseView: View {
  @Environment(AppStore.self) private var store
  @Environment(\.dismiss) private var dismiss
  let isAdvanced: Bool
  let initialIndex: Int
  @State private var index = 0
  @State private var completed = false
  private var lessons: [AILesson] {
    isAdvanced ? store.catalog.advancedLessons : store.catalog.lessons
  }
  private var lesson: AILesson { lessons[min(max(index, 0), lessons.count - 1)] }
  var body: some View {
    Group {
      if isAdvanced && !store.intro.completed {
        ContentUnavailableView(
          "Finish AI Fundamentals first", systemImage: "lock",
          description: Text("Complete the introductory course to unlock AI in Depth."))
      } else if completed {
        completion
      } else {
        ScrollViewReader { proxy in
          ScrollView {
            VStack(alignment: .leading, spacing: 24) {
              HStack {
                Kicker(text: isAdvanced ? "AI in Depth" : "AI Fundamentals")
                Spacer()
                Text("\(index + 1) / \(lessons.count)").font(AppTheme.font(12)).foregroundStyle(
                  AppTheme.muted)
              }.id("lesson-top")
              ProgressView(value: Double(index + 1), total: Double(lessons.count)).tint(
                Color(hex: lesson.color))
              VStack(alignment: .leading, spacing: 12) {
                IconTile(icon: AppTheme.icon(lesson.icon), color: Color(hex: lesson.color))
                Kicker(text: lesson.category, color: Color(hex: lesson.color))
                Text(lesson.title).font(AppTheme.font(34, .semibold)).tracking(-0.6)
                Text(lesson.subtitle).font(AppTheme.font(16)).foregroundStyle(AppTheme.muted)
              }
              ForEach(Array(lesson.sections.enumerated()), id: \.offset) { _, section in
                Card {
                  VStack(alignment: .leading, spacing: 16) {
                    if let heading = section.heading {
                      Text(heading).font(AppTheme.font(20, .semibold))
                    }
                    ReferenceText(text: section.content, size: 15)
                    if let bullets = section.bullets {
                      ForEach(bullets, id: \.self) { bullet in
                        HStack(alignment: .top, spacing: 10) {
                          Circle().fill(Color(hex: lesson.color)).frame(width: 5, height: 5)
                            .padding(.top, 8)
                          ReferenceText(text: bullet, size: 14)
                        }
                      }
                    }
                    if let visual = section.visual {
                      LessonVisualView(visual: visual, color: lesson.color).id(
                        "\(index)-\(visual.type)")
                    }
                    if let sources = section.sources { SourceLinks(sources: sources) }
                  }
                }
              }
              if let takeaway = lesson.keyTakeaway {
                Card(
                  color: Color(hex: lesson.color).opacity(0.08),
                  border: Color(hex: lesson.color).opacity(0.25)
                ) {
                  VStack(alignment: .leading, spacing: 10) {
                    Label("Key takeaway", systemImage: "lightbulb").font(
                      AppTheme.font(15, .semibold)
                    ).foregroundStyle(Color(hex: lesson.color))
                    ReferenceText(text: takeaway, size: 15)
                  }
                }
              }
            }.frame(maxWidth: 760, alignment: .leading).padding(24).frame(maxWidth: .infinity)
          }.onChange(of: index) { _, _ in proxy.scrollTo("lesson-top", anchor: .top) }
        }
        .safeAreaInset(edge: .bottom) {
          HStack(spacing: 14) {
            Button {
              move(-1)
            } label: {
              Image(systemName: "chevron.left").frame(width: 44, height: 48).background(
                AppTheme.surface, in: RoundedRectangle(cornerRadius: 10))
            }.disabled(index == 0).accessibilityLabel("Previous lesson")
            Button {
              if index == lessons.count - 1 {
                store.visitLesson(index, advanced: isAdvanced, complete: true)
                completed = true
              } else {
                move(1)
              }
            } label: {
              HStack {
                Text(index == lessons.count - 1 ? "Finish course" : "Next lesson")
                Image(systemName: "arrow.right")
              }.font(AppTheme.font(16, .semibold)).frame(maxWidth: .infinity).frame(minHeight: 48)
                .background(AppTheme.accent, in: RoundedRectangle(cornerRadius: 10))
                .foregroundStyle(.white)
            }
          }.padding(.horizontal, 24).padding(.vertical, 12).background(AppTheme.background)
        }
      }
    }.background(AppTheme.background).navigationTitle(
      isAdvanced ? "AI in Depth" : "AI Fundamentals"
    )
    .onAppear {
      index = min(max(initialIndex, 0), lessons.count - 1)
      store.visitLesson(index, advanced: isAdvanced)
    }
  }
  private func move(_ delta: Int) {
    index = min(max(index + delta, 0), lessons.count - 1)
    store.visitLesson(index, advanced: isAdvanced)
  }
  private var completion: some View {
    Page {
      VStack(spacing: 24) {
        Image(systemName: "checkmark.seal.fill").font(.system(size: 70)).foregroundStyle(
          AppTheme.light)
        Kicker(text: "Course complete")
        Text(isAdvanced ? "You opened the black box." : "You’ve got the fundamentals.").font(
          AppTheme.font(32, .semibold)
        ).multilineTextAlignment(.center)
        Text(
          isAdvanced
            ? "Keep exploring the evidence, and put your knowledge to the test."
            : "AI in Depth is now unlocked. Keep learning or test what you know."
        ).foregroundStyle(AppTheme.muted).multilineTextAlignment(.center)
        PrimaryButton(title: "Test your knowledge") { store.path = [.practice] }
        if !isAdvanced {
          Button("Start AI in Depth") { store.path = [.course(true, 0)] }.font(
            AppTheme.font(16, .semibold))
        }
        Button("Back to Learn") { dismiss() }
      }.padding(.top, 30)
    }
  }
}
