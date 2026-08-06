//
//  ModelDetailView.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import SwiftUI

struct ModelDetailView: View {
    let model: AIModel
    let accentColor: Color
    @State private var selectedTab: DetailTab = .overview
    @Environment(\.openURL) private var openURL
    
    enum DetailTab: String, CaseIterable {
        case overview = "Overview"
        case capabilities = "Capabilities"
        case myths = "Myths"
        case sources = "Sources"
        
        var icon: String {
            switch self {
            case .overview: return "doc.text"
            case .capabilities: return "star"
            case .myths: return "exclamationmark.bubble"
            case .sources: return "link"
            }
        }
    }
    
    var body: some View {
        ZStack {
            AnimatedBackground()
            
            VStack(spacing: 0) {
                // Tab selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(DetailTab.allCases, id: \.self) { tab in
                            TabButton(
                                tab: tab,
                                isSelected: selectedTab == tab,
                                accentColor: accentColor,
                                badgeCount: tab == .myths ? model.myths.count : nil
                            ) {
                                withAnimation(.easeInOut(duration: 0.2)) {
                                    selectedTab = tab
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                }
                .background(AppTheme.cardBackground.opacity(0.5))
                
                // Content
                ScrollView {
                    VStack(spacing: 20) {
                        // Model header (always visible)
                        VStack(spacing: 12) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(model.name)
                                        .font(.system(size: 26, weight: .black, design: .rounded))
                                        .foregroundColor(AppTheme.textPrimary)
                                    
                                    Text(model.version)
                                        .font(.system(size: 12, weight: .medium, design: .monospaced))
                                        .foregroundColor(AppTheme.textTertiary)
                                }
                                
                                Spacer()
                                
                                if model.isOpenSource {
                                    OpenSourceBadge()
                                }
                            }
                            
                            Text(model.description)
                                .font(.system(size: 14))
                                .foregroundColor(AppTheme.textSecondary)
                            
                            // Release date
                            HStack(spacing: 6) {
                                Image(systemName: "calendar")
                                    .font(.system(size: 11))
                                Text("Released \(model.releaseDate.formatted(date: .abbreviated, time: .omitted))")
                                    .font(.system(size: 12, weight: .medium))
                            }
                            .foregroundColor(AppTheme.textTertiary)
                        }
                        .padding(20)
                        .background(AppTheme.cardBackground)
                        .cornerRadius(16)
                        .padding(.horizontal, 20)
                        .padding(.top, 10)
                        
                        // Tab content
                        switch selectedTab {
                        case .overview:
                            overviewContent
                        case .capabilities:
                            capabilitiesContent
                        case .myths:
                            mythsContent
                        case .sources:
                            sourcesContent
                        }
                    }
                    .padding(.bottom, 100)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }
    
    // MARK: - Overview Content
    
    @ViewBuilder
    private var overviewContent: some View {
        VStack(spacing: 20) {
            // Specs card
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader("Specifications", icon: "cpu")
                
                VStack(spacing: 0) {
                    SpecRow(icon: "cpu", label: "Parameters", value: model.specs.parameterCount ?? "Unknown", termName: "Parameter")
                    Divider().background(AppTheme.divider)
                    
                    SpecRow(icon: "text.alignleft", label: "Context Window", value: formatTokens(model.specs.contextWindow), termName: "Context Window")
                    Divider().background(AppTheme.divider)
                    
                    SpecRow(icon: "calendar", label: "Training Cutoff", value: model.specs.trainingDataCutoff?.formatted(date: .abbreviated, time: .omitted) ?? "Unknown", termName: "Training Data Cutoff")
                    Divider().background(AppTheme.divider)
                    
                    SpecRow(icon: "gearshape.2", label: "Architecture", value: model.specs.architecture, termName: "Transformer")
                    
                    if let latency = model.specs.averageLatency {
                        Divider().background(AppTheme.divider)
                        SpecRow(icon: "bolt", label: "Avg Latency", value: latency, termName: "Latency")
                    }
                    
                    if let speed = model.specs.tokensPerSecond {
                        Divider().background(AppTheme.divider)
                        SpecRow(icon: "speedometer", label: "Speed", value: speed, termName: "Throughput")
                    }
                    
                    if let resources = model.specs.resourceRequirements {
                        Divider().background(AppTheme.divider)
                        SpecRow(icon: "memorychip", label: "Resources", value: resources, termName: "VRAM")
                    }
                }
                .padding(14)
                .background(AppTheme.cardBackground)
                .cornerRadius(14)
            }
            .padding(.horizontal, 20)
            
            // Modalities
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    SectionHeader("Modalities", icon: "square.stack.3d.up")
                    Spacer()
                    TermLink("Multimodal", display: "What's this?")
                }
                
                HStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Input")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(AppTheme.textTertiary)
                        
                        FlowLayout(spacing: 6) {
                            ForEach(model.specs.inputModalities, id: \.self) { modality in
                                ModalityBadge(modality: modality, isInput: true, accentColor: accentColor)
                            }
                        }
                    }
                    
                    Divider()
                        .frame(height: 50)
                        .background(AppTheme.divider)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Output")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(AppTheme.textTertiary)
                        
                        FlowLayout(spacing: 6) {
                            ForEach(model.specs.outputModalities, id: \.self) { modality in
                                ModalityBadge(modality: modality, isInput: false, accentColor: .purple)
                            }
                        }
                    }
                    
                    Spacer()
                }
                .padding(14)
                .background(AppTheme.cardBackground)
                .cornerRadius(14)
            }
            .padding(.horizontal, 20)
            
            // Pricing
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    SectionHeader("Pricing", icon: "dollarsign.circle")
                    Spacer()
                    TermLink("Token", display: "What's a token?")
                }
                PriceDisplay(pricing: model.pricing)
            }
            .padding(.horizontal, 20)
            
            // Limitations
            if !model.limitations.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    SectionHeader("Known Limitations", icon: "exclamationmark.triangle")
                    
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(model.limitations, id: \.self) { limitation in
                            HStack(alignment: .top, spacing: 10) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 14))
                                    .foregroundColor(.red.opacity(0.8))
                                
                                Text(limitation)
                                    .font(.system(size: 13))
                                    .foregroundColor(AppTheme.textSecondary)
                            }
                        }
                    }
                    .padding(14)
                    .background(Color.red.opacity(0.06))
                    .cornerRadius(14)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(Color.red.opacity(0.15), lineWidth: 1)
                    )
                }
                .padding(.horizontal, 20)
            }
        }
    }
    
    // MARK: - Capabilities Content
    
    @ViewBuilder
    private var capabilitiesContent: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader("Capabilities", icon: "star")
                .padding(.horizontal, 20)
            
            ForEach(model.capabilities) { capability in
                CapabilityRow(capability: capability)
            }
            .padding(.horizontal, 20)
        }
    }
    
    // MARK: - Myths Content
    
    @ViewBuilder
    private var mythsContent: some View {
        VStack(alignment: .leading, spacing: 14) {
            if model.myths.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.green)
                    
                    Text("No Common Myths")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(AppTheme.textPrimary)
                    
                    Text("We haven't identified widely-spread myths or misconceptions about this model yet.")
                        .font(.system(size: 14))
                        .foregroundColor(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(40)
            } else {
                HStack {
                    SectionHeader("Common Myths & Facts", icon: "exclamationmark.bubble")
                    Spacer()
                    TermLink("Hallucination", display: "About AI myths")
                }
                .padding(.horizontal, 20)
                
                // Verdict legend
                HStack(spacing: 16) {
                    ForEach(MythVerdict.allCases, id: \.self) { verdict in
                        HStack(spacing: 4) {
                            Circle()
                                .fill(verdict.color)
                                .frame(width: 8, height: 8)
                            Text(verdict.rawValue)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(AppTheme.textTertiary)
                        }
                    }
                }
                .padding(.horizontal, 20)
                
                ForEach(model.myths) { myth in
                    MythCard(myth: myth)
                }
                .padding(.horizontal, 20)
            }
        }
    }
    
    // MARK: - Sources Content
    
    @ViewBuilder
    private var sourcesContent: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader("Verified Sources", icon: "link")
                .padding(.horizontal, 20)
            
            if model.sources.isEmpty {
                Text("No specific sources for this model")
                    .font(.system(size: 14))
                    .foregroundColor(AppTheme.textTertiary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else {
                ForEach(model.sources) { source in
                    Button {
                        if let url = URL(string: source.url) {
                            openURL(url)
                        }
                    } label: {
                        SourceRow(source: source)
                    }
                    .buttonStyle(ScaleButtonStyle())
                    .padding(.horizontal, 20)
                }
            }
        }
    }
    
    // MARK: - Helpers
    
    private func formatTokens(_ tokens: Int) -> String {
        if tokens >= 1000000 {
            return "\(tokens / 1000000)M tokens"
        } else if tokens >= 1000 {
            return "\(tokens / 1000)K tokens"
        }
        return "\(tokens) tokens"
    }
}

// MARK: - Open Source Badge (Tappable)

struct OpenSourceBadge: View {
    @State private var showingTerm = false
    
    var body: some View {
        Button(action: { showingTerm = true }) {
            VStack(spacing: 2) {
                Image(systemName: "lock.open.fill")
                    .font(.system(size: 20))
                    .foregroundColor(.green)
                HStack(spacing: 2) {
                    Text("Open")
                        .font(.system(size: 9, weight: .bold))
                    Image(systemName: "info.circle")
                        .font(.system(size: 8))
                }
                .foregroundColor(.green)
            }
            .padding(10)
            .background(Color.green.opacity(0.12))
            .cornerRadius(10)
        }
        .sheet(isPresented: $showingTerm) {
            if let term = AITermsData.findTerm(named: "Open Source / Open Weights") {
                TermDefinitionSheet(term: term)
            }
        }
    }
}

// MARK: - Tab Button

struct TabButton: View {
    let tab: ModelDetailView.DetailTab
    let isSelected: Bool
    let accentColor: Color
    let badgeCount: Int?
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: tab.icon)
                    .font(.system(size: 12))
                
                Text(tab.rawValue)
                    .font(.system(size: 13, weight: .semibold))
                
                if let count = badgeCount, count > 0 {
                    Text("\(count)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(isSelected ? accentColor : AppTheme.textTertiary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(
                            isSelected ? Color.white : AppTheme.cardBackgroundLight
                        )
                        .cornerRadius(6)
                }
            }
            .foregroundColor(isSelected ? .white : AppTheme.textSecondary)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isSelected ? accentColor : AppTheme.cardBackground)
            .cornerRadius(20)
        }
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.replacingUnspecifiedDimensions().width,
            subviews: subviews,
            spacing: spacing
        )
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            spacing: spacing
        )
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x,
                                     y: bounds.minY + result.positions[index].y),
                         proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var size: CGSize = .zero
        var positions: [CGPoint] = []
        
        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var rowHeight: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                if x + size.width > maxWidth, x > 0 {
                    x = 0
                    y += rowHeight + spacing
                    rowHeight = 0
                }
                positions.append(CGPoint(x: x, y: y))
                rowHeight = max(rowHeight, size.height)
                x += size.width + spacing
            }
            
            size = CGSize(width: maxWidth, height: y + rowHeight)
        }
    }
}

#Preview {
    NavigationStack {
        ModelDetailView(
            model: AIDataProvider.shared.companies[0].models[0],
            accentColor: AIDataProvider.shared.companies[0].accentColor
        )
    }
}
