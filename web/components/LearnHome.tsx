'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Brain,
  Compass,
  Cpu,
  Network,
  MessageCircle,
  AlignLeft,
  Scale,
  CheckCircle,
  ShieldAlert,
  Check,
  ArrowRight,
  Building2,
  ShieldCheck,
  ArrowLeftRight,
  Link as LinkIcon,
  ClipboardCheck,
  Flame,
} from 'lucide-react'
import { lessons } from '@/data/lessons'
import { companies, getAllModels, getAllSources } from '@/data/companies'
import { factCheckQAs } from '@/data/factcheck'
import { loadProgress, type CourseProgress } from '@/lib/courseProgress'
import { loadPracticeStats, type PracticeStats } from '@/lib/practiceStats'
import { APP_VERSION, LAST_UPDATED, DATA_SNAPSHOT } from '@/lib/appMeta'
import TermVisual, { PLAYABLE_TERM_IDS, TERM_VISUAL_KEYFRAMES } from '@/components/practice/TermVisuals'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Brain, Compass, Cpu, Network, MessageCircle, AlignLeft, Scale, CheckCircle, ShieldAlert,
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(112, 101, 240, ${alpha})`
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

export default function LearnHome() {
  const router = useRouter()
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setProgress(loadProgress())
    setPracticeStats(loadPracticeStats())
    setHydrated(true)
  }, [])

  const completedCount = progress?.completed ? lessons.length : progress?.max ?? 0
  const started = progress !== null && (progress.max > 0 || progress.current > 0)
  const ctaLabel = progress?.completed
    ? 'Review the course'
    : started
      ? `Continue — Lesson ${Math.min((progress?.current ?? 0) + 1, lessons.length)} of ${lessons.length}`
      : 'Start the course'

  const quickLinks = [
    { href: '/companies', label: 'Companies', icon: Building2, note: `${companies.length} companies · ${getAllModels().length} models` },
    { href: '/fact-check', label: 'Fact Check', icon: ShieldCheck, note: `${factCheckQAs.length} verified answers` },
    { href: '/compare', label: 'Compare', icon: ArrowLeftRight, note: 'Models side by side' },
    { href: '/sources', label: 'Sources', icon: LinkIcon, note: `${getAllSources().length} primary sources` },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] p-6">
      <div className="max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9fa3fc] mb-2">
            Start here
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[#f5f5f5] leading-tight">
            AI Fundamentals
          </h1>
          <p className="text-sm text-[#8a8990] mt-1.5">
            {lessons.length} short lessons on how AI actually works — starting with a guided tour of this app, no technical background needed
          </p>
        </div>

        {/* Course CTA */}
        <div className="space-y-2">
          <Link
            href="/learn"
            className="scale-button group w-full py-5 sm:py-6 px-5 sm:px-6 rounded-[14px] bg-[#7065f0] hover:bg-[#7d73f2] transition-colors text-white flex items-center justify-center gap-3"
          >
            <span className="text-xl sm:text-2xl font-semibold tracking-tight">
              {hydrated ? ctaLabel : 'Start the course'}
            </span>
            <ArrowRight size={22} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
          {hydrated && started && !progress?.completed && (
            <div className="flex items-center gap-3 px-1">
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#7065f0] transition-all"
                  style={{ width: `${(completedCount / lessons.length) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-[#8a8990]">
                {completedCount} of {lessons.length} lessons
              </span>
            </div>
          )}
          {hydrated && progress?.completed && (
            <p className="text-[11px] text-[#8a8990] text-center flex items-center justify-center gap-1.5">
              <Check size={12} className="text-green-400" /> Course completed — nice work
            </p>
          )}
        </div>

        {/* Lesson list */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8a8990] mb-3">Lessons</h2>
          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const Icon = ICON_MAP[lesson.icon] ?? Brain
              const isDone = hydrated && (progress?.completed || i < (progress?.max ?? 0))
              return (
                <button
                  key={lesson.title}
                  type="button"
                  onClick={() => router.push(`/learn?lesson=${i}`)}
                  className="w-full text-left flex items-center gap-4 p-4 rounded-[10px] bg-[#161618] border border-white/10 hover:bg-[#1b1b1e] transition-colors group"
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center"
                    style={{ backgroundColor: hexToRgba(lesson.color, 0.15), color: lesson.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8a8990]">
                      Lesson {i + 1} · {lesson.category}
                    </p>
                    <p className="text-[15px] font-semibold text-[#f5f5f5] truncate">{lesson.title}</p>
                  </div>
                  {isDone ? (
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-400/10 flex items-center justify-center">
                      <Check size={13} className="text-green-400" />
                    </span>
                  ) : (
                    <ArrowRight size={16} className="flex-shrink-0 text-[#8a8990] opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Knowledge check quiz */}
        <div>
          <style>{TERM_VISUAL_KEYFRAMES}</style>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8a8990] mb-3">Test your knowledge</h2>
          <Link
            href="/learn/practice"
            className="scale-button group block rounded-[14px] border border-[#7065f0]/30 overflow-hidden"
            style={{ background: 'linear-gradient(150deg, rgba(112,101,240,.14) 0%, #161618 55%)' }}
          >
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <ClipboardCheck size={16} className="text-[#9fa3fc]" />
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9fa3fc]">Quiz</p>
                </div>
                <p className="text-xl font-semibold tracking-tight text-[#f5f5f5]">Knowledge Check</p>
                <p className="text-sm text-[#8a8990] mt-1 leading-relaxed">
                  A quick 10-question quiz covering {PLAYABLE_TERM_IDS.length} key AI terms. Animated visuals illustrate each concept, and every answer comes with an explanation.
                </p>
                {hydrated && practiceStats && practiceStats.rounds > 0 ? (
                  <div className="flex items-center gap-4 mt-3 text-[12px] font-semibold">
                    <span className="text-[#9fa3fc]">{practiceStats.xp} pts earned</span>
                    <span className="flex items-center gap-1 text-orange-400"><Flame size={12} /> Best streak {practiceStats.bestStreak}</span>
                    <span className="text-[#8a8990]">{practiceStats.rounds} {practiceStats.rounds === 1 ? 'quiz' : 'quizzes'} taken</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-[#9fa3fc] group-hover:text-[#b8b4fb] transition-colors">
                    Start the quiz
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </div>
              <div className="hidden sm:grid grid-cols-2 gap-2 w-[190px] flex-shrink-0">
                {['term-9', 'term-10', 'term-21', 'term-31'].map((id) => (
                  <div key={id} className="rounded-[10px] bg-[#101013] border border-white/[0.07] p-1">
                    <TermVisual termId={id} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </div>

        {/* Explore the rest of the app */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8a8990] mb-3">Then explore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map(({ href, label, icon: Icon, note }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-4 rounded-[10px] bg-[#161618] border border-white/10 hover:bg-[#1b1b1e] transition-colors group"
              >
                <Icon size={18} className="text-[#9fa3fc] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#f5f5f5]">{label}</p>
                  <p className="text-xs text-[#8a8990] truncate">{note}</p>
                </div>
                <ArrowRight size={15} className="ml-auto flex-shrink-0 text-[#8a8990] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#8a8990] text-center pt-2">
          v{APP_VERSION} · Model &amp; company data current as of {DATA_SNAPSHOT} · Updated {LAST_UPDATED}
        </p>
      </div>
    </div>
  )
}
