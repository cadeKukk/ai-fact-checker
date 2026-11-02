import SwiftUI

extension Color {
  init(hex: String) {
    let value =
      UInt64(hex.trimmingCharacters(in: CharacterSet(charactersIn: "#")), radix: 16) ?? 0x7065f0
    self.init(
      .sRGB, red: Double((value >> 16) & 255) / 255, green: Double((value >> 8) & 255) / 255,
      blue: Double(value & 255) / 255, opacity: 1)
  }
}
enum AppTheme {
  static let background = Color(hex: "0a0a0a")
  static let surface = Color(hex: "161618")
  static let text = Color(hex: "f5f5f5")
  static let soft = Color(hex: "b3b2b8")
  static let muted = Color(hex: "8a8990")
  static let accent = Color(hex: "7065f0")
  static let light = Color(hex: "9fa3fc")
  static let line = Color.white.opacity(0.10)
  static func font(_ size: CGFloat, _ weight: Font.Weight = .regular) -> Font {
    .custom("Outfit", size: size, relativeTo: size >= 30 ? .largeTitle : .body).weight(weight)
  }
  static func status(_ status: String) -> Color {
    switch status {
    case "high", "confirmed", "excellent", "practical": return Color(hex: "22c55e")
    case "medium", "plausible", "good": return Color(hex: "eab308")
    case "low", "misleading", "fair", "training": return Color(hex: "f97316")
    case "busted", "poor", "safety": return Color(hex: "ef4444")
    case "architecture", "exaggerated": return Color(hex: "a855f7")
    case "fundamentals": return Color(hex: "3b82f6")
    case "exceptional": return Color(hex: "2dd4bf")
    default: return light
    }
  }
  static func icon(_ name: String) -> String {
    [
      "Compass": "safari", "Brain": "brain", "Cpu": "cpu", "Network": "network",
      "MessageCircle": "bubble", "AlignLeft": "text.alignleft", "Scale": "scalemass",
      "CheckCircle": "checkmark.circle", "ShieldAlert": "exclamationmark.shield",
      "ShieldCheck": "checkmark.shield", "Layers": "square.3.layers.3d",
      "Database": "externaldrive", "BrainCircuit": "brain", "Bot": "gearshape.2",
      "BarChart3": "chart.bar", "Lock": "lock", "HardDrive": "internaldrive",
      "Sparkles": "sparkles", "Infinity": "infinity", "CircleX": "xmark.circle", "Wind": "wind",
      "Link2": "link", "Moon": "moon", "Terminal": "terminal", "Laptop": "laptopcomputer",
      "Music": "music.note", "Mic": "mic", "Clapperboard": "film", "Globe": "globe",
      "Aperture": "camera.aperture", "Trees": "tree", "Sailboat": "sailboat", "Cog": "gearshape",
      "SquareCode": "chevron.left.forwardslash.chevron.right", "Blocks": "square.stack.3d.up",
      "Hand": "hand.raised", "GitBranch": "arrow.triangle.branch",
    ][name] ?? "cpu"
  }
}
struct Card<Content: View>: View {
  var color: Color = AppTheme.surface
  var border: Color = AppTheme.line
  @ViewBuilder var content: Content
  var body: some View {
    content.padding(16).frame(maxWidth: .infinity, alignment: .leading).background(
      color, in: RoundedRectangle(cornerRadius: 10)
    ).overlay(RoundedRectangle(cornerRadius: 10).stroke(border, lineWidth: 1))
  }
}
struct Page<Content: View>: View {
  @ViewBuilder var content: Content
  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 24) { content }.frame(maxWidth: 850, alignment: .leading)
        .padding(24).frame(maxWidth: .infinity)
    }
    .scrollDismissesKeyboard(.interactively).background(AppTheme.background)
  }
}
struct PageHeader: View {
  let kicker, title, subtitle: String
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Kicker(text: kicker)
      Text(title).font(AppTheme.font(36, .semibold)).tracking(-0.7).fixedSize(
        horizontal: false, vertical: true)
      Text(subtitle).font(AppTheme.font(14)).foregroundStyle(AppTheme.muted).fixedSize(
        horizontal: false, vertical: true)
      Rectangle().fill(AppTheme.line).frame(height: 1).padding(.top, 14)
    }
  }
}
struct Kicker: View {
  let text: String
  var color: Color = AppTheme.light
  var body: some View {
    Text(text.uppercased()).font(AppTheme.font(11, .medium)).tracking(1.8).foregroundStyle(color)
  }
}
struct SectionTitle: View {
  let text: String
  var body: some View {
    Text(text.uppercased()).font(AppTheme.font(14, .semibold)).tracking(0.7).foregroundStyle(
      AppTheme.muted)
  }
}
struct Badge: View {
  let text: String
  var color: Color = AppTheme.light
  var body: some View {
    Text(text).font(AppTheme.font(11, .medium)).foregroundStyle(color).padding(.horizontal, 9)
      .padding(.vertical, 5).background(color.opacity(0.12), in: RoundedRectangle(cornerRadius: 6))
  }
}
struct SearchField: View {
  @Binding var text: String
  var placeholder = "Search"
  var autofocus = false
  @FocusState private var isFocused: Bool
  var body: some View {
    HStack(spacing: 10) {
      Image(systemName: "magnifyingglass").foregroundStyle(AppTheme.muted)
      TextField(placeholder, text: $text).focused($isFocused).font(AppTheme.font(15))
        .autocorrectionDisabled()
        .textInputAutocapitalization(.never)
      if !text.isEmpty {
        Button {
          text = ""
        } label: {
          Image(systemName: "xmark.circle.fill").foregroundStyle(AppTheme.muted)
        }.accessibilityLabel("Clear search")
      }
    }.padding(14).background(AppTheme.surface, in: RoundedRectangle(cornerRadius: 10)).overlay(
      RoundedRectangle(cornerRadius: 10).stroke(AppTheme.line)
    ).onAppear { if autofocus { isFocused = true } }
  }
}
struct PrimaryButton: View {
  let title: String
  var icon = "arrow.right"
  let action: () -> Void
  var body: some View {
    Button(action: action) {
      HStack(spacing: 12) {
        Text(title).font(AppTheme.font(20, .semibold))
        Image(systemName: icon).font(.system(size: 20)).opacity(0.65)
      }.frame(maxWidth: .infinity).padding(.vertical, 21).padding(.horizontal, 12).background(
        AppTheme.accent, in: RoundedRectangle(cornerRadius: 14)
      ).foregroundStyle(.white)
    }.buttonStyle(.plain)
  }
}
struct IconTile: View {
  let icon: String
  var color: Color = AppTheme.light
  var body: some View {
    Image(systemName: icon).font(.system(size: 20)).foregroundStyle(color).frame(
      width: 40, height: 40
    ).background(color.opacity(0.15), in: RoundedRectangle(cornerRadius: 10))
  }
}
struct EmptyResults: View {
  var text = "No results found"
  var body: some View {
    VStack(spacing: 10) {
      Image(systemName: "magnifyingglass").font(.system(size: 26))
      Text(text).font(AppTheme.font(18, .medium))
      Text("Try another search or clear your filters.").font(AppTheme.font(14))
    }.foregroundStyle(AppTheme.muted).frame(maxWidth: .infinity).padding(.vertical, 40)
  }
}
struct FilterChips: View {
  let values: [String]
  @Binding var selected: String
  var labels: [String: String] = [:]
  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 8) {
        ForEach(values, id: \.self) { value in
          Button {
            selected = value
          } label: {
            Text(labels[value] ?? value.capitalized).font(AppTheme.font(12, .medium)).padding(
              .horizontal, 12
            ).padding(.vertical, 10).background(
              selected == value ? AppTheme.accent : AppTheme.surface,
              in: RoundedRectangle(cornerRadius: 10)
            ).overlay(
              RoundedRectangle(cornerRadius: 10).stroke(
                selected == value ? AppTheme.accent : AppTheme.line))
          }.buttonStyle(.plain).accessibilityAddTraits(selected == value ? [.isSelected] : [])
        }
      }
    }
  }
}
struct ReferenceText: View {
  @Environment(AppStore.self) private var store
  let text: String
  var size: CGFloat = 14
  var color: Color = AppTheme.soft
  var body: some View {
    Text(highlighted).font(AppTheme.font(size)).foregroundStyle(color).lineSpacing(5).fixedSize(
      horizontal: false, vertical: true
    )
    .environment(
      \.openURL,
      OpenURLAction { url in
        guard url.scheme == "aifc-ref", let id = url.host else { return .systemAction }
        if url.path == "/term" {
          store.show(.term(id))
        } else if url.path == "/model" {
          store.show(.model(id))
        } else if url.path == "/benchmark" {
          store.show(.benchmark(id))
        }
        return .handled
      })
  }
  private var highlighted: AttributedString {
    var result = AttributedString(text)
    var refs = store.catalog.terms.flatMap { term in
      var names = [term.term]
      if !term.term.hasSuffix("s") { names.append(term.term + "s") }
      if let start = term.term.firstIndex(of: "("), let end = term.term.firstIndex(of: ")"),
        start < end
      {
        names.append(String(term.term[term.term.index(after: start)..<end]))
        names.append(String(term.term[..<start]).trimmingCharacters(in: .whitespaces))
      }
      return names.map { ($0, term.id, "term", AppTheme.status(term.category)) }
    }
    refs += store.catalog.models.map {
      ($0.name, $0.id, "model", Color(hex: store.catalog.company(for: $0)?.accentColor ?? "7065f0"))
    }
    refs += store.catalog.benchmarks.filter { $0.excludeFromInlineHighlight != true }.flatMap { b in
      ([b.name] + (b.aliases ?? [])).map { ($0, b.id, "benchmark", AppTheme.light) }
    }
    var occupied: [Range<String.Index>] = []
    for (name, id, type, tint) in refs.sorted(by: { $0.0.count > $1.0.count }) where name.count > 2
    {
      let pattern =
        "(?<![\\p{L}\\p{N}])" + NSRegularExpression.escapedPattern(for: name) + "(?![\\p{L}\\p{N}])"
      guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) else {
        continue
      }
      for match in regex.matches(in: text, range: NSRange(text.startIndex..., in: text)) {
        guard let range = Range(match.range, in: text),
          !occupied.contains(where: { $0.overlaps(range) }),
          let a = AttributedString.Index(range.lowerBound, within: result),
          let b = AttributedString.Index(range.upperBound, within: result)
        else { continue }
        result[a..<b].link = URL(string: "aifc-ref://\(id)/\(type)")
        result[a..<b].foregroundColor = tint
        result[a..<b].underlineStyle = .single
        occupied.append(range)
      }
    }
    return result
  }
}
struct SourceLinks: View {
  let sources: [Source]
  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      ForEach(sources) { source in
        if let url = URL(string: source.url) {
          Link(destination: url) {
            HStack(alignment: .top, spacing: 7) {
              Image(systemName: "arrow.up.right.square")
              Text(source.title).multilineTextAlignment(.leading)
            }.font(AppTheme.font(12)).foregroundStyle(AppTheme.muted)
          }
        }
      }
    }
  }
}
