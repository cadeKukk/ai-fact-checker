import SwiftUI
import WebKit

/// Only self-contained educational illustrations use WebKit. All navigation,
/// lesson text, search, progress, quizzes, and reference screens are SwiftUI.
struct OfflineIllustration: UIViewRepresentable {
  let type: String
  var color = "#7065f0"
  var termID = ""
  @Binding var height: CGFloat
  func makeCoordinator() -> Coordinator { Coordinator(height: $height) }
  func makeUIView(context: Context) -> WKWebView {
    let config = WKWebViewConfiguration()
    config.websiteDataStore = .nonPersistent()
    config.userContentController.add(context.coordinator, name: "size")
    let webView = WKWebView(frame: .zero, configuration: config)
    webView.isOpaque = false
    webView.backgroundColor = UIColor(Color(hex: "151517"))
    webView.scrollView.isScrollEnabled = false
    webView.scrollView.backgroundColor = webView.backgroundColor
    webView.navigationDelegate = context.coordinator
    webView.accessibilityLabel =
      type == "term" ? "Animated concept illustration" : "Interactive \(type) illustration"
    return webView
  }
  func updateUIView(_ view: WKWebView, context: Context) {
    let key = "\(type)-\(color)-\(termID)"
    guard context.coordinator.loadedKey != key,
      let base = Bundle.main.url(forResource: "visuals", withExtension: "html")
    else { return }
    context.coordinator.loadedKey = key
    var components = URLComponents(url: base, resolvingAgainstBaseURL: false)!
    components.queryItems = [
      URLQueryItem(name: "type", value: type), URLQueryItem(name: "color", value: color),
      URLQueryItem(name: "id", value: termID),
    ]
    if let url = components.url {
      view.loadFileURL(url, allowingReadAccessTo: base.deletingLastPathComponent())
    }
  }
  static func dismantleUIView(_ view: WKWebView, coordinator: Coordinator) {
    view.stopLoading()
    view.configuration.userContentController.removeScriptMessageHandler(forName: "size")
    view.navigationDelegate = nil
  }
  final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
    var loadedKey = ""
    var height: Binding<CGFloat>
    init(height: Binding<CGFloat>) { self.height = height }
    func userContentController(
      _ userContentController: WKUserContentController, didReceive message: WKScriptMessage
    ) {
      guard let number = message.body as? Double, number.isFinite else { return }
      let size = min(max(CGFloat(number), 120), 1600)
      if abs(height.wrappedValue - size) > 1 { height.wrappedValue = size }
    }
    func webView(
      _ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
      decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
      decisionHandler(navigationAction.request.url?.isFileURL == true ? .allow : .cancel)
    }
  }
}
struct LessonVisualView: View {
  @Environment(AppStore.self) private var store
  let visual: LessonVisual
  let color: String
  @State private var height: CGFloat = 280
  @State private var section: AppTab = .learn
  @State private var query = ""
  var body: some View {
    VStack(alignment: .leading, spacing: 14) {
      switch visual.type {
      case "tapTermDemo":
        Kicker(text: "Try it now", color: Color(hex: color))
        ReferenceText(
          text:
            "A neural network learns patterns by adjusting its parameters. Tap a highlighted term, then follow a related term inside its definition.",
          size: 16)
      case "sectionExplorer":
        HStack {
          ForEach(AppTab.allCases, id: \.self) { tab in
            Button {
              section = tab
            } label: {
              Image(systemName: tab.icon).frame(maxWidth: .infinity).frame(height: 44).background(
                tab == section ? Color(hex: color).opacity(0.25) : AppTheme.surface,
                in: RoundedRectangle(cornerRadius: 8))
            }.accessibilityLabel(tab.rawValue)
          }
        }
        Text(section.rawValue).font(AppTheme.font(18, .semibold))
        Text(sectionDescription).font(AppTheme.font(14)).foregroundStyle(AppTheme.soft)
      case "searchDemo":
        SearchField(text: $query, placeholder: "Try “token” or “Claude”…")
        if !query.isEmpty {
          ForEach(
            store.catalog.terms.filter { $0.term.localizedCaseInsensitiveContains(query) }.prefix(3)
          ) { term in
            Button {
              store.show(.term(term.id))
            } label: {
              HStack {
                Text(term.term)
                Spacer()
                Image(systemName: "arrow.up.right")
              }.padding(10).background(AppTheme.surface, in: RoundedRectangle(cornerRadius: 8))
            }
          }
        }
      case "diagram", "flow", "comparison", "scale":
        ForEach(Array(visual.elements.enumerated()), id: \.offset) { index, element in
          if visual.type == "flow" && index > 0 {
            Image(systemName: "arrow.down").frame(maxWidth: .infinity).foregroundStyle(
              Color(hex: color))
          }
          Text(element).font(AppTheme.font(14, .medium)).frame(
            maxWidth: .infinity, alignment: visual.type == "diagram" ? .leading : .center
          ).padding(14).background(
            Color(hex: color).opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
        }
      default:
        OfflineIllustration(type: visual.type, color: color, height: $height).frame(height: height)
          .clipShape(RoundedRectangle(cornerRadius: 10))
      }
      if let caption = visual.caption {
        Text(caption).font(AppTheme.font(12)).italic().foregroundStyle(AppTheme.muted)
      }
    }.padding(12).background(Color(hex: "151517"), in: RoundedRectangle(cornerRadius: 10)).overlay(
      RoundedRectangle(cornerRadius: 10).stroke(Color(hex: color).opacity(0.15)))
  }
  private var sectionDescription: String {
    switch section {
    case .learn: "Start with 9 short lessons, unlock AI in Depth, and test your knowledge."
    case .companies: "Explore the organizations building AI and the models and tools they make."
    case .facts: "Find evidence-backed answers to common questions about AI."
    case .compare: "Compare up to three language models side by side."
    case .sources: "Read the primary sources behind the claims in this app."
    }
  }
}
