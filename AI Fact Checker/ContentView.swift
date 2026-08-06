//
//  ContentView.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .companies
    
    enum Tab: String, CaseIterable {
        case companies = "Companies"
        case factChecker = "Fact Check"
        case compare = "Compare"
        case terms = "Terms"
        case sources = "Sources"
        
        var icon: String {
            switch self {
            case .companies: return "building.2"
            case .factChecker: return "checkmark.shield"
            case .compare: return "arrow.left.arrow.right"
            case .terms: return "text.book.closed"
            case .sources: return "link"
            }
        }
        
        var selectedIcon: String {
            switch self {
            case .companies: return "building.2.fill"
            case .factChecker: return "checkmark.shield.fill"
            case .compare: return "arrow.left.arrow.right.circle.fill"
            case .terms: return "text.book.closed.fill"
            case .sources: return "link.circle.fill"
            }
        }
    }
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Content
            Group {
                switch selectedTab {
                case .companies:
                    CompanyListView()
                case .factChecker:
                    FactCheckerView()
                case .compare:
                    CompareView()
                case .terms:
                    TermsView()
                case .sources:
                    SourcesView()
                }
            }
            
            // Custom Tab Bar
            CustomTabBar(selectedTab: $selectedTab)
        }
        .ignoresSafeArea(.keyboard)
    }
}

// MARK: - Custom Tab Bar

struct CustomTabBar: View {
    @Binding var selectedTab: ContentView.Tab
    @Namespace private var animation
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(ContentView.Tab.allCases, id: \.self) { tab in
                TabBarButton(
                    tab: tab,
                    isSelected: selectedTab == tab,
                    namespace: animation
                ) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        selectedTab = tab
                    }
                }
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 25)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 25)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
                .shadow(color: .black.opacity(0.3), radius: 20, y: 10)
        )
        .padding(.horizontal, 20)
        .padding(.bottom, 8)
    }
}

// MARK: - Tab Bar Button

struct TabBarButton: View {
    let tab: ContentView.Tab
    let isSelected: Bool
    var namespace: Namespace.ID
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                ZStack {
                    if isSelected {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(AppTheme.accent.opacity(0.2))
                            .frame(width: 50, height: 32)
                            .matchedGeometryEffect(id: "background", in: namespace)
                    }
                    
                    Image(systemName: isSelected ? tab.selectedIcon : tab.icon)
                        .font(.system(size: 18, weight: isSelected ? .semibold : .regular))
                        .foregroundColor(isSelected ? AppTheme.accent : AppTheme.textTertiary)
                }
                .frame(height: 32)
                
                Text(tab.rawValue)
                    .font(.system(size: 10, weight: isSelected ? .semibold : .medium))
                    .foregroundColor(isSelected ? AppTheme.accent : AppTheme.textTertiary)
            }
            .frame(maxWidth: .infinity)
        }
    }
}

#Preview {
    ContentView()
}
