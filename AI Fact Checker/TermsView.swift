import SwiftUI

struct TermsView: View {
  @Environment(AppStore.self) private var store
  @State private var query = ""
  @State private var category = "all"
  private var terms: [AITerm] {
    store.catalog.terms.filter {
      (category == "all" || $0.category == category)
        && (query.isEmpty || $0.term.localizedCaseInsensitiveContains(query)
          || $0.shortDefinition.localizedCaseInsensitiveContains(query))
    }.sorted { $0.term < $1.term }
  }
  var body: some View {
    Page {
      PageHeader(
        kicker: "Reference", title: "AI Glossary",
        subtitle: "86 terms to help you understand how AI works.")
      SearchField(text: $query, placeholder: "Search terms…")
      FilterChips(
        values: [
          "all", "fundamentals", "architecture", "training", "inference", "performance", "safety",
          "practical",
        ], selected: $category, labels: Labels.termCategories)
      if terms.isEmpty { EmptyResults() }
      LazyVStack(spacing: 10) {
        ForEach(terms) { term in
          Button {
            store.show(.term(term.id))
          } label: {
            Card {
              VStack(alignment: .leading, spacing: 8) {
                Text(term.term).font(AppTheme.font(18, .semibold))
                Text(term.shortDefinition).font(AppTheme.font(14)).foregroundStyle(AppTheme.soft)
              }
            }
          }.buttonStyle(.plain)
        }
      }
    }.navigationTitle("AI Glossary")
  }
}
struct TermDetailView: View {
  @Environment(AppStore.self) private var store
  let term: AITerm
  var body: some View {
    Page {
      PageHeader(
        kicker: Labels.termCategories[term.category] ?? term.category, title: term.term,
        subtitle: term.shortDefinition)
      ReferenceText(text: term.fullExplanation, size: 16)
      if let example = term.example {
        Card {
          VStack(alignment: .leading, spacing: 12) {
            Kicker(text: "Example")
            ReferenceText(text: example)
          }
        }
      }
      if !term.relatedTerms.isEmpty {
        SectionTitle(text: "Related terms")
        ForEach(term.relatedTerms, id: \.self) { name in
          if let related = store.catalog.terms.first(where: {
            $0.term.caseInsensitiveCompare(name) == .orderedSame
          }) {
            Button {
              store.show(.term(related.id))
            } label: {
              Card {
                HStack {
                  Text(name).font(AppTheme.font(15, .medium))
                  Spacer()
                  Image(systemName: "arrow.right")
                }
              }
            }
          } else {
            Text(name).font(AppTheme.font(14)).foregroundStyle(AppTheme.muted)
          }
        }
      }
    }.navigationTitle(term.term)
  }
}
struct BenchmarkDetailView: View {
  let benchmark: Benchmark
  var body: some View {
    Page {
      PageHeader(
        kicker: "Benchmark · \(benchmark.category)", title: benchmark.name,
        subtitle: benchmark.shortDescription)
      ReferenceText(text: benchmark.details, size: 16)
      if let metric = benchmark.metric {
        Card {
          VStack(alignment: .leading, spacing: 12) {
            Kicker(text: "How it’s scored")
            ReferenceText(text: metric)
          }
        }
      }
      if let source = benchmark.source { Text(source).foregroundStyle(AppTheme.muted) }
      if let raw = benchmark.url, let url = URL(string: raw) {
        Link(destination: url) {
          Label("View primary source", systemImage: "arrow.up.right.square")
        }
      }
    }.navigationTitle(benchmark.name)
  }
}
struct ReferenceSheet: View {
  @Environment(AppStore.self) private var store
  var body: some View {
    NavigationStack {
      if let route = store.popupPath.last {
        RouteView(route: route).id(route).navigationBarTitleDisplayMode(.inline)
          .toolbar {
            ToolbarItem(placement: .topBarLeading) {
              if store.popupPath.count > 1 {
                Button {
                  store.popupPath.removeLast()
                } label: {
                  Label("Back", systemImage: "chevron.left")
                }
              }
            }
            ToolbarItem(placement: .topBarTrailing) { Button("Done") { store.popupPath = [] } }
          }
      }
    }.presentationDragIndicator(.visible).presentationDetents([.large])
  }
}
