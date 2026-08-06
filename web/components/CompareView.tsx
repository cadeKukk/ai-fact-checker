'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Search,
  X,
  Plus,
  Crown,
  ChevronDown,
  ChevronUp,
  Check,
  Brain,
  ShieldCheck,
  Sparkles,
  Infinity,
  XCircle as CircleX,
  Wind,
  Link2,
  Moon,
  Building2,
  GitCompare,
  Eye,
  Ear,
  Video,
  Code2,
  AlignLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Zap,
  DollarSign,
  BookOpen,
  Layers,
  ExternalLink,
  Info,
} from 'lucide-react'
import { companies, getAllModels } from '@/data/companies'
import { factCheckQAs } from '@/data/factcheck'
import {
  type AIModel,
  type AICompany,
  type Modality,
  type Capability,
  type CapabilityRating,
  ratingValue,
  ratingLabel,
  ratingColor,
} from '@/data/types'

export type CompareNavTarget =
  | { kind: 'company'; companyId: string }
  | { kind: 'sources'; query: string }
  | { kind: 'factcheck'; query: string }

const LOGO_ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Brain, ShieldCheck, Sparkles, Infinity, CircleX, Wind, Link2, Moon,
}

const MODALITY_ICON_MAP: Record<Modality, React.ComponentType<{ className?: string; size?: number }>> = {
  Text: AlignLeft, Image: Eye, Audio: Ear, Video, Code: Code2,
}

const MAX_MODELS = 3

// ---------- shared helpers ----------

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 179, 255, ${alpha})`
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getCompanyForModel(modelId: string): AICompany | undefined {
  return companies.find((c) => c.models.some((m) => m.id === modelId))
}

function parseParamCount(s?: string): number | null {
  if (!s) return null
  const match = s.match(/([\d.]+)\s*[Bb]/)
  if (match) return parseFloat(match[1])
  return null
}

function parseLatency(s?: string): number | null {
  if (!s) return null
  const match = s.match(/([\d.]+)\s*ms/)
  if (match) return parseFloat(match[1])
  const secMatch = s.match(/([\d.]+)\s*s(?:ec)?/)
  if (secMatch) return parseFloat(secMatch[1]) * 1000
  return null
}

function parseSpeed(s?: string): number | null {
  if (!s) return null
  const match = s.match(/([\d.]+)\s*tokens?\/s/)
  if (match) return parseFloat(match[1])
  return null
}

// ---------- scoring ----------

type Dimension = 'quality' | 'speed' | 'context' | 'value' | 'versatility'

interface DimensionMeta {
  id: Dimension
  label: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  weight: number
  awardLabel: string
  awardIcon: React.ComponentType<{ className?: string; size?: number }>
}

const DIMENSIONS: DimensionMeta[] = [
  { id: 'quality', label: 'Quality', icon: Target, weight: 0.40, awardLabel: 'Best Quality', awardIcon: Target },
  { id: 'speed', label: 'Speed', icon: Zap, weight: 0.15, awardLabel: 'Fastest', awardIcon: Zap },
  { id: 'context', label: 'Context', icon: BookOpen, weight: 0.15, awardLabel: 'Most Context', awardIcon: BookOpen },
  { id: 'value', label: 'Value', icon: DollarSign, weight: 0.20, awardLabel: 'Best Value', awardIcon: DollarSign },
  { id: 'versatility', label: 'Versatility', icon: Layers, weight: 0.10, awardLabel: 'Most Versatile', awardIcon: Layers },
]

// Average verified-capability rating, mapped poor→exceptional (1–5) onto 0–100.
function qualityScore(model: AIModel): number {
  const ratings = model.capabilities.map((c: Capability) => ratingValue[c.rating])
  if (ratings.length === 0) return 0
  const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length
  // Map 1..5 -> 20..100, with a slight lift so a single 'fair' isn't punished too hard.
  return Math.max(0, Math.min(100, (avg / 5) * 100))
}

// Absolute log-scale speed score anchored at 5 tok/s (≈0) and 250 tok/s (≈100).
// Intentionally NOT normalized against other models in the comparison — that
// way adding a faster model never causes the existing models' scores to shift.
// Anchors: 5≈0, 25≈40, 50≈59, 100≈77, 150≈87, 200≈94, 250≈100.
const SPEED_MIN = 5
const SPEED_MAX = 250
function speedScore(model: AIModel): number | null {
  const my = parseSpeed(model.specs.tokensPerSecond)
  if (my == null) return null
  const v =
    (Math.log10(Math.max(my, 0.1)) - Math.log10(SPEED_MIN)) /
    (Math.log10(SPEED_MAX) - Math.log10(SPEED_MIN))
  return Math.max(0, Math.min(100, v * 100))
}

// Log-scale context score: 8K ~ 20, 128K ~ 60, 1M+ ~ 100.
function contextScore(model: AIModel): number {
  const c = model.specs.contextWindow
  if (!c || c <= 0) return 0
  const v = (Math.log10(c) - Math.log10(8000)) / (Math.log10(1_000_000) - Math.log10(8000))
  return Math.max(0, Math.min(100, v * 100))
}

// Value: cheaper input price = higher score; free tier gives a meaningful bump.
// Caps roughly so $0.10/M ≈ 100, $20/M ≈ 10. Free tier adds +10 (capped at 100).
function valueScore(model: AIModel): number | null {
  const price = model.pricing?.inputPricePerMillionTokens
  const free = model.pricing?.freeTierAvailable ?? false
  if (price == null) {
    // No pricing data: only a free tier signal exists.
    if (free) return 70
    return null
  }
  // Smooth log-ish curve. Anchors:
  //   $0.10/M -> ~95   $1/M -> ~70   $5/M -> ~50   $15/M -> ~20
  const base = Math.max(0, Math.min(100, 100 - 35 * Math.log10(price + 0.1) - 30))
  return Math.max(0, Math.min(100, base + (free ? 10 : 0)))
}

// Versatility: count of input + output modalities. Cap at 8 total.
function versatilityScore(model: AIModel): number {
  const total = model.specs.inputModalities.length + model.specs.outputModalities.length
  return Math.max(0, Math.min(100, (total / 8) * 100))
}

interface ScoreBreakdown {
  quality: number
  speed: number | null
  context: number
  value: number | null
  versatility: number
  overall: number
}

// Raw underlying values used for *winner determination only*. We compare these
// instead of the normalized 0-100 scores so we don't lose precision (e.g. log-
// scaled context windows compressing to ~100 for anything ≥1M) and so the
// award reflects what the user can see in the spec table.
function rawValueFor(dim: Dimension, model: AIModel): number | null {
  switch (dim) {
    case 'quality': {
      const ratings = model.capabilities.map((c: Capability) => ratingValue[c.rating])
      if (ratings.length === 0) return null
      return ratings.reduce((s, r) => s + r, 0) / ratings.length
    }
    case 'speed':
      return parseSpeed(model.specs.tokensPerSecond)
    case 'context':
      return model.specs.contextWindow > 0 ? model.specs.contextWindow : null
    case 'value': {
      // For "Best Value" we use price directly (lower wins). Free-tier acts as
      // a 25% effective-price discount. Models with no pricing data are excluded.
      const price = model.pricing?.inputPricePerMillionTokens
      if (price == null) return null
      const free = model.pricing?.freeTierAvailable ?? false
      return free ? price * 0.75 : price
    }
    case 'versatility':
      return model.specs.inputModalities.length + model.specs.outputModalities.length
  }
}

const HIGHER_IS_BETTER: Record<Dimension, boolean> = {
  quality: true,
  speed: true,
  context: true,
  value: false, // lower (effective) price wins
  versatility: true,
}

// Returns the indices of every model tied for first place. Empty array means
// no model has any data for this dimension (so we render "—").
function winnerIndices(
  values: (number | null)[],
  higherIsBetter: boolean,
  epsilon = 0,
): number[] {
  const valid = values
    .map((v, i) => ({ v, i }))
    .filter((e) => e.v != null) as { v: number; i: number }[]
  if (valid.length === 0) return []

  let best = higherIsBetter ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
  for (const e of valid) {
    if (higherIsBetter ? e.v > best : e.v < best) best = e.v
  }
  return valid
    .filter((e) => Math.abs(e.v - best) <= epsilon)
    .map((e) => e.i)
}

function scoreModel(model: AIModel): ScoreBreakdown {
  const q = qualityScore(model)
  const s = speedScore(model)
  const c = contextScore(model)
  const v = valueScore(model)
  const ver = versatilityScore(model)

  // Weighted overall, with weights re-normalized when a dimension is N/A so
  // missing data doesn't unfairly drag a model toward 0.
  let totalWeight = 0
  let sum = 0
  for (const dim of DIMENSIONS) {
    const val =
      dim.id === 'quality' ? q :
      dim.id === 'speed' ? s :
      dim.id === 'context' ? c :
      dim.id === 'value' ? v :
      ver
    if (val == null) continue
    sum += val * dim.weight
    totalWeight += dim.weight
  }
  const overall = totalWeight > 0 ? sum / totalWeight : 0

  return { quality: q, speed: s, context: c, value: v, versatility: ver, overall }
}

// ---------- ranking helpers (used by the existing detailed table) ----------

type RankResult = { rank: number; color: string; isBest: boolean }

function rankValues(values: (number | null)[], higherIsBetter: boolean): RankResult[] {
  const validEntries = values
    .map((v, i) => ({ v, i }))
    .filter((e) => e.v !== null) as { v: number; i: number }[]

  if (validEntries.length < 2) {
    return values.map(() => ({ rank: 0, color: '#b3b2b8', isBest: false }))
  }

  validEntries.sort((a, b) => (higherIsBetter ? b.v - a.v : a.v - b.v))

  const results: RankResult[] = values.map(() => ({ rank: -1, color: '#8a8990', isBest: false }))
  validEntries.forEach((entry, idx) => {
    const rank = idx + 1
    let color = '#f97316'
    if (rank === 1) color = '#22c55e'
    else if (rank === 2 && validEntries.length > 2) color = '#eab308'
    results[entry.i] = { rank, color, isBest: rank === 1 }
  })

  return results
}

// Count fact-check Q&As that explicitly reference this model name.
function factCheckCountForModel(model: AIModel): number {
  const target = model.name.toLowerCase()
  return factCheckQAs.filter((qa) =>
    qa.relatedModels.some((rm) => rm.toLowerCase() === target),
  ).length
}

// ---------- component ----------

interface CompareViewProps {
  onNavigate?: (target: CompareNavTarget) => void
  /** Model ids seeded from the URL's ?models= parameter. */
  initialModelIds?: string[]
}

export default function CompareView({ onNavigate, initialModelIds }: CompareViewProps = {}) {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(
    () => initialModelIds?.slice(0, MAX_MODELS) ?? []
  )
  const [showPicker, setShowPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')

  // Keep the URL shareable as models are selected, without triggering navigation.
  useEffect(() => {
    const url = selectedModelIds.length
      ? `${window.location.pathname}?models=${selectedModelIds.join(',')}`
      : window.location.pathname
    window.history.replaceState(null, '', url)
  }, [selectedModelIds])

  const allModels = useMemo(() => getAllModels(), [])

  const selectedModels = useMemo(
    () => selectedModelIds.map((id) => allModels.find((m) => m.id === id)!).filter(Boolean),
    [selectedModelIds, allModels]
  )

  const breakdowns = useMemo(
    () => selectedModels.map((m) => scoreModel(m)),
    [selectedModels]
  )

  const toggleModel = useCallback((modelId: string) => {
    setSelectedModelIds((prev) => {
      if (prev.includes(modelId)) return prev.filter((id) => id !== modelId)
      if (prev.length >= MAX_MODELS) return prev
      return [...prev, modelId]
    })
  }, [])

  const removeModel = useCallback((modelId: string) => {
    setSelectedModelIds((prev) => prev.filter((id) => id !== modelId))
  }, [])

  const filteredCompanies = useMemo(() => {
    const query = pickerSearch.trim().toLowerCase()
    if (!query) return companies
    return companies
      .map((c) => ({
        ...c,
        models: c.models.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query)
        ),
      }))
      .filter((c) => c.models.length > 0)
  }, [pickerSearch])

  // Indices of every model tied for first per dimension (and overall). Empty
  // array = no data, so the chip renders "—".
  const winners = useMemo(() => {
    const result: Record<'overall' | Dimension, number[]> = {
      overall: [],
      quality: [],
      speed: [],
      context: [],
      value: [],
      versatility: [],
    }

    // Overall uses the computed weighted score. A 0.5-point epsilon means
    // visually-identical bars are treated as ties.
    result.overall = winnerIndices(breakdowns.map((b) => b.overall), true, 0.5)

    // Per-dimension winners use raw underlying data so log-scaling / bucketing
    // never produces a false tie or wrong winner.
    for (const dim of DIMENSIONS) {
      const raws = selectedModels.map((m) => rawValueFor(dim.id, m))
      result[dim.id] = winnerIndices(raws, HIGHER_IS_BETTER[dim.id], 0)
    }

    return result
  }, [breakdowns, selectedModels])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] p-6">
      <div className="max-w-3xl lg:max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9fa3fc] mb-2">
              Benchmarks
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[#f5f5f5] leading-tight">Compare</h1>
            <p className="text-sm text-[#8a8990] mt-1.5">Quality, speed, context, value &amp; versatility</p>
          </div>
          {selectedModelIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedModelIds([])}
              className="text-sm text-[#8a8990] hover:text-[#f5f5f5] transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Selected chips */}
        {selectedModels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedModels.map((model) => {
              const company = getCompanyForModel(model.id)
              const accent = company?.accentColor ?? '#7065f0'
              return (
                <span
                  key={model.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-sm font-medium"
                  style={{ backgroundColor: hexToRgba(accent, 0.2), color: accent }}
                >
                  {model.name}
                  <button type="button" onClick={() => removeModel(model.id)} className="hover:opacity-70">
                    <X size={14} />
                  </button>
                </span>
              )
            })}
          </div>
        )}

        {/* Add / Select models button */}
        <button
          type="button"
          onClick={() => { setShowPicker(true); setPickerSearch('') }}
          className="w-full py-3 px-4 rounded-[10px] bg-[#161618] border border-dashed border-[#333338] text-[#b3b2b8] hover:border-[#7065f0]/50 hover:text-[#f5f5f5] transition-all flex items-center justify-center gap-2"
        >
          {selectedModels.length === 0 ? (
            <>
              <ChevronDown size={18} />
              Select up to {MAX_MODELS} models to compare
            </>
          ) : selectedModelIds.length < MAX_MODELS ? (
            <>
              <Plus size={18} />
              Add model ({selectedModelIds.length}/{MAX_MODELS})
            </>
          ) : (
            <span className="text-[#8a8990]">Maximum {MAX_MODELS} models selected</span>
          )}
        </button>

        {/* Model picker modal */}
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70">
            <div className="w-full max-w-lg max-h-[80vh] mb-20 sm:mb-0 rounded-t-2xl sm:rounded-[10px] bg-[#161618] border border-[#2a2a2e] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
                <h3 className="font-bold text-[#f5f5f5]">Select Models</h3>
                <button type="button" onClick={() => setShowPicker(false)} className="text-[#8a8990] hover:text-[#f5f5f5]">
                  <X size={20} />
                </button>
              </div>
              <div className="p-3 border-b border-[#2a2a2e]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8990]" size={16} />
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Search models..."
                    className="w-full pl-9 pr-4 py-2 rounded-[10px] bg-[#0a0a0a] border border-[#2a2a2e] text-[#f5f5f5] text-sm placeholder:text-[#8a8990] focus:outline-none focus:border-[#7065f0]/50"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {filteredCompanies.map((company) => {
                  const IconComponent = LOGO_ICON_MAP[company.logoIcon] ?? Building2
                  return (
                    <div key={company.id}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span style={{ color: company.accentColor }}><IconComponent size={16} /></span>
                        <span className="text-xs font-semibold text-[#8a8990] uppercase tracking-wide">
                          {company.name}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {company.models.map((model) => {
                          const isSelected = selectedModelIds.includes(model.id)
                          const isDisabled = !isSelected && selectedModelIds.length >= MAX_MODELS
                          return (
                            <button
                              key={model.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => toggleModel(model.id)}
                              className={`w-full text-left px-3 py-2.5 rounded-[10px] flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-[#7065f0]/15 border border-[#7065f0]/30'
                                  : isDisabled
                                  ? 'opacity-40 cursor-not-allowed bg-[#0a0a0a]'
                                  : 'bg-[#0a0a0a] hover:bg-[#151517] border border-transparent'
                              }`}
                            >
                              <div>
                                <span className="text-sm font-medium text-[#f5f5f5]">{model.name}</span>
                                <span className="text-xs text-[#8a8990] ml-2">{model.version}</span>
                              </div>
                              {isSelected && <Check size={16} className="text-[#7065f0]" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-3 border-t border-[#2a2a2e]">
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="w-full py-2.5 rounded-[10px] bg-[#7065f0] text-white font-semibold hover:bg-[#9fa3fc] transition-colors"
                >
                  Done ({selectedModelIds.length} selected)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Score cards (one per model). Shown as soon as anything is selected — a
            lone card still tells you the model's standalone scores, which is
            useful before you've finished adding comparisons. */}
        {selectedModels.length >= 1 && (
          <div className={`grid gap-3 ${
            selectedModels.length === 1 ? 'grid-cols-1' :
            selectedModels.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            'grid-cols-1 sm:grid-cols-3'
          }`}>
            {selectedModels.map((model, i) => (
              <ScoreCard
                key={model.id}
                model={model}
                breakdown={breakdowns[i]}
                isOverallWinner={
                  selectedModels.length >= 2 &&
                  winners.overall.includes(i) &&
                  // Don't crown everyone when *all* models tie (e.g. 3 identical
                  // selections) — the ribbon means nothing in that case.
                  winners.overall.length < selectedModels.length
                }
                onRemove={() => removeModel(model.id)}
              />
            ))}
          </div>
        )}

        {/* Awards strip (only meaningful with ≥2 models) */}
        {selectedModels.length >= 2 && (
          <AwardsStrip models={selectedModels} winners={winners} />
        )}

        {/* Strengths (per-model top capabilities). Useful even with 1 model. */}
        {selectedModels.length >= 1 && (
          <StrengthsSection models={selectedModels} />
        )}

        {/* Sources & references — let users dig into where the data comes from */}
        {selectedModels.length >= 1 && (
          <ReferencesSection models={selectedModels} onNavigate={onNavigate} />
        )}

        {/* How is this scored? — full methodology with per-model raw inputs */}
        <MethodologySection models={selectedModels} breakdowns={breakdowns} />

        {/* Detailed comparison table (≥2 models) */}
        {selectedModels.length >= 2 && (
          <div className="rounded-[10px] bg-[#161618] border border-[#2a2a2e] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2a2a2e]">
              <h2 className="text-sm font-semibold text-[#f5f5f5]">Full specifications</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a2e]">
                    <th className="text-left p-3 text-[#8a8990] font-medium min-w-[140px]" />
                    {selectedModels.map((model) => {
                      const company = getCompanyForModel(model.id)
                      return (
                        <th key={model.id} className="p-3 text-center min-w-[120px]">
                          <span className="font-bold text-[#f5f5f5] text-sm">{model.name}</span>
                          {company && (
                            <span className="block text-xs mt-0.5" style={{ color: company.accentColor }}>
                              {company.shortName}
                            </span>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* SPECIFICATIONS */}
                  <SectionHeader label="SPECIFICATIONS" colSpan={selectedModels.length + 1} />
                  <RankedRow
                    label="Parameters"
                    models={selectedModels}
                    getValue={(m) => m.specs.parameterCount ?? 'N/A'}
                    getNumeric={(m) => parseParamCount(m.specs.parameterCount)}
                    higherIsBetter={true}
                  />
                  <RankedRow
                    label="Context Window"
                    models={selectedModels}
                    getValue={(m) => (m.specs.contextWindow >= 1000000 ? `${(m.specs.contextWindow / 1000000).toFixed(1)}M` : `${(m.specs.contextWindow / 1000).toFixed(0)}K`)}
                    getNumeric={(m) => m.specs.contextWindow}
                    higherIsBetter={true}
                  />
                  <SimpleRow
                    label="Architecture"
                    models={selectedModels}
                    getValue={(m) => m.specs.architecture}
                  />
                  <RankedRow
                    label="Latency"
                    models={selectedModels}
                    getValue={(m) => m.specs.averageLatency ?? 'N/A'}
                    getNumeric={(m) => parseLatency(m.specs.averageLatency)}
                    higherIsBetter={false}
                  />
                  <RankedRow
                    label="Speed"
                    models={selectedModels}
                    getValue={(m) => m.specs.tokensPerSecond ?? 'N/A'}
                    getNumeric={(m) => parseSpeed(m.specs.tokensPerSecond)}
                    higherIsBetter={true}
                  />

                  {/* MODALITIES */}
                  <SectionHeader label="MODALITIES" colSpan={selectedModels.length + 1} />
                  <ModalityRow
                    label="Input"
                    models={selectedModels}
                    getModalities={(m) => m.specs.inputModalities}
                  />
                  <ModalityRow
                    label="Output"
                    models={selectedModels}
                    getModalities={(m) => m.specs.outputModalities}
                  />

                  {/* FEATURES */}
                  <SectionHeader label="FEATURES" colSpan={selectedModels.length + 1} />
                  <BooleanRow
                    label="Open Source"
                    models={selectedModels}
                    getValue={(m) => m.isOpenSource}
                  />
                  <BooleanRow
                    label="Free Tier"
                    models={selectedModels}
                    getValue={(m) => m.pricing?.freeTierAvailable ?? false}
                  />

                  {/* PRICING */}
                  <SectionHeader label="PRICING" colSpan={selectedModels.length + 1} />
                  <RankedRow
                    label="Input Cost"
                    models={selectedModels}
                    getValue={(m) =>
                      m.pricing?.inputPricePerMillionTokens != null
                        ? `$${m.pricing.inputPricePerMillionTokens.toFixed(2)}/M`
                        : 'N/A'
                    }
                    getNumeric={(m) => m.pricing?.inputPricePerMillionTokens ?? null}
                    higherIsBetter={false}
                  />
                  <RankedRow
                    label="Output Cost"
                    models={selectedModels}
                    getValue={(m) =>
                      m.pricing?.outputPricePerMillionTokens != null
                        ? `$${m.pricing.outputPricePerMillionTokens.toFixed(2)}/M`
                        : 'N/A'
                    }
                    getNumeric={(m) => m.pricing?.outputPricePerMillionTokens ?? null}
                    higherIsBetter={false}
                  />
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="p-3 border-t border-[#2a2a2e] flex flex-wrap gap-4 text-xs text-[#8a8990]">
              <span className="flex items-center gap-1">
                <Crown size={12} className="text-[#22c55e]" /> Best
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#eab308]" /> Middle
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#f97316]" /> Lowest
              </span>
            </div>
          </div>
        )}

        {selectedModels.length === 0 && (
          <p className="text-center text-[#8a8990] py-12 text-sm">
            Select 2 or 3 models to start comparing.
          </p>
        )}
      </div>
    </div>
  )
}

// ---------- Score Card ----------

function ScoreCard({
  model,
  breakdown,
  isOverallWinner,
  onRemove,
}: {
  model: AIModel
  breakdown: ScoreBreakdown
  isOverallWinner: boolean
  onRemove: () => void
}) {
  const company = getCompanyForModel(model.id)
  const accent = company?.accentColor ?? '#7065f0'
  const overall = Math.round(breakdown.overall)

  return (
    <div
      className={`relative rounded-[10px] bg-[#161618] border p-4 flex flex-col gap-3 ${
        isOverallWinner ? 'border-[#22c55e]/60 shadow-[0_0_0_1px_rgba(34,197,94,0.25)]' : 'border-[#2a2a2e]'
      }`}
    >
      {isOverallWinner && (
        <span className="absolute -top-2 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#22c55e] text-white text-[10px] font-bold uppercase tracking-wide">
          <Trophy size={10} /> Best overall
        </span>
      )}

      {/* Top: model name + remove */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#f5f5f5] truncate">{model.name}</h3>
          {company && (
            <p className="text-xs font-medium truncate" style={{ color: accent }}>
              {company.shortName}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[#838289] hover:text-[#f5f5f5] p-1 -m-1"
          aria-label={`Remove ${model.name}`}
        >
          <X size={14} />
        </button>
      </div>

      {/* Overall score */}
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-[#f5f5f5] tabular-nums">{overall}</span>
          <span className="text-sm text-[#8a8990] font-medium">/100</span>
          <span className="text-[11px] text-[#838289] ml-auto self-center uppercase tracking-wide">Overall</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-[#0a0a0a] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${overall}%`,
              background: `linear-gradient(90deg, ${accent} 0%, ${accent}cc 100%)`,
            }}
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="space-y-1.5">
        {DIMENSIONS.map((dim) => {
          const v =
            dim.id === 'quality' ? breakdown.quality :
            dim.id === 'speed' ? breakdown.speed :
            dim.id === 'context' ? breakdown.context :
            dim.id === 'value' ? breakdown.value :
            breakdown.versatility
          const Icon = dim.icon
          return (
            <div key={dim.id} className="grid grid-cols-[68px_1fr_28px] items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-[#8a8990]">
                <Icon size={11} />
                {dim.label}
              </span>
              <div className="h-1 rounded-full bg-[#0a0a0a] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: v == null ? '0%' : `${Math.round(v)}%`,
                    background: v == null ? '#333338' : accent,
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold text-[#b3b2b8] tabular-nums text-right">
                {v == null ? '—' : Math.round(v)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Awards ----------

function AwardsStrip({
  models,
  winners,
}: {
  models: AIModel[]
  winners: Record<'overall' | Dimension, number[]>
}) {
  const items: { dim: Dimension | 'overall'; label: string; Icon: React.ComponentType<{ className?: string; size?: number }> }[] = [
    { dim: 'overall', label: 'Best Overall', Icon: Trophy },
    ...DIMENSIONS.map((d) => ({ dim: d.id, label: d.awardLabel, Icon: d.awardIcon })),
  ]

  return (
    <div className="rounded-[10px] bg-[#161618] border border-[#2a2a2e] p-3">
      <h2 className="text-xs font-semibold text-[#8a8990] uppercase tracking-wider mb-2 px-1">Awards</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(({ dim, label, Icon }) => {
          const winnerIdxs = winners[dim]
          const allTied = winnerIdxs.length > 0 && winnerIdxs.length === models.length
          const tied = winnerIdxs.length > 1
          const winnerNames = winnerIdxs.map((i) => models[i].name)

          // When there's exactly one winner, use that company's accent. When
          // tied (or no data), fall back to a neutral accent so we don't favor
          // any one model visually.
          const singleWinner = winnerIdxs.length === 1 ? models[winnerIdxs[0]] : null
          const accent = singleWinner
            ? (getCompanyForModel(singleWinner.id)?.accentColor ?? '#7065f0')
            : '#7065f0'

          let displayName: string
          if (winnerIdxs.length === 0) displayName = '—'
          else if (allTied) displayName = 'All tied'
          else displayName = winnerNames.join(' · ')

          return (
            <div
              key={dim}
              className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#0a0a0a] border border-[#1e1e21]"
            >
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: hexToRgba(accent, 0.18), color: accent }}
              >
                <Icon size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-[#8a8990] leading-tight">
                  {tied && !allTied ? `${label} · Tied` : label}
                </p>
                <p
                  className="text-sm font-semibold text-[#f5f5f5] leading-tight"
                  title={displayName}
                >
                  {displayName}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Strengths ----------

function topCapabilities(model: AIModel, n: number): Capability[] {
  return [...model.capabilities]
    .sort((a, b) => ratingValue[b.rating] - ratingValue[a.rating])
    .slice(0, n)
}

function StrengthsSection({ models }: { models: AIModel[] }) {
  return (
    <div className="rounded-[10px] bg-[#161618] border border-[#2a2a2e] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2e]">
        <h2 className="text-sm font-semibold text-[#f5f5f5]">Strengths</h2>
        <p className="text-xs text-[#8a8990] mt-0.5">Each model&apos;s two highest-rated verified capabilities.</p>
      </div>
      <div className={`grid gap-px bg-[#2a2a2e] ${
        models.length === 1 ? 'grid-cols-1' :
        models.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        'grid-cols-1 sm:grid-cols-3'
      }`}>
        {models.map((model) => {
          const top = topCapabilities(model, 2)
          const company = getCompanyForModel(model.id)
          const accent = company?.accentColor ?? '#7065f0'
          return (
            <div key={model.id} className="bg-[#161618] border border-white/10 p-4 space-y-3">
              <p className="text-xs font-semibold" style={{ color: accent }}>{model.name}</p>
              {top.length === 0 && (
                <p className="text-xs text-[#838289]">No capability data.</p>
              )}
              {top.map((cap) => (
                <StrengthRow key={cap.id} cap={cap} />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StrengthRow({ cap }: { cap: Capability }) {
  const rating = cap.rating as CapabilityRating
  const color = ratingColor[rating]
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[#f5f5f5] truncate">{cap.name}</span>
        <span
          className="flex-shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{ backgroundColor: hexToRgba(color, 0.15), color }}
        >
          {ratingLabel[rating]}
        </span>
      </div>
      <p className="text-xs text-[#b3b2b8] leading-relaxed">{cap.description}</p>
    </div>
  )
}

// ---------- Sources & references ----------

function ReferencesSection({
  models,
  onNavigate,
}: {
  models: AIModel[]
  onNavigate?: (target: CompareNavTarget) => void
}) {
  return (
    <div className="rounded-[10px] bg-[#161618] border border-[#2a2a2e] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2e]">
        <h2 className="text-sm font-semibold text-[#f5f5f5]">Sources &amp; references</h2>
        <p className="text-xs text-[#8a8990] mt-0.5">
          Jump to the company profile, the original sources, or fact-checks that
          mention each model.
        </p>
      </div>
      <div className="divide-y divide-[#1e1e21]">
        {models.map((model) => {
          const company = getCompanyForModel(model.id)
          const accent = company?.accentColor ?? '#7065f0'
          const sourceCount = model.sources.length
          const fcCount = factCheckCountForModel(model)
          return (
            <div
              key={model.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#f5f5f5] truncate">{model.name}</p>
                <p className="text-xs truncate" style={{ color: accent }}>
                  {company?.name ?? 'Unknown company'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {company && onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate({ kind: 'company', companyId: company.id })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium bg-[#0a0a0a] border border-[#1e1e21] text-[#b3b2b8] hover:border-[#7065f0]/40 hover:text-[#f5f5f5] transition-colors"
                  >
                    <Building2 size={12} />
                    View company
                    <ExternalLink size={10} className="opacity-60" />
                  </button>
                )}
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({
                        kind: 'sources',
                        query: company?.shortName ?? model.name,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium bg-[#0a0a0a] border border-[#1e1e21] text-[#b3b2b8] hover:border-[#7065f0]/40 hover:text-[#f5f5f5] transition-colors"
                  >
                    <Link2 size={12} />
                    {sourceCount} source{sourceCount === 1 ? '' : 's'}
                    <ExternalLink size={10} className="opacity-60" />
                  </button>
                )}
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate({ kind: 'factcheck', query: model.name })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-colors ${
                      fcCount > 0
                        ? 'bg-[#0a0a0a] border-[#1e1e21] text-[#b3b2b8] hover:border-[#7065f0]/40 hover:text-[#f5f5f5]'
                        : 'bg-[#0a0a0a] border-[#1e1e21]/60 text-[#838289] cursor-default hover:cursor-pointer hover:text-[#b3b2b8] hover:border-[#1e1e21]'
                    }`}
                  >
                    <ShieldCheck size={12} />
                    {fcCount} fact check{fcCount === 1 ? '' : 's'}
                    <ExternalLink size={10} className="opacity-60" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Methodology (How is this scored?) ----------

interface MethodologyEntry {
  label: string
  weightPct: number
  formula: string
  data: string
  // Per-model row builder. Returns rawText (e.g. "4.8 / 5"), inputs (auxiliary
  // text — e.g. "5 capabilities"), and the resulting 0-100 score (or null).
  rowFor: (model: AIModel, all: AIModel[], score: ScoreBreakdown) => {
    inputs: string
    raw: string
    score: number | null
  }
}

const METHODOLOGY: MethodologyEntry[] = [
  {
    label: 'Quality',
    weightPct: 40,
    formula:
      "Average rating across each model's verified capabilities, mapped onto a 0–100 scale (poor=20, fair=40, good=60, excellent=80, exceptional=100).",
    data:
      'Capability ratings are editorial and drawn from each model\'s official documentation, technical reports, and published benchmark results — see each model\'s source list to audit them.',
    rowFor: (model, _all, score) => {
      const ratings = model.capabilities.map((c) => ratingValue[c.rating])
      const n = ratings.length
      const avg = n > 0 ? ratings.reduce((s, r) => s + r, 0) / n : null
      return {
        inputs: `${n} capabilit${n === 1 ? 'y' : 'ies'} rated`,
        raw: avg == null ? '—' : `${avg.toFixed(2)} / 5`,
        score: Math.round(score.quality),
      }
    },
  },
  {
    label: 'Speed',
    weightPct: 15,
    formula:
      "Provider-reported output tokens per second, mapped onto an absolute log scale (5 tok/s ≈ 0, 50 tok/s ≈ 59, 100 tok/s ≈ 77, 250 tok/s ≈ 100). Absolute — never changes when other models join or leave the comparison.",
    data:
      'Token rates come from each provider\'s public documentation or API reference (see the model\'s sources). Models without a published rate are excluded from this dimension.',
    rowFor: (model, _all, score) => {
      const my = parseSpeed(model.specs.tokensPerSecond)
      return {
        inputs: model.specs.tokensPerSecond ?? '—',
        raw: my == null ? '—' : `${my.toFixed(0)} tok/s`,
        score: score.speed == null ? null : Math.round(score.speed),
      }
    },
  },
  {
    label: 'Context',
    weightPct: 15,
    formula:
      "Token context window on a log scale anchored at 8K ≈ 20 and 1M+ ≈ 100. So 128K ≈ 60 — large jumps in context produce smaller score gains as we approach 1M.",
    data:
      'Context windows come from each provider\'s official model spec — auditable on the company\'s page or in the model\'s source list.',
    rowFor: (model, _all, score) => ({
      inputs:
        model.specs.contextWindow >= 1_000_000
          ? `${(model.specs.contextWindow / 1_000_000).toFixed(2)}M tokens`
          : `${(model.specs.contextWindow / 1000).toFixed(0)}K tokens`,
      raw: `${model.specs.contextWindow.toLocaleString()} tokens`,
      score: Math.round(score.context),
    }),
  },
  {
    label: 'Value',
    weightPct: 20,
    formula:
      "Cheaper input price per million tokens scores higher (smooth log curve — $0.10/M ≈ 95, $1/M ≈ 70, $5/M ≈ 50, $15/M ≈ 20). A free tier adds +10. For award purposes, free tier acts as a 25% effective-price discount.",
    data:
      'Pricing is taken from each provider\'s official API pricing page (Sources tab) and is per-million input tokens unless otherwise noted.',
    rowFor: (model, _all, score) => {
      const price = model.pricing?.inputPricePerMillionTokens
      const free = model.pricing?.freeTierAvailable ?? false
      const inputs = price == null
        ? 'No published pricing'
        : `$${price.toFixed(2)}/M input${free ? ' · free tier' : ''}`
      return {
        inputs,
        raw: price == null
          ? '—'
          : `$${price.toFixed(2)} per million tokens`,
        score: score.value == null ? null : Math.round(score.value),
      }
    },
  },
  {
    label: 'Versatility',
    weightPct: 10,
    formula:
      "Count of input + output modalities supported, scaled out of 8 (so a text-only model that produces text = 2/8 = 25).",
    data:
      'Modality support is drawn from each provider\'s official model card — see the company\'s detail page or the model\'s source list.',
    rowFor: (model, _all, score) => {
      const inN = model.specs.inputModalities.length
      const outN = model.specs.outputModalities.length
      return {
        inputs: `in: ${model.specs.inputModalities.join(', ') || '—'} · out: ${model.specs.outputModalities.join(', ') || '—'}`,
        raw: `${inN} in + ${outN} out = ${inN + outN} modalities`,
        score: Math.round(score.versatility),
      }
    },
  },
]

function MethodologySection({
  models,
  breakdowns,
}: {
  models: AIModel[]
  breakdowns: ScoreBreakdown[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-[10px] bg-[#161618] border border-[#2a2a2e] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#151517] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Info size={16} className="text-[#7065f0] flex-shrink-0" />
          <h2 className="text-sm font-semibold text-[#f5f5f5] truncate">
            How are these scores calculated?
          </h2>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-[#8a8990] flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-[#8a8990] flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-[#2a2a2e] p-4 space-y-5">
          <p className="text-xs text-[#b3b2b8] leading-relaxed">
            Each model gets a 0–100 score in five dimensions, then a weighted average
            produces the overall score. When a dimension has no published data for a
            model (e.g. no tokens-per-second listed), it's excluded from that model's
            overall and the remaining weights re-normalize — so missing data doesn't
            unfairly drag a score toward 0.
          </p>

          {METHODOLOGY.map((entry) => (
            <div key={entry.label} className="space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-[#f5f5f5]">{entry.label}</h3>
                <span className="text-[11px] font-medium text-[#7065f0] uppercase tracking-wide">
                  {entry.weightPct}% of overall
                </span>
              </div>
              <p className="text-xs text-[#b3b2b8] leading-relaxed">{entry.formula}</p>
              <p className="text-[11px] text-[#8a8990] leading-relaxed italic">
                {entry.data}
              </p>

              {models.length > 0 && (
                <div className="rounded-[10px] bg-[#0a0a0a] border border-[#1e1e21] overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-[#1e1e21] text-[#8a8990]">
                        <th className="text-left px-3 py-1.5 font-medium">Model</th>
                        <th className="text-left px-3 py-1.5 font-medium">Raw value</th>
                        <th className="text-right px-3 py-1.5 font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((model, i) => {
                        const company = getCompanyForModel(model.id)
                        const accent = company?.accentColor ?? '#7065f0'
                        const { inputs, raw, score } = entry.rowFor(
                          model,
                          models,
                          breakdowns[i],
                        )
                        return (
                          <tr key={model.id} className="border-b border-[#1e1e21]/60 last:border-b-0">
                            <td className="px-3 py-1.5">
                              <span className="font-medium text-[#f5f5f5]">{model.name}</span>
                              <span className="block text-[10px]" style={{ color: accent }}>
                                {company?.shortName ?? ''}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-[#b3b2b8]">
                              <span className="block">{raw}</span>
                              <span className="block text-[10px] text-[#838289]">{inputs}</span>
                            </td>
                            <td className="px-3 py-1.5 text-right text-[#f5f5f5] font-semibold tabular-nums">
                              {score == null ? '—' : score}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-[#1e1e21]">
            <p className="text-xs text-[#b3b2b8] leading-relaxed">
              <span className="text-[#f5f5f5] font-semibold">Overall</span> = 0.40 ·
              Quality + 0.15 · Speed + 0.15 · Context + 0.20 · Value + 0.10 ·
              Versatility.
            </p>
            <p className="text-[11px] text-[#8a8990] leading-relaxed mt-1">
              All underlying numbers can be audited via the &ldquo;Sources &amp;
              references&rdquo; section above — each company&apos;s page, source
              list, and matching fact-checks are one tap away.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- table helpers (unchanged behavior) ----------

function SectionHeader({ label, colSpan }: { label: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 pt-4 pb-2">
        <span className="text-xs font-bold text-[#7065f0] uppercase tracking-wider">{label}</span>
      </td>
    </tr>
  )
}

function SimpleRow({
  label,
  models,
  getValue,
}: {
  label: string
  models: AIModel[]
  getValue: (m: AIModel) => string
}) {
  return (
    <tr className="border-b border-[#2a2a2e]/50">
      <td className="p-3 text-[#8a8990]">{label}</td>
      {models.map((m) => (
        <td key={m.id} className="p-3 text-center text-[#b3b2b8] text-xs">
          {getValue(m)}
        </td>
      ))}
    </tr>
  )
}

function RankedRow({
  label,
  models,
  getValue,
  getNumeric,
  higherIsBetter,
}: {
  label: string
  models: AIModel[]
  getValue: (m: AIModel) => string
  getNumeric: (m: AIModel) => number | null
  higherIsBetter: boolean
}) {
  const numerics = models.map(getNumeric)
  const ranks = rankValues(numerics, higherIsBetter)

  return (
    <tr className="border-b border-[#2a2a2e]/50">
      <td className="p-3 text-[#8a8990]">{label}</td>
      {models.map((m, i) => (
        <td key={m.id} className="p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            {ranks[i].isBest && <Crown size={12} className="text-[#22c55e]" />}
            <span className="text-xs font-medium" style={{ color: ranks[i].color }}>
              {getValue(m)}
            </span>
          </div>
        </td>
      ))}
    </tr>
  )
}

function ModalityRow({
  label,
  models,
  getModalities,
}: {
  label: string
  models: AIModel[]
  getModalities: (m: AIModel) => Modality[]
}) {
  const counts = models.map((m) => getModalities(m).length)
  const ranks = rankValues(counts, true)

  return (
    <tr className="border-b border-[#2a2a2e]/50">
      <td className="p-3 text-[#8a8990]">{label}</td>
      {models.map((m, i) => {
        const mods = getModalities(m)
        return (
          <td key={m.id} className="p-3 text-center">
            <div className="flex flex-wrap items-center justify-center gap-1">
              {ranks[i].isBest && mods.length > 1 && <Crown size={10} className="text-[#22c55e]" />}
              {mods.map((mod) => {
                const Icon = MODALITY_ICON_MAP[mod]
                return (
                  <span
                    key={mod}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
                    style={{ backgroundColor: hexToRgba(ranks[i].color, 0.15), color: ranks[i].color }}
                  >
                    <Icon size={10} />
                    {mod}
                  </span>
                )
              })}
            </div>
          </td>
        )
      })}
    </tr>
  )
}

function BooleanRow({
  label,
  models,
  getValue,
}: {
  label: string
  models: AIModel[]
  getValue: (m: AIModel) => boolean
}) {
  return (
    <tr className="border-b border-[#2a2a2e]/50">
      <td className="p-3 text-[#8a8990]">{label}</td>
      {models.map((m) => {
        const val = getValue(m)
        return (
          <td key={m.id} className="p-3 text-center">
            {val ? (
              <CheckCircle2 size={16} className="inline text-[#22c55e]" />
            ) : (
              <XCircle size={16} className="inline text-[#8a8990]/50" />
            )}
          </td>
        )
      })}
    </tr>
  )
}
