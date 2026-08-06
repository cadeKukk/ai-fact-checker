//
//  LessonAnimations.swift
//  AI Fact Checker
//

import SwiftUI

// MARK: - Tokenizer Visual

struct TokenizerVisual: View {
    let color: Color

    @State private var phase = 0
    @State private var visibleTokens = 0
    @State private var showIds = false
    @State private var showStats = false

    private let sentence = "Understanding AI is important"
    private let tokens: [(text: String, id: String)] = [
        ("Under", "8667"),
        ("standing", "18252"),
        (" AI", "9012"),
        (" is", "374"),
        (" import", "12815"),
        ("ant", "519")
    ]

    private let opacities: [Double] = [1.0, 0.85, 0.7, 0.6, 0.5, 0.4]

    var body: some View {
        VStack(spacing: 14) {
            HStack {
                Text(phase == 0 ? "Tap to tokenize" : phase == 1 ? "Splitting..." : "Done")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(phase == 0 ? AppTheme.textTertiary : color)

                Spacer()

                if phase == 0 || phase >= 2 {
                    Button(action: startAnimation) {
                        Text(phase >= 2 ? "Replay" : "Tokenize")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 6)
                            .background(color)
                            .cornerRadius(8)
                    }
                }
            }

            if phase == 0 {
                Text(sentence)
                    .font(.system(size: 16, weight: .medium, design: .monospaced))
                    .foregroundColor(AppTheme.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(14)
                    .background(AppTheme.cardBackgroundLight)
                    .cornerRadius(10)
            } else {
                VStack(spacing: 8) {
                    FlowLayout(spacing: 5) {
                        ForEach(0..<min(visibleTokens, tokens.count), id: \.self) { idx in
                            VStack(spacing: 3) {
                                Text(tokens[idx].text)
                                    .font(.system(size: 14, weight: .semibold, design: .monospaced))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 6)
                                    .background(color.opacity(opacities[idx % opacities.count]))
                                    .cornerRadius(6)

                                if showIds {
                                    Text(tokens[idx].id)
                                        .font(.system(size: 9, weight: .medium, design: .monospaced))
                                        .foregroundColor(AppTheme.textTertiary)
                                        .transition(.opacity)
                                }
                            }
                            .transition(.scale.combined(with: .opacity))
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(14)
                .background(AppTheme.cardBackgroundLight)
                .cornerRadius(10)
                .animation(.spring(response: 0.4, dampingFraction: 0.7), value: visibleTokens)
                .animation(.easeInOut(duration: 0.3), value: showIds)
            }

            if showStats {
                HStack(spacing: 0) {
                    StatLabel(label: "Characters", value: "\(sentence.count)", valueColor: AppTheme.textSecondary)
                    StatLabel(label: "Tokens", value: "\(tokens.count)", valueColor: color)
                    StatLabel(label: "Ratio", value: "~\(sentence.count / tokens.count):1", valueColor: color.opacity(0.7))
                }
                .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: phase)
        .animation(.easeOut(duration: 0.3), value: showStats)
    }

    private func startAnimation() {
        phase = 0
        visibleTokens = 0
        showIds = false
        showStats = false

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            withAnimation { phase = 1 }

            for i in 0..<tokens.count {
                DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.25 + 0.2) {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.65)) {
                        visibleTokens = i + 1
                    }
                }
            }

            let done = Double(tokens.count) * 0.25 + 0.5
            DispatchQueue.main.asyncAfter(deadline: .now() + done) {
                withAnimation { showIds = true }
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + done + 0.3) {
                withAnimation { phase = 2; showStats = true }
            }
        }
    }
}

// MARK: - Stat Label

private struct StatLabel: View {
    let label: String
    let value: String
    let valueColor: Color

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(valueColor)
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(AppTheme.textTertiary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Next Word Prediction Visual

struct NextWordVisual: View {
    let color: Color

    @State private var currentWord = 0
    @State private var showCandidates = false
    @State private var winnerChosen = false
    @State private var isAnimating = false

    private struct Prediction {
        let context: String
        let candidates: [(word: String, prob: Double)]
    }

    private let predictions: [Prediction] = [
        Prediction(context: "The cat sat on the",
                   candidates: [("mat", 0.72), ("floor", 0.15), ("bed", 0.08), ("roof", 0.05)]),
        Prediction(context: "The cat sat on the mat and",
                   candidates: [("purred", 0.45), ("slept", 0.30), ("meowed", 0.18), ("yawned", 0.07)]),
        Prediction(context: "The cat sat on the mat and purred",
                   candidates: [("softly", 0.55), ("loudly", 0.25), ("happily", 0.15), (".", 0.05)])
    ]

    private let completeSentence = "The cat sat on the mat and purred softly"
    private var isComplete: Bool { currentWord >= predictions.count }

    var body: some View {
        VStack(spacing: 14) {
            headerView
            sentenceDisplay
            candidateBars
            footerText
        }
    }

    private var headerView: some View {
        HStack {
            Text(headerText)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(!showCandidates && currentWord == 0 ? AppTheme.textTertiary : color)

            Spacer()

            if !isAnimating {
                Button(action: handleTap) {
                    Text(buttonText)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(color)
                        .cornerRadius(8)
                }
            }
        }
    }

    private var sentenceDisplay: some View {
        HStack(spacing: 4) {
            if isComplete {
                Text(completeSentence)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(AppTheme.textPrimary)
            } else {
                Text(predictions[currentWord].context + " ")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(AppTheme.textPrimary)

                if winnerChosen {
                    Text(predictions[currentWord].candidates[0].word)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(color)
                        .transition(.scale.combined(with: .opacity))
                } else {
                    Text("___")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(color.opacity(showCandidates ? 0.6 : 0.25))
                }
            }

            Spacer(minLength: 0)
        }
        .padding(12)
        .background(AppTheme.cardBackgroundLight)
        .cornerRadius(10)
        .animation(.spring(response: 0.3), value: winnerChosen)
        .animation(.spring(response: 0.3), value: isComplete)
    }

    @ViewBuilder
    private var candidateBars: some View {
        if showCandidates && !isComplete {
            let p = predictions[currentWord]
            VStack(spacing: 6) {
                ForEach(Array(p.candidates.enumerated()), id: \.offset) { idx, c in
                    let isWinner = idx == 0 && winnerChosen
                    candidateRow(word: c.word, prob: c.prob, isWinner: isWinner, dimmed: winnerChosen && idx != 0)
                }
            }
            .id(currentWord)
            .transition(.opacity.combined(with: .move(edge: .bottom)))
        }
    }

    private func candidateRow(word: String, prob: Double, isWinner: Bool, dimmed: Bool) -> some View {
        HStack(spacing: 8) {
            Text(word)
                .font(.system(size: 13, weight: isWinner ? .bold : .medium, design: .monospaced))
                .foregroundColor(isWinner ? color : AppTheme.textPrimary)
                .frame(width: 70, alignment: .trailing)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(AppTheme.divider)

                    RoundedRectangle(cornerRadius: 3)
                        .fill(color.opacity(isWinner ? 1 : 0.4))
                        .frame(width: geo.size.width * prob)
                }
            }
            .frame(height: 18)

            Text("\(Int(prob * 100))%")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(isWinner ? color : AppTheme.textTertiary)
                .frame(width: 32)
        }
        .opacity(dimmed ? 0.3 : 1)
        .animation(.easeInOut(duration: 0.3), value: dimmed)
    }

    @ViewBuilder
    private var footerText: some View {
        if isComplete {
            Text("Built one prediction at a time")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textTertiary)
                .transition(.opacity)
        } else {
            Text("The model picks the most probable next token each time")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textTertiary)
                .frame(maxWidth: .infinity)
        }
    }

    private var headerText: String {
        if isComplete { return "Sentence complete" }
        if !showCandidates && currentWord == 0 { return "Tap to predict" }
        return "Predicting word \(currentWord + 1) of \(predictions.count)"
    }

    private var buttonText: String {
        if isComplete { return "Replay" }
        if winnerChosen {
            return currentWord >= predictions.count - 1 ? "Finish" : "Next"
        }
        return "Predict"
    }

    private func handleTap() {
        if isComplete {
            currentWord = 0
            showCandidates = false
            winnerChosen = false
            isAnimating = false
            return
        }

        if winnerChosen {
            isAnimating = true
            withAnimation(.easeOut(duration: 0.2)) {
                showCandidates = false
                winnerChosen = false
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
                currentWord += 1
                guard !isComplete else {
                    isAnimating = false
                    return
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                    startPrediction()
                }
            }
            return
        }

        startPrediction()
    }

    private func startPrediction() {
        isAnimating = true
        withAnimation(.spring(response: 0.4)) {
            showCandidates = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                winnerChosen = true
                isAnimating = false
            }
        }
    }
}

// MARK: - Confidence Meter Visual

struct ConfidenceMeterVisual: View {
    let color: Color

    @State private var currentIndex = 0
    @State private var revealed = false
    @State private var meterWidth: CGFloat = 0

    private struct Claim {
        let text: String
        let isCorrect: Bool
        let confidence: Double
        let explanation: String
    }

    private let claims: [Claim] = [
        Claim(text: "The Eiffel Tower is in Paris, France",
              isCorrect: true, confidence: 0.97,
              explanation: "Correct — AI handles well-known facts from training data reliably."),
        Claim(text: "The Great Wall of China is visible from space",
              isCorrect: false, confidence: 0.92,
              explanation: "Wrong — a popular myth AI repeats confidently because it appeared often in training data."),
        Claim(text: "Python was created by Guido van Rossum",
              isCorrect: true, confidence: 0.95,
              explanation: "Correct — well-documented technical facts are usually accurate."),
        Claim(text: "Albert Einstein failed math in school",
              isCorrect: false, confidence: 0.89,
              explanation: "Wrong — Einstein excelled at math. AI confidently repeats this popular misconception.")
    ]

    private var currentClaim: Claim? {
        guard currentIndex < claims.count else { return nil }
        return claims[currentIndex]
    }

    private var isComplete: Bool { currentIndex >= claims.count }

    var body: some View {
        VStack(spacing: 14) {
            headerRow

            if let claim = currentClaim {
                claimCard(claim)
            } else {
                completionCard
            }
        }
        .onAppear { animateMeter() }
    }

    private var headerRow: some View {
        HStack {
            Text("Confidence test")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(color)

            Spacer()

            if isComplete {
                Button(action: reset) {
                    Text("Replay")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(color)
                        .cornerRadius(8)
                }
            } else {
                Text("\(currentIndex + 1)/\(claims.count)")
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundColor(AppTheme.textTertiary)
            }
        }
    }

    private func claimCard(_ claim: Claim) -> some View {
        VStack(spacing: 12) {
            Text("\"\(claim.text)\"")
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(AppTheme.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            confidenceMeterBar(claim)

            if !revealed {
                revealButton
            } else {
                revealedResult(claim)
            }
        }
        .padding(14)
        .background(AppTheme.cardBackgroundLight)
        .cornerRadius(10)
        .animation(.spring(response: 0.4), value: revealed)
    }

    private func confidenceMeterBar(_ claim: Claim) -> some View {
        VStack(spacing: 4) {
            HStack {
                Text("Confidence")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(AppTheme.textTertiary)
                Spacer()
                Text("\(Int(claim.confidence * 100))%")
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .foregroundColor(color)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(AppTheme.divider)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(color)
                        .frame(width: geo.size.width * meterWidth)
                }
            }
            .frame(height: 10)
        }
    }

    private var revealButton: some View {
        Button(action: revealAnswer) {
            Text("Tap to reveal")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(color)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(color.opacity(0.1))
                .cornerRadius(8)
        }
    }

    private func revealedResult(_ claim: Claim) -> some View {
        VStack(spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: claim.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .font(.system(size: 16))
                    .foregroundColor(claim.isCorrect ? .green : .red)

                Text(claim.isCorrect ? "Actually correct" : "Actually wrong")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(claim.isCorrect ? .green : .red)

                Spacer()
            }

            Text(claim.explanation)
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            Button(action: nextClaim) {
                Text(currentIndex < claims.count - 1 ? "Next" : "See insight")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(color)
                    .cornerRadius(8)
            }
        }
        .transition(.opacity.combined(with: .move(edge: .bottom)))
    }

    private var completionCard: some View {
        VStack(spacing: 10) {
            let avg = Int(claims.map(\.confidence).reduce(0, +) / Double(claims.count) * 100)
            Text("Key Insight")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(AppTheme.textPrimary)

            Text("AI showed \(avg)% average confidence on all claims — even the wrong ones.\n\nConfidence ≠ Accuracy")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(16)
        .frame(maxWidth: .infinity)
        .background(AppTheme.cardBackgroundLight)
        .cornerRadius(10)
        .transition(.opacity)
    }

    private func animateMeter() {
        meterWidth = 0
        guard let claim = currentClaim else { return }
        withAnimation(.easeOut(duration: 0.8).delay(0.2)) {
            meterWidth = claim.confidence
        }
    }

    private func revealAnswer() {
        withAnimation(.spring(response: 0.4)) {
            revealed = true
        }
    }

    private func nextClaim() {
        withAnimation(.spring(response: 0.3)) {
            currentIndex += 1
            revealed = false
            meterWidth = 0
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            animateMeter()
        }
    }

    private func reset() {
        withAnimation(.spring(response: 0.3)) {
            currentIndex = 0
            revealed = false
            meterWidth = 0
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            animateMeter()
        }
    }
}

// MARK: - Red Flag Quiz Visual

struct RedFlagQuizVisual: View {
    let color: Color

    @State private var currentIndex = 0
    @State private var answered = false
    @State private var selectedIsRedFlag: Bool? = nil
    @State private var showExplanation = false
    @State private var score = 0

    private struct QuizClaim {
        let text: String
        let isRedFlag: Bool
        let explanation: String
    }

    private let quizClaims: [QuizClaim] = [
        QuizClaim(
            text: "GPT-4 truly understands the meaning of your questions",
            isRedFlag: true,
            explanation: "'Understands' implies consciousness. LLMs recognize patterns — they don't comprehend meaning."
        ),
        QuizClaim(
            text: "Claude can process up to 200K tokens of context",
            isRedFlag: false,
            explanation: "This is a verified technical specification from Anthropic's documentation."
        ),
        QuizClaim(
            text: "AI will replace all software engineers within 2 years",
            isRedFlag: true,
            explanation: "Absolute predictions with short timelines are almost always hype."
        ),
        QuizClaim(
            text: "LLMs can sometimes generate false information confidently",
            isRedFlag: false,
            explanation: "This is well-documented as 'hallucination' — a known limitation of current LLMs."
        ),
        QuizClaim(
            text: "This AI model is sentient and has real feelings",
            isRedFlag: true,
            explanation: "No current AI is sentient. Claims of AI consciousness are not supported by evidence."
        )
    ]

    private var currentClaim: QuizClaim? {
        guard currentIndex < quizClaims.count else { return nil }
        return quizClaims[currentIndex]
    }

    private var isComplete: Bool { currentIndex >= quizClaims.count }

    var body: some View {
        VStack(spacing: 14) {
            HStack {
                Text("Spot the red flags")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(color)

                Spacer()

                Text("\(score)/\(isComplete ? quizClaims.count : max(currentIndex, 0))")
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundColor(AppTheme.textTertiary)
            }

            progressDots

            if let claim = currentClaim {
                claimView(claim)
            } else {
                resultsView
            }
        }
        .animation(.spring(response: 0.3), value: currentIndex)
    }

    private var progressDots: some View {
        HStack(spacing: 5) {
            ForEach(0..<quizClaims.count, id: \.self) { idx in
                RoundedRectangle(cornerRadius: 2)
                    .fill(idx < currentIndex ? color : idx == currentIndex ? color.opacity(0.5) : AppTheme.divider)
                    .frame(height: 3)
            }
        }
    }

    private func claimView(_ claim: QuizClaim) -> some View {
        VStack(spacing: 12) {
            Text(claim.text)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(AppTheme.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            if !answered {
                HStack(spacing: 10) {
                    Button(action: { answer(isRedFlag: false) }) {
                        Text("Legit")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.green)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(8)
                    }

                    Button(action: { answer(isRedFlag: true) }) {
                        Text("Red Flag")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(8)
                    }
                }
            }

            if showExplanation {
                explanationView(claim)
            }
        }
        .padding(14)
        .background(AppTheme.cardBackgroundLight)
        .cornerRadius(10)
        .animation(.spring(response: 0.4), value: showExplanation)
        .animation(.spring(response: 0.4), value: answered)
    }

    private func explanationView(_ claim: QuizClaim) -> some View {
        let isCorrectAnswer = selectedIsRedFlag == claim.isRedFlag
        return VStack(spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: isCorrectAnswer ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .font(.system(size: 16))
                    .foregroundColor(isCorrectAnswer ? .green : .red)

                Text(isCorrectAnswer ? "Correct" : "Not quite")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(isCorrectAnswer ? .green : .red)

                Spacer()
            }

            Text(claim.explanation)
                .font(.system(size: 13))
                .foregroundColor(AppTheme.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            Button(action: nextClaim) {
                Text(currentIndex < quizClaims.count - 1 ? "Next" : "See results")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(color)
                    .cornerRadius(8)
            }
        }
        .transition(.opacity.combined(with: .move(edge: .bottom)))
    }

    private var resultsView: some View {
        VStack(spacing: 10) {
            Text("\(score)/\(quizClaims.count)")
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundColor(color)

            let pct = Int(Double(score) / Double(quizClaims.count) * 100)
            Text(pct >= 80 ? "Excellent — you can spot AI hype like a pro."
                 : pct >= 60 ? "Good job — you're building strong AI literacy."
                 : "Keep learning — these skills improve with practice.")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)

            Button(action: reset) {
                Text("Try again")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(color)
                    .cornerRadius(8)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity)
        .background(AppTheme.cardBackgroundLight)
        .cornerRadius(10)
        .transition(.opacity)
    }

    private func answer(isRedFlag: Bool) {
        selectedIsRedFlag = isRedFlag
        answered = true

        if let claim = currentClaim, isRedFlag == claim.isRedFlag {
            score += 1
        }

        withAnimation(.spring(response: 0.4)) {
            showExplanation = true
        }
    }

    private func nextClaim() {
        withAnimation(.spring(response: 0.3)) {
            currentIndex += 1
            answered = false
            selectedIsRedFlag = nil
            showExplanation = false
        }
    }

    private func reset() {
        withAnimation(.spring(response: 0.3)) {
            currentIndex = 0
            answered = false
            selectedIsRedFlag = nil
            showExplanation = false
            score = 0
        }
    }
}
