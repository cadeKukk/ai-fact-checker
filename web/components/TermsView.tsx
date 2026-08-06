'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Layers,
  GraduationCap,
  Zap,
  Gauge,
  ShieldAlert,
  Wrench,
} from 'lucide-react'
import { allTerms, findTerm } from '@/data/terms'
import type { AICompany, AIModel, AITerm, TermCategory } from '@/data/types'
import { termCategoryLabel, termCategoryColor } from '@/data/types'
import { ModelPopup, TermPopup, BenchmarkPopup, TermHighlightedText, useTermPopup } from './TermHighlight'

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 179, 255, ${alpha})`
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const CATEGORY_ICONS: Record<TermCategory, React.ComponentType<{ className?: string; size?: number }>> = {
  fundamentals: Lightbulb,
  architecture: Layers,
  training: GraduationCap,
  inference: Zap,
  performance: Gauge,
  safety: ShieldAlert,
  practical: Wrench,
}

const ALL_CATEGORIES: TermCategory[] = [
  'fundamentals', 'architecture', 'training', 'inference', 'performance', 'safety', 'practical',
]

function TermCard({
  term,
  isExpanded,
  onToggle,
  onTermTap,
  onModelTap,
}: {
  term: AITerm
  isExpanded: boolean
  onToggle: () => void
  onTermTap: (term: AITerm) => void
  onModelTap: (info: { model: AIModel; company: AICompany; matched: string }) => void
}) {
  const color = termCategoryColor[term.category]
  const CategoryIcon = CATEGORY_ICONS[term.category]

  return (
    <div
      className="rounded-[2px] bg-[#ffffff] border transition-all"
      style={{ borderColor: isExpanded ? hexToRgba(color, 0.4) : 'rgba(51,51,51,1)' }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-[2px] flex items-center justify-center"
          style={{ backgroundColor: hexToRgba(color, 0.15), color }}
        >
          <CategoryIcon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#141414] text-sm">{term.term}</h3>
          <p
            className={`text-xs text-[#75726b] mt-0.5 ${
              isExpanded ? '' : 'line-clamp-2'
            }`}
          >
            {term.shortDefinition}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-[#75726b] flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-[#75726b] flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#d9d6cc] pt-3">
          <TermHighlightedText
            text={term.fullExplanation}
            className="text-sm text-[#524f48] leading-relaxed"
            onTermTap={onTermTap}
            onModelTap={onModelTap}
            excludeTermId={term.id}
          />

          {term.example && (
            <div className="rounded-[2px] bg-[#f7f6f2] p-3">
              <pre className="text-xs text-[#524f48] font-mono whitespace-pre-wrap">{term.example}</pre>
            </div>
          )}

          {term.relatedTerms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[#75726b]">Related:</span>
              {term.relatedTerms.map((rt) => {
                const related = findTerm(rt)
                if (related) {
                  const rc = termCategoryColor[related.category]
                  return (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => onTermTap(related)}
                      className="px-2 py-0.5 rounded-[2px] text-xs font-medium active:scale-[0.95] transition-all"
                      style={{ color: rc, backgroundColor: hexToRgba(rc, 0.15) }}
                    >
                      {rt}
                    </button>
                  )
                }
                return (
                  <span
                    key={rt}
                    className="px-2 py-0.5 rounded-[2px] text-xs font-medium text-[#75726b] bg-[#141414]/[0.04]"
                  >
                    {rt}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TermsView() {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TermCategory | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
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

  const filteredTerms = useMemo(() => {
    let terms = allTerms

    if (selectedCategory) {
      terms = terms.filter((t) => t.category === selectedCategory)
    }

    const query = searchText.trim().toLowerCase()
    if (query) {
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(query) ||
          t.shortDefinition.toLowerCase().includes(query) ||
          t.fullExplanation.toLowerCase().includes(query)
      )
    }

    return terms
  }, [searchText, selectedCategory])

  const groupedTerms = useMemo(() => {
    if (selectedCategory) return null

    const groups: Record<TermCategory, AITerm[]> = {
      fundamentals: [], architecture: [], training: [],
      inference: [], performance: [], safety: [], practical: [],
    }

    filteredTerms.forEach((t) => {
      groups[t.category].push(t)
    })

    return groups
  }, [filteredTerms, selectedCategory])

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#141414] p-6">
      <div className="max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#141414]/20 pb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#2038e6] mb-2">
            [ SEC. 04 — GLOSSARY ]
          </p>
          <h1 className="text-4xl text-[#141414] leading-tight">Terms</h1>
          <p className="text-sm text-[#75726b] mt-1.5">{allTerms.length} terms</p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75726b]" size={20} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search terms..."
            className="w-full pl-10 pr-10 py-3 rounded-[2px] bg-[#ffffff] border border-[#d9d6cc] text-[#141414] placeholder:text-[#75726b] focus:outline-none focus:border-[#2038e6]/50"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75726b] hover:text-[#141414]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-[2px] text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-[#2038e6] text-[#f7f6f2]'
                : 'bg-[#ffffff] text-[#524f48] border border-[#d9d6cc]'
            }`}
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            const color = termCategoryColor[cat]
            const Icon = CATEGORY_ICONS[cat]
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isActive ? null : cat)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-sm font-medium transition-all border"
                style={
                  isActive
                    ? { backgroundColor: hexToRgba(color, 0.25), color, borderColor: hexToRgba(color, 0.4) }
                    : { backgroundColor: '#ffffff', color: '#524f48', borderColor: '#d9d6cc' }
                }
              >
                <Icon size={14} />
                {termCategoryLabel[cat]}
              </button>
            )
          })}
        </div>

        {/* Terms list */}
        {selectedCategory || searchText.trim() ? (
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:items-start">
            {filteredTerms.map((term) => (
              <TermCard
                key={term.id}
                term={term}
                isExpanded={expandedId === term.id}
                onToggle={() => setExpandedId(expandedId === term.id ? null : term.id)}
                onTermTap={showTerm}
                onModelTap={showModel}
              />
            ))}
          </div>
        ) : groupedTerms ? (
          <div className="space-y-6">
            {ALL_CATEGORIES.map((cat) => {
              const terms = groupedTerms[cat]
              if (terms.length === 0) return null
              const color = termCategoryColor[cat]
              const Icon = CATEGORY_ICONS[cat]
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span style={{ color }}><Icon size={16} /></span>
                    <span className="text-sm font-bold" style={{ color }}>
                      {termCategoryLabel[cat]}
                    </span>
                    <span className="text-xs text-[#75726b]">({terms.length})</span>
                  </div>
                  <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:items-start">
                    {terms.map((term) => (
                      <TermCard
                        key={term.id}
                        term={term}
                        isExpanded={expandedId === term.id}
                        onToggle={() => setExpandedId(expandedId === term.id ? null : term.id)}
                        onTermTap={showTerm}
                        onModelTap={showModel}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}

        {filteredTerms.length === 0 && (
          <p className="text-center text-[#524f48] py-8 opacity-70">
            No terms match your search.
          </p>
        )}
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
