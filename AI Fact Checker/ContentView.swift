import SwiftUI

struct ContentView: View {
  @Environment(AppStore.self) private var store
  @Environment(\.horizontalSizeClass) private var sizeClass
  var body: some View {
    @Bindable var store = store
    HStack(spacing: 0) {
      if sizeClass == .regular { sidebar }
      NavigationStack(path: $store.path) {
        Group {
          switch store.tab {
          case .learn: LearnHomeView()
          case .companies: CompanyListView()
          case .facts: FactCheckerView()
          case .compare: CompareView()
          case .sources: SourcesView()
          }
        }
        .safeAreaInset(edge: .top, spacing: 0) {
          if sizeClass != .regular { mobileHeader }
        }
        .navigationDestination(for: AppRoute.self) { route in RouteView(route: route).id(route) }
        .navigationTitle("").navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .navigationBar)
      }
      .safeAreaInset(edge: .bottom, spacing: 0) {
        if sizeClass != .regular && !immersive { bottomBar }
      }
    }
    .background(AppTheme.background)
    .sheet(
      isPresented: $store.searchOpen,
      onDismiss: {
        if let route = store.pendingReference {
          store.pendingReference = nil
          store.show(route)
        }
      }
    ) {
      SearchView().environment(store).preferredColorScheme(.dark)
    }
    .sheet(
      isPresented: Binding(
        get: { !store.popupPath.isEmpty }, set: { if !$0 { store.popupPath = [] } })
    ) { ReferenceSheet().environment(store).preferredColorScheme(.dark) }
  }
  private var mobileHeader: some View {
    HStack {
      Text("AI Fact Checker").font(AppTheme.font(15, .semibold))
      Spacer()
      Button {
        store.searchOpen = true
      } label: {
        Image(systemName: "magnifyingglass").font(.system(size: 15)).foregroundStyle(AppTheme.muted)
          .frame(width: 32, height: 32).background(
            AppTheme.surface, in: RoundedRectangle(cornerRadius: 8)
          )
          .overlay(RoundedRectangle(cornerRadius: 8).stroke(AppTheme.line)).frame(
            width: 44, height: 44)
      }.buttonStyle(.plain).accessibilityLabel("Search everything").keyboardShortcut(
        "k", modifiers: .command)
    }.padding(.horizontal, 20).frame(height: 56).background(AppTheme.background)
      .overlay(alignment: .bottom) { Rectangle().fill(AppTheme.line).frame(height: 1) }
  }
  private var immersive: Bool {
    if let last = store.path.last {
      switch last {
      case .course, .practice: return true
      default: break
      }
    }
    return false
  }
  private var bottomBar: some View {
    HStack(spacing: 0) {
      ForEach(AppTab.allCases, id: \.self) { tab in
        Button {
          store.select(tab)
        } label: {
          VStack(spacing: 4) {
            Image(systemName: tab.icon).font(
              .system(size: 18, weight: tab == store.tab ? .semibold : .regular))
            Text(tab.rawValue).font(AppTheme.font(10, .medium))
          }.foregroundStyle(tab == store.tab ? AppTheme.light : AppTheme.muted).frame(
            maxWidth: .infinity
          ).padding(.vertical, 12)
        }.buttonStyle(.plain).accessibilityIdentifier("tab-\(tab.rawValue)").accessibilityAddTraits(
          tab == store.tab ? [.isSelected] : [])
      }
    }.background(AppTheme.background).overlay(alignment: .top) {
      Rectangle().fill(AppTheme.line).frame(height: 1)
    }
  }
  private var sidebar: some View {
    VStack(alignment: .leading, spacing: 24) {
      HStack {
        IconTile(icon: "checkmark.shield")
        Text("AI Fact Checker").font(AppTheme.font(17, .semibold))
      }
      Button {
        store.searchOpen = true
      } label: {
        HStack {
          Image(systemName: "magnifyingglass")
          Text("Search anything")
          Spacer()
          Text("⌘K").font(AppTheme.font(11))
        }.foregroundStyle(AppTheme.muted).padding(12).background(
          AppTheme.surface, in: RoundedRectangle(cornerRadius: 8))
      }.keyboardShortcut("k", modifiers: .command)
      VStack(spacing: 5) {
        ForEach(AppTab.allCases, id: \.self) { tab in
          Button {
            store.select(tab)
          } label: {
            HStack(spacing: 12) {
              Image(systemName: tab.icon).frame(width: 20)
              Text(tab.rawValue).font(AppTheme.font(14, .medium))
              Spacer()
            }.padding(13).background(
              tab == store.tab ? AppTheme.accent.opacity(0.14) : .clear,
              in: RoundedRectangle(cornerRadius: 8)
            ).foregroundStyle(tab == store.tab ? AppTheme.light : AppTheme.muted)
          }
        }
      }
      Spacer()
      Text("Verified information.\nBetter understanding.").font(AppTheme.font(12)).foregroundStyle(
        AppTheme.muted)
      Text("v\(store.catalog.version) · \(store.catalog.lastUpdated)").font(AppTheme.font(11))
        .foregroundStyle(AppTheme.muted)
    }.padding(20).frame(width: 240).background(AppTheme.background).overlay(alignment: .trailing) {
      Rectangle().fill(AppTheme.line).frame(width: 1)
    }
  }
}
struct RouteView: View {
  @Environment(AppStore.self) private var store
  let route: AppRoute
  var body: some View {
    Group {
      switch route {
      case .company(let id):
        if let c = store.catalog.companies.first(where: { $0.id == id }) {
          CompanyDetailView(company: c)
        }
      case .model(let id):
        if let m = store.catalog.models.first(where: { $0.id == id }) { ModelDetailView(model: m) }
      case .fact(let id):
        if let f = store.catalog.facts.first(where: { $0.id == id }) { Page { FactCard(fact: f) } }
      case .term(let id):
        if let t = store.catalog.terms.first(where: { $0.id == id }) { TermDetailView(term: t) }
      case .benchmark(let id):
        if let b = store.catalog.benchmarks.first(where: { $0.id == id }) {
          BenchmarkDetailView(benchmark: b)
        }
      case .course(let advanced, let index): CourseView(isAdvanced: advanced, initialIndex: index)
      case .practice: PracticeView()
      case .glossary: TermsView()
      case .about: AboutView()
      }
    }.background(AppTheme.background).toolbar(.visible, for: .navigationBar).toolbar {
      if store.popupPath.isEmpty {
        ToolbarItem(placement: .topBarTrailing) {
          Button {
            store.searchOpen = true
          } label: {
            Image(systemName: "magnifyingglass")
          }.accessibilityLabel("Search everything").keyboardShortcut("k", modifiers: .command)
        }
      }
    }.toolbarBackground(AppTheme.background, for: .navigationBar).toolbarBackground(
      .visible, for: .navigationBar)
  }
}
