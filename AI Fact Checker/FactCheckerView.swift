//
//  FactCheckerView.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import SwiftUI

struct FactCheckerView: View {
    @State private var searchQuery = ""
    @State private var isSearching = false
    @State private var selectedCategory: QuestionCategory = .all
    @FocusState private var isSearchFocused: Bool
    
    let factCheckQAs = AIDataProvider.shared.factCheckQAs
    
    enum QuestionCategory: String, CaseIterable {
        case all = "All"
        case capabilities = "Capabilities"
        case technical = "Technical"
        case safety = "Safety"
        case business = "Business"
        
        var icon: String {
            switch self {
            case .all: return "square.grid.2x2"
            case .capabilities: return "star"
            case .technical: return "cpu"
            case .safety: return "shield"
            case .business: return "briefcase"
            }
        }
    }
    
    var filteredQAs: [FactCheckQA] {
        if searchQuery.isEmpty {
            return factCheckQAs
        }
        return factCheckQAs.filter { qa in
            qa.question.localizedCaseInsensitiveContains(searchQuery) ||
            qa.answer.localizedCaseInsensitiveContains(searchQuery) ||
            qa.relatedModels.contains { $0.localizedCaseInsensitiveContains(searchQuery) }
        }
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
                                    Text("Fact Checker")
                                        .font(.system(size: 28, weight: .black, design: .rounded))
                                        .foregroundColor(AppTheme.textPrimary)
                                    
                                    Text("Get verified answers about AI")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(AppTheme.textSecondary)
                                }
                                
                                Spacer()
                                
                                Image(systemName: "checkmark.shield.fill")
                                    .font(.system(size: 36))
                                    .foregroundStyle(
                                        LinearGradient(
                                            colors: [AppTheme.accent, .purple],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 10)
                        
                        // Search box
                        VStack(spacing: 12) {
                            HStack(spacing: 12) {
                                Image(systemName: "magnifyingglass")
                                    .font(.system(size: 16))
                                    .foregroundColor(isSearchFocused ? AppTheme.accent : AppTheme.textTertiary)
                                
                                TextField("Ask a question about AI...", text: $searchQuery)
                                    .font(.system(size: 15))
                                    .foregroundColor(AppTheme.textPrimary)
                                    .autocorrectionDisabled()
                                    .focused($isSearchFocused)
                                
                                if !searchQuery.isEmpty {
                                    Button(action: { searchQuery = "" }) {
                                        Image(systemName: "xmark.circle.fill")
                                            .font(.system(size: 16))
                                            .foregroundColor(AppTheme.textTertiary)
                                    }
                                }
                            }
                            .padding(14)
                            .background(AppTheme.cardBackground)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(isSearchFocused ? AppTheme.accent.opacity(0.5) : Color.clear, lineWidth: 2)
                            )
                            
                            // Example questions
                            if searchQuery.isEmpty && !isSearchFocused {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Try asking:")
                                        .font(.system(size: 12, weight: .medium))
                                        .foregroundColor(AppTheme.textTertiary)
                                    
                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: 8) {
                                            ExampleQuestion(text: "Can AI think?", action: { searchQuery = "Can AI actually think" })
                                            ExampleQuestion(text: "Replace programmers?", action: { searchQuery = "replace programmers" })
                                            ExampleQuestion(text: "AI learn from me?", action: { searchQuery = "learn from my conversations" })
                                            ExampleQuestion(text: "Open source vs closed?", action: { searchQuery = "open-source as good" })
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                        
                        // Results
                        VStack(alignment: .leading, spacing: 14) {
                            HStack {
                                Text(searchQuery.isEmpty ? "Common Questions" : "Results")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(AppTheme.textSecondary)
                                    .textCase(.uppercase)
                                    .tracking(1)
                                
                                Spacer()
                                
                                Text("\(filteredQAs.count) answers")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(AppTheme.textTertiary)
                            }
                            .padding(.horizontal, 20)
                            
                            if filteredQAs.isEmpty {
                                NoResultsView(query: searchQuery)
                                    .padding(.horizontal, 20)
                            } else {
                                ForEach(filteredQAs) { qa in
                                    FactCheckAnswerCard(qa: qa)
                                        .transition(.opacity.combined(with: .move(edge: .top)))
                                }
                                .padding(.horizontal, 20)
                            }
                        }
                        
                        // Disclaimer
                        VStack(spacing: 8) {
                            HStack(spacing: 6) {
                                Image(systemName: "info.circle.fill")
                                    .font(.system(size: 12))
                                Text("About our fact checking")
                                    .font(.system(size: 12, weight: .semibold))
                            }
                            .foregroundColor(AppTheme.accent)
                            
                            Text("Answers are based on verified sources and official documentation. AI is evolving rapidly—always verify critical claims with primary sources.")
                                .font(.system(size: 11))
                                .foregroundColor(AppTheme.textTertiary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(16)
                        .background(AppTheme.cardBackground.opacity(0.5))
                        .cornerRadius(12)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 100)
                    }
                }
            }
        }
    }
}

// MARK: - Example Question Pill

struct ExampleQuestion: View {
    let text: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(text)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(AppTheme.accent)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(AppTheme.accent.opacity(0.12))
                .cornerRadius(16)
        }
    }
}

// MARK: - No Results View

struct NoResultsView: View {
    let query: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "questionmark.circle")
                .font(.system(size: 48))
                .foregroundColor(AppTheme.textTertiary)
            
            Text("No matches found")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(AppTheme.textPrimary)
            
            Text("We don't have a pre-written answer for \"\(query)\" yet. Try a different search or browse the common questions.")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("You might find answers in:")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(AppTheme.textTertiary)
                
                HStack(spacing: 8) {
                    SuggestionPill(icon: "building.2", text: "Company pages")
                    SuggestionPill(icon: "cpu", text: "Model details")
                    SuggestionPill(icon: "exclamationmark.bubble", text: "Myth sections")
                }
            }
            .padding(.top, 8)
        }
        .padding(30)
        .frame(maxWidth: .infinity)
        .background(AppTheme.cardBackground)
        .cornerRadius(16)
    }
}

struct SuggestionPill: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 10))
            Text(text)
                .font(.system(size: 11, weight: .medium))
        }
        .foregroundColor(AppTheme.textSecondary)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(AppTheme.cardBackgroundLight)
        .cornerRadius(8)
    }
}

#Preview {
    FactCheckerView()
}
