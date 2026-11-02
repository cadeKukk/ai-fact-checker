import SwiftUI

struct CompareView: View {
  @Environment(AppStore.self) private var store
  @State private var picker = false
  @State private var query = ""
  private var models: [AIModel] {
    store.comparedIDs.compactMap { id in store.catalog.models.first { $0.id == id } }
  }
  var body: some View {
    Page {
      PageHeader(
        kicker: "Side by side", title: "Compare Models",
        subtitle:
          "Compare up to 3 language models across quality, speed, context, value, and versatility.")
      VStack(spacing: 10) {
        ForEach(models) { model in
          Card {
            HStack {
              VStack(alignment: .leading, spacing: 5) {
                Text(model.name).font(AppTheme.font(17, .semibold))
                Text(store.catalog.company(for: model)?.name ?? "").font(AppTheme.font(12))
                  .foregroundStyle(AppTheme.muted)
              }
              Spacer()
              Button {
                store.toggleComparison(model)
              } label: {
                Image(systemName: "xmark").frame(width: 32, height: 32)
              }.accessibilityLabel("Remove \(model.name)")
            }
          }
        }
        if models.count < 3 {
          Button {
            picker = true
          } label: {
            Label("Add model", systemImage: "plus").font(AppTheme.font(16, .medium)).frame(
              maxWidth: .infinity
            ).padding(20).background(
              AppTheme.accent.opacity(0.08), in: RoundedRectangle(cornerRadius: 10)
            ).overlay(
              RoundedRectangle(cornerRadius: 10).stroke(
                AppTheme.accent.opacity(0.4), style: StrokeStyle(lineWidth: 1, dash: [5])))
          }
        }
      }
      if models.count < 2 {
        VStack(spacing: 12) {
          Image(systemName: "arrow.left.arrow.right").font(.system(size: 40)).foregroundStyle(
            AppTheme.light)
          Text("Select \(models.isEmpty ? "two models" : "one more model") to compare").font(
            AppTheme.font(22, .semibold))
          Text("Explore their strengths, tradeoffs, and specifications.").foregroundStyle(
            AppTheme.muted)
        }.frame(maxWidth: .infinity).padding(.vertical, 30)
      } else {
        SectionTitle(text: "At a glance")
        ScrollView(.horizontal) {
          HStack(alignment: .top, spacing: 12) {
            ForEach(models) { model in scoreCard(model).frame(width: 250) }
          }.padding(1)
        }
        SectionTitle(text: "Specifications")
        ScrollView(.horizontal) {
          VStack(spacing: 0) {
            comparisonRow("Model", values: models.map(\.name), header: true)
            comparisonRow(
              "Parameters", values: models.map { $0.specs.parameterCount ?? "Not disclosed" })
            comparisonRow(
              "Context",
              values: models.map {
                $0.specs.contextWindow > 0
                  ? "\($0.specs.contextWindow.formatted()) tokens" : "Not disclosed"
              })
            comparisonRow(
              "Speed", values: models.map { $0.specs.tokensPerSecond ?? "Not disclosed" })
            comparisonRow(
              "Latency", values: models.map { $0.specs.averageLatency ?? "Not disclosed" })
            comparisonRow(
              "Input / 1M", values: models.map { priceText($0.pricing?.inputPricePerMillionTokens) }
            )
            comparisonRow(
              "Output / 1M",
              values: models.map { priceText($0.pricing?.outputPricePerMillionTokens) })
            comparisonRow(
              "Input types", values: models.map { $0.specs.inputModalities.joined(separator: ", ") }
            )
            comparisonRow(
              "Output types",
              values: models.map { $0.specs.outputModalities.joined(separator: ", ") })
            comparisonRow("Open weights", values: models.map { $0.isOpenSource ? "Yes" : "No" })
            comparisonRow(
              "Free tier",
              values: models.map { $0.pricing?.freeTierAvailable == true ? "Yes" : "No" })
          }.background(AppTheme.surface, in: RoundedRectangle(cornerRadius: 10))
        }
        SectionTitle(text: "Capabilities")
        ScrollView(.horizontal) {
          VStack(spacing: 0) {
            comparisonRow("Capability", values: models.map(\.name), header: true)
            ForEach(Array(Set(models.flatMap { $0.capabilities.map(\.name) })).sorted(), id: \.self)
            { name in
              comparisonRow(
                name,
                values: models.map { model in
                  model.capabilities.first { $0.name == name }?.rating.capitalized ?? "—"
                })
            }
          }.background(AppTheme.surface, in: RoundedRectangle(cornerRadius: 10))
        }
        DisclosureGroup("How scoring works") {
          VStack(alignment: .leading, spacing: 12) {
            Text(
              "Scores reproduce the web app’s editorial formula. Quality: 40%, speed: 15%, context: 15%, value: 20%, versatility: 10%. Missing speed or value data is excluded and remaining weights are renormalized."
            )
            Text(
              "Quality averages capability ratings. Speed uses a logarithmic scale from 5 to 250 tokens/sec. Context uses 8,000 to 1,000,000 tokens. Value uses input pricing with a free-tier bonus. Versatility counts input and output modalities, capped at eight."
            )
            Text(
              "These are comparative guides, not independent benchmark results. Verify pricing and performance against primary sources."
            )
          }.font(AppTheme.font(13)).foregroundStyle(AppTheme.muted).padding(.top, 12)
        }.font(AppTheme.font(14, .medium))
        ShareLink(item: shareURL) {
          Label("Share comparison", systemImage: "square.and.arrow.up").font(AppTheme.font(14))
        }
      }
    }
    .sheet(isPresented: $picker) {
      NavigationStack {
        Page {
          SearchField(text: $query, placeholder: "Search language models…")
          LazyVStack(spacing: 10) {
            ForEach(
              store.catalog.models.filter {
                $0.isLanguage && $0.legacy != true
                  && (query.isEmpty || $0.name.localizedCaseInsensitiveContains(query))
              }
            ) { model in
              Button {
                store.toggleComparison(model)
                picker = false
              } label: {
                Card {
                  HStack {
                    VStack(alignment: .leading, spacing: 5) {
                      Text(model.name).font(AppTheme.font(16, .semibold))
                      Text(store.catalog.company(for: model)?.name ?? "").font(AppTheme.font(12))
                        .foregroundStyle(AppTheme.muted)
                    }
                    Spacer()
                    Image(
                      systemName: store.comparedIDs.contains(model.id)
                        ? "checkmark.circle.fill" : "plus.circle")
                  }
                }
              }.buttonStyle(.plain)
            }
          }
        }.navigationTitle("Choose a model").navigationBarTitleDisplayMode(.inline).toolbar {
          ToolbarItem(placement: .topBarTrailing) { Button("Done") { picker = false } }
        }
      }.preferredColorScheme(.dark)
    }
  }
  private func scoreCard(_ model: AIModel) -> some View {
    let scores = ModelScores(model)
    return Card {
      VStack(alignment: .leading, spacing: 16) {
        Text(model.name).font(AppTheme.font(18, .semibold))
        ForEach(awards(for: model), id: \.self) { Badge(text: $0, color: AppTheme.light) }
        HStack(alignment: .firstTextBaseline) {
          Text("\(Int(scores.overall.rounded()))").font(AppTheme.font(42, .semibold))
            .foregroundStyle(AppTheme.light)
          Text("/ 100").foregroundStyle(AppTheme.muted)
        }
        ForEach(
          Array(["Quality", "Speed", "Context", "Value", "Versatility"].enumerated()), id: \.offset
        ) { index, title in
          VStack(spacing: 5) {
            HStack {
              Text(title)
              Spacer()
              Text(scores.values[index].map { String(Int($0.rounded())) } ?? "—")
            }.font(AppTheme.font(12))
            ProgressView(value: scores.values[index] ?? 0, total: 100).tint(AppTheme.accent)
          }
        }
        Button("View model & sources") { store.show(.model(model.id)) }.font(
          AppTheme.font(12, .medium))
      }
    }
  }
  private func awards(for model: AIModel) -> [String] {
    let titles = ["Best quality", "Fastest", "Most context", "Best value", "Most versatile"]
    func raw(_ model: AIModel, _ dim: Int) -> Double? {
      switch dim {
      case 0:
        return model.capabilities.isEmpty
          ? nil
          : model.capabilities.map(\.ratingValue).reduce(0, +) / Double(model.capabilities.count)
      case 1: return ModelScores.parseSpeed(model.specs.tokensPerSecond)
      case 2: return model.specs.contextWindow > 0 ? Double(model.specs.contextWindow) : nil
      case 3:
        return model.pricing?.inputPricePerMillionTokens.map {
          $0 * (model.pricing?.freeTierAvailable == true ? 0.75 : 1)
        }
      default: return Double(model.specs.inputModalities.count + model.specs.outputModalities.count)
      }
    }
    return (0..<5).compactMap { dim in
      guard let value = raw(model, dim) else { return nil }
      let values = models.compactMap { raw($0, dim) }
      let best = dim == 3 ? values.min() : values.max()
      return best == value ? titles[dim] : nil
    }
  }
  private func comparisonRow(_ label: String, values: [String], header: Bool = false) -> some View {
    HStack(alignment: .top, spacing: 0) {
      Text(label).foregroundStyle(AppTheme.muted).frame(width: 115, alignment: .leading)
      ForEach(Array(values.enumerated()), id: \.offset) { _, value in
        Text(value).frame(width: 175, alignment: .leading)
      }
    }.font(AppTheme.font(13, header ? .semibold : .regular)).padding(14).overlay(alignment: .bottom)
    { Rectangle().fill(AppTheme.line).frame(height: 1) }
  }
  private var shareURL: URL {
    var c = URLComponents(string: "https://web-tau-peach-63.vercel.app/compare")!
    c.queryItems = [URLQueryItem(name: "models", value: models.map(\.id).joined(separator: ","))]
    return c.url!
  }
}
