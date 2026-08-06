'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search,
  X,
  Link as LinkIcon,
  ChevronRight,
  FileText,
  Github,
  Newspaper,
  BookOpen,
  Rss,
  Code2,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react'
import { getAllSources } from '@/data/companies'
import type { Source, SourceType } from '@/data/types'
import { sourceTypeLabel, sourceTypeColor } from '@/data/types'
import { SourcePopup } from './TermHighlight'

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 179, 255, ${alpha})`
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const SOURCE_TYPE_ICONS: Record<SourceType, React.ComponentType<{ className?: string; size?: number }>> = {
  officialDocs: FileText,
  github: Github,
  researchPaper: BookOpen,
  blogPost: Rss,
  newsArticle: Newspaper,
  apiReference: Code2,
}

const ALL_SOURCE_TYPES: SourceType[] = [
  'officialDocs', 'github', 'researchPaper', 'blogPost', 'newsArticle', 'apiReference',
]

interface SourcesViewProps {
  // When navigated to from another tab (e.g. Compare), the receiving search box
  // is seeded with this value. The `key` field changes on each request so the
  // effect re-runs even when the value is the same as a prior navigation.
  initialQuery?: { key: number; value: string } | null
}

export default function SourcesView({ initialQuery }: SourcesViewProps = {}) {
  const [searchText, setSearchText] = useState(initialQuery?.value ?? '')
  const [selectedType, setSelectedType] = useState<SourceType | null>(null)
  const [activeSource, setActiveSource] = useState<Source | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)

  // Sync the search box whenever a fresh navigation request arrives.
  useEffect(() => {
    if (!initialQuery) return
    setSearchText(initialQuery.value)
    setSelectedType(null)
  }, [initialQuery])

  const allSources = useMemo(() => getAllSources(), [])

  const typeCounts = useMemo(() => {
    const counts: Record<SourceType, number> = {
      officialDocs: 0, github: 0, researchPaper: 0,
      blogPost: 0, newsArticle: 0, apiReference: 0,
    }
    allSources.forEach((s) => { counts[s.type]++ })
    return counts
  }, [allSources])

  const filteredSources = useMemo(() => {
    let sources = allSources

    if (selectedType) {
      sources = sources.filter((s) => s.type === selectedType)
    }

    const query = searchText.trim().toLowerCase()
    if (query) {
      sources = sources.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.url.toLowerCase().includes(query) ||
          sourceTypeLabel[s.type].toLowerCase().includes(query)
      )
    }

    return sources
  }, [allSources, searchText, selectedType])

  const closeFeedback = useCallback(() => {
    setFeedbackOpen(false)
    setFeedbackStatus(null)
    setFeedbackSubmitting(false)
  }, [])

  const submitFeedback = useCallback(async () => {
    const text = feedbackText.trim()
    if (!text || feedbackSubmitting) return
    setFeedbackSubmitting(true)
    setFeedbackStatus(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setFeedbackStatus(
          json.error ||
            (res.status === 503
              ? 'Feedback could not be sent — the site email is not set up yet.'
              : 'Something went wrong. Please try again.')
        )
        return
      }
      setFeedbackText('')
      setFeedbackStatus('Thanks! Your feedback was sent.')
      window.setTimeout(closeFeedback, 1800)
    } catch {
      setFeedbackStatus('Could not reach the server. Check your connection and try again.')
    } finally {
      setFeedbackSubmitting(false)
    }
  }, [feedbackText, feedbackSubmitting, closeFeedback])

  useEffect(() => {
    if (!feedbackOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFeedback()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [feedbackOpen, closeFeedback])

  // Lock page scroll on mobile when the feedback dialog is open (avoids iOS
  // viewport "jump" / background rubber-banding) and restore scroll position on close.
  useEffect(() => {
    if (!feedbackOpen) return
    const scrollY = window.scrollY
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    }
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.position = prev.position
      document.body.style.top = prev.top
      document.body.style.left = prev.left
      document.body.style.right = prev.right
      document.body.style.width = prev.width
      document.body.style.overflow = prev.overflow
      window.scrollTo(0, scrollY)
    }
  }, [feedbackOpen])

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#141414] p-6">
      <div className="max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        <p className="text-xs text-[#75726b] text-center">
          Developed by Cade Kukk in collaboration with Dr. Blackwood and Professor Dolence
        </p>

        {/* Header */}
        <div className="flex items-end justify-between gap-4 w-full border-b border-[#141414]/20 pb-5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#2038e6] mb-2">
              [ SEC. 05 — EVIDENCE ]
            </p>
            <h1 className="text-4xl text-[#141414] leading-tight">Sources</h1>
            <p className="text-sm text-[#75726b] mt-1.5">{allSources.length} verified sources</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFeedbackStatus(null)
              setFeedbackOpen(true)
            }}
            className="flex items-center gap-1.5 flex-shrink-0 px-3.5 py-2 rounded-[2px] text-sm font-medium bg-[#ffffff] text-[#524f48] border border-[#d9d6cc] hover:border-[#2038e6]/40 hover:text-[#141414] transition-colors touch-manipulation mt-0.5"
            aria-haspopup="dialog"
            aria-expanded={feedbackOpen}
          >
            <MessageSquare size={16} className="text-[#2038e6]" aria-hidden />
            Feedback
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75726b]" size={20} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search sources..."
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

        {/* Type filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedType(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-[2px] text-sm font-medium transition-all ${
              selectedType === null
                ? 'bg-[#2038e6] text-[#f7f6f2]'
                : 'bg-[#ffffff] text-[#524f48] border border-[#d9d6cc]'
            }`}
          >
            All ({allSources.length})
          </button>
          {ALL_SOURCE_TYPES.map((type) => {
            const isActive = selectedType === type
            const color = sourceTypeColor[type]
            const Icon = SOURCE_TYPE_ICONS[type]
            const count = typeCounts[type]
            if (count === 0) return null
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(isActive ? null : type)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-sm font-medium transition-all border"
                style={
                  isActive
                    ? { backgroundColor: hexToRgba(color, 0.25), color, borderColor: hexToRgba(color, 0.4) }
                    : { backgroundColor: '#ffffff', color: '#524f48', borderColor: '#d9d6cc' }
                }
              >
                <Icon size={14} />
                {sourceTypeLabel[type]} ({count})
              </button>
            )
          })}
        </div>

        {/* Source list — grouped by type when not filtering */}
        {!selectedType && !searchText.trim() ? (
          <div className="space-y-6">
            {ALL_SOURCE_TYPES.map((type) => {
              const typeSources = filteredSources.filter((s) => s.type === type)
              if (typeSources.length === 0) return null
              const color = sourceTypeColor[type]
              const Icon = SOURCE_TYPE_ICONS[type]
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span style={{ color }}><Icon size={16} /></span>
                    <span className="text-sm font-bold" style={{ color }}>
                      {sourceTypeLabel[type]}
                    </span>
                    <span className="text-xs text-[#75726b]">({typeSources.length})</span>
                  </div>
                  <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                    {typeSources.map((source) => (
                      <SourceRow key={source.id} source={source} onTap={setActiveSource} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {filteredSources.map((source) => (
              <SourceRow key={source.id} source={source} onTap={setActiveSource} />
            ))}
          </div>
        )}

        {filteredSources.length === 0 && (
          <p className="text-center text-[#524f48] py-8 opacity-70">
            No sources match your search.
          </p>
        )}

        {/* Verified Sources info card */}
        <div className="rounded-[2px] p-4 bg-[#ffffff] border border-[#d9d6cc] space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#2038e6]" />
            <h3 className="font-bold text-[#141414] text-sm">Verified Sources</h3>
          </div>
          <p className="text-xs text-[#75726b] leading-relaxed">
            All information in this app is backed by verified sources. We use multiple source types
            to ensure accuracy:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_SOURCE_TYPES.map((type) => {
              const color = sourceTypeColor[type]
              const Icon = SOURCE_TYPE_ICONS[type]
              return (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-[2px] flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: hexToRgba(color, 0.15), color }}
                  >
                    <Icon size={12} />
                  </div>
                  <span className="text-xs text-[#524f48]">{sourceTypeLabel[type]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {feedbackOpen && (
        <div
          className="fixed inset-0 z-[210] min-h-0 h-[100dvh] max-h-[100dvh] flex items-end sm:items-center justify-center bg-[#141414]/40 p-4 sm:p-6 overflow-hidden overscroll-none"
          onClick={closeFeedback}
          role="presentation"
        >
          <div
            className="w-full max-w-lg max-h-[min(90dvh,36rem)] overflow-y-auto overscroll-contain rounded-[2px] bg-[#edeae1] border border-[#d9d6cc] p-5 shadow-2xl touch-manipulation"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 id="feedback-title" className="text-lg font-bold text-[#141414]">
                Feedback
              </h2>
              <button
                type="button"
                onClick={closeFeedback}
                className="w-8 h-8 rounded-full bg-[#eeece3] flex items-center justify-center text-[#75726b] hover:text-[#141414]"
                aria-label="Close feedback"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-[#75726b] leading-relaxed mb-3">
              Share bugs, ideas, or anything that would make this app more useful. If you&apos;d like to hear back, please include a way to contact you (such as an email or phone number) in your message.
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => {
                setFeedbackText(e.target.value)
                if (feedbackStatus) setFeedbackStatus(null)
              }}
              rows={7}
              className="w-full resize-y min-h-[140px] rounded-[2px] bg-[#f7f6f2] border border-[#d9d6cc] text-[#141414] p-3 text-base leading-relaxed placeholder:text-[#93908a] focus:outline-none focus:border-[#2038e6]/50"
              placeholder="Bugs, ideas, unclear text — anything that helps us improve the site…"
            />
            {feedbackStatus && (
              <p
                className={`mt-2 text-xs leading-relaxed ${
                  feedbackStatus.startsWith('Thanks!') ? 'text-[#15803d]' : 'text-amber-700/90'
                }`}
              >
                {feedbackStatus}
              </p>
            )}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={closeFeedback}
                className="px-4 py-2.5 rounded-[2px] text-sm font-medium bg-[#eeece3] text-[#524f48] hover:text-[#141414]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFeedback}
                disabled={!feedbackText.trim() || feedbackSubmitting}
                className="px-4 py-2.5 rounded-[2px] text-sm font-semibold bg-[#2038e6] text-[#f7f6f2] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
              >
                {feedbackSubmitting ? 'Sending…' : 'Submit feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSource && (
        <SourcePopup source={activeSource} onClose={() => setActiveSource(null)} />
      )}
    </div>
  )
}

function SourceRow({ source, onTap }: { source: Source; onTap: (s: Source) => void }) {
  const color = sourceTypeColor[source.type]
  const Icon = SOURCE_TYPE_ICONS[source.type]
  const label = sourceTypeLabel[source.type]

  return (
    <button
      type="button"
      onClick={() => onTap(source)}
      className="w-full text-left flex items-center gap-3 p-3 rounded-[2px] bg-[#ffffff] border border-[#d9d6cc] hover:border-[#2038e6]/30 transition-all group active:scale-[0.99]"
      aria-label={`About source: ${source.title}`}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-[2px] flex items-center justify-center"
        style={{ backgroundColor: hexToRgba(color, 0.15), color }}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[#141414] text-sm group-hover:text-[#2038e6] transition-colors truncate">
          {source.title}
        </h3>
        <p className="text-xs text-[#75726b] truncate mt-0.5">{source.url}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="px-2 py-0.5 rounded-[2px] text-xs font-medium"
            style={{ backgroundColor: hexToRgba(color, 0.15), color }}
          >
            {label}
          </span>
          <span className="text-xs text-[#75726b]">
            Accessed {source.dateAccessed}
          </span>
        </div>
      </div>
      <ChevronRight size={16} className="text-[#75726b] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
