import SwiftUI

struct SearchView: View {
  @Environment(AppStore.self) private var store
  @State private var query = ""
  private var q: String { query.trimmingCharacters(in: .whitespacesAndNewlines) }
  var body: some View {
    NavigationStack {
      Page {
        SearchField(
          text: $query, placeholder: "Search companies, models, questions, terms…", autofocus: true)
        if q.isEmpty {
          Kicker(text: "Explore anything")
          ForEach(["Neural network", "Claude", "Can AI think?", "Token"], id: \.self) {
            suggestion in
            Button {
              query = suggestion
            } label: {
              Label(suggestion, systemImage: "magnifyingglass").font(AppTheme.font(16)).padding(
                .vertical, 8)
            }
          }
          Button {
            open(.glossary, tab: .learn)
          } label: {
            Label("Browse all 86 glossary terms", systemImage: "text.book.closed")
          }
        } else {
          let companies = store.catalog.companies.filter {
            $0.name.localizedCaseInsensitiveContains(q)
              || $0.shortName.localizedCaseInsensitiveContains(q)
          }
          let models = store.catalog.models.filter { $0.name.localizedCaseInsensitiveContains(q) }
          let terms = store.catalog.terms.filter {
            $0.term.localizedCaseInsensitiveContains(q)
              || $0.shortDefinition.localizedCaseInsensitiveContains(q)
          }
          let facts = store.catalog.facts.map { ($0, $0.match(q)) }.filter { $0.1 > 0 }.sorted {
            $0.1 > $1.1
          }.prefix(6).map(\.0)
          let benchmarks = store.catalog.benchmarks.filter {
            $0.name.localizedCaseInsensitiveContains(q)
              || ($0.aliases ?? []).contains { $0.localizedCaseInsensitiveContains(q) }
          }
          if companies.isEmpty && models.isEmpty && terms.isEmpty && facts.isEmpty
            && benchmarks.isEmpty
          {
            EmptyResults()
          }
          if !companies.isEmpty {
            SectionTitle(text: "Companies")
            ForEach(companies.prefix(6)) { c in
              row(c.name, subtitle: c.description, icon: "building.2") {
                open(.company(c.id), tab: .companies)
              }
            }
          }
          if !models.isEmpty {
            SectionTitle(text: "Models & systems")
            ForEach(models.prefix(12)) { m in
              row(m.name, subtitle: m.categoryName, icon: "cpu") {
                open(.model(m.id), tab: .companies)
              }
            }
          }
          if !terms.isEmpty {
            SectionTitle(text: "Glossary")
            ForEach(terms.prefix(10)) { t in
              row(t.term, subtitle: t.shortDefinition, icon: "text.book.closed") {
                open(.term(t.id), tab: store.tab)
              }
            }
          }
          if !facts.isEmpty {
            SectionTitle(text: "Fact Check")
            ForEach(facts) { f in
              row(
                f.question, subtitle: "\(f.confidence.capitalized) confidence",
                icon: "checkmark.shield"
              ) { open(.fact(f.id), tab: .facts) }
            }
          }
          if !benchmarks.isEmpty {
            SectionTitle(text: "Benchmarks")
            ForEach(benchmarks.prefix(6)) { b in
              row(b.name, subtitle: b.shortDescription, icon: "chart.bar") {
                open(.benchmark(b.id), tab: store.tab)
              }
            }
          }
        }
      }.navigationTitle("Search everything").navigationBarTitleDisplayMode(.inline).toolbar {
        ToolbarItem(placement: .topBarTrailing) { Button("Done") { store.searchOpen = false } }
      }
    }.presentationDragIndicator(.visible)
  }
  private func open(_ route: AppRoute, tab: AppTab) {
    switch route {
    case .term, .benchmark:
      store.pendingReference = route
      store.searchOpen = false
    default:
      store.searchOpen = false
      store.select(tab)
      store.path = [route]
    }
  }
  private func row(_ title: String, subtitle: String, icon: String, action: @escaping () -> Void)
    -> some View
  {
    Button(action: action) {
      HStack(alignment: .top, spacing: 12) {
        Image(systemName: icon).foregroundStyle(AppTheme.light).frame(width: 22)
        VStack(alignment: .leading, spacing: 5) {
          Text(title).font(AppTheme.font(16, .medium))
          Text(subtitle).font(AppTheme.font(12)).foregroundStyle(AppTheme.muted).lineLimit(2)
        }
        Spacer(minLength: 0)
      }.padding(.vertical, 5)
    }.buttonStyle(.plain)
  }
}
