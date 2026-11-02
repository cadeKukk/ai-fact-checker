import SwiftUI

struct ModelDetailView: View {
  @Environment(AppStore.self) private var store
  let model: AIModel
  var body: some View {
    Page {
      PageHeader(
        kicker: store.catalog.company(for: model)?.name ?? "Model", title: model.name,
        subtitle: model.categoryName)
      HStack {
        Badge(text: model.isOpenSource ? "Open weights" : "Proprietary")
        if model.releaseDateVerified != false {
          Badge(text: model.releaseDate, color: AppTheme.muted)
        } else {
          Badge(text: "Release date unverified", color: .orange)
        }
      }
      ReferenceText(text: model.description, size: 16)
      if let verification = model.verification {
        Card(color: AppTheme.accent.opacity(0.06), border: AppTheme.accent.opacity(0.2)) {
          VStack(alignment: .leading, spacing: 10) {
            Kicker(text: "Verification · \(verification.checkedAt)")
            ForEach(verification.notes, id: \.self) { ReferenceText(text: $0, size: 12) }
          }
        }
      }
      if model.isLanguage && model.legacy != true {
        Button {
          store.toggleComparison(model)
        } label: {
          Label(
            store.comparedIDs.contains(model.id)
              ? "Remove from comparison"
              : store.comparedIDs.count == 3 ? "Comparison full (3 models)" : "Add to comparison",
            systemImage: "arrow.left.arrow.right"
          ).font(AppTheme.font(14, .semibold)).frame(maxWidth: .infinity).padding(16).background(
            AppTheme.accent.opacity(0.15), in: RoundedRectangle(cornerRadius: 10))
        }.disabled(!store.comparedIDs.contains(model.id) && store.comparedIDs.count >= 3)
      }
      SectionTitle(text: "Specifications")
      Card {
        VStack(spacing: 12) {
          SpecRow(label: "Parameters", value: model.specs.parameterCount ?? "Not disclosed")
          if model.isLanguage {
            SpecRow(
              label: "Context window",
              value: model.specs.contextWindow > 0
                ? "\(model.specs.contextWindow.formatted()) tokens" : "Not disclosed")
          }
          SpecRow(label: "Architecture", value: model.specs.architecture)
          SpecRow(label: "Input", value: model.specs.inputModalities.joined(separator: ", "))
          SpecRow(label: "Output", value: model.specs.outputModalities.joined(separator: ", "))
          if let cutoff = model.specs.trainingDataCutoff {
            SpecRow(label: "Training cutoff", value: cutoff)
          }
          if let speed = model.specs.tokensPerSecond { SpecRow(label: "Speed", value: speed) }
          if let latency = model.specs.averageLatency { SpecRow(label: "Latency", value: latency) }
          if let resources = model.specs.resourceRequirements { ReferenceText(text: resources) }
        }
      }
      if let pricing = model.pricing {
        SectionTitle(text: "Pricing")
        Card {
          VStack(alignment: .leading, spacing: 12) {
            if model.isLanguage {
              SpecRow(
                label: "Input / 1M tokens", value: priceText(pricing.inputPricePerMillionTokens))
              SpecRow(
                label: "Output / 1M tokens", value: priceText(pricing.outputPricePerMillionTokens))
            }
            SpecRow(
              label: "Free tier", value: pricing.freeTierAvailable ? "Available" : "Not available")
            if let notes = pricing.notes { ReferenceText(text: notes, size: 13) }
          }
        }
      }
      SectionTitle(text: "Capabilities")
      Text(
        "Feature claims are source-backed where citations are provided. Ratings are editorial judgments."
      ).font(AppTheme.font(12)).foregroundStyle(AppTheme.muted)
      ForEach(model.capabilities) { capability in
        Card {
          VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
              Text(capability.name).font(AppTheme.font(16, .semibold))
              Spacer()
              Badge(text: capability.rating.capitalized, color: AppTheme.status(capability.rating))
            }
            ReferenceText(text: capability.description)
            SourceLinks(sources: capability.sources ?? [])
          }
        }
      }
      if !model.limitations.isEmpty {
        SectionTitle(text: "Limitations")
        Card {
          VStack(alignment: .leading, spacing: 16) {
            ForEach(model.limitations, id: \.self) { text in
              HStack(alignment: .top, spacing: 10) {
                Image(systemName: "exclamationmark.triangle").foregroundStyle(.orange)
                ReferenceText(text: text)
              }
            }
          }
        }
      }
      if !model.myths.isEmpty {
        SectionTitle(text: "Myths & facts")
        ForEach(model.myths) { myth in
          Card {
            VStack(alignment: .leading, spacing: 12) {
              Badge(text: myth.verdict.capitalized, color: AppTheme.status(myth.verdict))
              Text(myth.claim).font(AppTheme.font(17, .semibold))
              ReferenceText(text: myth.explanation)
              if let source = myth.source { SourceLinks(sources: [source]) }
            }
          }
        }
      }
      SectionTitle(text: "Sources")
      SourceLinks(sources: model.sources)
    }.navigationTitle(model.name).toolbar {
      ToolbarItem(placement: .topBarTrailing) {
        if let company = store.catalog.company(for: model),
          let url = URL(
            string: "https://web-tau-peach-63.vercel.app/companies/\(company.id)/\(model.id)")
        {
          ShareLink(item: url) { Image(systemName: "square.and.arrow.up") }.accessibilityLabel(
            "Share model")
        }
      }
    }
  }
}
func priceText(_ price: Double?) -> String {
  guard let price else { return "Not disclosed" }
  return price.formatted(.currency(code: "USD").precision(.fractionLength(0...3)))
}
