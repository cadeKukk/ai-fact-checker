'use client'

import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Brain,
  ShieldCheck,
  Sparkles,
  Infinity,
  XCircle,
  Wind,
  Link2,
  Moon,
  Globe,
  Cpu,
  LockOpen,
  AlignLeft,
  Image,
  AudioWaveform,
  Video,
  Code2,
  FileText,
} from 'lucide-react'
import type { AICompany, AIModel, AITerm, Modality } from '@/data/types'
import { sourceTypeLabel, sourceTypeColor } from '@/data/types'
import { ModelPopup, TermPopup, BenchmarkPopup, SourcePopup, TermHighlightedText, useTermPopup } from './TermHighlight'

const LOGO_ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Brain,
  ShieldCheck,
  Sparkles,
  Infinity,
  CircleX: XCircle,
  Wind,
  Link2,
  Moon,
}

const MODALITY_ICON_MAP: Record<Modality, React.ComponentType<{ className?: string; size?: number }>> = {
  Text: AlignLeft,
  Image,
  Audio: AudioWaveform,
  Video,
  Code: Code2,
}

const MODALITY_COLOR: Record<Modality, string> = {
  Text: '#3b82f6',
  Image: '#22c55e',
  Audio: '#f97316',
  Video: '#ec4899',
  Code: '#a855f7',
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 179, 255, ${alpha})`
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function formatContextWindow(n: number): string {
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

interface CompanyDetailProps {
  company: AICompany
  onSelectModel: (model: AIModel, accentColor: string) => void
  onBack: () => void
}

function ModelCard({
  model,
  accentColor,
  onClick,
  onTermTap,
  onModelTap,
}: {
  model: AIModel
  accentColor: string
  onClick: () => void
  onTermTap: (term: AITerm) => void
  onModelTap: (info: { model: AIModel; company: AICompany; matched: string }) => void
}) {
  const accentBorder15 = hexToRgba(accentColor, 0.15)
  const modalities = useMemo(() => {
    const set = new Set<Modality>([...model.specs.inputModalities, ...model.specs.outputModalities])
    return Array.from(set)
  }, [model.specs.inputModalities, model.specs.outputModalities])

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 rounded-[10px] transition-all hover:opacity-90"
      style={{ backgroundColor: '#161618', borderWidth: 1, borderColor: accentBorder15 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-[#f5f5f5]">{model.name}</span>
        <span className="font-mono text-sm text-[#8a8990]">{model.version}</span>
        {model.isOpenSource && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-400/10 text-green-400">
            <LockOpen size={12} />
            Open Source
          </span>
        )}
      </div>
      <TermHighlightedText
        text={model.description}
        className="block text-sm text-[#b3b2b8] leading-relaxed line-clamp-2 mb-3"
        onTermTap={onTermTap}
        onModelTap={onModelTap}
        excludeModelId={model.id}
      />
      <div className="h-px bg-[#2a2a2e] mb-3" />
      <div className="flex flex-wrap gap-3 text-sm text-[#8a8990] mb-3">
        {model.specs.parameterCount && (
          <span className="inline-flex items-center gap-1.5">
            <Cpu size={14} />
            {model.specs.parameterCount}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <FileText size={14} />
          {formatContextWindow(model.specs.contextWindow)} ctx
        </span>
        {model.myths.length > 0 && (
          <span>{model.myths.length} myth{model.myths.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {modalities.map((m) => {
          const Icon = MODALITY_ICON_MAP[m]
          const color = MODALITY_COLOR[m]
          return (
            <span
              key={m}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {Icon && <Icon size={12} />}
              {m}
            </span>
          )
        })}
      </div>
    </button>
  )
}

export default function CompanyDetail({ company, onSelectModel, onBack }: CompanyDetailProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'proprietary'>('all')
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

  const filteredModels = useMemo(() => {
    if (filter === 'open') return company.models.filter((m) => m.isOpenSource)
    if (filter === 'proprietary') return company.models.filter((m) => !m.isOpenSource)
    return company.models
  }, [company.models, filter])

  const openCount = company.models.filter((m) => m.isOpenSource).length
  const proprietaryCount = company.models.length - openCount

  const IconComponent = LOGO_ICON_MAP[company.logoIcon] ?? Brain
  const accentBg20 = hexToRgba(company.accentColor, 0.2)

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

        {/* Company header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: accentBg20, color: company.accentColor }}
          >
            <IconComponent size={40} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#f5f5f5] mb-1">{company.name}</h1>
            <p className="text-[#8a8990] text-sm mb-3">
              Founded {company.foundedYear} • {company.headquarters}
            </p>
            <TermHighlightedText text={company.description} className="block text-[#b3b2b8] text-sm leading-relaxed max-w-lg mx-auto mb-4" onTermTap={showTerm} onModelTap={showModel} />
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#161618] border border-white/10 hover:bg-[#1b1b1e] text-[#b3b2b8] hover:text-[#f5f5f5] transition-colors"
            >
              <Globe size={18} />
              Website
            </a>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="px-3 py-1.5 rounded-[10px] border text-xs font-medium transition-colors"
            style={
              filter === 'all'
                ? { backgroundColor: company.accentColor, color: '#fff', borderColor: company.accentColor }
                : { backgroundColor: '#161618', color: '#b3b2b8', borderColor: 'rgba(255,255,255,0.14)' }
            }
          >
            All ({company.models.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('open')}
            className="px-3 py-1.5 rounded-[10px] border text-xs font-medium transition-colors"
            style={
              filter === 'open'
                ? { backgroundColor: company.accentColor, color: '#fff', borderColor: company.accentColor }
                : { backgroundColor: '#161618', color: '#b3b2b8', borderColor: 'rgba(255,255,255,0.14)' }
            }
          >
            Open Source ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('proprietary')}
            className="px-3 py-1.5 rounded-[10px] border text-xs font-medium transition-colors"
            style={
              filter === 'proprietary'
                ? { backgroundColor: company.accentColor, color: '#fff', borderColor: company.accentColor }
                : { backgroundColor: '#161618', color: '#b3b2b8', borderColor: 'rgba(255,255,255,0.14)' }
            }
          >
            Proprietary ({proprietaryCount})
          </button>
        </div>

        {/* Models section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={18} className="text-[#8a8990]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8a8990]">Models</h2>
          </div>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                accentColor={company.accentColor}
                onClick={() => onSelectModel(model, company.accentColor)}
                onTermTap={showTerm}
                onModelTap={showModel}
              />
            ))}
          </div>
          {filteredModels.length === 0 && (
            <p className="text-center text-sm text-[#8a8990] py-8">No models match this filter.</p>
          )}
        </div>

        {/* Company Sources */}
        {company.sources.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-[#8a8990]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8a8990]">
                Company Sources
              </h2>
            </div>
            <div className="space-y-2">
              {company.sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => showSource(source)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-[10px] bg-[#161618] border border-white/10 hover:bg-[#1b1b1e] transition-colors group active:scale-[0.99]"
                  aria-label={`About source: ${source.title}`}
                >
                  <span className="text-sm text-[#b3b2b8] group-hover:text-[#f5f5f5]">{source.title}</span>
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: `${sourceTypeColor[source.type]}20`,
                      color: sourceTypeColor[source.type],
                    }}
                  >
                    {sourceTypeLabel[source.type]}
                  </span>
                </button>
              ))}
            </div>
          </div>
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
      {activeSource && <SourcePopup source={activeSource} onClose={clearSource} onBack={canGoBack ? back : undefined} />}
    </div>
  )
}
