import SwiftUI

struct CompanyDetailView: View {
  let company: AICompany
  var body: some View {
    Page {
      HStack(spacing: 14) {
        IconTile(icon: AppTheme.icon(company.logoIcon), color: Color(hex: company.accentColor))
        VStack(alignment: .leading, spacing: 4) {
          Kicker(text: "Company profile")
          Text(company.name).font(AppTheme.font(32, .semibold))
        }
        Spacer()
      }
      ReferenceText(text: company.description, size: 16)
      Card {
        VStack(alignment: .leading, spacing: 12) {
          if company.metadataVerified != false {
            SpecRow(label: "Founded", value: String(company.foundedYear))
            SpecRow(label: "Headquarters", value: company.headquarters)
          } else {
            Text("Founding year and headquarters are unverified.").font(AppTheme.font(12))
              .foregroundStyle(AppTheme.muted)
          }
          if let url = URL(string: company.website) {
            Link(destination: url) {
              Label("Official website", systemImage: "arrow.up.right.square").font(
                AppTheme.font(14, .medium))
            }
          }
        }
      }
      SectionTitle(text: "Current models & systems")
      VStack(spacing: 12) {
        ForEach(company.models.filter { $0.legacy != true }) { model in modelLink(model) }
      }
      let legacy = company.models.filter { $0.legacy == true }
      if !legacy.isEmpty {
        SectionTitle(text: "Earlier models")
        VStack(spacing: 12) { ForEach(legacy) { model in modelLink(model) } }
      }
      if !company.sources.isEmpty {
        SectionTitle(text: "Sources")
        SourceLinks(sources: company.sources)
      }
    }.navigationTitle(company.name).toolbar {
      ToolbarItem(placement: .topBarTrailing) {
        ShareLink(item: URL(string: "https://web-tau-peach-63.vercel.app/companies/\(company.id)")!)
        { Image(systemName: "square.and.arrow.up") }
      }
    }
  }
  private func modelLink(_ model: AIModel) -> some View {
    NavigationLink(value: AppRoute.model(model.id)) {
      Card {
        VStack(alignment: .leading, spacing: 10) {
          HStack {
            Text(model.name).font(AppTheme.font(20, .semibold))
            Spacer()
            Image(systemName: "chevron.right").font(.system(size: 12)).foregroundStyle(
              AppTheme.muted)
          }
          HStack {
            Badge(text: model.categoryName, color: Color(hex: company.accentColor))
            if model.isOpenSource { Badge(text: "Open weights", color: .green) }
          }
          Text(model.description).font(AppTheme.font(14)).foregroundStyle(AppTheme.soft).lineLimit(
            3)
          if model.releaseDateVerified != false {
            Text("Released \(model.releaseDate)").font(AppTheme.font(11)).foregroundStyle(
              AppTheme.muted)
          } else {
            Badge(text: "Release date unverified", color: .orange)
          }
        }
      }
    }.buttonStyle(.plain)
  }
}
struct SpecRow: View {
  let label, value: String
  var body: some View {
    HStack(alignment: .top, spacing: 15) {
      Text(label).foregroundStyle(AppTheme.muted)
      Spacer(minLength: 10)
      Text(value).foregroundStyle(AppTheme.text).multilineTextAlignment(.trailing)
    }.font(AppTheme.font(13)).padding(.vertical, 3)
  }
}
