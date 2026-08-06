//
//  Components.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import SwiftUI

// MARK: - App Theme

struct AppTheme {
    static let backgroundGradient = LinearGradient(
        colors: [
            Color(red: 0.05, green: 0.05, blue: 0.08),
            Color(red: 0.08, green: 0.08, blue: 0.12),
            Color(red: 0.05, green: 0.07, blue: 0.10)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let cardBackground = Color(red: 0.12, green: 0.12, blue: 0.15)
    static let cardBackgroundLight = Color(red: 0.15, green: 0.15, blue: 0.18)
    static let textPrimary = Color.white
    static let textSecondary = Color(white: 0.7)
    static let textTertiary = Color(white: 0.5)
    static let divider = Color(white: 0.2)
    static let accent = Color(red: 0.4, green: 0.7, blue: 1.0)
}

// MARK: - Company Card

struct CompanyCard: View {
    let company: AICompany
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(company.accentColor.opacity(0.2))
                        .frame(width: 50, height: 50)
                    
                    Image(systemName: company.logoSystemImage)
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundColor(company.accentColor)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(company.name)
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                        .foregroundColor(AppTheme.textPrimary)
                    
                    Text("\(company.models.count) models")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(company.accentColor)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(AppTheme.textTertiary)
            }
            
            Text(company.description)
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textSecondary)
                .lineLimit(2)
            
            HStack(spacing: 6) {
                ForEach(company.models.prefix(3)) { model in
                    Text(model.name)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(company.accentColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(company.accentColor.opacity(0.15))
                        .cornerRadius(6)
                }
                
                if company.models.count > 3 {
                    Text("+\(company.models.count - 3)")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(AppTheme.textTertiary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(AppTheme.cardBackgroundLight)
                        .cornerRadius(6)
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(AppTheme.cardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(company.accentColor.opacity(0.2), lineWidth: 1)
                )
        )
    }
}

// MARK: - Model Card

struct ModelCard: View {
    let model: AIModel
    let accentColor: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(model.name)
                        .font(.system(size: 17, weight: .bold, design: .rounded))
                        .foregroundColor(AppTheme.textPrimary)
                    
                    Text(model.version)
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundColor(AppTheme.textTertiary)
                }
                
                Spacer()
                
                if model.isOpenSource {
                    Label("Open Source", systemImage: "lock.open.fill")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.green)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.green.opacity(0.15))
                        .cornerRadius(6)
                }
            }
            
            Text(model.description)
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textSecondary)
                .lineLimit(2)
            
            Divider()
                .background(AppTheme.divider)
            
            HStack(spacing: 16) {
                StatBadge(
                    icon: "cpu",
                    label: "Params",
                    value: model.specs.parameterCount ?? "Unknown"
                )
                
                StatBadge(
                    icon: "text.alignleft",
                    label: "Context",
                    value: formatContextWindow(model.specs.contextWindow)
                )
                
                if !model.myths.isEmpty {
                    StatBadge(
                        icon: "exclamationmark.bubble",
                        label: "Myths",
                        value: "\(model.myths.count)"
                    )
                }
            }
            
            // Modality badges
            HStack(spacing: 6) {
                ForEach(model.specs.inputModalities, id: \.self) { modality in
                    ModalityBadge(modality: modality, isInput: true, accentColor: accentColor)
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(AppTheme.cardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(accentColor.opacity(0.15), lineWidth: 1)
                )
        )
    }
    
    private func formatContextWindow(_ tokens: Int) -> String {
        if tokens >= 1000000 {
            return "\(tokens / 1000000)M"
        } else if tokens >= 1000 {
            return "\(tokens / 1000)K"
        }
        return "\(tokens)"
    }
}

// MARK: - Stat Badge

struct StatBadge: View {
    let icon: String
    let label: String
    let value: String
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textTertiary)
            
            Text(value)
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(AppTheme.textPrimary)
            
            Text(label)
                .font(.system(size: 9, weight: .medium))
                .foregroundColor(AppTheme.textTertiary)
        }
        .frame(minWidth: 50)
    }
}

// MARK: - Modality Badge

struct ModalityBadge: View {
    let modality: Modality
    let isInput: Bool
    let accentColor: Color
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: modality.icon)
                .font(.system(size: 10))
            Text(modality.rawValue)
                .font(.system(size: 10, weight: .medium))
        }
        .foregroundColor(accentColor)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(accentColor.opacity(0.12))
        .cornerRadius(6)
    }
}

// MARK: - Myth Card

struct MythCard: View {
    let myth: Myth
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                Image(systemName: myth.verdict.icon)
                    .font(.system(size: 22))
                    .foregroundColor(myth.verdict.color)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(myth.verdict.rawValue.uppercased())
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(myth.verdict.color)
                    
                    Text(myth.claim)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(AppTheme.textPrimary)
                }
                
                Spacer()
            }
            
            Text(myth.explanation)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            
            if let source = myth.source {
                HStack(spacing: 6) {
                    Image(systemName: "link")
                        .font(.system(size: 10))
                    Text(source.title)
                        .font(.system(size: 11, weight: .medium))
                }
                .foregroundColor(AppTheme.accent)
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(myth.verdict.color.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(myth.verdict.color.opacity(0.25), lineWidth: 1)
                )
        )
    }
}

// MARK: - Capability Row

struct CapabilityRow: View {
    let capability: Capability
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(capability.name)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(AppTheme.textPrimary)
                
                Spacer()
                
                if capability.isVerified {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 12))
                        .foregroundColor(.blue)
                }
                
                Text(capability.rating.label)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(capability.rating.color)
            }
            
            Text(capability.description)
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textSecondary)
            
            // Rating bar
            HStack(spacing: 3) {
                ForEach(1...5, id: \.self) { level in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(level <= capability.rating.rawValue ? capability.rating.color : AppTheme.divider)
                        .frame(height: 4)
                }
            }
        }
        .padding(12)
        .background(AppTheme.cardBackgroundLight.opacity(0.5))
        .cornerRadius(10)
    }
}

// MARK: - Spec Row

struct SpecRow: View {
    let icon: String
    let label: String
    let value: String
    var termName: String? = nil
    @State private var showingTerm = false
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.accent)
                .frame(width: 24)
            
            // Label with optional term link
            if let termName = termName {
                Button(action: { showingTerm = true }) {
                    HStack(spacing: 4) {
                        Text(label)
                            .font(.system(size: 14, weight: .medium))
                        Image(systemName: "questionmark.circle")
                            .font(.system(size: 11))
                    }
                    .foregroundColor(AppTheme.accent)
                }
                .sheet(isPresented: $showingTerm) {
                    if let term = AITermsData.findTerm(named: termName) {
                        TermDefinitionSheet(term: term)
                    }
                }
            } else {
                Text(label)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(AppTheme.textSecondary)
            }
            
            Spacer()
            
            Text(value)
                .font(.system(size: 14, weight: .semibold, design: .monospaced))
                .foregroundColor(AppTheme.textPrimary)
        }
        .padding(.vertical, 10)
    }
}

// MARK: - Source Row

struct SourceRow: View {
    let source: Source
    
    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(AppTheme.accent.opacity(0.15))
                    .frame(width: 36, height: 36)
                
                Image(systemName: source.type.icon)
                    .font(.system(size: 14))
                    .foregroundColor(AppTheme.accent)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(source.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(AppTheme.textPrimary)
                    .lineLimit(1)
                
                Text(source.type.rawValue)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(AppTheme.textTertiary)
            }
            
            Spacer()
            
            Image(systemName: "arrow.up.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(AppTheme.textTertiary)
        }
        .padding(12)
        .background(AppTheme.cardBackground)
        .cornerRadius(10)
    }
}

// MARK: - Section Header

struct SectionHeader: View {
    let title: String
    let icon: String?
    
    init(_ title: String, icon: String? = nil) {
        self.title = title
        self.icon = icon
    }
    
    var body: some View {
        HStack(spacing: 8) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(AppTheme.accent)
            }
            
            Text(title)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(AppTheme.textSecondary)
                .textCase(.uppercase)
                .tracking(1)
            
            Spacer()
        }
        .padding(.top, 8)
    }
}

// MARK: - Fact Check Answer Card

struct FactCheckAnswerCard: View {
    let qa: FactCheckQA
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: qa.confidence.icon)
                    .font(.system(size: 24))
                    .foregroundColor(qa.confidence.color)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(qa.confidence.rawValue)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(qa.confidence.color)
                    
                    Text(qa.question)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(AppTheme.textPrimary)
                }
            }
            
            Text(qa.answer)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            
            if !qa.relatedModels.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        Text("Related:")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(AppTheme.textTertiary)
                        
                        ForEach(qa.relatedModels, id: \.self) { model in
                            Text(model)
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(AppTheme.accent)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(AppTheme.accent.opacity(0.12))
                                .cornerRadius(6)
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(qa.confidence.color.opacity(0.06))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(qa.confidence.color.opacity(0.2), lineWidth: 1)
                )
        )
    }
}

// MARK: - Animated Background

struct AnimatedBackground: View {
    @State private var animateGradient = false
    
    var body: some View {
        LinearGradient(
            colors: [
                Color(red: 0.05, green: 0.05, blue: 0.10),
                Color(red: 0.08, green: 0.06, blue: 0.12),
                Color(red: 0.04, green: 0.08, blue: 0.12),
                Color(red: 0.06, green: 0.04, blue: 0.10)
            ],
            startPoint: animateGradient ? .topLeading : .bottomLeading,
            endPoint: animateGradient ? .bottomTrailing : .topTrailing
        )
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeInOut(duration: 8).repeatForever(autoreverses: true)) {
                animateGradient.toggle()
            }
        }
    }
}

// MARK: - Price Display

struct PriceDisplay: View {
    let pricing: Pricing?
    
    var body: some View {
        if let pricing = pricing {
            VStack(alignment: .leading, spacing: 12) {
                if let input = pricing.inputPricePerMillionTokens {
                    HStack {
                        Text("Input")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(AppTheme.textSecondary)
                        Spacer()
                        Text("$\(String(format: "%.2f", input))")
                            .font(.system(size: 14, weight: .bold, design: .monospaced))
                            .foregroundColor(.green) +
                        Text(" / 1M tokens")
                            .font(.system(size: 11))
                            .foregroundColor(AppTheme.textTertiary)
                    }
                }
                
                if let output = pricing.outputPricePerMillionTokens {
                    HStack {
                        Text("Output")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(AppTheme.textSecondary)
                        Spacer()
                        Text("$\(String(format: "%.2f", output))")
                            .font(.system(size: 14, weight: .bold, design: .monospaced))
                            .foregroundColor(.green) +
                        Text(" / 1M tokens")
                            .font(.system(size: 11))
                            .foregroundColor(AppTheme.textTertiary)
                    }
                }
                
                if pricing.freeTierAvailable {
                    HStack(spacing: 6) {
                        Image(systemName: "gift.fill")
                            .font(.system(size: 12))
                        Text("Free tier available")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundColor(.mint)
                }
                
                if let notes = pricing.notes {
                    Text(notes)
                        .font(.system(size: 11))
                        .foregroundColor(AppTheme.textTertiary)
                        .italic()
                }
            }
            .padding(14)
            .background(AppTheme.cardBackgroundLight.opacity(0.5))
            .cornerRadius(12)
        } else {
            Text("Pricing not available")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textTertiary)
                .italic()
        }
    }
}

// MARK: - Comparison Table Header

struct ComparisonHeader: View {
    let models: [AIModel]
    let companyColors: [UUID: Color]
    
    var body: some View {
        HStack(spacing: 0) {
            Text("Spec")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(AppTheme.textSecondary)
                .frame(width: 100, alignment: .leading)
            
            ForEach(models) { model in
                VStack(spacing: 4) {
                    Text(model.name)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(AppTheme.textPrimary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(companyColors[model.id]?.opacity(0.15) ?? AppTheme.cardBackgroundLight)
            }
        }
        .padding(.horizontal, 12)
        .background(AppTheme.cardBackground)
    }
}

// MARK: - Comparison Row

struct ComparisonRow: View {
    let label: String
    let values: [String]
    let highlight: Bool
    
    var body: some View {
        HStack(spacing: 0) {
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(AppTheme.textSecondary)
                .frame(width: 100, alignment: .leading)
            
            ForEach(values.indices, id: \.self) { index in
                Text(values[index])
                    .font(.system(size: 11, weight: highlight ? .bold : .regular, design: .monospaced))
                    .foregroundColor(highlight ? AppTheme.textPrimary : AppTheme.textSecondary)
                    .frame(maxWidth: .infinity)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(highlight ? AppTheme.cardBackgroundLight.opacity(0.3) : Color.clear)
    }
}
