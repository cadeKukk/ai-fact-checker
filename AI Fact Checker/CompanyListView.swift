//
//  CompanyListView.swift
//  AI Fact Checker
//
//  Created by Cade Kukk on 2/5/26.
//

import SwiftUI

struct CompanyListView: View {
    let companies = AIDataProvider.shared.companies
    @State private var searchText = ""
    @State private var showingInfo = false
    @State private var showingGettingStarted = false
    
    var filteredCompanies: [AICompany] {
        if searchText.isEmpty {
            return companies
        }
        return companies.filter { company in
            company.name.localizedCaseInsensitiveContains(searchText) ||
            company.models.contains { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                AnimatedBackground()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Getting Started Button
                        Button(action: { showingGettingStarted = true }) {
                            HStack(spacing: 12) {
                                Image(systemName: "questionmark.circle.fill")
                                    .font(.system(size: 20))
                                
                                Text("Don't know where to start?")
                                    .font(.system(size: 15, weight: .semibold))
                                
                                Spacer()
                                
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 14, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .padding(16)
                            .background(
                                LinearGradient(
                                    colors: [AppTheme.accent, Color.purple],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(14)
                        }
                        .buttonStyle(ScaleButtonStyle())
                        .padding(.horizontal, 20)
                        .padding(.top, 10)
                        
                        // Stats row
                        HStack(spacing: 12) {
                            StatPill(
                                icon: "building.2.fill",
                                value: "\(companies.count)",
                                label: "Companies"
                            )
                            
                            StatPill(
                                icon: "cpu.fill",
                                value: "\(AIDataProvider.shared.allModels.count)",
                                label: "Models"
                            )
                            
                            StatPill(
                                icon: "link",
                                value: "\(AIDataProvider.shared.allSources.count)",
                                label: "Sources"
                            )
                            
                            Spacer()
                            
                            Button(action: { showingInfo = true }) {
                                Image(systemName: "info.circle.fill")
                                    .font(.system(size: 22))
                                    .foregroundColor(AppTheme.accent)
                            }
                        }
                        .padding(.horizontal, 20)
                        
                        // Search
                        HStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 16))
                                .foregroundColor(AppTheme.textTertiary)
                            
                            TextField("Search companies or models...", text: $searchText)
                                .font(.system(size: 15))
                                .foregroundColor(AppTheme.textPrimary)
                                .autocorrectionDisabled()
                            
                            if !searchText.isEmpty {
                                Button(action: { searchText = "" }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.system(size: 16))
                                        .foregroundColor(AppTheme.textTertiary)
                                }
                            }
                        }
                        .padding(14)
                        .background(AppTheme.cardBackground)
                        .cornerRadius(12)
                        .padding(.horizontal, 20)
                        
                        // Companies list
                        LazyVStack(spacing: 14) {
                            ForEach(filteredCompanies) { company in
                                NavigationLink(value: company) {
                                    CompanyCard(company: company)
                                }
                                .buttonStyle(ScaleButtonStyle())
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 100)
                    }
                }
            }
            .navigationDestination(for: AICompany.self) { company in
                CompanyDetailView(company: company)
            }
            .sheet(isPresented: $showingInfo) {
                AboutView()
            }
            .fullScreenCover(isPresented: $showingGettingStarted) {
                GettingStartedView()
            }
        }
    }
}

// MARK: - Getting Started View (AI Fundamentals Mini-Course)

struct GettingStartedView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var currentLesson = 0
    
    var currentLessonData: AILesson {
        AIFundamentalsContent.lessons[currentLesson]
    }
    
    var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.06, blue: 0.09)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                ProgressHeader(
                    currentLesson: $currentLesson,
                    totalLessons: AIFundamentalsContent.lessons.count,
                    lessons: AIFundamentalsContent.lessons,
                    onExit: { dismiss() }
                )
                
                // Content - takes most of the space
                TabView(selection: $currentLesson) {
                    ForEach(0..<AIFundamentalsContent.lessons.count, id: \.self) { index in
                        FullScreenLessonView(lesson: AIFundamentalsContent.lessons[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                
                // Navigation
                LessonNavigation(
                    currentLesson: $currentLesson,
                    totalLessons: AIFundamentalsContent.lessons.count,
                    currentColor: currentLessonData.color,
                    onComplete: { dismiss() }
                )
            }
        }
    }
}

// MARK: - Full Screen Lesson View

struct FullScreenLessonView: View {
    let lesson: AILesson
    @State private var heroAppeared = false
    @State private var takeawayAppeared = false
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 10) {
                        Image(systemName: lesson.icon)
                            .font(.system(size: 20))
                            .foregroundColor(lesson.color)
                        
                        Text(lesson.category.uppercased())
                            .font(.system(size: 11, weight: .semibold))
                            .tracking(1)
                            .foregroundColor(AppTheme.textTertiary)
                    }
                    .opacity(heroAppeared ? 1 : 0)
                    
                    Text(lesson.title)
                        .font(.system(size: 26, weight: .bold))
                        .foregroundColor(AppTheme.textPrimary)
                        .opacity(heroAppeared ? 1 : 0)
                        .offset(y: heroAppeared ? 0 : 8)
                    
                    Text(lesson.subtitle)
                        .font(.system(size: 15))
                        .foregroundColor(AppTheme.textSecondary)
                        .lineSpacing(3)
                        .opacity(heroAppeared ? 1 : 0)
                        .offset(y: heroAppeared ? 0 : 8)
                }
                .padding(.top, 8)
                .onAppear {
                    withAnimation(.easeOut(duration: 0.4).delay(0.1)) {
                        heroAppeared = true
                    }
                }
                .onDisappear {
                    heroAppeared = false
                    takeawayAppeared = false
                }
                
                ForEach(lesson.sections.indices, id: \.self) { index in
                    FullScreenSectionCard(section: lesson.sections[index], lessonColor: lesson.color, index: index)
                }
                
                if let takeaway = lesson.keyTakeaway {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Key Takeaway")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(lesson.color)
                            .tracking(0.5)
                        
                        Text(takeaway)
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(AppTheme.textPrimary)
                            .lineSpacing(2)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.cardBackground)
                    .cornerRadius(12)
                    .opacity(takeawayAppeared ? 1 : 0)
                    .onAppear {
                        withAnimation(.easeOut(duration: 0.3).delay(0.2)) {
                            takeawayAppeared = true
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }
}

// MARK: - Full Screen Section Card

struct FullScreenSectionCard: View {
    let section: AILessonSection
    let lessonColor: Color
    let index: Int
    @State private var appeared = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let heading = section.heading {
                HStack(spacing: 8) {
                    Text("\(index + 1)")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundColor(lessonColor)
                    
                    Text(heading)
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(AppTheme.textPrimary)
                }
            }
            
            Text(section.content)
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textSecondary)
                .lineSpacing(4)
            
            if let bullets = section.bullets {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(bullets, id: \.self) { bullet in
                        HStack(alignment: .top, spacing: 8) {
                            Text("•")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(lessonColor)
                            
                            Text(bullet)
                                .font(.system(size: 14))
                                .foregroundColor(AppTheme.textSecondary)
                        }
                    }
                }
            }
            
            if let visual = section.visual {
                FullScreenVisualContent(visual: visual, lessonColor: lessonColor)
            }
        }
        .padding(.vertical, 16)
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 15)
        .onAppear {
            withAnimation(.easeOut(duration: 0.4).delay(Double(index) * 0.08 + 0.1)) {
                appeared = true
            }
        }
        .onDisappear {
            appeared = false
        }
    }
}

// MARK: - Full Screen Visual Content

struct FullScreenVisualContent: View {
    let visual: AILessonVisual
    let lessonColor: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            visualContent
            captionView
        }
        .padding(14)
        .background(AppTheme.cardBackground)
        .cornerRadius(10)
    }
    
    @ViewBuilder
    private var visualContent: some View {
        switch visual.type {
        case .diagram:
            diagramView
        case .comparison:
            comparisonView
        case .flow:
            flowView
        case .scale:
            scaleView
        case .neuralNetwork:
            NeuralNetworkVisual(color: lessonColor)
                .frame(height: 300)
        case .tokenizer:
            TokenizerVisual(color: lessonColor)
        case .nextWord:
            NextWordVisual(color: lessonColor)
        case .confidenceMeter:
            ConfidenceMeterVisual(color: lessonColor)
        case .quiz:
            RedFlagQuizVisual(color: lessonColor)
        }
    }
    
    private var diagramView: some View {
        VStack(spacing: 6) {
            ForEach(visual.elements, id: \.self) { element in
                HStack {
                    Text(element)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(AppTheme.textPrimary)
                    Spacer()
                }
                .padding(10)
                .background(lessonColor.opacity(0.06))
                .cornerRadius(8)
            }
        }
    }
    
    private var comparisonView: some View {
        HStack(spacing: 10) {
            ForEach(visual.elements.indices, id: \.self) { idx in
                VStack {
                    Text(visual.elements[idx])
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(AppTheme.textPrimary)
                        .multilineTextAlignment(.center)
                        .padding(10)
                }
                .frame(maxWidth: .infinity)
                .background(lessonColor.opacity(idx % 2 == 0 ? 0.1 : 0.05))
                .cornerRadius(8)
            }
        }
    }
    
    private var flowView: some View {
        VStack(spacing: 4) {
            ForEach(visual.elements.indices, id: \.self) { idx in
                VStack(spacing: 4) {
                    Text(visual.elements[idx])
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .frame(maxWidth: .infinity)
                        .background(lessonColor.opacity(0.12))
                        .cornerRadius(10)
                    
                    if idx < visual.elements.count - 1 {
                        Image(systemName: "arrow.down")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(lessonColor.opacity(0.6))
                    }
                }
            }
        }
    }
    
    private var scaleView: some View {
        VStack(spacing: 8) {
            HStack(spacing: 2) {
                ForEach(0..<visual.elements.count, id: \.self) { idx in
                    let opacity = 0.2 + Double(idx) * 0.15
                    RoundedRectangle(cornerRadius: 4)
                        .fill(lessonColor.opacity(opacity))
                        .frame(height: 30)
                }
            }
            HStack {
                if let first = visual.elements.first {
                    Text(first)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(AppTheme.textTertiary)
                }
                Spacer()
                if let last = visual.elements.last {
                    Text(last)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(AppTheme.textTertiary)
                }
            }
        }
    }
    
    @ViewBuilder
    private var captionView: some View {
        if let caption = visual.caption {
            Text(caption)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(AppTheme.textTertiary)
                .italic()
                .padding(.top, 4)
        }
    }
    
    private var backgroundView: some View {
        RoundedRectangle(cornerRadius: 10)
            .fill(AppTheme.cardBackground)
    }
}

// MARK: - Progress Header

struct ProgressHeader: View {
    @Binding var currentLesson: Int
    let totalLessons: Int
    let lessons: [AILesson]
    var onExit: (() -> Void)? = nil
    
    var body: some View {
        VStack(spacing: 10) {
            HStack(spacing: 12) {
                if let onExit = onExit {
                    Button(action: onExit) {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(AppTheme.textSecondary)
                    }
                }
                
                Spacer()
                
                Text("\(currentLesson + 1) of \(totalLessons)")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(AppTheme.textTertiary)
            }
            
            HStack(spacing: 3) {
                ForEach(0..<totalLessons, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(index <= currentLesson ? AppTheme.accent : AppTheme.divider)
                        .frame(height: 3)
                        .onTapGesture {
                            withAnimation(.easeInOut(duration: 0.25)) {
                                currentLesson = index
                            }
                        }
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 12)
        .padding(.bottom, 6)
    }
}

// MARK: - Lesson View

struct LessonView: View {
    let lesson: AILesson
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 12) {
                    // Icon and category
                    HStack(spacing: 12) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(lesson.color.opacity(0.2))
                                .frame(width: 50, height: 50)
                            
                            Image(systemName: lesson.icon)
                                .font(.system(size: 24))
                                .foregroundColor(lesson.color)
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(lesson.category.uppercased())
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(lesson.color)
                                .tracking(1)
                            
                            Text(lesson.title)
                                .font(.system(size: 22, weight: .bold, design: .rounded))
                                .foregroundColor(AppTheme.textPrimary)
                        }
                    }
                    
                    Text(lesson.subtitle)
                        .font(.system(size: 15))
                        .foregroundColor(AppTheme.textSecondary)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                
                // Content sections
                ForEach(lesson.sections.indices, id: \.self) { index in
                    LessonSection(section: lesson.sections[index], color: lesson.color)
                }
                
                // Key takeaway
                if let takeaway = lesson.keyTakeaway {
                    KeyTakeawayCard(takeaway: takeaway, color: lesson.color)
                        .padding(.horizontal, 20)
                }
                
                Spacer(minLength: 100)
            }
        }
    }
}

// MARK: - Lesson Section

struct LessonSection: View {
    let section: AILessonSection
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let heading = section.heading {
                Text(heading)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(AppTheme.textPrimary)
            }
            
            Text(section.content)
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textSecondary)
                .lineSpacing(6)
            
            // Visual/diagram if present
            if let visual = section.visual {
                VisualCard(visual: visual, color: color)
            }
            
            // Bullet points if present
            if let bullets = section.bullets {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(bullets, id: \.self) { bullet in
                        HStack(alignment: .top, spacing: 8) {
                            Text("•")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(color)
                            
                            Text(bullet)
                                .font(.system(size: 14))
                                .foregroundColor(AppTheme.textSecondary)
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 20)
    }
}

// MARK: - Visual Card

struct VisualCard: View {
    let visual: AILessonVisual
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            switch visual.type {
            case .diagram:
                DiagramView(visual: visual, color: color)
            case .comparison:
                ComparisonVisual(visual: visual, color: color)
            case .flow:
                FlowVisual(visual: visual, color: color)
            case .scale:
                ScaleVisual(visual: visual, color: color)
            case .neuralNetwork:
                NeuralNetworkVisual(color: color)
            case .tokenizer:
                TokenizerVisual(color: color)
            case .nextWord:
                NextWordVisual(color: color)
            case .confidenceMeter:
                ConfidenceMeterVisual(color: color)
            case .quiz:
                RedFlagQuizVisual(color: color)
            }
            
            if let caption = visual.caption {
                Text(caption)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(AppTheme.textTertiary)
                    .italic()
            }
        }
        .padding(14)
        .background(AppTheme.cardBackground)
        .cornerRadius(10)
    }
}

// MARK: - Neural Network Visual (Animated)

struct NeuralNetworkVisual: View {
    let color: Color
    
    // Animation state
    @State private var phase = 0  // 0=idle, 1=input, 2=layer1, 3=hidden, 4=layer2, 5=output, 6=error, 7=backward, 8=update, 9=done
    @State private var layer1Progress: CGFloat = 0
    @State private var layer2Progress: CGFloat = 0
    @State private var backwardProgress: CGFloat = 0
    @State private var inputGlow = false
    @State private var hiddenGlow = false
    @State private var outputGlow = false
    @State private var showError = false
    @State private var weightScale: CGFloat = 1.0
    
    let inputNodes = 3
    let hiddenNodes = 4
    let outputNodes = 2
    
    var phaseText: String {
        switch phase {
        case 0: return "Tap to Start"
        case 1: return "① Input Data"
        case 2: return "② Weighted Sum → Hidden"
        case 3: return "③ Hidden Activation"
        case 4: return "④ Weighted Sum → Output"
        case 5: return "⑤ Output Prediction"
        case 6: return "⑥ Calculate Error"
        case 7: return "⑦ Backpropagation"
        case 8: return "⑧ Update Weights"
        default: return "✓ Learning Complete!"
        }
    }
    
    var phaseExplanation: String {
        switch phase {
        case 0: return "See how data flows through a neural network"
        case 1: return "Input values enter the network (e.g., image pixels)"
        case 2: return "Each input × weight, then all summed together"
        case 3: return "Hidden neurons activate based on their inputs"
        case 4: return "Hidden values × weights, sent to output"
        case 5: return "Output neuron produces the prediction"
        case 6: return "Compare prediction to correct answer"
        case 7: return "Calculate how much each weight contributed to error"
        case 8: return "Adjust weights to reduce error next time"
        default: return "Repeat many times to improve accuracy!"
        }
    }
    
    var phaseColor: Color {
        switch phase {
        case 0: return AppTheme.textTertiary
        case 1, 2: return .blue
        case 3, 4: return color
        case 5: return .green
        case 6: return .red
        case 7: return .orange
        default: return .green
        }
    }
    
    func weightFor(layer: Int, from: Int, to: Int) -> CGFloat {
        let seed = Double(layer * 100 + from * 10 + to)
        let base = (sin(seed) + 1) / 2
        return CGFloat(0.3 + base * 0.5) * weightScale
    }
    
    var body: some View {
        VStack(spacing: 12) {
            // Phase header
            HStack {
                Circle()
                    .fill(phaseColor)
                    .frame(width: 10, height: 10)
                
                Text(phaseText)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(phaseColor)
                
                Spacer()
                
                if phase == 0 || phase >= 9 {
                    Button(action: startAnimation) {
                        HStack(spacing: 4) {
                            Image(systemName: phase >= 9 ? "arrow.counterclockwise" : "play.fill")
                                .font(.system(size: 10))
                            Text(phase >= 9 ? "Replay" : "Start")
                                .font(.system(size: 12, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(color)
                        .cornerRadius(12)
                    }
                }
            }
            
            // Network visualization
            GeometryReader { geo in
                let w = geo.size.width
                let h: CGFloat = 180
                
                ZStack {
                    // Layer 1 connections (input → hidden)
                    // Forward: phase 2, Backward: second half of phase 7 (hidden → input)
                    ForEach(0..<inputNodes, id: \.self) { i in
                        ForEach(0..<hiddenNodes, id: \.self) { j in
                            AnimatedConnection(
                                from: pos(0, i, inputNodes, w, h),
                                to: pos(1, j, hiddenNodes, w, h),
                                weight: weightFor(layer: 0, from: i, to: j),
                                progress: layer1Progress,
                                isActive: phase == 2,
                                isBackward: phase == 7,
                                backwardProgress: max(0, (backwardProgress - 0.5) * 2),
                                dotColor: .blue
                            )
                        }
                    }
                    
                    // Layer 2 connections (hidden → output)
                    // Forward: phase 4, Backward: first half of phase 7 (output → hidden)
                    ForEach(0..<hiddenNodes, id: \.self) { i in
                        ForEach(0..<outputNodes, id: \.self) { j in
                            AnimatedConnection(
                                from: pos(1, i, hiddenNodes, w, h),
                                to: pos(2, j, outputNodes, w, h),
                                weight: weightFor(layer: 1, from: i, to: j),
                                progress: layer2Progress,
                                isActive: phase == 4,
                                isBackward: phase == 7,
                                backwardProgress: min(1, backwardProgress * 2),
                                dotColor: color
                            )
                        }
                    }
                    
                    // Input nodes
                    ForEach(0..<inputNodes, id: \.self) { i in
                        GlowingNode(
                            position: pos(0, i, inputNodes, w, h),
                            label: "x\(i+1)",
                            isGlowing: inputGlow,
                            baseColor: .blue
                        )
                    }
                    
                    // Hidden nodes
                    ForEach(0..<hiddenNodes, id: \.self) { i in
                        GlowingNode(
                            position: pos(1, i, hiddenNodes, w, h),
                            label: "h\(i+1)",
                            isGlowing: hiddenGlow,
                            baseColor: color
                        )
                    }
                    
                    // Output nodes
                    ForEach(0..<outputNodes, id: \.self) { i in
                        GlowingNode(
                            position: pos(2, i, outputNodes, w, h),
                            label: "y\(i+1)",
                            isGlowing: outputGlow,
                            baseColor: .green,
                            showError: showError && phase >= 6
                        )
                    }
                    
                    // Error badge
                    if showError {
                        VStack(spacing: 2) {
                            Text("Error")
                                .font(.system(size: 9, weight: .bold))
                            Text(phase >= 8 ? "28%" : "70%")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(phase >= 8 ? .green : .red)
                        }
                        .padding(8)
                        .background(Color.red.opacity(0.12))
                        .cornerRadius(8)
                        .position(x: w - 40, y: 25)
                    }
                }
                .frame(height: h)
            }
            .frame(height: 180)
            
            // Legend
            HStack(spacing: 16) {
                LegendDot(color: .blue, label: "Input")
                LegendDot(color: color, label: "Hidden")
                LegendDot(color: .green, label: "Output")
                Spacer()
                if phase == 7 {
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.left")
                            .font(.system(size: 10))
                        Text("Error flows back")
                            .font(.system(size: 10))
                    }
                    .foregroundColor(.orange)
                }
            }
            .font(.system(size: 10))
            
            // Explanation
            Text(phaseExplanation)
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
        }
    }
    
    func pos(_ layer: Int, _ index: Int, _ total: Int, _ w: CGFloat, _ h: CGFloat) -> CGPoint {
        let x = CGFloat(layer) / 2 * (w - 60) + 30
        let spacing = h / CGFloat(total + 1)
        return CGPoint(x: x, y: spacing * CGFloat(index + 1))
    }
    
    func startAnimation() {
        // Reset
        phase = 0
        layer1Progress = 0
        layer2Progress = 0
        backwardProgress = 0
        inputGlow = false
        hiddenGlow = false
        outputGlow = false
        showError = false
        weightScale = 1.0
        
        // Phase 1: Input lights up (0.1s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            withAnimation(.easeInOut(duration: 0.3)) {
                phase = 1
                inputGlow = true
            }
        }
        
        // Phase 2: Layer 1 connections animate (0.7s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
            withAnimation(.easeInOut(duration: 0.2)) { phase = 2 }
            withAnimation(.easeOut(duration: 1.0)) { layer1Progress = 1.0 }
        }
        
        // Phase 3: Hidden layer activates (1.8s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
            withAnimation(.easeInOut(duration: 0.3)) {
                phase = 3
                hiddenGlow = true
            }
        }
        
        // Phase 4: Layer 2 connections animate (2.3s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.3) {
            withAnimation(.easeInOut(duration: 0.2)) { phase = 4 }
            withAnimation(.easeOut(duration: 1.0)) { layer2Progress = 1.0 }
        }
        
        // Phase 5: Output activates (3.4s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.4) {
            withAnimation(.easeInOut(duration: 0.3)) {
                phase = 5
                outputGlow = true
            }
        }
        
        // Phase 6: Show error (4.0s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
            withAnimation(.easeInOut(duration: 0.3)) {
                phase = 6
                showError = true
            }
        }
        
        // Phase 7: Backward pass (4.8s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 4.8) {
            withAnimation(.easeInOut(duration: 0.2)) { phase = 7 }
            withAnimation(.easeInOut(duration: 1.5)) { backwardProgress = 1.0 }
        }
        
        // Phase 8: Update weights (6.5s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 6.5) {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.6)) {
                phase = 8
                weightScale = 0.85
            }
        }
        
        // Done (7.3s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 7.3) {
            withAnimation(.easeInOut(duration: 0.3)) { phase = 9 }
        }
    }
}

// MARK: - Animated Connection (with traveling dot)

struct AnimatedConnection: View {
    let from: CGPoint
    let to: CGPoint
    let weight: CGFloat
    let progress: CGFloat
    let isActive: Bool
    let isBackward: Bool
    let backwardProgress: CGFloat
    let dotColor: Color
    
    // Only show backward animation when progress is between 0 and 1 (not complete)
    var showBackwardDot: Bool {
        isBackward && backwardProgress > 0.01 && backwardProgress < 0.99
    }
    
    var body: some View {
        ZStack {
            // Base line (weight visualization)
            Path { path in
                path.move(to: from)
                path.addLine(to: to)
            }
            .stroke(Color.gray.opacity(0.15 + Double(weight) * 0.2), lineWidth: 1 + weight * 1.5)
            
            // Forward: traveling colored line
            if isActive && progress > 0 {
                Path { path in
                    path.move(to: from)
                    path.addLine(to: to)
                }
                .trim(from: 0, to: progress)
                .stroke(dotColor, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                
                // Traveling dot at the front
                if progress < 0.99 {
                    Circle()
                        .fill(dotColor)
                        .frame(width: 8, height: 8)
                        .shadow(color: dotColor, radius: 4)
                        .position(interpolate(from: from, to: to, t: progress))
                }
            }
            
            // Backward: orange traveling from output toward input
            if isBackward && backwardProgress > 0 {
                // Line grows from 'to' back toward 'from'
                Path { path in
                    path.move(to: to)
                    path.addLine(to: from)
                }
                .trim(from: 0, to: min(1, backwardProgress))
                .stroke(Color.orange, style: StrokeStyle(lineWidth: 2, lineCap: .round))
                
                // Traveling dot going backward (only show while animating)
                if showBackwardDot {
                    Circle()
                        .fill(Color.orange)
                        .frame(width: 6, height: 6)
                        .shadow(color: .orange, radius: 3)
                        .position(interpolate(from: to, to: from, t: backwardProgress))
                }
            }
        }
    }
    
    func interpolate(from: CGPoint, to: CGPoint, t: CGFloat) -> CGPoint {
        CGPoint(
            x: from.x + (to.x - from.x) * t,
            y: from.y + (to.y - from.y) * t
        )
    }
}

// MARK: - Glowing Node

struct GlowingNode: View {
    let position: CGPoint
    let label: String
    let isGlowing: Bool
    let baseColor: Color
    var showError: Bool = false
    
    var body: some View {
        ZStack {
            // Glow effect
            if isGlowing {
                Circle()
                    .fill(baseColor.opacity(0.3))
                    .frame(width: 36, height: 36)
                    .blur(radius: 4)
            }
            
            // Main circle
            Circle()
                .fill(isGlowing ? baseColor : baseColor.opacity(0.3))
                .frame(width: 28, height: 28)
                .overlay(
                    Circle()
                        .stroke(showError ? Color.red : baseColor, lineWidth: showError ? 2 : 1)
                )
            
            // Label
            Text(label)
                .font(.system(size: 9, weight: .bold, design: .monospaced))
                .foregroundColor(isGlowing ? .white : baseColor)
        }
        .position(position)
    }
}

// MARK: - Legend Dot

struct LegendDot: View {
    let color: Color
    let label: String
    
    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(AppTheme.textTertiary)
        }
    }
}

// MARK: - Diagram View

struct DiagramView: View {
    let visual: AILessonVisual
    let color: Color
    
    var body: some View {
        VStack(spacing: 16) {
            ForEach(visual.elements.indices, id: \.self) { index in
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(color.opacity(0.2))
                            .frame(width: 36, height: 36)
                        
                        Text("\(index + 1)")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(color)
                    }
                    
                    Text(visual.elements[index])
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(AppTheme.textPrimary)
                    
                    Spacer()
                }
                
                if index < visual.elements.count - 1 {
                    HStack {
                        Rectangle()
                            .fill(color.opacity(0.3))
                            .frame(width: 2, height: 20)
                            .padding(.leading, 17)
                        Spacer()
                    }
                }
            }
        }
    }
}

// MARK: - Comparison Visual

struct ComparisonVisual: View {
    let visual: AILessonVisual
    let color: Color
    
    var body: some View {
        HStack(spacing: 12) {
            ForEach(visual.elements.indices, id: \.self) { index in
                VStack(spacing: 8) {
                    let parts = visual.elements[index].split(separator: ":", maxSplits: 1)
                    
                    Text(String(parts.first ?? ""))
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(index == 0 ? color : .orange)
                    
                    if parts.count > 1 {
                        Text(String(parts.last ?? ""))
                            .font(.system(size: 11))
                            .foregroundColor(AppTheme.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(12)
                .background((index == 0 ? color : Color.orange).opacity(0.1))
                .cornerRadius(10)
                
                if index < visual.elements.count - 1 {
                    Image(systemName: "arrow.right")
                        .font(.system(size: 12))
                        .foregroundColor(AppTheme.textTertiary)
                }
            }
        }
    }
}

// MARK: - Flow Visual

struct FlowVisual: View {
    let visual: AILessonVisual
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            ForEach(visual.elements.indices, id: \.self) { index in
                HStack {
                    Text(visual.elements[index])
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .frame(maxWidth: .infinity)
                        .background(color.opacity(0.15 + Double(index) * 0.1))
                        .cornerRadius(8)
                }
                
                if index < visual.elements.count - 1 {
                    Image(systemName: "arrow.down")
                        .font(.system(size: 12))
                        .foregroundColor(color)
                }
            }
        }
    }
}

// MARK: - Scale Visual

struct ScaleVisual: View {
    let visual: AILessonVisual
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(visual.elements.indices, id: \.self) { index in
                let parts = visual.elements[index].split(separator: ":", maxSplits: 1)
                let label = String(parts.first ?? "")
                let value = parts.count > 1 ? String(parts.last ?? "") : ""
                
                HStack(spacing: 12) {
                    Text(label)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(AppTheme.textSecondary)
                        .frame(width: 80, alignment: .leading)
                    
                    GeometryReader { geo in
                        let width = geo.size.width * CGFloat(index + 1) / CGFloat(visual.elements.count)
                        
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(AppTheme.divider)
                                .frame(height: 20)
                            
                            RoundedRectangle(cornerRadius: 4)
                                .fill(color.opacity(0.3 + Double(index) * 0.2))
                                .frame(width: width, height: 20)
                            
                            Text(value.trimmingCharacters(in: .whitespaces))
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(AppTheme.textPrimary)
                                .padding(.leading, 8)
                        }
                    }
                    .frame(height: 20)
                }
            }
        }
    }
}

// MARK: - Key Takeaway Card

struct KeyTakeawayCard: View {
    let takeaway: String
    let color: Color
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "lightbulb.fill")
                .font(.system(size: 20))
                .foregroundColor(.yellow)
            
            VStack(alignment: .leading, spacing: 4) {
                Text("KEY TAKEAWAY")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.yellow)
                    .tracking(1)
                
                Text(takeaway)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(AppTheme.textPrimary)
            }
        }
        .padding(16)
        .background(Color.yellow.opacity(0.1))
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color.yellow.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Lesson Navigation

struct LessonNavigation: View {
    @Binding var currentLesson: Int
    let totalLessons: Int
    let currentColor: Color
    let onComplete: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            if currentLesson > 0 {
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.25)) { currentLesson -= 1 }
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 13, weight: .semibold))
                        Text("Back")
                            .font(.system(size: 15, weight: .medium))
                    }
                    .foregroundColor(AppTheme.textSecondary)
                }
            }
            
            Spacer()
            
            if currentLesson < totalLessons - 1 {
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.25)) { currentLesson += 1 }
                }) {
                    HStack(spacing: 4) {
                        Text("Continue")
                            .font(.system(size: 15, weight: .semibold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 13, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(AppTheme.accent)
                    .cornerRadius(10)
                }
            } else {
                Button(action: onComplete) {
                    HStack(spacing: 4) {
                        Text("Start Exploring")
                            .font(.system(size: 15, weight: .semibold))
                        Image(systemName: "arrow.right")
                            .font(.system(size: 13, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(AppTheme.accent)
                    .cornerRadius(10)
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
    }
}

// MARK: - AI Lesson Models

struct AILesson {
    let category: String
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let sections: [AILessonSection]
    let keyTakeaway: String?
}

struct AILessonSection {
    let heading: String?
    let content: String
    let visual: AILessonVisual?
    let bullets: [String]?
    
    init(heading: String? = nil, content: String, visual: AILessonVisual? = nil, bullets: [String]? = nil) {
        self.heading = heading
        self.content = content
        self.visual = visual
        self.bullets = bullets
    }
}

struct AILessonVisual {
    enum VisualType {
        case diagram
        case comparison
        case flow
        case scale
        case neuralNetwork
        case tokenizer
        case nextWord
        case confidenceMeter
        case quiz
    }
    
    let type: VisualType
    let elements: [String]
    let caption: String?
    
    init(type: VisualType, elements: [String] = [], caption: String? = nil) {
        self.type = type
        self.elements = elements
        self.caption = caption
    }
}

// MARK: - AI Fundamentals Content

struct AIFundamentalsContent {
    static let lessons: [AILesson] = [
        // Lesson 1: Welcome & Why This Matters
        AILesson(
            category: "Introduction",
            title: "Why AI Literacy Matters",
            subtitle: "Understanding AI helps you separate fact from fiction in today's world.",
            icon: "brain.head.profile",
            color: .blue,
            sections: [
                AILessonSection(
                    content: "AI is everywhere—in your phone, your search results, your social media feed. Companies make bold claims about what AI can do. News headlines swing between 'AI will solve everything' and 'AI will destroy us all.'\n\nThe truth? It's somewhere in between, and understanding the basics helps you navigate this landscape."
                ),
                AILessonSection(
                    heading: "What You'll Learn",
                    content: "This mini-course will teach you the fundamentals:",
                    bullets: [
                        "How AI and neural networks actually work",
                        "What language models like ChatGPT really do",
                        "Key terms like 'parameters' and 'tokens'",
                        "What AI can and cannot do today",
                        "How to spot AI misinformation"
                    ]
                ),
                AILessonSection(
                    heading: "No Technical Background Needed",
                    content: "We'll explain everything in plain language with helpful visuals. By the end, you'll be able to evaluate AI claims critically and use this app to fact-check what you hear."
                )
            ],
            keyTakeaway: "AI literacy isn't about becoming a programmer—it's about being an informed citizen in a world increasingly shaped by AI."
        ),
        
        // Lesson 2: What is AI?
        AILesson(
            category: "Fundamentals",
            title: "What is Artificial Intelligence?",
            subtitle: "AI is software that can learn patterns from data instead of following fixed rules.",
            icon: "cpu",
            color: Color(red: 0.0, green: 0.65, blue: 0.55),
            sections: [
                AILessonSection(
                    heading: "Traditional Programming vs AI",
                    content: "Traditional software follows explicit rules written by programmers. AI systems learn patterns from examples instead.",
                    visual: AILessonVisual(
                        type: .comparison,
                        elements: [
                            "Traditional: Programmer writes rules",
                            "AI: System learns from examples"
                        ],
                        caption: "The key difference in approach"
                    )
                ),
                AILessonSection(
                    heading: "A Simple Example",
                    content: "To build a spam filter the traditional way, you'd write rules like 'if email contains URGENT MONEY, mark as spam.' But spammers adapt.\n\nWith AI, you show the system thousands of spam and non-spam emails. It learns to recognize patterns humans might miss—without being told specific rules."
                ),
                AILessonSection(
                    heading: "What AI Is NOT",
                    content: "Despite the name 'artificial intelligence,' current AI systems are not intelligent in the human sense:",
                    bullets: [
                        "They don't understand or think—they recognize patterns",
                        "They don't have consciousness or feelings",
                        "They don't have goals or desires",
                        "They can't reason about novel situations like humans"
                    ]
                )
            ],
            keyTakeaway: "AI systems are sophisticated pattern-matching tools, not thinking machines. They're incredibly useful but fundamentally different from human intelligence."
        ),
        
        // Lesson 3: Neural Networks
        AILesson(
            category: "Fundamentals",
            title: "Neural Networks Explained",
            subtitle: "The building blocks of modern AI, inspired by (but very different from) the brain.",
            icon: "point.3.connected.trianglepath.dotted",
            color: .purple,
            sections: [
                AILessonSection(
                    heading: "The Basic Idea",
                    content: "A neural network is layers of simple mathematical operations connected together. Data flows through these layers, getting transformed at each step until it produces an output.\n\nThe 'neural' name comes from a loose inspiration from brain neurons, but modern neural networks work very differently from actual brains."
                ),
                AILessonSection(
                    heading: "How It Works",
                    content: "Information flows through the network in stages:",
                    visual: AILessonVisual(
                        type: .flow,
                        elements: [
                            "Input (text, image, etc.)",
                            "Hidden layers process & transform",
                            "More layers find complex patterns",
                            "Output (prediction, text, etc.)"
                        ],
                        caption: "Simplified view of a neural network"
                    )
                ),
                AILessonSection(
                    heading: "See It In Action",
                    content: "Tap 'Start' below to watch how a neural network learns. You'll see the forward pass (data flowing through), error calculation, and the backward pass where weights get adjusted:",
                    visual: AILessonVisual(
                        type: .neuralNetwork,
                        caption: "Interactive: Watch the forward and backward pass"
                    )
                ),
                AILessonSection(
                    heading: "The Two Passes",
                    content: "Training involves two key phases that repeat over and over:",
                    bullets: [
                        "Forward Pass: Data flows from input to output. Each connection multiplies the data by its weight.",
                        "Error Calculation: Compare the output to what we wanted. How wrong were we?",
                        "Backward Pass: The error flows backward, telling each weight how much it contributed to the mistake.",
                        "Weight Update: Each weight is adjusted slightly to reduce the error. This is the actual 'learning'!"
                    ]
                ),
                AILessonSection(
                    heading: "Scale = Intelligence?",
                    content: "A large language model like GPT-4 has hundreds of billions of these weights—that's what 'parameters' means. Training adjusts all of them, millions of times, on trillions of examples.\n\nThe magic isn't in any single weight—it's in the patterns that emerge from billions of tiny adjustments."
                )
            ],
            keyTakeaway: "Neural networks learn by adjusting billions of numerical weights through repeated forward and backward passes. Each pass makes the model slightly better at its task."
        ),
        
        // Lesson 4: Language Models
        AILesson(
            category: "Core Concepts",
            title: "How Language Models Work",
            subtitle: "The technology behind ChatGPT, Claude, and other AI assistants.",
            icon: "text.bubble",
            color: .orange,
            sections: [
                AILessonSection(
                    heading: "Predicting the Next Word",
                    content: "At their core, language models do one thing: predict what word (or piece of word) comes next. Given 'The cat sat on the...', the model predicts 'mat' is likely.\n\nWatch it happen below — tap Predict to see a language model build a sentence:",
                    visual: AILessonVisual(
                        type: .nextWord,
                        caption: "Interactive: Watch next-word prediction in action"
                    )
                ),
                AILessonSection(
                    heading: "Training on the Internet",
                    content: "Models learn by reading enormous amounts of text—books, websites, code, conversations. They learn patterns like:\n\n• Grammar and sentence structure\n• Facts (though not always accurately)\n• Writing styles and formats\n• How conversations flow"
                ),
                AILessonSection(
                    heading: "Why They Seem Smart",
                    content: "Because they've seen so many examples of human text, language models can:",
                    bullets: [
                        "Write in many styles and formats",
                        "Answer questions (by predicting likely answers)",
                        "Follow instructions (by predicting compliance)",
                        "Have conversations (by predicting responses)"
                    ]
                ),
                AILessonSection(
                    heading: "Why They Make Mistakes",
                    content: "They predict plausible text, not true text. If a false statement sounds like something that would appear in their training data, they might generate it. This is called 'hallucination'—confident-sounding nonsense."
                )
            ],
            keyTakeaway: "Language models are prediction engines, not knowledge databases. They generate text that sounds right, whether or not it is right."
        ),
        
        // Lesson 5: Tokens and Context
        AILesson(
            category: "Core Concepts",
            title: "Tokens & Context Windows",
            subtitle: "Understanding how AI models process and remember text.",
            icon: "text.alignleft",
            color: .cyan,
            sections: [
                AILessonSection(
                    heading: "What Are Tokens?",
                    content: "AI models don't read letters or words—they read 'tokens.' A token is a chunk of text, roughly 3-4 characters or about ¾ of a word.\n\nTap below to see tokenization in action:",
                    visual: AILessonVisual(
                        type: .tokenizer,
                        caption: "Interactive: Watch text get split into tokens"
                    )
                ),
                AILessonSection(
                    heading: "Why Tokens Matter",
                    content: "Everything in AI is measured in tokens:",
                    bullets: [
                        "Pricing: APIs charge per token processed",
                        "Limits: Models can only handle so many tokens",
                        "Speed: Fewer tokens = faster responses",
                        "Cost: Your 'prompt' uses tokens from your limit"
                    ]
                ),
                AILessonSection(
                    heading: "Context Window",
                    content: "The 'context window' is how many tokens a model can consider at once—like its working memory. This includes your question AND the model's response.",
                    visual: AILessonVisual(
                        type: .scale,
                        elements: [
                            "GPT-3.5: 16K tokens (~20 pages)",
                            "GPT-4: 128K tokens (~150 pages)",
                            "Claude: 200K tokens (~250 pages)",
                            "Gemini: 1M+ tokens (~1200 pages)"
                        ],
                        caption: "Context windows have grown rapidly"
                    )
                ),
                AILessonSection(
                    heading: "The Memory Myth",
                    content: "Important: context window is NOT memory! Once a conversation exceeds the window, earlier parts are forgotten. And between conversations, models remember nothing—each chat starts fresh."
                )
            ],
            keyTakeaway: "Context window = temporary working space, not permanent memory. Models don't learn from or remember your conversations."
        ),
        
        // Lesson 6: Parameters and Model Size
        AILesson(
            category: "Core Concepts",
            title: "Parameters & Model Size",
            subtitle: "Why '70 billion parameters' matters (and why it doesn't).",
            icon: "scalemass",
            color: .pink,
            sections: [
                AILessonSection(
                    heading: "What Are Parameters?",
                    content: "Parameters are the numbers inside a neural network that get adjusted during training. Think of them as the 'knowledge' encoded in the model—patterns learned from training data.\n\nWhen you see 'GPT-4' or 'Llama 70B,' the number refers to billions of parameters."
                ),
                AILessonSection(
                    heading: "Bigger = Better?",
                    content: "More parameters generally means:",
                    bullets: [
                        "More patterns can be learned",
                        "Better performance on complex tasks",
                        "More 'knowledge' from training data",
                        "BUT: More compute needed to run",
                        "BUT: Diminishing returns at scale"
                    ]
                ),
                AILessonSection(
                    heading: "Size Isn't Everything",
                    content: "A well-trained 7B model can beat a poorly-trained 70B model. What matters:\n\n• Quality of training data\n• Training techniques used\n• How well it's fine-tuned for tasks\n• Architecture innovations"
                ),
                AILessonSection(
                    heading: "Running Large Models",
                    content: "Each parameter needs memory. A 70B parameter model needs ~140GB of GPU memory at full precision—far more than any consumer graphics card. This is why most people use cloud APIs instead of running models locally.",
                    visual: AILessonVisual(
                        type: .scale,
                        elements: [
                            "7B params: ~14GB (high-end consumer GPU)",
                            "13B params: ~26GB (workstation GPU)",
                            "70B params: ~140GB (multiple professional GPUs)"
                        ],
                        caption: "Memory requirements at full precision"
                    )
                )
            ],
            keyTakeaway: "Parameter count is a rough indicator of capability, but training quality and architecture matter just as much. Bigger isn't always better."
        ),
        
        // Lesson 7: Capabilities & Limitations
        AILesson(
            category: "Reality Check",
            title: "What AI Can & Can't Do",
            subtitle: "Cutting through the hype to understand real capabilities.",
            icon: "checkmark.circle.trianglebadge.exclamationmark",
            color: .green,
            sections: [
                AILessonSection(
                    heading: "What AI Does Well",
                    content: "Current language models genuinely excel at:",
                    bullets: [
                        "Writing and editing text in many styles",
                        "Explaining concepts at different levels",
                        "Translating between languages",
                        "Writing and debugging code",
                        "Summarizing long documents",
                        "Brainstorming and generating ideas"
                    ]
                ),
                AILessonSection(
                    heading: "What AI Does Poorly",
                    content: "Despite impressive demos, models struggle with:",
                    bullets: [
                        "Factual accuracy (they hallucinate)",
                        "Math and precise calculations",
                        "Counting (even letters in words!)",
                        "Real-time information (training cutoffs)",
                        "Truly novel reasoning",
                        "Tasks requiring physical world interaction"
                    ]
                ),
                AILessonSection(
                    heading: "The Confidence Problem",
                    content: "AI models sound confident whether they're right or wrong. They don't say 'I don't know' naturally—they generate plausible-sounding text even when they're completely wrong.\n\nSee for yourself — can you tell which AI claims are accurate?",
                    visual: AILessonVisual(
                        type: .confidenceMeter,
                        caption: "Interactive: See how AI confidence doesn't equal accuracy"
                    )
                ),
                AILessonSection(
                    heading: "AI is a Tool",
                    content: "Think of AI as a powerful autocomplete that's read the internet. It's incredibly useful for drafts, explanations, and creative work—but it needs human oversight for accuracy and judgment."
                )
            ],
            keyTakeaway: "AI is excellent at generating plausible text, but terrible at knowing when it's wrong. Always verify important claims."
        ),
        
        // Lesson 8: Spotting AI Misinformation
        AILesson(
            category: "Practical Skills",
            title: "Spotting AI Misinformation",
            subtitle: "How to evaluate claims about AI capabilities.",
            icon: "exclamationmark.shield",
            color: .red,
            sections: [
                AILessonSection(
                    heading: "Common Red Flags",
                    content: "Be skeptical when you see claims that:",
                    bullets: [
                        "Use vague terms like 'understands' or 'thinks'",
                        "Claim AI is 'conscious' or has 'feelings'",
                        "Promise AI will 'replace all jobs' soon",
                        "Suggest AI can do anything humans can",
                        "Come from companies selling AI products"
                    ]
                ),
                AILessonSection(
                    heading: "Questions to Ask",
                    content: "When evaluating AI claims, consider:\n\n• What's the source? Company marketing vs independent testing?\n• What were the test conditions? Cherry-picked examples?\n• Does it work reliably or just sometimes?\n• What are the failure modes?"
                ),
                AILessonSection(
                    heading: "Benchmark Skepticism",
                    content: "AI companies love to cite benchmarks showing their model is 'best.' But benchmarks have problems:",
                    bullets: [
                        "Models may be trained on test data",
                        "Benchmarks may not reflect real-world use",
                        "Companies cherry-pick favorable benchmarks",
                        "Small improvements may not matter in practice"
                    ]
                ),
                AILessonSection(
                    heading: "Test Your Skills",
                    content: "Put what you've learned into practice! Can you spot the red flags in these AI claims?",
                    visual: AILessonVisual(
                        type: .quiz,
                        caption: "Interactive: Test your AI misinformation detection skills"
                    )
                ),
                AILessonSection(
                    heading: "Keep Learning!",
                    content: "That's what AI Fact Checker is for! Browse model specs with verified information. Check the Myths section for common misconceptions. Use the Fact Check tab to search for answers. And always check our Sources."
                )
            ],
            keyTakeaway: "Healthy skepticism is your best tool. If a claim sounds too good (or too scary) to be true, it probably is. This app is here to help you verify."
        )
    ]
}

// MARK: - Stat Pill

struct StatPill: View {
    let icon: String
    let value: String
    let label: String
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(AppTheme.accent)
            
            VStack(alignment: .leading, spacing: 0) {
                Text(value)
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundColor(AppTheme.textPrimary)
                
                Text(label)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(AppTheme.textTertiary)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(AppTheme.cardBackground)
        .cornerRadius(10)
    }
}

// MARK: - Scale Button Style

struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - About View

struct AboutView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        VStack(spacing: 16) {
                            Image(systemName: "checkmark.shield.fill")
                                .font(.system(size: 60))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [AppTheme.accent, .purple],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                            
                            Text("AI Fact Checker")
                                .font(.system(size: 28, weight: .black, design: .rounded))
                                .foregroundColor(AppTheme.textPrimary)
                            
                            Text("Combat misinformation about AI")
                                .font(.system(size: 15))
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            Text("About This App")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(AppTheme.textPrimary)
                            
                            Text("This app provides verified, fact-checked information about AI models and companies to help combat the hype and misinformation surrounding artificial intelligence capabilities.")
                                .font(.system(size: 14))
                                .foregroundColor(AppTheme.textSecondary)
                            
                            Text("Every claim is sourced from official documentation, research papers, and verified reports. When information is uncertain or contested, we make that clear.")
                                .font(.system(size: 14))
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        
                        VStack(alignment: .leading, spacing: 12) {
                            Text("What We Cover")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(AppTheme.textPrimary)
                            
                            FeatureRow(icon: "building.2", text: "Major AI companies and their models")
                            FeatureRow(icon: "cpu", text: "Technical specifications and capabilities")
                            FeatureRow(icon: "exclamationmark.bubble", text: "Common myths and misconceptions")
                            FeatureRow(icon: "dollarsign.circle", text: "Pricing and availability information")
                            FeatureRow(icon: "link", text: "Verified sources for all claims")
                        }
                        
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Disclaimer")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(AppTheme.textPrimary)
                            
                            Text("AI is a rapidly evolving field. Information in this app is current as of our last update but may change. Always verify critical information with official sources.")
                                .font(.system(size: 14))
                                .foregroundColor(AppTheme.textSecondary)
                        }
                    }
                    .padding(24)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(AppTheme.accent)
                        .fontWeight(.semibold)
                }
            }
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.accent)
                .frame(width: 24)
            
            Text(text)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
        }
    }
}

#Preview {
    CompanyListView()
}
