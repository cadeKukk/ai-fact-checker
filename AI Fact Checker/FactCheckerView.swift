import SwiftUI

struct FactCheckerView: View {
  @Environment(AppStore.self) private var store
  @State private var query = ""
  @State private var confidence = "all"
  private var results: [FactCheckQA] {
    let filtered = store.catalog.facts.filter { confidence == "all" || $0.confidence == confidence }
    if query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return filtered }
    return filtered.map { ($0, $0.match(query)) }.filter { $0.1 > 0 }.sorted { $0.1 > $1.1 }.map(
      \.0)
  }
  var body: some View {
    Page {
      PageHeader(
        kicker: "Verified answers", title: "Fact Check",
        subtitle: "Ask a question about AI. Get answers backed by evidence.")
      SearchField(text: $query, placeholder: "What do you want to know about AI?")
      ScrollView(.horizontal, showsIndicators: false) {
        HStack {
          ForEach(
            [
              "Can AI think?", "Replace programmers?", "Is my data safe?",
              "What are hallucinations?", "Open source vs closed?",
            ], id: \.self
          ) { example in
            Button {
              query = example
            } label: {
              Badge(text: example, color: AppTheme.muted)
            }
          }
        }
      }
      FilterChips(
        values: ["all", "high", "medium", "low"], selected: $confidence,
        labels: ["all": "All answers", "high": "High confidence", "medium": "Medium", "low": "Low"])
      Text("\(results.count) answers · Data snapshot: \(store.catalog.dataSnapshot)").font(
        AppTheme.font(12)
      ).foregroundStyle(AppTheme.muted)
      if results.isEmpty { EmptyResults() }
      LazyVStack(spacing: 16) { ForEach(results) { fact in FactCard(fact: fact) } }
    }
  }
}
struct FactCard: View {
  @Environment(AppStore.self) private var store
  let fact: FactCheckQA
  var body: some View {
    let color = AppTheme.status(fact.confidence)
    Card(color: color.opacity(0.06), border: color.opacity(0.2)) {
      VStack(alignment: .leading, spacing: 12) {
        HStack {
          Image(
            systemName: fact.confidence == "high" ? "checkmark.shield" : "exclamationmark.triangle")
          Kicker(text: "\(fact.confidence) confidence", color: color)
          Spacer()
          ShareLink(item: shareURL) {
            Image(systemName: "square.and.arrow.up").font(.system(size: 14))
          }.accessibilityLabel("Share answer")
        }.foregroundStyle(color)
        Text(fact.question).font(AppTheme.font(18, .semibold))
        ReferenceText(text: fact.answer)
        if !fact.relatedModels.isEmpty {
          ScrollView(.horizontal, showsIndicators: false) {
            HStack {
              ForEach(fact.relatedModels, id: \.self) { name in
                if let model = store.catalog.models.first(where: { $0.name == name }) {
                  Button {
                    store.show(.model(model.id))
                  } label: {
                    Badge(text: name)
                  }
                } else {
                  Badge(text: name, color: AppTheme.muted)
                }
              }
            }
          }
        }
        if !fact.sources.isEmpty {
          Divider().overlay(AppTheme.line)
          Kicker(text: "Sources", color: AppTheme.muted)
          SourceLinks(sources: fact.sources)
        }
      }
    }
  }
  private var shareURL: URL {
    var components = URLComponents(string: "https://web-tau-peach-63.vercel.app/fact-check")!
    components.queryItems = [URLQueryItem(name: "q", value: fact.question)]
    return components.url!
  }
}
