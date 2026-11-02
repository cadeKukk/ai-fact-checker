import CoreText
import SwiftUI

@main
struct AI_Fact_CheckerApp: App {
  private let result: Result<Catalog, Error>
  init() {
    if let font = Bundle.main.url(forResource: "Outfit", withExtension: "ttf") {
      CTFontManagerRegisterFontsForURL(font as CFURL, .process, nil)
    }
    result = Result { try Catalog.load() }
    let appearance = UINavigationBarAppearance()
    appearance.configureWithOpaqueBackground()
    appearance.backgroundColor = UIColor(AppTheme.background)
    appearance.shadowColor = UIColor(AppTheme.line)
    appearance.titleTextAttributes = [
      .foregroundColor: UIColor(AppTheme.text),
      .font: UIFont(name: "Outfit", size: 15) ?? UIFont.systemFont(ofSize: 15),
    ]
    UINavigationBar.appearance().standardAppearance = appearance
    UINavigationBar.appearance().scrollEdgeAppearance = appearance
  }
  var body: some Scene {
    WindowGroup {
      switch result {
      case .success(let catalog): AppRoot(catalog: catalog).preferredColorScheme(.dark)
      case .failure:
        ContentUnavailableView(
          "Content unavailable", systemImage: "exclamationmark.triangle",
          description: Text(
            "The bundled catalog could not be loaded. Please reinstall AI Fact Checker.")
        ).preferredColorScheme(.dark)
      }
    }
  }
}
struct AppRoot: View {
  @State private var store: AppStore
  init(catalog: Catalog) { _store = State(initialValue: AppStore(catalog: catalog)) }
  var body: some View {
    ContentView().environment(store).font(AppTheme.font(14)).foregroundStyle(AppTheme.text).tint(
      AppTheme.light
    )
    .onOpenURL { store.handleURL($0) }
    #if DEBUG
    .task {
      // Deterministic simulator navigation; omitted from App Store builds.
      let args = ProcessInfo.processInfo.arguments
      if let index = args.firstIndex(of: "--route"), args.indices.contains(index + 1),
        let url = URL(string: args[index + 1])
      {
        store.handleURL(url)
      }
    }
    #endif
  }
}
