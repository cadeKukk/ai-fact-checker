// Runs the shipped illustration bundle in WebKit and checks every widget for runtime errors.
import AppKit
import WebKit

final class Verifier: NSObject, WKNavigationDelegate {
  let webView: WKWebView
  let window: NSWindow
  var pending: [String]
  var current = ""
  var passed = 0
  let base = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent(
    "AI Fact Checker/Resources/visuals.html")
  override init() {
    let config = WKWebViewConfiguration()
    config.websiteDataStore = .nonPersistent()
    config.userContentController.addUserScript(
      WKUserScript(
        source:
          "window.__visualErrors=[];window.addEventListener('error',e=>window.__visualErrors.push(e.message));window.addEventListener('unhandledrejection',e=>window.__visualErrors.push(String(e.reason)));",
        injectionTime: .atDocumentStart, forMainFrameOnly: true))
    webView = WKWebView(frame: NSRect(x: 0, y: 0, width: 350, height: 600), configuration: config)
    window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 350, height: 600), styleMask: [.borderless],
      backing: .buffered, defer: false)
    window.contentView = webView
    let catalog =
      try! JSONSerialization.jsonObject(
        with: Data(
          contentsOf: base.deletingLastPathComponent().appendingPathComponent("catalog.json")))
      as! [String: Any]
    pending =
      [
        "layerStack", "attention", "moeRouter", "trainingStages", "thinkingBudget", "agentLoop",
        "chartCrime", "injectionDemo", "quantizeSlider", "tokenizer", "nextWord", "confidenceMeter",
        "quiz", "parameterScale", "neuralNetwork", "embedding",
      ].map { "type=\($0)" }
      + (catalog["playableTermIDs"] as! [String]).map { "type=term&id=\($0)" }
    super.init()
    webView.navigationDelegate = self
  }
  func next() {
    guard !pending.isEmpty else {
      print(
        "Passed \(passed) offline WebKit illustrations at 350pt width, with no JavaScript errors.")
      exit(0)
    }
    current = pending.removeFirst()
    var url = URLComponents(url: base, resolvingAgainstBaseURL: false)!
    url.query = current
    webView.loadFileURL(url.url!, allowingReadAccessTo: base.deletingLastPathComponent())
  }
  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
      self.webView.evaluateJavaScript(
        "JSON.stringify({encoding:document.characterSet,errors:window.__visualErrors,children:document.getElementById('root').children.length,content:document.getElementById('root').innerHTML.length,width:document.documentElement.scrollWidth})"
      ) { result, error in
        guard error == nil, let raw = result as? String, let data = raw.data(using: .utf8),
          let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          let errors = object["errors"] as? [String], errors.isEmpty,
          object["encoding"] as? String == "UTF-8",
          let content = object["content"] as? Int, content > 100,
          let width = object["width"] as? Int, width <= 352
        else {
          print("FAIL \(self.current): \(String(describing:result)) \(String(describing:error))")
          exit(1)
        }
        self.passed += 1
        self.next()
      }
    }
  }
  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    print(error)
    exit(1)
  }
}
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let verifier = Verifier()
verifier.next()
DispatchQueue.main.asyncAfter(deadline: .now() + 90) {
  print("FAIL: illustration test timed out")
  exit(1)
}
app.run()
