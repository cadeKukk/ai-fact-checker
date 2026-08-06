'use client'

import { useState, useMemo } from 'react'
import {
  Brain,
  ShieldCheck,
  Sparkles,
  Infinity,
  XCircle as CircleX,
  Wind,
  Link2,
  Search,
  X,
  ChevronRight,
  Building2,
} from 'lucide-react'
import { companies, getAllModels, getAllSources } from '@/data/companies'
import type { AICompany } from '@/data/types'
import { ModelPopup, TermPopup, BenchmarkPopup, TermHighlightedText, useTermPopup } from './TermHighlight'
import GettingStartedView from './GettingStartedView'

const LOGO_ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Brain,
  ShieldCheck,
  Sparkles,
  Infinity,
  CircleX,
  Wind,
  Link2,
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 179, 255, ${alpha})`
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

interface CompanyListProps {
  onSelectCompany: (company: AICompany) => void
}

type SortMode = 'default' | 'companies' | 'models' | 'sources'

export default function CompanyList({ onSelectCompany }: CompanyListProps) {
  const [searchText, setSearchText] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('default')
  const [showGettingStarted, setShowGettingStarted] = useState(false)
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

  const allModels = useMemo(() => getAllModels(), [])
  const allSources = useMemo(() => getAllSources(), [])

  const sourceCountByCompany = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of companies) {
      let count = c.sources.length
      for (const m of c.models) count += m.sources.length
      counts[c.id] = count
    }
    return counts
  }, [])

  const filteredCompanies = useMemo(() => {
    let result = [...companies]

    const query = searchText.trim().toLowerCase()
    if (query) {
      result = result.filter((company) => {
        const nameMatch = company.name.toLowerCase().includes(query) || company.shortName.toLowerCase().includes(query)
        const modelMatch = company.models.some((model) => model.name.toLowerCase().includes(query))
        return nameMatch || modelMatch
      })
    }

    switch (sortMode) {
      case 'companies':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'models':
        result.sort((a, b) => b.models.length - a.models.length)
        break
      case 'sources':
        result.sort((a, b) => (sourceCountByCompany[b.id] ?? 0) - (sourceCountByCompany[a.id] ?? 0))
        break
    }

    return result
  }, [searchText, sortMode, sourceCountByCompany])

  function toggleSort(mode: SortMode) {
    setSortMode((prev) => (prev === mode ? 'default' : mode))
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#141414] p-6">
      <div className="max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#141414]/20 pb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#2038e6] mb-2">
            [ SEC. 01 — THE PLAYERS ]
          </p>
          <h1 className="text-4xl text-[#141414] leading-tight">Companies</h1>
          <p className="text-sm text-[#75726b] mt-1.5">Who builds today&apos;s AI, and what they&apos;ve shipped</p>
        </div>

        {/* Start here button */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowGettingStarted(true)}
            className="scale-button group w-full py-5 sm:py-7 lg:py-8 px-5 sm:px-6 rounded-[2px] bg-[#141414] hover:bg-[#2038e6] transition-colors text-[#f7f6f2] flex items-center justify-center gap-3"
          >
            <span className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight">Start here</span>
            <span className="font-mono text-sm opacity-60 group-hover:opacity-100 transition-opacity">↓</span>
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#75726b] text-center">
            V 0.1.5 · Updated Aug 5, 2026
          </p>
        </div>

        {/* Sort pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleSort('companies')}
            className="px-3 py-1.5 rounded-[2px] border font-mono text-xs transition-all"
            style={
              sortMode === 'companies'
                ? { backgroundColor: '#2038e6', color: '#f7f6f2', borderColor: '#2038e6' }
                : { backgroundColor: '#ffffff', color: '#524f48', borderColor: 'rgba(20,20,20,0.2)' }
            }
          >
            {companies.length} companies {sortMode === 'companies' ? '(A→Z)' : ''}
          </button>
          <button
            type="button"
            onClick={() => toggleSort('models')}
            className="px-3 py-1.5 rounded-[2px] border font-mono text-xs transition-all"
            style={
              sortMode === 'models'
                ? { backgroundColor: '#2038e6', color: '#f7f6f2', borderColor: '#2038e6' }
                : { backgroundColor: '#ffffff', color: '#524f48', borderColor: 'rgba(20,20,20,0.2)' }
            }
          >
            {allModels.length} models {sortMode === 'models' ? '(most first)' : ''}
          </button>
          <button
            type="button"
            onClick={() => toggleSort('sources')}
            className="px-3 py-1.5 rounded-[2px] border font-mono text-xs transition-all"
            style={
              sortMode === 'sources'
                ? { backgroundColor: '#2038e6', color: '#f7f6f2', borderColor: '#2038e6' }
                : { backgroundColor: '#ffffff', color: '#524f48', borderColor: 'rgba(20,20,20,0.2)' }
            }
          >
            {allSources.length} sources {sortMode === 'sources' ? '(most first)' : ''}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75726b]"
            size={20}
          />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search companies or models..."
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

        {/* Company list */}
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {filteredCompanies.map((company) => {
            const IconComponent = LOGO_ICON_MAP[company.logoIcon] ?? Building2
            const accent = company.accentColor
            const accentBg20 = hexToRgba(accent, 0.2)
            const accentBg15 = hexToRgba(accent, 0.15)
            const accentBorder20 = hexToRgba(accent, 0.2)

            const displayModels = company.models.slice(0, 3)
            const remainingCount = company.models.length - 3

            return (
              <button
                key={company.id}
                type="button"
                onClick={() => onSelectCompany(company)}
                className="w-full text-left p-4 rounded-[2px] bg-[#ffffff] border transition-all hover:bg-[#f4f2eb]"
                style={{ borderColor: accentBorder20 }}
              >
                <div className="flex items-start gap-4">
                  {/* Left: circle with icon */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accentBg20, color: accent }}
                  >
                    <IconComponent size={24} />
                  </div>

                  {/* Center: content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#141414]">{company.name}</span>
                      <span className="text-sm" style={{ color: accent }}>
                        {company.models.length} {company.models.length === 1 ? 'model' : 'models'}
                      </span>
                      {sortMode === 'sources' && (
                        <span className="text-xs text-[#75726b]">
                          · {sourceCountByCompany[company.id] ?? 0} sources
                        </span>
                      )}
                    </div>
                    <TermHighlightedText
                      text={company.description}
                      className="block text-sm text-[#524f48] leading-relaxed line-clamp-2 mb-3 opacity-70"
                      onTermTap={showTerm}
                      onModelTap={showModel}
                    />
                    {/* Model badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {displayModels.map((model) => (
                        <span
                          key={model.id}
                          className="px-2 py-0.5 rounded-[2px] text-xs font-medium"
                          style={{ backgroundColor: accentBg15, color: accent }}
                        >
                          {model.name}
                        </span>
                      ))}
                      {remainingCount > 0 && (
                        <span
                          className="px-2 py-0.5 rounded-[2px] text-xs font-medium"
                          style={{ backgroundColor: accentBg15, color: accent }}
                        >
                          +{remainingCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: chevron */}
                  <ChevronRight className="flex-shrink-0 text-[#75726b] opacity-50" size={20} />
                </div>
              </button>
            )
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <p className="text-center text-[#524f48] py-8 opacity-70">
            No companies match your search.
          </p>
        )}
      </div>

      {showGettingStarted && (
        <GettingStartedView onClose={() => setShowGettingStarted(false)} />
      )}

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
