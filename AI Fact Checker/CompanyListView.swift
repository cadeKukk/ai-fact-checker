import SwiftUI

struct CompanyListView: View {
  @Environment(AppStore.self) private var store
  @State private var query = ""
  @State private var category = "all"
  @State private var sort = "default"
  private var companies: [AICompany] {
    let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
    let result = store.catalog.companies.filter { c in
      (q.isEmpty || c.name.localizedCaseInsensitiveContains(q)
        || c.models.contains { $0.name.localizedCaseInsensitiveContains(q) })
        && (category == "all" || c.models.contains { ($0.category ?? "language") == category })
    }
    switch sort {
    case "companies": return result.sorted { $0.name < $1.name }
    case "models": return result.sorted { $0.models.count > $1.models.count }
    case "sources": return result.sorted { sourceCount($0) > sourceCount($1) }
    default: return result
    }
  }
  private func sourceCount(_ c: AICompany) -> Int {
    c.sources.count + c.models.reduce(0) { $0 + $1.sources.count }
  }
  var body: some View {
    Page {
      PageHeader(
        kicker: "Directory", title: "Companies",
        subtitle: "Who builds today’s AI — models, harnesses, and the tools that run them")
      FilterChips(
        values: [
          "all", "language", "harness", "runtime", "image", "video", "audio", "science",
          "perception", "product",
        ], selected: $category,
        labels: Labels.categories.merging(["all": "All"], uniquingKeysWith: { $1 }))
      HStack(spacing: 8) {
        countButton("\(store.catalog.companies.count) companies", key: "companies")
        countButton("\(store.catalog.models.count) models", key: "models")
        countButton("\(store.catalog.sources.count) sources", key: "sources")
      }
      SearchField(text: $query, placeholder: "Search companies or models…")
      if companies.isEmpty { EmptyResults() }
      LazyVStack(spacing: 12) {
        ForEach(companies) { company in
          NavigationLink(value: AppRoute.company(company.id)) {
            Card {
              VStack(alignment: .leading, spacing: 14) {
                HStack(spacing: 12) {
                  IconTile(
                    icon: AppTheme.icon(company.logoIcon), color: Color(hex: company.accentColor))
                  VStack(alignment: .leading, spacing: 3) {
                    Text(company.name).font(AppTheme.font(19, .semibold))
                    Text("\(company.models.filter { $0.legacy != true }.count) current systems")
                      .font(AppTheme.font(12)).foregroundStyle(AppTheme.muted)
                  }
                  Spacer()
                  Image(systemName: "chevron.right").font(.system(size: 13)).foregroundStyle(
                    AppTheme.muted)
                }
                Text(company.description).font(AppTheme.font(14)).foregroundStyle(AppTheme.soft)
                  .lineLimit(3).multilineTextAlignment(.leading)
                Text(
                  company.models.filter { $0.legacy != true }.prefix(3).map(\.name).joined(
                    separator: "  ·  ")
                ).font(AppTheme.font(11)).foregroundStyle(Color(hex: company.accentColor))
                  .lineLimit(2)
              }
            }
          }.buttonStyle(.plain)
        }
      }
    }
  }
  private func countButton(_ text: String, key: String) -> some View {
    Button {
      sort = sort == key ? "default" : key
    } label: {
      Badge(text: text, color: sort == key ? AppTheme.light : AppTheme.muted)
    }.buttonStyle(.plain)
  }
}
