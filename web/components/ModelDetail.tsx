'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  Hash,
  LayoutGrid,
  Cpu,
  Gauge,
  Zap,
  HardDrive,
  AlignLeft,
  Image,
  AudioWaveform,
  Video,
  Code2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BadgeCheck,
  Brain,
  Wrench,
  Layers,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type {
  AICompany,
  AIModel,
  AITerm,
  Capability,
  Myth,
  Source,
  Modality,
  CapabilityRating,
  MythVerdict,
} from '@/data/types'
import {
  ratingValue,
  ratingLabel,
  ratingColor,
  verdictLabel,
  verdictColor,
  sourceTypeLabel,
  sourceTypeColor,
  modalityIcon,
  modelCategoryLabel,
  modelCategoryColor,
} from '@/data/types'
import { ModelPopup, TermPopup, BenchmarkPopup, SourcePopup, TermHighlightedText, useTermPopup } from './TermHighlight'
import type { Benchmark } from '@/data/benchmarks'
import { BENCHMARK_PATTERNS_ALL } from '@/data/benchmarks'

const MODALITY_COLORS: Record<Modality, string> = {
  Text: '#3b82f6',
  Image: '#22c55e',
  Audio: '#f97316',
  Video: '#ec4899',
  Code: '#a855f7',
}

const MODALITY_ICON_MAP: Record<string, LucideIcon> = {
  AlignLeft,
  Image,
  AudioWaveform,
  Video,
  Code2,
}

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return `rgba(102, 179, 255, ${alpha})`
  return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${alpha})`
}

// Capability auto-categorization. Each capability is classified by checking its
// name + description against keyword lists; the first matching category wins,
// and 'other' is the fallback. Order matters — more specific buckets come first.
type CapabilityCategoryId =
  | 'reasoning'
  | 'coding'
  | 'agent'
  | 'multimodal'
  | 'language'
  | 'knowledge'
  | 'speed'
  | 'context'
  | 'other'

const CAP_CATEGORIES: { id: CapabilityCategoryId; label: string; icon: LucideIcon; keywords: string[] }[] = [
  { id: 'context',    label: 'Long Context',         icon: LayoutGrid, keywords: ['long context', 'long-context', 'context window', 'large context', 'context length'] },
  { id: 'agent',      label: 'Agent & Tools',        icon: Wrench,     keywords: ['agentic', 'agent ', 'tool use', 'tool-use', 'function call', 'computer use', 'autonomous', 'browser use', 'os ', 'osworld', 'terminal', 'plugin'] },
  { id: 'coding',     label: 'Coding & Development', icon: Code2,      keywords: ['code', 'coding', 'programming', 'swe-bench', 'swe bench', 'humaneval', 'mbpp', 'debug', 'refactor', 'github', 'programmer', 'software engineering'] },
  { id: 'reasoning',  label: 'Reasoning & Math',     icon: Brain,      keywords: ['reasoning', 'math', 'logic', 'aime', 'gpqa', 'science', 'problem solving', 'mathematic', 'gsm8k', 'arithmetic'] },
  { id: 'multimodal', label: 'Multimodal',           icon: Layers,     keywords: ['image', 'vision', 'video', 'audio', 'multimodal', 'visual', 'speech', 'transcription', 'omni', 'voice', 'mmmu', 'chartqa', 'docvqa', 'mathvista'] },
  { id: 'language',   label: 'Language & Writing',   icon: AlignLeft,  keywords: ['writing', 'conversation', 'dialog', 'dialogue', 'creative', 'prose', 'summariz', 'translation', 'multilingual', 'languages', 'character', 'persona', 'tone'] },
  { id: 'knowledge',  label: 'Knowledge & Accuracy', icon: BookOpen,   keywords: ['knowledge', 'factual', 'accuracy', 'accurate', 'truthful', 'hallucinat', 'recall', 'encyclopedic', 'grounded', 'citation', 'sourc'] },
  { id: 'speed',      label: 'Speed & Efficiency',   icon: Zap,        keywords: ['speed', 'latency', 'fast', 'efficient', 'efficiency', 'throughput', 'real-time', 'real time', 'tokens per second', 'cost', 'cheap', 'price', 'affordable', 'budget'] },
  { id: 'other',      label: 'Other Capabilities',   icon: Sparkles,   keywords: [] },
]

function categorizeCapability(cap: Capability): CapabilityCategoryId {
  const haystack = `${cap.name} ${cap.description}`.toLowerCase()
  for (const cat of CAP_CATEGORIES) {
    if (cat.id === 'other') continue
    for (const kw of cat.keywords) {
      if (haystack.includes(kw)) return cat.id
    }
  }
  return 'other'
}

// Pulls benchmark mentions out of capability descriptions so we can render them
// as tappable chips. Uses BENCHMARK_PATTERNS_ALL (sorted longest-first) so
// "SWE-Bench Pro" matches before "SWE-Bench" and we never double-count.
function extractBenchmarks(text: string): Benchmark[] {
  const found: Benchmark[] = []
  const seen = new Set<string>()
  let remaining = text
  for (const { benchmark, pattern } of BENCHMARK_PATTERNS_ALL) {
    if (seen.has(benchmark.id)) continue
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, 'i')
    if (re.test(remaining)) {
      found.push(benchmark)
      seen.add(benchmark.id)
      remaining = remaining.replace(re, '')
    }
  }
  return found
}

interface ModelDetailProps {
  model: AIModel
  accentColor: string
  onBack: () => void
}

type TabId = 'overview' | 'capabilities' | 'myths' | 'sources'

function formatContextWindow(n: number): string {
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M tokens`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K tokens`
  return `${n} tokens`
}

function formatDateAbbrev(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'myths', label: 'Myths' },
  { id: 'sources', label: 'Sources' },
]

export default function ModelDetail({ model, accentColor, onBack }: ModelDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const {
    activeTerm,
    activeModel,
    activeBenchmark,
    activeSource,
    showTerm,
    showModel,
    showBenchmark,
    showSource,
    selectTerm,
    clearTerm,
    clearModel,
    clearBenchmark,
    clearSource,
    back,
    canGoBack,
  } = useTermPopup()

  const accentBg20 = `${accentColor}33`
  const accentBg15 = `${accentColor}26`

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] p-6">
      <div className="max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#b3b2b8] hover:text-[#f5f5f5] transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-[10px] text-sm font-medium whitespace-nowrap transition-all"
              style={
                activeTab === tab.id
                  ? { backgroundColor: accentColor, color: '#fff' }
                  : { backgroundColor: '#161618', color: '#b3b2b8' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Model header - always visible */}
        <header>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="text-[28px] font-bold text-[#f5f5f5] leading-tight">
              {model.name}
            </h1>
            <span className="font-mono text-sm text-[#8a8990]">{model.version}</span>
            {model.category && model.category !== 'language' && (
              <span
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: `${modelCategoryColor[model.category]}26`,
                  color: modelCategoryColor[model.category],
                }}
              >
                {modelCategoryLabel[model.category]}
              </span>
            )}
            {model.isOpenSource && (
              <span
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: accentBg20, color: accentColor }}
              >
                Open Source
              </span>
            )}
          </div>
          <TermHighlightedText
            text={model.description}
            className="block text-[#b3b2b8] text-sm leading-relaxed mb-3"
            onTermTap={showTerm}
            onModelTap={showModel}
            onBenchmarkTap={showBenchmark}
            excludeModelId={model.id}
          />
          <div className="flex items-center gap-2 text-[#8a8990] text-sm">
            <Calendar size={16} />
            <span>{formatDateAbbrev(model.releaseDate)}</span>
          </div>
        </header>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <OverviewTab
            model={model}
            accentColor={accentColor}
            accentBg20={accentBg20}
            onTermTap={showTerm}
            onModelTap={showModel}
            onBenchmarkTap={showBenchmark}
          />
        )}
        {activeTab === 'capabilities' && (
          <CapabilitiesTab
            model={model}
            accentColor={accentColor}
            accentBg20={accentBg20}
            onTermTap={showTerm}
            onModelTap={showModel}
            onBenchmarkTap={showBenchmark}
          />
        )}
        {activeTab === 'myths' && (
          <MythsTab
            model={model}
            accentColor={accentColor}
            accentBg20={accentBg20}
            onTermTap={showTerm}
            onModelTap={showModel}
            onBenchmarkTap={showBenchmark}
            onSourceTap={showSource}
          />
        )}
        {activeTab === 'sources' && (
          <SourcesTab model={model} accentColor={accentColor} accentBg20={accentBg20} onSourceTap={showSource} />
        )}
      </div>

      {activeTerm && (
        <TermPopup
          term={activeTerm}
          onClose={clearTerm}
          onBack={canGoBack ? back : undefined}
          onTermTap={selectTerm}
          onModelTap={showModel}
          onBenchmarkTap={showBenchmark}
        />
      )}
      {activeModel && (
        <ModelPopup
          payload={activeModel}
          onClose={clearModel}
          onBack={canGoBack ? back : undefined}
          onTermTap={showTerm}
          onModelTap={showModel}
          onBenchmarkTap={showBenchmark}
        />
      )}
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
      {activeSource && (
        <SourcePopup source={activeSource} onClose={clearSource} onBack={canGoBack ? back : undefined} />
      )}
    </div>
  )
}

type ModelHighlightProps = {
  onTermTap: (term: AITerm) => void
  onModelTap: (info: { model: AIModel; company: AICompany; matched: string }) => void
  onBenchmarkTap: (benchmark: Benchmark) => void
}

function OverviewTab({
  model,
  accentColor,
  accentBg20,
  onTermTap,
  onModelTap,
  onBenchmarkTap,
}: {
  model: AIModel
  accentColor: string
  accentBg20: string
} & ModelHighlightProps) {
  const { specs, pricing, limitations } = model

  const specRows = [
    { icon: Hash, label: 'Parameter Count', value: specs.parameterCount ?? '—' },
    { icon: LayoutGrid, label: 'Context Window', value: specs.contextWindow > 0 ? formatContextWindow(specs.contextWindow) : '—' },
    { icon: Calendar, label: 'Training Data Cutoff', value: specs.trainingDataCutoff ?? '—' },
    { icon: Cpu, label: 'Architecture', value: specs.architecture },
    { icon: Gauge, label: 'Latency', value: specs.averageLatency ?? '—' },
    { icon: Zap, label: 'Tokens per Second', value: specs.tokensPerSecond ?? '—' },
    { icon: HardDrive, label: 'VRAM / Resources', value: specs.resourceRequirements ?? '—' },
  ]

  return (
    <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:items-start">
      {/* SPECIFICATIONS */}
      <section className="lg:col-span-2">
        <h2 className="text-sm font-semibold text-[#8a8990] uppercase tracking-wider mb-4">
          Specifications
        </h2>
        <div className="rounded-[10px] bg-[#161618] border border-white/10 p-4 space-y-3">
          {specRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="flex-shrink-0 text-[#8a8990]" size={18} />
              <TermHighlightedText text={label} className="text-[#b3b2b8] text-sm" onTermTap={onTermTap} onModelTap={onModelTap} onBenchmarkTap={onBenchmarkTap} excludeModelId={model.id} />
              <TermHighlightedText text={value} className="ml-auto font-mono text-sm text-[#f5f5f5] text-right" onTermTap={onTermTap} onModelTap={onModelTap} onBenchmarkTap={onBenchmarkTap} excludeModelId={model.id} />
            </div>
          ))}
        </div>
      </section>

      {/* MODALITIES */}
      <section className="lg:col-span-2">
        <h2 className="text-sm font-semibold text-[#8a8990] uppercase tracking-wider mb-4">
          Modalities
        </h2>
        <div className="rounded-[10px] bg-[#161618] border border-white/10 p-4 flex items-center gap-6">
          <div className="flex-1">
            <p className="text-xs text-[#8a8990] mb-2">Input</p>
            <div className="flex flex-wrap gap-2">
              {specs.inputModalities.map((m) => (
                <ModalityBadge key={m} modality={m} />
              ))}
            </div>
          </div>
          <div className="w-px h-12 bg-[#2a2a2e]" />
          <div className="flex-1">
            <p className="text-xs text-[#8a8990] mb-2">Output</p>
            <div className="flex flex-wrap gap-2">
              {specs.outputModalities.map((m) => (
                <ModalityBadge key={m} modality={m} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      {pricing && (
        <section>
          <h2 className="text-sm font-semibold text-[#8a8990] uppercase tracking-wider mb-4">
            Pricing
          </h2>
          <div className="rounded-[10px] bg-[#161618] border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#b3b2b8] text-sm">Input price</span>
              <span className="font-mono text-sm text-[#22c55e]">
                {pricing.inputPricePerMillionTokens != null
                  ? `$${pricing.inputPricePerMillionTokens}/1M tokens`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#b3b2b8] text-sm">Output price</span>
              <span className="font-mono text-sm text-[#22c55e]">
                {pricing.outputPricePerMillionTokens != null
                  ? `$${pricing.outputPricePerMillionTokens}/1M tokens`
                  : '—'}
              </span>
            </div>
            {pricing.freeTierAvailable && (
              <span
                className="inline-block px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: '#22c55e26', color: '#22c55e' }}
              >
                Free tier available
              </span>
            )}
            {pricing.notes && (
              <TermHighlightedText text={pricing.notes} className="text-sm text-[#8a8990] italic" onTermTap={onTermTap} onModelTap={onModelTap} onBenchmarkTap={onBenchmarkTap} excludeModelId={model.id} />
            )}
          </div>
        </section>
      )}

      {/* KNOWN LIMITATIONS */}
      <section className="lg:col-span-2">
        <h2 className="text-sm font-semibold text-[#8a8990] uppercase tracking-wider mb-4">
          Known Limitations
        </h2>
        <div
          className="rounded-[10px] p-4 space-y-2"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
        >
          {limitations.map((lim, i) => (
            <div key={i} className="flex items-start gap-2">
              <XCircle
                className="flex-shrink-0 mt-0.5 text-red-400"
                size={18}
              />
              <TermHighlightedText text={lim} className="text-sm text-[#d6d5da]" onTermTap={onTermTap} onModelTap={onModelTap} onBenchmarkTap={onBenchmarkTap} excludeModelId={model.id} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ModalityBadge({ modality }: { modality: Modality }) {
  const color = MODALITY_COLORS[modality]
  const iconName = modalityIcon[modality]
  const IconComponent = MODALITY_ICON_MAP[iconName] ?? AlignLeft
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-xs font-medium"
      style={{ backgroundColor: `${color}33`, color }}
    >
      <IconComponent size={14} />
      {modality}
    </span>
  )
}

function CapabilitiesTab({
  model,
  accentColor,
  onTermTap,
  onModelTap,
  onBenchmarkTap,
}: {
  model: AIModel
  accentColor: string
  accentBg20: string
} & ModelHighlightProps) {
  const [filter, setFilter] = useState<CapabilityRating | 'all'>('all')
  const caps = model.capabilities

  const distribution: Record<CapabilityRating, number> = {
    poor: 0, fair: 0, good: 0, excellent: 0, exceptional: 0,
  }
  for (const c of caps) distribution[c.rating]++
  const total = caps.length
  const avg = total > 0 ? caps.reduce((s, c) => s + ratingValue[c.rating], 0) / total : 0
  const verifiedCount = caps.filter((c) => c.isVerified).length
  const ratingTiers: CapabilityRating[] = ['exceptional', 'excellent', 'good', 'fair', 'poor']

  const topStrengths = total > 0
    ? [...caps].sort((a, b) => ratingValue[b.rating] - ratingValue[a.rating]).slice(0, 3)
    : []

  const visibleCaps = filter === 'all' ? caps : caps.filter((c) => c.rating === filter)

  // Group by category, preserving CAP_CATEGORIES display order.
  const grouped = new Map<CapabilityCategoryId, Capability[]>()
  for (const c of visibleCaps) {
    const id = categorizeCapability(c)
    if (!grouped.has(id)) grouped.set(id, [])
    grouped.get(id)!.push(c)
  }

  if (total === 0) {
    return (
      <div className="rounded-[10px] bg-[#161618] border border-white/10 p-12 text-center">
        <Sparkles className="mx-auto mb-4 text-[#8a8990]" size={40} />
        <p className="text-lg font-medium text-[#f5f5f5]">No capabilities documented</p>
        <p className="text-sm text-[#8a8990] mt-1">
          We don&apos;t have verified capability data for this model yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* OVERVIEW SUMMARY */}
      <section>
        <h2 className="text-sm font-semibold text-[#8a8990] uppercase tracking-wider mb-3">
          Capability Overview
        </h2>
        <div className="rounded-[10px] bg-[#161618] border border-white/10 p-5 border border-[#1e1e21]">
          <div className="flex items-end gap-7 mb-5 flex-wrap">
            <div>
              <div className="text-3xl font-bold text-[#f5f5f5] leading-none">
                {avg.toFixed(1)}
                <span className="text-[#7a797f] text-base font-medium ml-0.5">/5</span>
              </div>
              <div className="text-[10px] font-bold tracking-[1px] text-[#8a8990] uppercase mt-1.5">
                Average Rating
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#f5f5f5] leading-none">{total}</div>
              <div className="text-[10px] font-bold tracking-[1px] text-[#8a8990] uppercase mt-1.5">
                Capabilities
              </div>
            </div>
            {verifiedCount > 0 && (
              <div>
                <div
                  className="text-3xl font-bold leading-none flex items-center gap-1.5"
                  style={{ color: '#22c55e' }}
                >
                  <CheckCircle2 size={20} />
                  {verifiedCount}
                </div>
                <div className="text-[10px] font-bold tracking-[1px] text-[#8a8990] uppercase mt-1.5">
                  Independently Verified
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            {ratingTiers.map((r) => {
              const count = distribution[r]
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={r} className="flex items-center gap-3">
                  <span
                    className="w-[88px] text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: ratingColor[r] }}
                  >
                    {ratingLabel[r]}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[#0a0a0a] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: ratingColor[r],
                        transition: 'width 400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-medium text-[#8a8990] tabular-nums">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TOP STRENGTHS */}
      {topStrengths.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#8a8990] uppercase tracking-wider mb-3">
            Top Strengths
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topStrengths.map((c) => {
              const c1 = ratingColor[c.rating]
              return (
                <div
                  key={c.id}
                  className="rounded-[10px] p-4 border"
                  style={{
                    backgroundColor: hexToRgba(c1, 0.08),
                    borderColor: hexToRgba(c1, 0.25),
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c1 }}
                    />
                    <span
                      className="text-[10px] font-bold tracking-[1px] uppercase"
                      style={{ color: c1 }}
                    >
                      {ratingLabel[c.rating]} · {ratingValue[c.rating]}/5
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#f5f5f5] leading-snug">{c.name}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* FILTER CHIPS */}
      <section>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', ...ratingTiers] as const).map((opt) => {
            const count = opt === 'all' ? total : distribution[opt]
            if (opt !== 'all' && count === 0) return null
            const isActive = filter === opt
            const c = opt === 'all' ? accentColor : ratingColor[opt]
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className="flex-shrink-0 px-3 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all"
                style={
                  isActive
                    ? { backgroundColor: c, color: '#fff', border: '1px solid transparent' }
                    : {
                        backgroundColor: '#161618',
                        color: '#b3b2b8',
                        border: '1px solid #2a2a2e',
                      }
                }
              >
                {opt === 'all' ? 'All' : ratingLabel[opt]}{' '}
                <span className={isActive ? 'opacity-60' : 'text-[#7a797f]'}>· {count}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* GROUPED CAPABILITY CARDS */}
      <div className="space-y-7">
        {CAP_CATEGORIES.map((cat) => {
          const list = grouped.get(cat.id)
          if (!list || list.length === 0) return null
          const Icon = cat.icon
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className="text-[#8a8990]" />
                <h3 className="text-xs font-bold tracking-[1.5px] text-[#8a8990] uppercase">
                  {cat.label}
                </h3>
                <span className="text-xs text-[#7a797f]">· {list.length}</span>
              </div>
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {list.map((cap) => (
                  <CapabilityCard
                    key={cap.id}
                    capability={cap}
                    modelId={model.id}
                    onTermTap={onTermTap}
                    onModelTap={onModelTap}
                    onBenchmarkTap={onBenchmarkTap}
                  />
                ))}
              </div>
            </section>
          )
        })}
        {visibleCaps.length === 0 && (
          <p className="text-center text-[#8a8990] py-8">
            No capabilities match this filter.
          </p>
        )}
      </div>

      {/* RATING SCALE LEGEND */}
      <section className="pt-2">
        <p className="text-[11px] text-[#7a797f] leading-relaxed">
          <span className="font-semibold text-[#8a8990]">Rating scale</span> · Ratings reflect
          relative strength compared to peers in the same model class. <span style={{ color: '#22c55e' }}>Verified</span> indicates the
          claim is backed by a published benchmark or first-party documentation.
        </p>
      </section>
    </div>
  )
}

function CapabilityCard({
  capability,
  modelId,
  onTermTap,
  onModelTap,
  onBenchmarkTap,
}: { capability: Capability; modelId: string } & ModelHighlightProps) {
  const rating = capability.rating
  const value = ratingValue[rating]
  const color = ratingColor[rating]
  const label = ratingLabel[rating]
  const benchmarks = extractBenchmarks(capability.description)

  return (
    <div className="rounded-[10px] bg-[#161618] border border-white/10 p-4 border border-[#1e1e21] hover:border-[#3a3a40] transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-[#f5f5f5] text-[15px] leading-snug">
              {capability.name}
            </span>
            {capability.isVerified && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
              >
                <CheckCircle2 size={10} />
                Verified
              </span>
            )}
          </div>
          <span
            className="text-[10px] font-bold tracking-[1.2px] uppercase"
            style={{ color }}
          >
            {label}
          </span>
        </div>
        <div className="flex-shrink-0 text-right pl-2">
          <div className="text-lg font-bold leading-none tabular-nums" style={{ color }}>
            {value}
            <span className="text-[#7a797f] text-xs font-medium">/5</span>
          </div>
        </div>
      </div>

      <TermHighlightedText
        text={capability.description}
        className="block text-sm text-[#b3b2b8] leading-relaxed mb-3"
        onTermTap={onTermTap}
        onModelTap={onModelTap}
        onBenchmarkTap={onBenchmarkTap}
        excludeModelId={modelId}
      />

      {benchmarks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {benchmarks.map((bm) => (
            <button
              key={bm.id}
              type="button"
              onClick={() => onBenchmarkTap(bm)}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#b3b2b8] hover:text-[#f5f5f5] hover:border-[#3a3a40] active:scale-[0.96]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid #1e1e21',
                transition: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              {bm.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: i <= value ? color : '#1e1e21' }}
          />
        ))}
      </div>
    </div>
  )
}

function MythsTab({
  model,
  accentColor,
  accentBg20,
  onTermTap,
  onModelTap,
  onBenchmarkTap,
  onSourceTap,
}: {
  model: AIModel
  accentColor: string
  accentBg20: string
  onSourceTap: (source: Source) => void
} & ModelHighlightProps) {
  const { myths } = model

  if (myths.length === 0) {
    return (
      <div className="rounded-[10px] bg-[#161618] border border-white/10 p-12 text-center">
        <BadgeCheck
          className="mx-auto mb-4 text-green-400"
          size={48}
        />
        <p className="text-lg font-medium text-[#f5f5f5]">No Common Myths</p>
        <p className="text-sm text-[#8a8990] mt-1">
          No widely circulated myths have been documented for this model.
        </p>
      </div>
    )
  }

  const verdictTypes = [...new Set(myths.map((m) => m.verdict))]

  return (
    <div className="space-y-6">
      {/* Verdict legend */}
      <div className="flex flex-wrap gap-4 items-center">
        {verdictTypes.map((v) => (
          <div key={v} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: verdictColor[v] }}
            />
            <span className="text-sm text-[#b3b2b8]">{verdictLabel[v]}</span>
          </div>
        ))}
      </div>

      {/* Myth cards */}
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {myths.map((myth) => (
          <MythCard key={myth.id} modelId={model.id} myth={myth} accentColor={accentColor} onTermTap={onTermTap} onModelTap={onModelTap} onBenchmarkTap={onBenchmarkTap} onSourceTap={onSourceTap} />
        ))}
      </div>
    </div>
  )
}

function MythCard({
  myth,
  modelId,
  accentColor,
  onTermTap,
  onModelTap,
  onBenchmarkTap,
  onSourceTap,
}: {
  myth: Myth
  modelId: string
  accentColor: string
  onSourceTap: (source: Source) => void
} & ModelHighlightProps) {
  const color = verdictColor[myth.verdict]
  const label = verdictLabel[myth.verdict]

  return (
    <div className="rounded-[10px] bg-[#161618] border border-white/10 p-4 border border-[#2a2a2e]">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium" style={{ color }}>
          {label}
        </span>
      </div>
      <TermHighlightedText text={myth.claim} className="block text-[#f5f5f5] font-medium mb-2" onTermTap={onTermTap} onModelTap={onModelTap} onBenchmarkTap={onBenchmarkTap} excludeModelId={modelId} />
      <TermHighlightedText text={myth.explanation} className="block text-sm text-[#b3b2b8] leading-relaxed mb-3" onTermTap={onTermTap} onModelTap={onModelTap} onBenchmarkTap={onBenchmarkTap} excludeModelId={modelId} />
      {myth.source && (
        <button
          type="button"
          onClick={() => myth.source && onSourceTap(myth.source)}
          className="inline-flex items-center gap-1.5 text-sm underline decoration-dotted underline-offset-2 active:opacity-70 transition-opacity"
          style={{ color: accentColor }}
          aria-label={`About source: ${myth.source.title}`}
        >
          <BookOpen size={14} />
          {myth.source.title}
        </button>
      )}
    </div>
  )
}

function SourcesTab({
  model,
  accentColor,
  accentBg20,
  onSourceTap,
}: {
  model: AIModel
  accentColor: string
  accentBg20: string
  onSourceTap: (source: Source) => void
}) {
  return (
    <div className="space-y-3">
      {model.sources.map((source) => (
        <SourceRow key={source.id} source={source} accentColor={accentColor} onTap={onSourceTap} />
      ))}
    </div>
  )
}

function SourceRow({
  source,
  accentColor,
  onTap,
}: {
  source: Source
  accentColor: string
  onTap: (source: Source) => void
}) {
  const typeColor = sourceTypeColor[source.type]
  const typeLabel = sourceTypeLabel[source.type]

  return (
    <button
      type="button"
      onClick={() => onTap(source)}
      className="w-full text-left flex items-center gap-3 p-3 rounded-[10px] bg-[#161618] border border-[#2a2a2e] hover:border-[#333338] transition-colors group active:scale-[0.99]"
      aria-label={`About source: ${source.title}`}
    >
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${typeColor}33`, color: typeColor }}
      >
        <BookOpen size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#f5f5f5] truncate">{source.title}</p>
        <span
          className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium"
          style={{ backgroundColor: `${typeColor}33`, color: typeColor }}
        >
          {typeLabel}
        </span>
      </div>
      <ExternalLink
        className="flex-shrink-0 text-[#8a8990] group-hover:text-[#f5f5f5] transition-colors"
        size={18}
      />
    </button>
  )
}
