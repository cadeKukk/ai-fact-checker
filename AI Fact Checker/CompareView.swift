//
//  CompareView.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import SwiftUI

struct CompareView: View {
    @State private var selectedModels: [AIModel] = []
    @State private var showingModelPicker = false
    @State private var searchText = ""
    
    let allModels = AIDataProvider.shared.allModels
    let companies = AIDataProvider.shared.companies
    
    var body: some View {
        NavigationStack {
            ZStack {
                AnimatedBackground()
                
                VStack(spacing: 0) {
                    // Header
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Compare")
                                    .font(.system(size: 28, weight: .black, design: .rounded))
                                    .foregroundColor(AppTheme.textPrimary)
                                
                                Text("Side-by-side model comparison")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(AppTheme.textSecondary)
                            }
                            
                            Spacer()
                            
                            if !selectedModels.isEmpty {
                                Button(action: { selectedModels = [] }) {
                                    Text("Clear")
                                        .font(.system(size: 13, weight: .semibold))
                                        .foregroundColor(.red)
                                }
                            }
                        }
                        
                        // Selected models chips
                        if !selectedModels.isEmpty {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(selectedModels) { model in
                                        SelectedModelChip(model: model, color: colorForModel(model)) {
                                            withAnimation {
                                                selectedModels.removeAll { $0.id == model.id }
                                            }
                                        }
                                    }
                                    
                                    if selectedModels.count < 4 {
                                        Button(action: { showingModelPicker = true }) {
                                            HStack(spacing: 6) {
                                                Image(systemName: "plus")
                                                    .font(.system(size: 12, weight: .bold))
                                                Text("Add")
                                                    .font(.system(size: 13, weight: .semibold))
                                            }
                                            .foregroundColor(AppTheme.accent)
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 10)
                                            .background(AppTheme.accent.opacity(0.12))
                                            .cornerRadius(20)
                                        }
                                    }
                                }
                            }
                        } else {
                            Button(action: { showingModelPicker = true }) {
                                HStack(spacing: 12) {
                                    Image(systemName: "plus.circle.fill")
                                        .font(.system(size: 20))
                                    
                                    Text("Select models to compare")
                                        .font(.system(size: 15, weight: .medium))
                                }
                                .foregroundColor(AppTheme.accent)
                                .frame(maxWidth: .infinity)
                                .padding(16)
                                .background(AppTheme.cardBackground)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(AppTheme.accent.opacity(0.3), style: StrokeStyle(lineWidth: 2, dash: [8]))
                                )
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16)
                    
                    // Comparison content
                    if selectedModels.count >= 2 {
                        ComparisonTableView(models: selectedModels, companyColors: getCompanyColors())
                    } else if selectedModels.count == 1 {
                        SelectMoreView()
                    } else {
                        EmptyCompareView()
                    }
                }
            }
            .sheet(isPresented: $showingModelPicker) {
                ModelPickerView(
                    allModels: allModels,
                    selectedModels: $selectedModels,
                    companies: companies
                )
            }
        }
    }
    
    private func colorForModel(_ model: AIModel) -> Color {
        for company in companies {
            if company.models.contains(where: { $0.id == model.id }) {
                return company.accentColor
            }
        }
        return AppTheme.accent
    }
    
    private func getCompanyColors() -> [UUID: Color] {
        var colors: [UUID: Color] = [:]
        for model in selectedModels {
            colors[model.id] = colorForModel(model)
        }
        return colors
    }
}

// MARK: - Selected Model Chip

struct SelectedModelChip: View {
    let model: AIModel
    let color: Color
    let onRemove: () -> Void
    
    var body: some View {
        HStack(spacing: 8) {
            Text(model.name)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.white)
            
            Button(action: onRemove) {
                Image(systemName: "xmark")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.white.opacity(0.8))
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(color)
        .cornerRadius(20)
    }
}

// MARK: - Model Picker View

struct ModelPickerView: View {
    let allModels: [AIModel]
    @Binding var selectedModels: [AIModel]
    let companies: [AICompany]
    @State private var searchText = ""
    @Environment(\.dismiss) private var dismiss
    
    var filteredCompanies: [AICompany] {
        if searchText.isEmpty {
            return companies
        }
        return companies.compactMap { company in
            let filteredModels = company.models.filter { model in
                model.name.localizedCaseInsensitiveContains(searchText)
            }
            if filteredModels.isEmpty && !company.name.localizedCaseInsensitiveContains(searchText) {
                return nil
            }
            return company
        }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 16) {
                        // Search
                        HStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 16))
                                .foregroundColor(AppTheme.textTertiary)
                            
                            TextField("Search models...", text: $searchText)
                                .font(.system(size: 15))
                                .foregroundColor(AppTheme.textPrimary)
                        }
                        .padding(14)
                        .background(AppTheme.cardBackground)
                        .cornerRadius(12)
                        .padding(.horizontal, 20)
                        
                        // Models by company
                        ForEach(filteredCompanies) { company in
                            VStack(alignment: .leading, spacing: 10) {
                                HStack(spacing: 10) {
                                    Image(systemName: company.logoSystemImage)
                                        .font(.system(size: 14))
                                        .foregroundColor(company.accentColor)
                                    
                                    Text(company.name)
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(AppTheme.textSecondary)
                                }
                                .padding(.horizontal, 20)
                                
                                ForEach(company.models) { model in
                                    let isSelected = selectedModels.contains { $0.id == model.id }
                                    let isDisabled = selectedModels.count >= 4 && !isSelected
                                    
                                    Button(action: {
                                        if isSelected {
                                            selectedModels.removeAll { $0.id == model.id }
                                        } else if selectedModels.count < 4 {
                                            selectedModels.append(model)
                                        }
                                    }) {
                                        HStack {
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text(model.name)
                                                    .font(.system(size: 15, weight: .semibold))
                                                    .foregroundColor(isDisabled ? AppTheme.textTertiary : AppTheme.textPrimary)
                                                
                                                Text(model.specs.parameterCount ?? "Unknown params")
                                                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                                                    .foregroundColor(AppTheme.textTertiary)
                                            }
                                            
                                            Spacer()
                                            
                                            if isSelected {
                                                Image(systemName: "checkmark.circle.fill")
                                                    .font(.system(size: 20))
                                                    .foregroundColor(company.accentColor)
                                            } else {
                                                Image(systemName: "circle")
                                                    .font(.system(size: 20))
                                                    .foregroundColor(isDisabled ? AppTheme.divider : AppTheme.textTertiary)
                                            }
                                        }
                                        .padding(14)
                                        .background(isSelected ? company.accentColor.opacity(0.1) : AppTheme.cardBackground)
                                        .cornerRadius(12)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(isSelected ? company.accentColor.opacity(0.3) : Color.clear, lineWidth: 1)
                                        )
                                    }
                                    .disabled(isDisabled)
                                    .padding(.horizontal, 20)
                                }
                            }
                        }
                    }
                    .padding(.vertical, 16)
                }
            }
            .navigationTitle("Select Models")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(AppTheme.textSecondary)
                }
                
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(AppTheme.accent)
                        .fontWeight(.semibold)
                        .disabled(selectedModels.count < 2)
                }
            }
        }
    }
}

// MARK: - Comparison Table View

struct ComparisonTableView: View {
    let models: [AIModel]
    let companyColors: [UUID: Color]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Model headers with ranking summary
                ComparisonHeader(models: models, companyColors: companyColors)
                
                // Winner summary
                WinnerSummaryRow(models: models, companyColors: companyColors)
                
                Divider().background(AppTheme.divider)
                
                // Specs comparison
                Group {
                    ComparisonSectionHeader(title: "Specifications", termName: "Parameter")
                    
                    RankedComparisonRow(
                        label: "Parameters",
                        values: models.map { $0.specs.parameterCount ?? "Unknown" },
                        numericValues: models.map { parseParamCount($0.specs.parameterCount) },
                        comparisonType: .higherIsBetter,
                        companyColors: models.map { companyColors[$0.id] ?? AppTheme.accent }
                    )
                    
                    RankedComparisonRow(
                        label: "Context",
                        values: models.map { formatContext($0.specs.contextWindow) },
                        numericValues: models.map { Double($0.specs.contextWindow) },
                        comparisonType: .higherIsBetter,
                        companyColors: models.map { companyColors[$0.id] ?? AppTheme.accent }
                    )
                    
                    ComparisonRow(label: "Architecture", values: models.map { $0.specs.architecture }, highlight: false)
                    
                    RankedComparisonRow(
                        label: "Latency",
                        values: models.map { $0.specs.averageLatency ?? "N/A" },
                        numericValues: models.map { parseLatency($0.specs.averageLatency) },
                        comparisonType: .lowerIsBetter,
                        companyColors: models.map { companyColors[$0.id] ?? AppTheme.accent }
                    )
                    
                    RankedComparisonRow(
                        label: "Speed",
                        values: models.map { $0.specs.tokensPerSecond ?? "N/A" },
                        numericValues: models.map { parseSpeed($0.specs.tokensPerSecond) },
                        comparisonType: .higherIsBetter,
                        companyColors: models.map { companyColors[$0.id] ?? AppTheme.accent }
                    )
                }
                
                Divider().background(AppTheme.divider).padding(.vertical, 8)
                
                // Modalities comparison
                Group {
                    ComparisonSectionHeader(title: "Modalities", termName: "Multimodal")
                    
                    RankedComparisonRow(
                        label: "Input Types",
                        values: models.map { formatModalities($0.specs.inputModalities) },
                        numericValues: models.map { Double($0.specs.inputModalities.count) },
                        comparisonType: .higherIsBetter,
                        companyColors: models.map { companyColors[$0.id] ?? AppTheme.accent }
                    )
                    
                    RankedComparisonRow(
                        label: "Output Types",
                        values: models.map { formatModalities($0.specs.outputModalities) },
                        numericValues: models.map { Double($0.specs.outputModalities.count) },
                        comparisonType: .higherIsBetter,
                        companyColors: models.map { companyColors[$0.id] ?? AppTheme.accent }
                    )
                }
                
                Divider().background(AppTheme.divider).padding(.vertical, 8)
                
                // Features comparison
                Group {
                    ComparisonSectionHeader(title: "Features", termName: "Open Source / Open Weights")
                    
                    ComparisonBoolRow(label: "Open Source", values: models.map { $0.isOpenSource })
                    ComparisonBoolRow(label: "Free Tier", values: models.map { $0.pricing?.freeTierAvailable ?? false })
                }
                
                Divider().background(AppTheme.divider).padding(.vertical, 8)
                
                // Pricing comparison
                Group {
                    ComparisonSectionHeader(title: "Pricing (per 1M tokens)", termName: "Token")
                    
                    RankedComparisonRow(
                        label: "Input Cost",
                        values: models.map { formatPrice($0.pricing?.inputPricePerMillionTokens) },
                        numericValues: models.map { $0.pricing?.inputPricePerMillionTokens },
                        comparisonType: .lowerIsBetter,
                        companyColors: models.map { companyColors[$0.id] ?? AppTheme.accent }
                    )
                    
                    RankedComparisonRow(
                        label: "Output Cost",
                        values: models.map { formatPrice($0.pricing?.outputPricePerMillionTokens) },
                        numericValues: models.map { $0.pricing?.outputPricePerMillionTokens },
                        comparisonType: .lowerIsBetter,
                        companyColors: models.map { companyColors[$0.id] ?? AppTheme.accent }
                    )
                }
                
                // Legend
                ComparisonLegend()
            }
            .background(AppTheme.cardBackground)
            .cornerRadius(16)
            .padding(.horizontal, 20)
            .padding(.bottom, 100)
        }
    }
    
    private func formatContext(_ tokens: Int) -> String {
        if tokens >= 1000000 {
            return "\(tokens / 1000000)M"
        } else if tokens >= 1000 {
            return "\(tokens / 1000)K"
        }
        return "\(tokens)"
    }
    
    private func formatModalities(_ modalities: [Modality]) -> String {
        if modalities.isEmpty { return "Text only" }
        return modalities.map { $0.rawValue }.joined(separator: ", ")
    }
    
    private func formatPrice(_ price: Double?) -> String {
        guard let price = price else { return "N/A" }
        if price == 0 { return "Free" }
        return "$\(String(format: "%.2f", price))"
    }
    
    // Parse parameter count like "70B", "175B", "Undisclosed"
    private func parseParamCount(_ str: String?) -> Double? {
        guard let str = str else { return nil }
        let cleaned = str.lowercased().replacingOccurrences(of: " ", with: "")
        if cleaned.contains("undisclosed") || cleaned.contains("unknown") { return nil }
        
        if cleaned.hasSuffix("t") {
            if let num = Double(cleaned.dropLast()) { return num * 1000 }
        } else if cleaned.hasSuffix("b") {
            if let num = Double(cleaned.dropLast()) { return num }
        } else if cleaned.hasSuffix("m") {
            if let num = Double(cleaned.dropLast()) { return num / 1000 }
        }
        
        // Try to extract number from strings like "314B (MoE, 25% active)"
        let pattern = #"(\d+\.?\d*)([btm])"#
        if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
           let match = regex.firstMatch(in: cleaned, range: NSRange(cleaned.startIndex..., in: cleaned)),
           let numRange = Range(match.range(at: 1), in: cleaned),
           let suffixRange = Range(match.range(at: 2), in: cleaned) {
            let num = Double(cleaned[numRange]) ?? 0
            let suffix = cleaned[suffixRange].lowercased()
            switch suffix {
            case "t": return num * 1000
            case "b": return num
            case "m": return num / 1000
            default: return nil
            }
        }
        
        return nil
    }
    
    // Parse latency like "~500ms", "~300ms", "10-60 seconds"
    private func parseLatency(_ str: String?) -> Double? {
        guard let str = str else { return nil }
        let cleaned = str.lowercased().replacingOccurrences(of: "~", with: "").replacingOccurrences(of: " ", with: "")
        
        if cleaned.contains("n/a") { return nil }
        
        // Handle "10-60 seconds" - take average
        if cleaned.contains("-") && cleaned.contains("second") {
            let parts = cleaned.replacingOccurrences(of: "seconds", with: "").split(separator: "-")
            if parts.count == 2, let low = Double(parts[0]), let high = Double(parts[1]) {
                return (low + high) / 2 * 1000 // convert to ms
            }
        }
        
        if cleaned.hasSuffix("ms") {
            return Double(cleaned.dropLast(2))
        } else if cleaned.hasSuffix("s") {
            if let num = Double(cleaned.dropLast()) { return num * 1000 }
        }
        
        return Double(cleaned)
    }
    
    // Parse speed like "~100 tokens/s", "~150 tokens/s"
    private func parseSpeed(_ str: String?) -> Double? {
        guard let str = str else { return nil }
        let cleaned = str.lowercased().replacingOccurrences(of: "~", with: "").replacingOccurrences(of: " ", with: "")
        
        if cleaned.contains("n/a") || cleaned.contains("varies") { return nil }
        
        // Extract first number
        let pattern = #"(\d+\.?\d*)"#
        if let regex = try? NSRegularExpression(pattern: pattern),
           let match = regex.firstMatch(in: cleaned, range: NSRange(cleaned.startIndex..., in: cleaned)),
           let range = Range(match.range(at: 1), in: cleaned) {
            return Double(cleaned[range])
        }
        
        return nil
    }
}

// MARK: - Comparison Type

enum ComparisonType {
    case higherIsBetter
    case lowerIsBetter
    case neutral
}

// MARK: - Winner Summary Row

struct WinnerSummaryRow: View {
    let models: [AIModel]
    let companyColors: [UUID: Color]
    
    var modelScores: [UUID: Int] {
        var scores: [UUID: Int] = [:]
        for model in models {
            scores[model.id] = 0
        }
        
        // Context window (higher is better)
        if let bestIdx = models.indices.max(by: { models[$0].specs.contextWindow < models[$1].specs.contextWindow }) {
            scores[models[bestIdx].id, default: 0] += 1
        }
        
        // Free tier available
        for model in models where model.pricing?.freeTierAvailable == true {
            scores[model.id, default: 0] += 1
        }
        
        // Input modalities count
        if let bestIdx = models.indices.max(by: { models[$0].specs.inputModalities.count < models[$1].specs.inputModalities.count }) {
            scores[models[bestIdx].id, default: 0] += 1
        }
        
        // Cheaper input pricing (lower is better)
        let pricesInput = models.compactMap { ($0.id, $0.pricing?.inputPricePerMillionTokens) }
            .filter { $0.1 != nil }
            .map { ($0.0, $0.1!) }
        if let cheapest = pricesInput.min(by: { $0.1 < $1.1 }) {
            scores[cheapest.0, default: 0] += 1
        }
        
        return scores
    }
    
    var body: some View {
        VStack(spacing: 8) {
            HStack(spacing: 0) {
                Text("Score")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(AppTheme.textTertiary)
                    .frame(width: 100, alignment: .leading)
                
                ForEach(models) { model in
                    let score = modelScores[model.id] ?? 0
                    let color = companyColors[model.id] ?? AppTheme.accent
                    
                    VStack(spacing: 4) {
                        HStack(spacing: 2) {
                            ForEach(0..<score, id: \.self) { _ in
                                Image(systemName: "star.fill")
                                    .font(.system(size: 8))
                                    .foregroundColor(.yellow)
                            }
                        }
                        .frame(height: 12)
                        
                        // Score bar
                        GeometryReader { geo in
                            let maxScore = modelScores.values.max() ?? 1
                            let width = geo.size.width * CGFloat(score) / CGFloat(max(maxScore, 1))
                            
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(AppTheme.divider)
                                    .frame(height: 4)
                                
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(color)
                                    .frame(width: max(width, 0), height: 4)
                            }
                        }
                        .frame(height: 4)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.horizontal, 4)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(AppTheme.cardBackgroundLight.opacity(0.3))
        }
    }
}

// MARK: - Ranked Comparison Row

struct RankedComparisonRow: View {
    let label: String
    let values: [String]
    let numericValues: [Double?]
    let comparisonType: ComparisonType
    let companyColors: [Color]
    
    var rankings: [Int] {
        // Calculate rank for each value (1 = best)
        let validIndices = numericValues.enumerated().compactMap { $0.element != nil ? $0.offset : nil }
        
        if validIndices.isEmpty {
            return Array(repeating: 0, count: values.count)
        }
        
        let sorted: [Int]
        switch comparisonType {
        case .higherIsBetter:
            sorted = validIndices.sorted { (numericValues[$0] ?? 0) > (numericValues[$1] ?? 0) }
        case .lowerIsBetter:
            sorted = validIndices.sorted { (numericValues[$0] ?? Double.infinity) < (numericValues[$1] ?? Double.infinity) }
        case .neutral:
            return Array(repeating: 0, count: values.count)
        }
        
        var ranks = Array(repeating: 0, count: values.count)
        for (rank, idx) in sorted.enumerated() {
            ranks[idx] = rank + 1
        }
        
        // Mark invalid values as 0 (no rank)
        for i in 0..<numericValues.count {
            if numericValues[i] == nil {
                ranks[i] = 0
            }
        }
        
        return ranks
    }
    
    func colorForRank(_ rank: Int, total: Int) -> Color {
        if rank == 0 { return AppTheme.textTertiary }
        if total <= 1 { return AppTheme.textPrimary }
        
        let validCount = rankings.filter { $0 > 0 }.count
        if validCount <= 1 { return AppTheme.textPrimary }
        
        // Gradient from green (best) to red (worst)
        let progress = Double(rank - 1) / Double(validCount - 1)
        
        if progress < 0.33 {
            return .green
        } else if progress < 0.66 {
            return .yellow
        } else {
            return .orange
        }
    }
    
    func backgroundColorForRank(_ rank: Int, total: Int) -> Color {
        colorForRank(rank, total: total).opacity(0.12)
    }
    
    private var valueIndices: [Int] {
        Array(0..<values.count)
    }
    
    var body: some View {
        HStack(spacing: 0) {
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(AppTheme.textSecondary)
                .frame(width: 100, alignment: .leading)
            
            ForEach(valueIndices, id: \.self) { index in
                RankedValueCell(
                    value: values[index],
                    numericValue: numericValues[index],
                    rank: rankings[index],
                    validCount: rankings.filter { $0 > 0 }.count,
                    comparisonType: comparisonType,
                    companyColor: companyColors[index],
                    allNumericValues: numericValues
                )
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 4)
    }
}

// MARK: - Ranked Value Cell

struct RankedValueCell: View {
    let value: String
    let numericValue: Double?
    let rank: Int
    let validCount: Int
    let comparisonType: ComparisonType
    let companyColor: Color
    let allNumericValues: [Double?]
    
    var rankColor: Color {
        if rank == 0 { return AppTheme.textTertiary }
        if validCount <= 1 { return AppTheme.textPrimary }
        
        let progress = Double(rank - 1) / Double(max(validCount - 1, 1))
        
        if progress < 0.33 {
            return .green
        } else if progress < 0.66 {
            return .yellow
        } else {
            return .orange
        }
    }
    
    var backgroundColor: Color {
        rankColor.opacity(0.12)
    }
    
    var body: some View {
        VStack(spacing: 4) {
            // Value with rank indicator
            HStack(spacing: 4) {
                if rank == 1 && validCount > 1 {
                    Image(systemName: "crown.fill")
                        .font(.system(size: 8))
                        .foregroundColor(.yellow)
                }
                
                Text(value)
                    .font(.system(size: 11, weight: rank == 1 ? .bold : .regular, design: .monospaced))
                    .foregroundColor(rank > 0 ? rankColor : AppTheme.textTertiary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            
            // Comparison bar
            if let numValue = numericValue, rank > 0 {
                let maxValue = allNumericValues.compactMap { $0 }.max() ?? 1
                let minValue = allNumericValues.compactMap { $0 }.min() ?? 0
                let range = maxValue - minValue
                let normalizedValue: CGFloat = range > 0 ? CGFloat((numValue - minValue) / range) : 1.0
                
                GeometryReader { geo in
                    let barWidth: CGFloat = {
                        switch comparisonType {
                        case .higherIsBetter:
                            return geo.size.width * normalizedValue
                        case .lowerIsBetter:
                            return geo.size.width * (1 - normalizedValue)
                        case .neutral:
                            return geo.size.width * 0.5
                        }
                    }()
                    
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(AppTheme.divider)
                            .frame(height: 3)
                        
                        RoundedRectangle(cornerRadius: 2)
                            .fill(
                                LinearGradient(
                                    colors: [companyColor.opacity(0.7), rankColor],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: max(barWidth, 4), height: 3)
                    }
                }
                .frame(height: 3)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 6)
        .padding(.horizontal, 4)
        .background(rank == 1 && validCount > 1 ? backgroundColor : Color.clear)
        .cornerRadius(6)
    }
}

// MARK: - Comparison Legend

struct ComparisonLegend: View {
    var body: some View {
        VStack(spacing: 8) {
            Divider().background(AppTheme.divider)
            
            HStack(spacing: 16) {
                LegendItem(color: .green, label: "Best")
                LegendItem(color: .yellow, label: "Good")
                LegendItem(color: .orange, label: "Lower")
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: "crown.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.yellow)
                    Text("Winner")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(AppTheme.textTertiary)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
        }
    }
}

struct LegendItem: View {
    let color: Color
    let label: String
    
    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(AppTheme.textTertiary)
        }
    }
}

// MARK: - Comparison Section Header

struct ComparisonSectionHeader: View {
    let title: String
    var termName: String? = nil
    @State private var showingTerm = false
    
    var body: some View {
        HStack {
            Text(title.uppercased())
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(AppTheme.accent)
                .tracking(1)
            
            if let termName = termName {
                Button(action: { showingTerm = true }) {
                    Image(systemName: "questionmark.circle")
                        .font(.system(size: 11))
                        .foregroundColor(AppTheme.accent.opacity(0.7))
                }
                .sheet(isPresented: $showingTerm) {
                    if let term = AITermsData.findTerm(named: termName) {
                        TermDefinitionSheet(term: term)
                    }
                }
            }
            
            Spacer()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(AppTheme.accent.opacity(0.08))
    }
}

// MARK: - Comparison Bool Row

struct ComparisonBoolRow: View {
    let label: String
    let values: [Bool]
    
    var body: some View {
        HStack(spacing: 0) {
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(AppTheme.textSecondary)
                .frame(width: 100, alignment: .leading)
            
            ForEach(values.indices, id: \.self) { index in
                HStack {
                    Image(systemName: values[index] ? "checkmark.circle.fill" : "xmark.circle")
                        .font(.system(size: 14))
                        .foregroundColor(values[index] ? .green : .red.opacity(0.6))
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
    }
}

// MARK: - Empty Compare View

struct EmptyCompareView: View {
    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Image(systemName: "arrow.left.arrow.right.circle")
                .font(.system(size: 60))
                .foregroundStyle(
                    LinearGradient(
                        colors: [AppTheme.accent.opacity(0.6), .purple.opacity(0.6)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            Text("Compare AI Models")
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(AppTheme.textPrimary)
            
            Text("Select 2-4 models to compare their specs, capabilities, and pricing side by side.")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Spacer()
        }
    }
}

// MARK: - Select More View

struct SelectMoreView: View {
    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            
            Image(systemName: "plus.circle")
                .font(.system(size: 48))
                .foregroundColor(AppTheme.textTertiary)
            
            Text("Select at least one more model")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(AppTheme.textSecondary)
            
            Text("Tap '+ Add' to select another model for comparison")
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textTertiary)
            
            Spacer()
        }
    }
}

#Preview {
    CompareView()
}
