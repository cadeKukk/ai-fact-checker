//
//  CompanyDetailView.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import SwiftUI

struct CompanyDetailView: View {
    let company: AICompany
    @State private var selectedFilter: ModelFilter = .all
    @Environment(\.openURL) private var openURL
    
    enum ModelFilter: String, CaseIterable {
        case all = "All"
        case openSource = "Open Source"
        case proprietary = "Proprietary"
    }
    
    var filteredModels: [AIModel] {
        switch selectedFilter {
        case .all:
            return company.models
        case .openSource:
            return company.models.filter { $0.isOpenSource }
        case .proprietary:
            return company.models.filter { !$0.isOpenSource }
        }
    }
    
    var body: some View {
        ZStack {
            AnimatedBackground()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Company Header
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(company.accentColor.opacity(0.2))
                                .frame(width: 80, height: 80)
                            
                            Image(systemName: company.logoSystemImage)
                                .font(.system(size: 36, weight: .semibold))
                                .foregroundColor(company.accentColor)
                        }
                        
                        VStack(spacing: 6) {
                            Text(company.name)
                                .font(.system(size: 28, weight: .black, design: .rounded))
                                .foregroundColor(AppTheme.textPrimary)
                            
                            Text("Founded \(company.foundedYear) • \(company.headquarters)")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        
                        Text(company.description)
                            .font(.system(size: 14))
                            .foregroundColor(AppTheme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        // Website link
                        Button {
                            if let url = URL(string: company.website) {
                                openURL(url)
                            }
                        } label: {
                            HStack(spacing: 6) {
                                Image(systemName: "globe")
                                    .font(.system(size: 12))
                                Text(company.website.replacingOccurrences(of: "https://", with: ""))
                                    .font(.system(size: 13, weight: .medium))
                                Image(systemName: "arrow.up.right")
                                    .font(.system(size: 10))
                            }
                            .foregroundColor(company.accentColor)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(company.accentColor.opacity(0.12))
                            .cornerRadius(20)
                        }
                    }
                    .padding(.top, 10)
                    
                    // Filter pills
                    HStack(spacing: 10) {
                        ForEach(ModelFilter.allCases, id: \.self) { filter in
                            let count = countModels(for: filter)
                            Button(action: { selectedFilter = filter }) {
                                HStack(spacing: 6) {
                                    Text(filter.rawValue)
                                        .font(.system(size: 13, weight: .semibold))
                                    
                                    Text("\(count)")
                                        .font(.system(size: 11, weight: .bold))
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(
                                            selectedFilter == filter ?
                                            Color.white.opacity(0.2) :
                                            AppTheme.cardBackgroundLight
                                        )
                                        .cornerRadius(6)
                                }
                                .foregroundColor(selectedFilter == filter ? .white : AppTheme.textSecondary)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(
                                    selectedFilter == filter ?
                                    company.accentColor :
                                    AppTheme.cardBackground
                                )
                                .cornerRadius(20)
                            }
                            .disabled(count == 0)
                            .opacity(count == 0 ? 0.5 : 1)
                        }
                    }
                    .padding(.horizontal)
                    
                    // Models section
                    VStack(alignment: .leading, spacing: 14) {
                        SectionHeader("Models", icon: "cpu")
                            .padding(.horizontal)
                        
                        if filteredModels.isEmpty {
                            Text("No models match this filter")
                                .font(.system(size: 14))
                                .foregroundColor(AppTheme.textTertiary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 40)
                        } else {
                            ForEach(filteredModels) { model in
                                NavigationLink(destination: ModelDetailView(model: model, accentColor: company.accentColor)) {
                                    ModelCard(model: model, accentColor: company.accentColor)
                                }
                                .buttonStyle(ScaleButtonStyle())
                            }
                            .padding(.horizontal)
                        }
                    }
                    
                    // Sources section
                    VStack(alignment: .leading, spacing: 14) {
                        SectionHeader("Company Sources", icon: "link")
                            .padding(.horizontal)
                        
                        ForEach(company.sources) { source in
                            Button {
                                if let url = URL(string: source.url) {
                                    openURL(url)
                                }
                            } label: {
                                SourceRow(source: source)
                            }
                            .buttonStyle(ScaleButtonStyle())
                            .padding(.horizontal)
                        }
                    }
                    .padding(.bottom, 100)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func countModels(for filter: ModelFilter) -> Int {
        switch filter {
        case .all:
            return company.models.count
        case .openSource:
            return company.models.filter { $0.isOpenSource }.count
        case .proprietary:
            return company.models.filter { !$0.isOpenSource }.count
        }
    }
}

#Preview {
    NavigationStack {
        CompanyDetailView(company: AIDataProvider.shared.companies[0])
    }
}
