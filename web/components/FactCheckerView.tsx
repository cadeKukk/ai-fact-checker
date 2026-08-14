'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Shield,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react'
import { factCheckQAs } from '@/data/factcheck'
import type { AICompany, AIModel, AITerm, FactCheckQA, ConfidenceLevel } from '@/data/types'
import { confidenceLabel, confidenceColor } from '@/data/types'
import { findModelRefByMatch } from '@/data/modelHighlightData'
import { DATA_SNAPSHOT } from '@/lib/appMeta'
import { ModelPopup, TermPopup, BenchmarkPopup, TermHighlightedText, useTermPopup } from './TermHighlight'

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 179, 255, ${alpha})`
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const confidenceIcon: Record<ConfidenceLevel, React.ComponentType<{ className?: string; size?: number }>> = {
  high: CheckCircle2,
  medium: AlertTriangle,
  low: AlertCircle,
}

const EXAMPLE_QUESTIONS = [
  'Can AI think?',
  'Replace programmers?',
  'Is my data safe?',
  'What are hallucinations?',
  'AI vs human jobs?',
  'Open source vs closed?',
]

function scoreMatch(qa: FactCheckQA, keywords: string[]): number {
  let score = 0
  const qLower = qa.question.toLowerCase()
  const aLower = qa.answer.toLowerCase()
  const allTags = qa.tags.map((t) => t.toLowerCase())

  for (const kw of keywords) {
    if (qLower.includes(kw)) score += 3
    if (allTags.some((t) => t.includes(kw) || kw.includes(t))) score += 2
    if (aLower.includes(kw)) score += 1
    if (qa.relatedModels.some((m) => m.toLowerCase().includes(kw))) score += 1
  }
  return score
}

function FactCheckAnswerCard({
  qa,
  onTermTap,
  onModelTap,
}: {
  qa: FactCheckQA
  onTermTap: (term: AITerm) => void
  onModelTap: (info: { model: AIModel; company: AICompany; matched: string }) => void
}) {
  const color = confidenceColor[qa.confidence]
  const label = confidenceLabel[qa.confidence]
  const Icon = confidenceIcon[qa.confidence]

  return (
    <div
      className="rounded-[10px] p-4 border transition-all"
      style={{
        backgroundColor: hexToRgba(color, 0.06),
        borderColor: hexToRgba(color, 0.2),
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}><Icon size={16} /></span>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {label}
        </span>
      </div>
      <TermHighlightedText
        text={qa.question}
        className="block font-bold text-[#f5f5f5] text-base mb-2"
        onTermTap={onTermTap}
        onModelTap={onModelTap}
      />
      <TermHighlightedText text={qa.answer} className="block text-sm text-[#b3b2b8] leading-relaxed mb-3" onTermTap={onTermTap} onModelTap={onModelTap} />
      {qa.relatedModels.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#8a8990]">Related:</span>
          {qa.relatedModels.map((modelName) => {
            const ref = findModelRefByMatch(modelName)
            if (ref) {
              const c = ref.company.accentColor
              return (
                <button
                  key={modelName}
                  type="button"
                  onClick={() =>
                    onModelTap({ model: ref.model, company: ref.company, matched: modelName })
                  }
                  className="px-2 py-0.5 rounded-md text-xs font-medium active:scale-[0.95] transition-all"
                  style={{ color: c, backgroundColor: hexToRgba(c, 0.15) }}
                >
                  {modelName}
                </button>
              )
            }
            return (
              <span
                key={modelName}
                className="px-2 py-0.5 rounded-md text-xs font-medium text-[#8a8990] bg-white/[0.05]"
              >
                {modelName}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface FactCheckerViewProps {
  initialQuery?: string
}

export default function FactCheckerView({ initialQuery = '' }: FactCheckerViewProps = {}) {
  const [searchText, setSearchText] = useState(initialQuery)

  // Sync when navigation delivers a new query (e.g. from search or Compare).
  useEffect(() => {
    setSearchText(initialQuery)
  }, [initialQuery])

  // Keep the URL shareable as the user types, without triggering navigation.
  useEffect(() => {
    const q = searchText.trim()
    const url = q ? `${window.location.pathname}?q=${encodeURIComponent(q)}` : window.location.pathname
    window.history.replaceState(null, '', url)
  }, [searchText])
  const {
    activeTerm,
    activeModel,
    activeBenchmark,
    showTerm,
    showModel,
    showBenchmark,
    selectTerm,
    clearTerm,
    clearModel,
    clearBenchmark,
    back,
    canGoBack,
  } = useTermPopup()

  const filteredQAs = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    if (!query) return factCheckQAs

    const keywords = query.split(/\s+/).filter((w) => w.length > 1)
    if (keywords.length === 0) return factCheckQAs

    const scored = factCheckQAs
      .map((qa) => ({ qa, score: scoreMatch(qa, keywords) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)

    return scored.map(({ qa }) => qa)
  }, [searchText])

  const isSearching = searchText.trim().length > 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] p-6">
      <div className="max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9fa3fc] mb-2">
            Verify
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[#f5f5f5] leading-tight">Fact Checker</h1>
          <p className="text-sm text-[#8a8990] mt-1.5">Get verified answers about AI</p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8990]" size={20} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Ask a question about AI..."
            className="w-full pl-10 pr-10 py-3 rounded-[10px] bg-[#161618] border border-[#2a2a2e] text-[#f5f5f5] placeholder:text-[#8a8990] focus:outline-none focus:border-[#7065f0]/50"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8990] hover:text-[#f5f5f5]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Example pills */}
        {!isSearching && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setSearchText(q)}
                className="px-3 py-1.5 rounded-[10px] bg-[#161618] border border-[#2a2a2e] text-sm text-[#b3b2b8] hover:border-[#7065f0]/50 hover:text-[#f5f5f5] transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Label */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#8a8990] uppercase tracking-wider">
            {isSearching ? 'Results' : 'Common Questions'}
          </h2>
          <span className="text-xs text-[#8a8990]">{filteredQAs.length}</span>
        </div>

        {/* QA list */}
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {filteredQAs.map((qa) => (
            <FactCheckAnswerCard key={qa.id} qa={qa} onTermTap={showTerm} onModelTap={showModel} />
          ))}
        </div>

        {filteredQAs.length === 0 && (
          <p className="text-center text-[#b3b2b8] py-8 opacity-70">
            No results match your search.
          </p>
        )}

        {/* Disclaimer */}
        <div className="rounded-[10px] p-4 bg-[#161618] border border-[#2a2a2e] flex items-start gap-3">
          <Info size={18} className="text-[#8a8990] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#8a8990] leading-relaxed">
            These answers are based on publicly available information and research as of {DATA_SNAPSHOT}.
            AI is a rapidly evolving field—always verify claims with primary sources. Confidence
            levels reflect the strength of available evidence, not absolute certainty.
          </p>
        </div>
      </div>

      {activeTerm && <TermPopup term={activeTerm} onClose={clearTerm} onBack={canGoBack ? back : undefined} onTermTap={selectTerm} onModelTap={showModel} onBenchmarkTap={showBenchmark} />}
      {activeModel && <ModelPopup payload={activeModel} onClose={clearModel} onBack={canGoBack ? back : undefined} onTermTap={showTerm} onModelTap={showModel} onBenchmarkTap={showBenchmark} />}
      {activeBenchmark && (
        <BenchmarkPopup
          benchmark={activeBenchmark}
          onClose={clearBenchmark}
          onBack={canGoBack ? back : undefined}
          onTermTap={showTerm}
          onModelTap={showModel}
          onBenchmarkTap={showBenchmark}
        />
      )}
    </div>
  )
}
