//
//  SourcesView.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import SwiftUI

struct SourcesView: View {
    let allSources = AIDataProvider.shared.allSources
    @State private var selectedType: SourceType? = nil
    @State private var searchText = ""
    @Environment(\.openURL) private var openURL
    
    var filteredSources: [Source] {
        var sources = allSources
        
        if let type = selectedType {
            sources = sources.filter { $0.type == type }
        }
        
        if !searchText.isEmpty {
            sources = sources.filter { source in
                source.title.localizedCaseInsensitiveContains(searchText) ||
                source.url.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return sources
    }
    
    var sourceTypeCounts: [SourceType: Int] {
        var counts: [SourceType: Int] = [:]
        for type in SourceType.allCases {
            counts[type] = allSources.filter { $0.type == type }.count
        }
        return counts
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                AnimatedBackground()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Header
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Sources")
                                        .font(.system(size: 28, weight: .black, design: .rounded))
                                        .foregroundColor(AppTheme.textPrimary)
                                    
                                    Text("\(allSources.count) verified sources")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(AppTheme.textSecondary)
                                }
                                
                                Spacer()
                                
                                Image(systemName: "link.badge.plus")
                                    .font(.system(size: 32))
                                    .foregroundStyle(
                                        LinearGradient(
                                            colors: [AppTheme.accent, .cyan],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 10)
                        
                        // Search
                        HStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 16))
                                .foregroundColor(AppTheme.textTertiary)
                            
                            TextField("Search sources...", text: $searchText)
                                .font(.system(size: 15))
                                .foregroundColor(AppTheme.textPrimary)
                        }
                        .padding(14)
                        .background(AppTheme.cardBackground)
                        .cornerRadius(12)
                        .padding(.horizontal, 20)
                        
                        // Type filters
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                FilterChip(
                                    title: "All",
                                    count: allSources.count,
                                    isSelected: selectedType == nil,
                                    color: AppTheme.accent
                                ) {
                                    selectedType = nil
                                }
                                
                                ForEach(SourceType.allCases, id: \.self) { type in
                                    FilterChip(
                                        title: type.rawValue,
                                        icon: type.icon,
                                        count: sourceTypeCounts[type] ?? 0,
                                        isSelected: selectedType == type,
                                        color: colorForSourceType(type)
                                    ) {
                                        selectedType = type
                                    }
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                        
                        // Sources list
                        LazyVStack(spacing: 10) {
                            ForEach(filteredSources) { source in
                                Button {
                                    if let url = URL(string: source.url) {
                                        openURL(url)
                                    }
                                } label: {
                                    SourceListRow(source: source)
                                }
                                .buttonStyle(ScaleButtonStyle())
                            }
                        }
                        .padding(.horizontal, 20)
                        
                        // Info card
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark.seal.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.green)
                                
                                Text("Verified Sources")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(AppTheme.textPrimary)
                            }
                            
                            Text("All information in this app is sourced from official documentation, research papers, and verified reports. We prioritize primary sources and clearly mark when information is uncertain or contested.")
                                .font(.system(size: 13))
                                .foregroundColor(AppTheme.textSecondary)
                            
                            Divider().background(AppTheme.divider)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                SourceTypeInfo(type: .officialDocs, description: "Direct from company websites and documentation")
                                SourceTypeInfo(type: .github, description: "Open source repositories and technical specs")
                                SourceTypeInfo(type: .researchPaper, description: "Peer-reviewed or official research publications")
                                SourceTypeInfo(type: .apiReference, description: "API documentation and technical references")
                            }
                        }
                        .padding(16)
                        .background(AppTheme.cardBackground)
                        .cornerRadius(14)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 100)
                    }
                }
            }
        }
    }
    
    private func colorForSourceType(_ type: SourceType) -> Color {
        switch type {
        case .officialDocs: return .blue
        case .github: return .purple
        case .researchPaper: return .orange
        case .blogPost: return .green
        case .newsArticle: return .cyan
        case .apiReference: return .pink
        }
    }
}

// MARK: - Filter Chip

struct FilterChip: View {
    let title: String
    var icon: String? = nil
    let count: Int
    let isSelected: Bool
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 10))
                }
                
                Text(title)
                    .font(.system(size: 12, weight: .semibold))
                    .lineLimit(1)
                
                Text("\(count)")
                    .font(.system(size: 10, weight: .bold))
                    .padding(.horizontal, 5)
                    .padding(.vertical, 2)
                    .background(isSelected ? Color.white.opacity(0.2) : AppTheme.cardBackgroundLight)
                    .cornerRadius(4)
            }
            .foregroundColor(isSelected ? .white : AppTheme.textSecondary)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(isSelected ? color : AppTheme.cardBackground)
            .cornerRadius(16)
        }
    }
}

// MARK: - Source List Row

struct SourceListRow: View {
    let source: Source
    
    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(colorForType.opacity(0.15))
                    .frame(width: 44, height: 44)
                
                Image(systemName: source.type.icon)
                    .font(.system(size: 18))
                    .foregroundColor(colorForType)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(source.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(AppTheme.textPrimary)
                    .lineLimit(1)
                
                Text(source.url)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(AppTheme.textTertiary)
                    .lineLimit(1)
                
                HStack(spacing: 8) {
                    Text(source.type.rawValue)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(colorForType)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(colorForType.opacity(0.12))
                        .cornerRadius(4)
                    
                    Text("Accessed \(source.dateAccessed.formatted(date: .abbreviated, time: .omitted))")
                        .font(.system(size: 10))
                        .foregroundColor(AppTheme.textTertiary)
                }
            }
            
            Spacer()
            
            Image(systemName: "arrow.up.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(AppTheme.textTertiary)
        }
        .padding(12)
        .background(AppTheme.cardBackground)
        .cornerRadius(12)
    }
    
    var colorForType: Color {
        switch source.type {
        case .officialDocs: return .blue
        case .github: return .purple
        case .researchPaper: return .orange
        case .blogPost: return .green
        case .newsArticle: return .cyan
        case .apiReference: return .pink
        }
    }
}

// MARK: - Source Type Info

struct SourceTypeInfo: View {
    let type: SourceType
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: type.icon)
                .font(.system(size: 12))
                .foregroundColor(colorForType)
                .frame(width: 20)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(type.rawValue)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(AppTheme.textPrimary)
                
                Text(description)
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.textTertiary)
            }
        }
    }
    
    var colorForType: Color {
        switch type {
        case .officialDocs: return .blue
        case .github: return .purple
        case .researchPaper: return .orange
        case .blogPost: return .green
        case .newsArticle: return .cyan
        case .apiReference: return .pink
        }
    }
}

#Preview {
    SourcesView()
}
