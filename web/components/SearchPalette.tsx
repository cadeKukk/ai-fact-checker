'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, Cpu, BookOpen, ShieldCheck, CornerDownLeft } from 'lucide-react'
import { companies, getAllModels, getCompanyForModel } from '@/data/companies'
import { allTerms } from '@/data/terms'
import { factCheckQAs } from '@/data/factcheck'
import type { AITerm } from '@/data/types'

interface Result {
  key: string
  group: 'Companies' | 'Models' | 'Glossary' | 'Fact checks'
  icon: typeof Building2
  title: string
  subtitle: string
  score: number
  action: () => void
}

interface SearchPaletteProps {
  open: boolean
  onClose: () => void
  onShowTerm: (term: AITerm) => void
}

function scoreText(haystack: string, query: string): number {
  const h = haystack.toLowerCase()
  if (h === query) return 100
  if (h.startsWith(query)) return 60
  if (h.includes(` ${query}`)) return 40
  if (h.includes(query)) return 25
  return 0
}

export default function SearchPalette({ open, onClose, onShowTerm }: SearchPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      // focus after the element mounts
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const out: Result[] = []

    for (const c of companies) {
      const s = Math.max(scoreText(c.name, q), scoreText(c.shortName, q))
      if (s > 0) {
        out.push({
          key: `c-${c.id}`,
          group: 'Companies',
          icon: Building2,
          title: c.name,
          subtitle: `${c.models.length} models`,
          score: s + 3,
          action: () => router.push(`/companies/${c.id}`),
        })
      }
    }

    for (const m of getAllModels()) {
      const s = scoreText(m.name, q)
      if (s > 0) {
        const company = getCompanyForModel(m.id)
        out.push({
          key: `m-${m.id}`,
          group: 'Models',
          icon: Cpu,
          title: m.name,
          subtitle: company?.name ?? 'Model',
          score: s + 2,
          action: () => company && router.push(`/companies/${company.id}/${m.id}`),
        })
      }
    }

    for (const t of allTerms) {
      const s = scoreText(t.term, q)
      if (s > 0) {
        out.push({
          key: `t-${t.id}`,
          group: 'Glossary',
          icon: BookOpen,
          title: t.term,
          subtitle: t.shortDefinition,
          score: s + 1,
          action: () => onShowTerm(t),
        })
      }
    }

    for (const qa of factCheckQAs) {
      const s = Math.max(
        scoreText(qa.question, q),
        ...qa.tags.map((tag) => Math.floor(scoreText(tag, q) / 2))
      )
      if (s > 0) {
        out.push({
          key: `q-${qa.id}`,
          group: 'Fact checks',
          icon: ShieldCheck,
          title: qa.question,
          subtitle: qa.answer.slice(0, 80) + '…',
          score: s,
          action: () => router.push(`/fact-check?q=${encodeURIComponent(qa.question)}`),
        })
      }
    }

    return out.sort((a, b) => b.score - a.score).slice(0, 12)
  }, [query, router, onShowTerm])

  useEffect(() => setSelected(0), [results.length, query])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter' && results[selected]) {
        e.preventDefault()
        results[selected].action()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, selected, onClose])

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${selected}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open) return null

  let lastGroup: string | null = null

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center px-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[14px] bg-[#161618] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
          <Search size={18} className="text-[#8a8990] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, models, terms, questions…"
            className="flex-1 bg-transparent text-[15px] text-[#f5f5f5] placeholder:text-[#8a8990] outline-none"
          />
          <kbd className="hidden sm:block text-[10px] text-[#8a8990] bg-white/[0.06] border border-white/10 rounded px-1.5 py-0.5">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
          {query.trim() === '' && (
            <div className="px-4 py-8 text-center text-sm text-[#8a8990]">
              Search everything — companies, models, glossary terms, and fact-checked questions.
            </div>
          )}
          {query.trim() !== '' && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[#8a8990]">
              No matches for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((r, i) => {
            const header = r.group !== lastGroup ? r.group : null
            lastGroup = r.group
            const Icon = r.icon
            return (
              <div key={r.key}>
                {header && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#8a8990]">
                    {header}
                  </p>
                )}
                <button
                  type="button"
                  data-idx={i}
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => {
                    r.action()
                    onClose()
                  }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${
                    i === selected ? 'bg-white/[0.06]' : ''
                  }`}
                >
                  <Icon size={16} className="text-[#9fa3fc] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f5f5f5] truncate">{r.title}</p>
                    <p className="text-xs text-[#8a8990] truncate">{r.subtitle}</p>
                  </div>
                  {i === selected && <CornerDownLeft size={14} className="text-[#8a8990] flex-shrink-0" />}
                </button>
              </div>
            )
          })}
        </div>

        <div className="px-4 py-2 border-t border-white/[0.08] flex items-center gap-4 text-[10px] text-[#8a8990]">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}
