'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  X,
  ChevronLeft,
  Beaker,
  ExternalLink,
  FileText,
  Github,
  BookOpen,
  Rss,
  Newspaper,
  Code2,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react'
import { allTerms, findTerm as findTermByName } from '@/data/terms'
import { MODEL_PATTERNS_SORTED } from '@/data/modelHighlightData'
import {
  BENCHMARK_PATTERNS_FOR_HIGHLIGHT,
  benchmarkCategoryColor,
  benchmarkCategoryLabel,
  findBenchmark,
} from '@/data/benchmarks'
import type { Benchmark } from '@/data/benchmarks'
import type { AICompany, AIModel, AITerm, Source, SourceType } from '@/data/types'
import { termCategoryLabel, termCategoryColor, sourceTypeLabel, sourceTypeColor } from '@/data/types'

const SPRING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const SPRING_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 179, 255, ${alpha})`
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

// Term lookup index — built once, longest-match-first

type TermEntry = { term: AITerm; pattern: string }

const SKIP_HIGHLIGHT_TERMS = new Set([
  'agentic ai', 'generative ai', 'predictive ai', 'ai agent', 'constitutional ai',
])

const TERM_INDEX: TermEntry[] = (() => {
  const entries: TermEntry[] = []
  for (const t of allTerms) {
    if (!SKIP_HIGHLIGHT_TERMS.has(t.term.toLowerCase())) {
      entries.push({ term: t, pattern: t.term })
    }
    const abbrMatch = t.term.match(/\(([A-Z][A-Za-z0-9/\- ]*)\)/)
    if (abbrMatch) {
      if (abbrMatch[1].length >= 3) {
        entries.push({ term: t, pattern: abbrMatch[1] })
      }
      const withoutParen = t.term.replace(/\s*\([^)]+\)/, '').trim()
      if (withoutParen !== t.term && !SKIP_HIGHLIGHT_TERMS.has(withoutParen.toLowerCase())) {
        entries.push({ term: t, pattern: withoutParen })
      }
    }
  }
  return entries.sort((a, b) => b.pattern.length - a.pattern.length)
})()

// Unified terms + model names + benchmarks (longest pattern wins in lookup order)

type UnifiedEntry =
  | { kind: 'term'; term: AITerm; pattern: string }
  | { kind: 'model'; model: AIModel; company: AICompany; pattern: string }
  | { kind: 'benchmark'; benchmark: Benchmark; pattern: string }

const UNIFIED_LOOKUP: Map<string, UnifiedEntry> = (() => {
  const raw: UnifiedEntry[] = []
  for (const t of TERM_INDEX) {
    raw.push({ kind: 'term', term: t.term, pattern: t.pattern })
  }
  for (const m of MODEL_PATTERNS_SORTED) {
    raw.push({ kind: 'model', model: m.model, company: m.company, pattern: m.pattern })
  }
  for (const { benchmark, pattern } of BENCHMARK_PATTERNS_FOR_HIGHLIGHT) {
    raw.push({ kind: 'benchmark', benchmark, pattern })
  }
  raw.sort((a, b) => b.pattern.length - a.pattern.length)
  const map = new Map<string, UnifiedEntry>()
  for (const e of raw) {
    const k = e.pattern.toLowerCase()
    if (!map.has(k)) map.set(k, e)
  }
  return map
})()

// Allow an optional trailing `s` so plural mentions ("LLMs", "tokens",
// "parameters", "hallucinations") still highlight back to their singular
// glossary entry. We deliberately do NOT extend this to "es" / "ies" because
// the false-positive risk on partial-word matches outweighs the benefit.
const UNIFIED_REGEX: RegExp = (() => {
  const byLen = Array.from(UNIFIED_LOOKUP.values()).sort((a, b) => b.pattern.length - a.pattern.length)
  const escaped = byLen.map((e) => e.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`(?<![a-zA-Z0-9])(${escaped.join('|')})s?(?![a-zA-Z0-9])`, 'gi')
})()

function lookupUnified(matched: string): UnifiedEntry | undefined {
  const direct = UNIFIED_LOOKUP.get(matched.toLowerCase())
  if (direct) return direct
  if (matched.length > 1 && /s$/i.test(matched)) {
    return UNIFIED_LOOKUP.get(matched.slice(0, -1).toLowerCase())
  }
  return undefined
}

export type ModelPopupPayload = { model: AIModel; company: AICompany; matched: string }

// Shared bag of popup actions used to recurse into nested taps inside a popup's
// description / detail body. Every popup forwards these to the embedded
// TermHighlightedText so a tap inside a popup smoothly switches to the
// corresponding popup type.
type PopupActions = {
  onTermTap: (term: AITerm) => void
  onModelTap: (info: ModelPopupPayload) => void
  onBenchmarkTap: (benchmark: Benchmark) => void
}

// Header action cluster — back arrow (when navigating a chain of popups) plus
// the close X. Used by every popup so the spacing/styling stays consistent.
function PopupHeaderActions({
  onBack,
  onClose,
}: {
  onBack?: () => void
  onClose: () => void
}) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-[#eeece3] flex items-center justify-center text-[#75726b] hover:text-[#141414] active:scale-[0.92]"
          style={{ transition: `all 250ms ${SPRING}` }}
          aria-label="Back to previous"
        >
          <ChevronLeft size={14} />
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-[#eeece3] flex items-center justify-center text-[#75726b] hover:text-[#141414] active:scale-[0.92]"
        style={{ transition: `all 250ms ${SPRING}` }}
        aria-label="Close"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ---------------- Term popup ----------------

export function TermPopup({
  term,
  onClose,
  onBack,
  onTermTap,
  onModelTap,
  onBenchmarkTap,
}: {
  term: AITerm
  onClose: () => void
  onBack?: () => void
} & Partial<PopupActions>) {
  const color = termCategoryColor[term.category]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    setVisible(true)
  }, [term.id])

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  // Term taps inside this popup should switch to the next term in-place.
  const handleTermTap = onTermTap ?? (() => {})
  const handleModelTap = onModelTap ?? (() => {})
  // No no-op fallback for benchmark: TermHighlightedText guards on this
  // prop being defined to decide whether to render benchmark mentions as
  // tappable buttons. A no-op fallback would make them *look* tappable
  // without actually doing anything.
  const handleBenchmarkTap = onBenchmarkTap

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={dismiss}>
      <div
        className="absolute inset-0 bg-[#141414]/35"
        style={{ opacity: visible ? 1 : 0, transition: `opacity 300ms ${SPRING}` }}
      />
      <div
        className="relative w-full max-w-lg mx-4 mb-4 rounded-[2px] bg-[#ffffff] border border-[#141414]/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
          transition: `opacity 350ms ${SPRING}, transform 350ms ${SPRING_BOUNCE}`,
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-[#c9c6bc]" />
        </div>

        <div className="px-5 pb-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-[2px] flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: hexToRgba(color, 0.2), color }}
            >
              {term.term.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#141414]">{term.term}</h3>
              <span className="text-[11px] font-semibold" style={{ color }}>
                {termCategoryLabel[term.category]}
              </span>
            </div>
            <PopupHeaderActions onBack={onBack} onClose={dismiss} />
          </div>

          <TermHighlightedText
            text={term.shortDefinition}
            className="block text-[15px] text-[#524f48] leading-relaxed"
            onTermTap={handleTermTap}
            onModelTap={handleModelTap}
            onBenchmarkTap={handleBenchmarkTap}
            excludeTermId={term.id}
          />

          <div className="p-3.5 rounded-[2px] bg-[#efede5] space-y-2">
            <span className="text-[11px] font-bold text-[#75726b] tracking-wide">DETAILED EXPLANATION</span>
            <TermHighlightedText
              text={term.fullExplanation}
              className="block text-[13px] text-[#524f48] leading-relaxed"
              onTermTap={handleTermTap}
              onModelTap={handleModelTap}
              onBenchmarkTap={handleBenchmarkTap}
              excludeTermId={term.id}
            />
          </div>

          {term.example && (
            <div className="p-3.5 rounded-[2px] bg-[#efede5] space-y-2">
              <span className="text-[11px] font-bold text-yellow-600 tracking-wide">EXAMPLE</span>
              <pre className="text-[12px] text-[#524f48] font-mono whitespace-pre-wrap leading-relaxed">{term.example}</pre>
            </div>
          )}

          {term.relatedTerms.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#75726b] tracking-wide">RELATED</span>
              <div className="flex flex-wrap gap-1.5">
                {term.relatedTerms.map((rt) => {
                  const related = findTermByName(rt)
                  if (related) {
                    const rc = termCategoryColor[related.category]
                    return onTermTap ? (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => onTermTap(related)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-[2px] active:scale-[0.95] transition-all"
                        style={{ color: rc, backgroundColor: hexToRgba(rc, 0.15) }}
                      >
                        {rt}
                      </button>
                    ) : (
                      <span
                        key={rt}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-[2px]"
                        style={{ color: rc, backgroundColor: hexToRgba(rc, 0.15) }}
                      >
                        {rt}
                      </span>
                    )
                  }
                  // Try benchmark fallback for related entries that aren't terms.
                  const relatedBench = findBenchmark(rt)
                  if (relatedBench && onBenchmarkTap) {
                    const bc = benchmarkCategoryColor[relatedBench.category]
                    return (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => onBenchmarkTap(relatedBench)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-[2px] active:scale-[0.95] transition-all"
                        style={{ color: bc, backgroundColor: hexToRgba(bc, 0.15) }}
                      >
                        {rt}
                      </button>
                    )
                  }
                  return (
                    <span
                      key={rt}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-[2px] text-[#75726b] bg-[#141414]/[0.04]"
                    >
                      {rt}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------- Model popup ----------------

export function ModelPopup({
  payload,
  onClose,
  onBack,
  onTermTap,
  onModelTap,
  onBenchmarkTap,
}: {
  payload: ModelPopupPayload
  onClose: () => void
  onBack?: () => void
} & Partial<PopupActions>) {
  const { model, company, matched } = payload
  const color = company.accentColor
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    setVisible(true)
  }, [model.id])

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const handleTermTap = onTermTap ?? (() => {})
  const handleModelTap = onModelTap ?? (() => {})
  // No no-op fallback for benchmark: TermHighlightedText guards on this
  // prop being defined to decide whether to render benchmark mentions as
  // tappable buttons. A no-op fallback would make them *look* tappable
  // without actually doing anything.
  const handleBenchmarkTap = onBenchmarkTap

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={dismiss}>
      <div
        className="absolute inset-0 bg-[#141414]/35"
        style={{ opacity: visible ? 1 : 0, transition: `opacity 300ms ${SPRING}` }}
      />
      <div
        className="relative w-full max-w-lg mx-4 mb-4 rounded-[2px] bg-[#ffffff] border border-[#141414]/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
          transition: `opacity 350ms ${SPRING}, transform 350ms ${SPRING_BOUNCE}`,
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-[#c9c6bc]" />
        </div>

        <div className="px-5 pb-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-[2px] flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: hexToRgba(color, 0.2), color }}
            >
              {model.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#141414] leading-tight">{model.name}</h3>
              <p className="text-[12px] text-[#66635c] mt-0.5">{company.name}</p>
            </div>
            <PopupHeaderActions onBack={onBack} onClose={dismiss} />
          </div>

          {matched.toLowerCase() !== model.name.toLowerCase() && (
            <p className="text-[11px] text-[#66635c]">
              Mention: <span className="font-semibold text-[#141414]/90">&ldquo;{matched}&rdquo;</span> &rarr; {model.name}
            </p>
          )}

          <TermHighlightedText
            text={model.description}
            className="block text-[15px] text-[#524f48] leading-relaxed"
            onTermTap={handleTermTap}
            onModelTap={handleModelTap}
            onBenchmarkTap={handleBenchmarkTap}
            excludeModelId={model.id}
          />

          <div className="flex flex-wrap gap-2 text-[11px] text-[#66635c]">
            <span className="px-2 py-1 rounded-[2px] bg-[#efede5]">
              Context:{' '}
              {model.specs.contextWindow >= 1_000_000
                ? `${(model.specs.contextWindow / 1_000_000).toFixed(1)}M`
                : model.specs.contextWindow.toLocaleString()}{' '}
              tokens
            </span>
            {model.specs.trainingDataCutoff && (
              <span className="px-2 py-1 rounded-[2px] bg-[#efede5]">Trained to {model.specs.trainingDataCutoff}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------- Benchmark popup ----------------

const BENCHMARK_HIGHLIGHT_COLOR = '#b45309'

export function BenchmarkPopup({
  benchmark,
  onClose,
  onBack,
  onTermTap,
  onModelTap,
  onBenchmarkTap,
}: {
  benchmark: Benchmark
  onClose: () => void
  onBack?: () => void
} & Partial<PopupActions>) {
  const color = benchmarkCategoryColor[benchmark.category]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    setVisible(true)
  }, [benchmark.id])

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const handleTermTap = onTermTap ?? (() => {})
  const handleModelTap = onModelTap ?? (() => {})
  // No no-op fallback for benchmark: TermHighlightedText guards on this
  // prop being defined to decide whether to render benchmark mentions as
  // tappable buttons. A no-op fallback would make them *look* tappable
  // without actually doing anything.
  const handleBenchmarkTap = onBenchmarkTap

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={dismiss}>
      <div
        className="absolute inset-0 bg-[#141414]/35"
        style={{ opacity: visible ? 1 : 0, transition: `opacity 300ms ${SPRING}` }}
      />
      <div
        className="relative w-full max-w-lg mx-4 mb-4 rounded-[2px] bg-[#ffffff] border border-[#141414]/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
          transition: `opacity 350ms ${SPRING}, transform 350ms ${SPRING_BOUNCE}`,
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-[#c9c6bc]" />
        </div>

        <div className="px-5 pb-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-[2px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: hexToRgba(color, 0.2), color }}
            >
              <Beaker size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#141414] leading-tight">{benchmark.name}</h3>
              <span className="text-[11px] font-semibold" style={{ color }}>
                BENCHMARK · {benchmarkCategoryLabel[benchmark.category].toUpperCase()}
              </span>
            </div>
            <PopupHeaderActions onBack={onBack} onClose={dismiss} />
          </div>

          <TermHighlightedText
            text={benchmark.shortDescription}
            className="block text-[15px] text-[#524f48] leading-relaxed"
            onTermTap={handleTermTap}
            onModelTap={handleModelTap}
            onBenchmarkTap={handleBenchmarkTap}
            excludeBenchmarkId={benchmark.id}
          />

          <div className="p-3.5 rounded-[2px] bg-[#efede5] space-y-2">
            <span className="text-[11px] font-bold text-[#75726b] tracking-wide">WHAT IT TESTS</span>
            <TermHighlightedText
              text={benchmark.details}
              className="block text-[13px] text-[#524f48] leading-relaxed"
              onTermTap={handleTermTap}
              onModelTap={handleModelTap}
              onBenchmarkTap={handleBenchmarkTap}
              excludeBenchmarkId={benchmark.id}
            />
          </div>

          {(benchmark.metric || benchmark.releaseYear || benchmark.source) && (
            <div className="grid grid-cols-2 gap-2">
              {benchmark.metric && (
                <div className="p-2.5 rounded-[2px] bg-[#efede5]">
                  <span className="text-[10px] font-bold text-[#75726b] tracking-wide">METRIC</span>
                  <p className="text-[12px] text-[#141414] mt-0.5">{benchmark.metric}</p>
                </div>
              )}
              {benchmark.releaseYear && (
                <div className="p-2.5 rounded-[2px] bg-[#efede5]">
                  <span className="text-[10px] font-bold text-[#75726b] tracking-wide">RELEASED</span>
                  <p className="text-[12px] text-[#141414] mt-0.5">{benchmark.releaseYear}</p>
                </div>
              )}
              {benchmark.source && (
                <div className="p-2.5 rounded-[2px] bg-[#efede5] col-span-2">
                  <span className="text-[10px] font-bold text-[#75726b] tracking-wide">CREATED BY</span>
                  <p className="text-[12px] text-[#141414] mt-0.5">{benchmark.source}</p>
                </div>
              )}
            </div>
          )}

          {benchmark.url && (
            <a
              href={benchmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold"
              style={{ color }}
            >
              <ExternalLink size={12} />
              View benchmark
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------- Source popup ----------------

const SOURCE_TYPE_ICONS: Record<SourceType, React.ComponentType<{ className?: string; size?: number }>> = {
  officialDocs: FileText,
  github: Github,
  researchPaper: BookOpen,
  blogPost: Rss,
  newsArticle: Newspaper,
  apiReference: Code2,
}

// Brief, plain-language explanation of what each source category represents.
// Shown inside SourcePopup so users learn how to weigh the source before
// following the link out.
const SOURCE_TYPE_DESCRIPTION: Record<SourceType, string> = {
  officialDocs:
    'Documentation published by the company that builds the model. Best for confirming model specs, supported features, pricing, and policies straight from the source.',
  github:
    'A public code repository — typically the project source, model card, or release notes. Useful for verifying open-source claims, examining implementation details, and tracking issues.',
  researchPaper:
    'A peer-reviewed or preprint academic paper (e.g. arXiv, conference proceedings). Best for understanding how a model was trained, evaluated, or what new technique it introduces.',
  blogPost:
    'An official engineering or product blog post. A reliable narrative source for launch details and design rationale, but more curated than raw documentation.',
  newsArticle:
    'A news report covering AI developments. Helpful for context and announcements; treat individual claims as secondary unless they cite primary sources.',
  apiReference:
    'Developer-facing API reference describing endpoints, parameters, and limits. The most authoritative source for what a model exposes to applications.',
}

function getHostFromUrl(url: string): string {
  try {
    const u = new URL(url)
    return u.host.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function SourcePopup({
  source,
  onClose,
  onBack,
}: {
  source: Source
  onClose: () => void
  onBack?: () => void
}) {
  const color = sourceTypeColor[source.type]
  const Icon = SOURCE_TYPE_ICONS[source.type]
  const typeLabel = sourceTypeLabel[source.type]
  const description = SOURCE_TYPE_DESCRIPTION[source.type]
  const host = getHostFromUrl(source.url)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    setVisible(true)
  }, [source.id])

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={dismiss}>
      <div
        className="absolute inset-0 bg-[#141414]/35"
        style={{ opacity: visible ? 1 : 0, transition: `opacity 300ms ${SPRING}` }}
      />
      <div
        className="relative w-full max-w-lg mx-4 mb-4 rounded-[2px] bg-[#ffffff] border border-[#141414]/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
          transition: `opacity 350ms ${SPRING}, transform 350ms ${SPRING_BOUNCE}`,
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-[#c9c6bc]" />
        </div>

        <div className="px-5 pb-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-[2px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: hexToRgba(color, 0.2), color }}
            >
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#141414] leading-tight break-words">{source.title}</h3>
              <span className="text-[11px] font-semibold tracking-wide" style={{ color }}>
                SOURCE · {typeLabel.toUpperCase()}
              </span>
            </div>
            <PopupHeaderActions onBack={onBack} onClose={dismiss} />
          </div>

          <p className="text-[15px] text-[#524f48] leading-relaxed">{description}</p>

          <div className="p-3.5 rounded-[2px] bg-[#efede5] space-y-2.5">
            <div className="flex items-center gap-2">
              <LinkIcon size={12} className="text-[#75726b] flex-shrink-0" />
              <span className="text-[11px] font-bold text-[#75726b] tracking-wide">LINK</span>
            </div>
            <p className="text-[12px] text-[#141414] font-mono break-all leading-relaxed">{source.url}</p>
            <p className="text-[11px] text-[#75726b]">{host}</p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#75726b]">
            <Calendar size={12} />
            <span>Accessed {source.dateAccessed}</span>
          </div>

          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-[2px] font-semibold text-[14px] active:scale-[0.98]"
            style={{
              backgroundColor: hexToRgba(color, 0.18),
              color,
              transition: `transform 200ms ${SPRING}`,
            }}
          >
            <ExternalLink size={15} />
            Open link in new tab
          </a>
        </div>
      </div>
    </div>
  )
}

// Tappable wrapper — turns any element (icon, title, chip) into a button that
// opens the SourcePopup. Use this whenever a source is rendered so the user
// gets a brief description before being sent off-site.
export function SourceTapTarget({
  source,
  onTap,
  className,
  style,
  children,
  ariaLabel,
}: {
  source: Source
  onTap: (source: Source) => void
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onTap(source)}
      className={className}
      style={style}
      aria-label={ariaLabel ?? `About source: ${source.title}`}
    >
      {children}
    </button>
  )
}

// ---------------- Inline highlighted text ----------------

// Highlights the FIRST occurrence of each glossary term, model, and benchmark
// in `text`. Subsequent mentions render as plain text. Optional exclude IDs
// keep popups from self-linking back to themselves.
export function TermHighlightedText({
  text,
  className,
  style,
  onTermTap,
  onModelTap,
  onBenchmarkTap,
  excludeTermId,
  excludeModelId,
  excludeBenchmarkId,
}: {
  text: string
  className?: string
  style?: React.CSSProperties
  onTermTap: (term: AITerm) => void
  onModelTap: (info: { model: AIModel; company: AICompany; matched: string }) => void
  onBenchmarkTap?: (benchmark: Benchmark) => void
  excludeTermId?: string
  /** Current model page — avoid self-link to same model in body copy */
  excludeModelId?: string
  /** Current benchmark popup — avoid self-link to same benchmark in body copy */
  excludeBenchmarkId?: string
}) {
  const parts = useMemo(() => {
    const result: {
      text: string
      term?: AITerm
      modelH?: { model: AIModel; company: AICompany; matched: string }
      benchmark?: Benchmark
    }[] = []
    const seenTerms = new Set<string>()
    const seenModels = new Set<string>()
    const seenBenchmarks = new Set<string>()
    if (excludeTermId) seenTerms.add(excludeTermId)
    if (excludeModelId) seenModels.add(excludeModelId)
    if (excludeBenchmarkId) seenBenchmarks.add(excludeBenchmarkId)
    let lastIndex = 0
    const regex = new RegExp(UNIFIED_REGEX.source, UNIFIED_REGEX.flags)
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ text: text.slice(lastIndex, match.index) })
      }
      const raw = match[0]
      const u = lookupUnified(raw)
      if (u?.kind === 'term') {
        const t = u.term
        if (!seenTerms.has(t.id)) {
          seenTerms.add(t.id)
          result.push({ text: raw, term: t })
        } else {
          result.push({ text: raw })
        }
      } else if (u?.kind === 'model') {
        if (!seenModels.has(u.model.id)) {
          seenModels.add(u.model.id)
          result.push({
            text: raw,
            modelH: { model: u.model, company: u.company, matched: raw },
          })
        } else {
          result.push({ text: raw })
        }
      } else if (u?.kind === 'benchmark') {
        if (!seenBenchmarks.has(u.benchmark.id)) {
          seenBenchmarks.add(u.benchmark.id)
          result.push({ text: raw, benchmark: u.benchmark })
        } else {
          result.push({ text: raw })
        }
      } else {
        result.push({ text: raw })
      }
      lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) {
      result.push({ text: text.slice(lastIndex) })
    }
    return result
  }, [text, excludeTermId, excludeModelId, excludeBenchmarkId])

  return (
    <span className={className} style={style}>
      {parts.map((p, i) => {
        if (p.term) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTermTap(p.term!)}
              className="inline underline decoration-dotted underline-offset-2 font-semibold cursor-pointer active:opacity-70"
              style={{
                color: termCategoryColor[p.term!.category],
                textDecorationColor: hexToRgba(termCategoryColor[p.term!.category], 0.4),
                transition: `opacity 200ms ${SPRING}`,
              }}
            >
              {p.text}
            </button>
          )
        }
        if (p.modelH) {
          const c = p.modelH.company.accentColor
          return (
            <button
              key={i}
              type="button"
              onClick={() => onModelTap(p.modelH!)}
              className="inline underline decoration-dotted underline-offset-2 font-semibold cursor-pointer active:opacity-70"
              style={{
                color: c,
                textDecorationColor: hexToRgba(c, 0.4),
                transition: `opacity 200ms ${SPRING}`,
              }}
            >
              {p.text}
            </button>
          )
        }
        if (p.benchmark && onBenchmarkTap) {
          const c = BENCHMARK_HIGHLIGHT_COLOR
          return (
            <button
              key={i}
              type="button"
              onClick={() => onBenchmarkTap(p.benchmark!)}
              className="inline underline decoration-dotted underline-offset-2 font-semibold cursor-pointer active:opacity-70"
              style={{
                color: c,
                textDecorationColor: hexToRgba(c, 0.4),
                transition: `opacity 200ms ${SPRING}`,
              }}
            >
              {p.text}
            </button>
          )
        }
        return <span key={i}>{p.text}</span>
      })}
    </span>
  )
}

// ---------------- Hook: combined popup state ----------------

// Each entry on the stack represents one popup the user has navigated to.
// The top entry is what's currently visible. Pushing onto the stack happens
// when the user taps a link inside an existing popup; popping happens when
// they tap the new "back" button. The X button always clears the entire stack.
type PopupEntry =
  | { kind: 'term'; value: AITerm }
  | { kind: 'model'; value: ModelPopupPayload }
  | { kind: 'benchmark'; value: Benchmark }
  | { kind: 'source'; value: Source }

export function useTermPopup() {
  const [stack, setStack] = useState<PopupEntry[]>([])
  const top = stack.length > 0 ? stack[stack.length - 1] : null

  // Derived "active X" values keep the existing consumer API stable: each
  // consumer renders <TermPopup>, <ModelPopup>, etc. conditionally on these.
  const activeTerm = top?.kind === 'term' ? top.value : null
  const activeModel = top?.kind === 'model' ? top.value : null
  const activeBenchmark = top?.kind === 'benchmark' ? top.value : null
  const activeSource = top?.kind === 'source' ? top.value : null

  const clearAll = () => setStack([])
  const back = () => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : []))

  // Each show*() call either pushes onto the stack (opening a new popup over
  // the current one) or clears it entirely if called with null. We dedupe so
  // tapping the same entity that's already on top doesn't push a duplicate
  // history entry (which would make "back" feel broken). We use the functional
  // setter form so dedup compares against the latest committed state, not a
  // stale closure capture from a prior render.
  const showTerm = (t: AITerm | null) => {
    if (!t) return clearAll()
    setStack((prev) => {
      const tip = prev[prev.length - 1]
      if (tip?.kind === 'term' && tip.value.id === t.id) return prev
      return [...prev, { kind: 'term', value: t }]
    })
  }
  const showModel = (m: ModelPopupPayload | null) => {
    if (!m) return clearAll()
    setStack((prev) => {
      const tip = prev[prev.length - 1]
      if (tip?.kind === 'model' && tip.value.model.id === m.model.id) return prev
      return [...prev, { kind: 'model', value: m }]
    })
  }
  const showBenchmark = (b: Benchmark | null) => {
    if (!b) return clearAll()
    setStack((prev) => {
      const tip = prev[prev.length - 1]
      if (tip?.kind === 'benchmark' && tip.value.id === b.id) return prev
      return [...prev, { kind: 'benchmark', value: b }]
    })
  }
  const showSource = (s: Source | null) => {
    if (!s) return clearAll()
    setStack((prev) => {
      const tip = prev[prev.length - 1]
      if (tip?.kind === 'source' && tip.value.id === s.id) return prev
      return [...prev, { kind: 'source', value: s }]
    })
  }

  return {
    activeTerm,
    activeModel,
    activeBenchmark,
    activeSource,
    showTerm,
    showModel,
    showBenchmark,
    showSource,
    selectTerm: (t: AITerm) => showTerm(t),
    // X button: collapse the entire navigation chain. All four clear*() are
    // aliases of the same operation by design — there's only one stack.
    clearTerm: clearAll,
    clearModel: clearAll,
    clearBenchmark: clearAll,
    clearSource: clearAll,
    // Back button — only meaningful when the stack has more than one entry.
    back,
    canGoBack: stack.length > 1,
  }
}

// Re-export Benchmark for convenience so consumers don't need to dig into
// data/benchmarks.ts just to type a callback.
export type { Benchmark }
