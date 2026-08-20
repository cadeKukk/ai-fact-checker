'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowDown,
  Lightbulb,
  Brain,
  Cpu,
  Network,
  MessageCircle,
  AlignLeft,
  Scale,
  CheckCircle,
  ShieldAlert,
  Check,
  CheckCircle2,
  XCircle,
  Compass,
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowLeftRight,
  Link as LinkIcon,
  Search,
  Layers,
  Database,
  BrainCircuit,
  Bot,
  BarChart3,
  Lock,
  HardDrive,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { lessons } from '@/data/lessons'
import { companies, getAllModels, getAllSources } from '@/data/companies'
import { allTerms } from '@/data/terms'
import { factCheckQAs } from '@/data/factcheck'
import { loadProgress, saveProgress } from '@/lib/courseProgress'
import type { AICompany, AIModel, AITerm, AILessonSection, AILessonVisual } from '@/data/types'
import { termCategoryLabel, termCategoryColor } from '@/data/types'
import { TermPopup, TermHighlightedText, ModelPopup, BenchmarkPopup, useTermPopup } from './TermHighlight'
import {
  LayerStack3D,
  AttentionPlayground,
  MoERouter,
  TrainingStages,
  ThinkingBudget,
  AgentLoopSim,
  ChartCrime,
  InjectionDemo,
  QuantizeSlider,
} from './AdvancedVisuals'
import type { Benchmark } from '@/data/benchmarks'

const SPRING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const SPRING_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Brain, Cpu, Network, MessageCircle, AlignLeft, Scale, CheckCircle, ShieldAlert, Compass,
  Layers, Database, BrainCircuit, Bot, BarChart3, Lock, HardDrive,
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(102, 179, 255, ${alpha})`
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

function useFadeIn(dep: unknown, duration = 400) {
  const [opacity, setOpacity] = useState(0)
  const [translateY, setTranslateY] = useState(8)
  useEffect(() => {
    setOpacity(0)
    setTranslateY(8)
    const raf = requestAnimationFrame(() => {
      setOpacity(1)
      setTranslateY(0)
    })
    return () => cancelAnimationFrame(raf)
  }, [dep])
  return {
    opacity,
    transform: `translateY(${translateY}px)`,
    transition: `opacity ${duration}ms ${SPRING}, transform ${duration}ms ${SPRING}`,
  }
}

// MARK: - Main View

interface GettingStartedViewProps {
  onClose: () => void
  /** Lesson index to open on. When omitted, resumes from saved progress. */
  initialLesson?: number
  /** Lesson set to render. Defaults to the intro course (AI Fundamentals). */
  courseLessons?: typeof lessons
  /** localStorage key for this course's progress. */
  progressKey?: string
  /** Header label, e.g. "AI FUNDAMENTALS" or "AI IN DEPTH". */
  courseLabel?: string
}

export default function GettingStartedView({
  onClose,
  initialLesson,
  courseLessons = lessons,
  progressKey,
  courseLabel = 'AI FUNDAMENTALS',
}: GettingStartedViewProps) {
  const [currentLesson, setCurrentLesson] = useState(() =>
    initialLesson !== undefined ? Math.min(Math.max(initialLesson, 0), courseLessons.length - 1) : 0
  )

  // Resume from saved progress when no explicit lesson was requested.
  const didRestoreRef = useRef(false)
  useEffect(() => {
    if (didRestoreRef.current) return
    didRestoreRef.current = true
    if (initialLesson !== undefined) return
    const saved = loadProgress(progressKey)
    if (saved && saved.current > 0 && !saved.completed) {
      setCurrentLesson(Math.min(saved.current, courseLessons.length - 1))
    }
  }, [initialLesson, progressKey, courseLessons.length])

  // Persist progress as the user moves through lessons.
  useEffect(() => {
    if (!didRestoreRef.current) return
    saveProgress({ current: currentLesson }, progressKey)
  }, [currentLesson, progressKey])
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const lesson = courseLessons[currentLesson]
  const color = lesson.color
  const LessonIcon = ICON_MAP[lesson.icon] ?? Brain
  const contentFade = useFadeIn(currentLesson, 450)

  // True whenever a popup sheet is open over the lesson content. Used to pause
  // the embedding animation behind it — the user can't see the cloud spinning
  // through the sheet, so the CPU is wasted.
  const isPopupOpen = Boolean(activeTerm || activeModel || activeBenchmark)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentLesson])

  const goBack = useCallback(() => {
    if (currentLesson > 0) setCurrentLesson((p) => p - 1)
  }, [currentLesson])

  const goForward = useCallback(() => {
    if (currentLesson < courseLessons.length - 1) {
      setCurrentLesson((p) => p + 1)
    } else {
      saveProgress({ current: currentLesson, completed: true }, progressKey)
      onClose()
    }
  }, [currentLesson, onClose, courseLessons.length, progressKey])

  const renderPrev = () =>
    currentLesson > 0 ? (
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 px-5 py-3.5 rounded-[10px] bg-[#161618] border border-white/10 text-[#b3b2b8] font-semibold text-[15px] hover:bg-[#1b1b1e] active:scale-[0.97]"
        style={{ transition: `all 250ms ${SPRING}` }}
      >
        <ChevronLeft size={14} />
        Previous
      </button>
    ) : null

  const renderForward = () =>
    currentLesson < courseLessons.length - 1 ? (
      <button
        onClick={goForward}
        className="flex items-center gap-1.5 px-6 py-3.5 rounded-[10px] text-[#f5f5f5] font-semibold text-[15px] active:scale-[0.97]"
        style={{ backgroundColor: color, transition: `all 250ms ${SPRING}` }}
      >
        Continue
        <ChevronRight size={14} />
      </button>
    ) : (
      <button
        // Finish via goForward (not onClose) so completion is saved to
        // localStorage before navigating home — otherwise the Learn landing
        // page never shows the course as completed.
        onClick={goForward}
        className="flex items-center gap-1.5 px-6 py-3.5 rounded-[10px] text-[#f5f5f5] font-bold text-[15px] active:scale-[0.97]"
        style={{ backgroundColor: color, transition: `all 250ms ${SPRING}` }}
      >
        Start Exploring!
        <ArrowRight size={14} />
      </button>
    )

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col lg:flex-row"
      style={{ background: '#101012' }}
    >
      {/* Desktop sidebar lesson navigator — hidden on mobile */}
      <aside className="hidden lg:flex flex-col w-[280px] flex-shrink-0 border-r border-white/10 bg-[#0a0a0a]">
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#161618] flex items-center justify-center text-[#b3b2b8] hover:text-[#f5f5f5]"
            style={{ transition: `color 300ms ${SPRING}` }}
          >
            <X size={14} />
          </button>
          <span className="text-[11px] font-bold tracking-[1.5px] text-[#7065f0]">
            {courseLabel}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {courseLessons.map((l, i) => {
            const TileIcon = ICON_MAP[l.icon] ?? Brain
            const isCurrent = i === currentLesson
            const isCompleted = i < currentLesson
            return (
              <button
                key={i}
                onClick={() => setCurrentLesson(i)}
                className="w-full flex items-start gap-3 p-2.5 rounded-[10px] text-left active:scale-[0.99]"
                style={{
                  backgroundColor: isCurrent ? hexToRgba(l.color, 0.12) : 'transparent',
                  transition: `all 250ms ${SPRING}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor:
                      isCurrent || isCompleted ? l.color : hexToRgba(l.color, 0.18),
                    color: isCurrent || isCompleted ? '#fff' : l.color,
                    transition: `all 250ms ${SPRING}`,
                  }}
                >
                  {isCompleted && !isCurrent ? <Check size={14} /> : <TileIcon size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-bold tracking-[1px] mb-0.5"
                    style={{ color: isCurrent ? l.color : '#7a797f' }}
                  >
                    LESSON {i + 1}
                  </p>
                  <p
                    className={`text-[13px] font-semibold leading-snug ${
                      isCurrent
                        ? 'text-[#f5f5f5]'
                        : isCompleted
                          ? 'text-[#b3b2b8]'
                          : 'text-[#8a8990]'
                    }`}
                  >
                    {l.title}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-[10px] font-bold tracking-[1px] text-[#7a797f] mb-2">PROGRESS</p>
          <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${((currentLesson + 1) / courseLessons.length) * 100}%`,
                background: lesson.color,
                transition: `width 350ms ${SPRING}, background 350ms ${SPRING}`,
              }}
            />
          </div>
          <p className="text-[11px] text-[#8a8990] mt-2">
            Lesson {currentLesson + 1} of {courseLessons.length}
          </p>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile header (close + tile strip) — hidden on desktop */}
        <div className="lg:hidden px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#161618] flex items-center justify-center text-[#b3b2b8] hover:text-[#f5f5f5]"
              style={{ transition: `color 300ms ${SPRING}` }}
            >
              <X size={14} />
            </button>
            <span className="text-[11px] font-bold tracking-[1.5px] text-[#7065f0]">
              {courseLabel}
            </span>
            <span className="ml-auto text-xs font-bold text-[#8a8990]">
              {currentLesson + 1}/{courseLessons.length}
            </span>
          </div>

          <div className="flex gap-1">
            {courseLessons.map((l, i) => {
              const isCurrent = i === currentLesson
              const isCompleted = i < currentLesson
              const TileIcon = ICON_MAP[l.icon] ?? Brain
              const tileColor = isCurrent ? l.color : isCompleted ? l.color : '#1e1e21'

              return (
                <button
                  key={i}
                  onClick={() => setCurrentLesson(i)}
                  className="flex-1 flex flex-col items-center gap-0.5"
                  style={{ transition: `all 350ms ${SPRING}` }}
                >
                  <div
                    className="w-full rounded-[10px] flex items-center justify-center"
                    style={{
                      height: isCurrent ? 32 : 24,
                      backgroundColor: tileColor,
                      transition: `all 350ms ${SPRING_BOUNCE}`,
                    }}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check size={10} className="text-[#f5f5f5]" />
                    ) : (
                      <span style={{ color: isCurrent || isCompleted ? '#fff' : '#7a797f' }}>
                        <TileIcon size={isCurrent ? 12 : 10} />
                      </span>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-bold" style={{ color: l.color }}>
                      {i + 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable content area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 lg:px-10 pb-32 lg:pb-8"
          style={contentFade}
        >
          <div className="max-w-lg lg:max-w-3xl mx-auto w-full">
            <div className="pt-4 lg:pt-8 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-[60px] h-[60px] rounded-[10px] flex items-center justify-center"
                  style={{ backgroundColor: hexToRgba(color, 0.2) }}
                >
                  <span style={{ color }}><LessonIcon size={28} /></span>
                </div>
                <span
                  className="text-[10px] font-bold tracking-[1.5px] px-2.5 py-1 rounded-[10px]"
                  style={{ color, backgroundColor: hexToRgba(color, 0.12) }}
                >
                  {lesson.category.toUpperCase()}
                </span>
              </div>
              <h1 className="text-[28px] lg:text-[32px] font-bold text-[#f5f5f5] mb-3">{lesson.title}</h1>
              <TermHighlightedText
                text={lesson.subtitle}
                className="text-base lg:text-[17px] text-[#b3b2b8] leading-relaxed"
                onTermTap={showTerm}
                onModelTap={showModel}
                onBenchmarkTap={showBenchmark}
              />
            </div>

            <div className="space-y-4">
              {lesson.sections.map((section, idx) => (
                <SectionCard key={`${currentLesson}-${idx}`} section={section} lessonColor={color} index={idx} onTermTap={showTerm} onModelTap={showModel} onBenchmarkTap={showBenchmark} pauseAnimations={isPopupOpen} />
              ))}
            </div>

            {lesson.keyTakeaway && (
              <div
                className="mt-6 flex items-start gap-4 p-5 rounded-[10px] border"
                style={{
                  backgroundColor: hexToRgba(color, 0.08),
                  borderColor: hexToRgba(color, 0.2),
                }}
              >
                <div
                  className="flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: hexToRgba(color, 0.15) }}
                >
                  <Lightbulb size={22} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#8a8990] tracking-[0.5px] mb-1">Key Takeaway</p>
                  <TermHighlightedText
                    text={lesson.keyTakeaway}
                    className="text-[15px] font-medium text-[#f5f5f5] leading-relaxed"
                    onTermTap={showTerm}
                    onModelTap={showModel}
                    onBenchmarkTap={showBenchmark}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile bottom nav (fixed across viewport) */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 px-5 py-4"
          style={{ background: 'linear-gradient(to top, #101012 60%, transparent)' }}
        >
          <div className="flex items-center gap-4 max-w-lg mx-auto">
            {renderPrev()}
            <div className="flex-1" />
            {renderForward()}
          </div>
        </div>

        {/* Desktop bottom nav (anchored to content column) */}
        <div className="hidden lg:flex flex-shrink-0 px-10 py-5 border-t border-white/10 bg-[#0a0a0a]">
          <div className="flex items-center gap-4 w-full max-w-3xl mx-auto">
            {renderPrev()}
            <div className="flex-1" />
            {renderForward()}
          </div>
        </div>
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
    </div>
  )
}

function SectionCard({ section, lessonColor, index, onTermTap, onModelTap, onBenchmarkTap, pauseAnimations }: { section: AILessonSection; lessonColor: string; index: number; onTermTap: (term: AITerm) => void; onModelTap: (info: { model: AIModel; company: AICompany; matched: string }) => void; onBenchmarkTap: (b: Benchmark) => void; pauseAnimations?: boolean }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisible(false)
    const delay = index * 100 + 120
    const t = setTimeout(() => setVisible(true), delay)
    return () => { clearTimeout(t); setVisible(false) }
  }, [index])

  return (
    <div
      ref={ref}
      className="rounded-[10px] bg-[#161618] border border-white/10 p-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
        transition: `opacity 450ms ${SPRING}, transform 450ms ${SPRING_BOUNCE}`,
      }}
    >
      {section.heading && (
        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-7 h-7 rounded-[10px] text-sm font-bold text-[#f5f5f5] flex items-center justify-center"
            style={{ backgroundColor: lessonColor }}
          >
            {index + 1}
          </span>
          <h3 className="text-lg font-bold text-[#f5f5f5]">{section.heading}</h3>
        </div>
      )}

      <TermHighlightedText
        text={section.content}
        className="text-[15px] text-[#b3b2b8] leading-[1.7] whitespace-pre-line"
        onTermTap={onTermTap}
        onModelTap={onModelTap}
      />

      {section.bullets && (
        <div className="mt-4 space-y-2.5 pl-1">
          {section.bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                style={{ backgroundColor: lessonColor }}
              />
              <TermHighlightedText
                text={bullet}
                className="text-sm text-[#b3b2b8]"
                onTermTap={onTermTap}
                onModelTap={onModelTap}
              />
            </div>
          ))}
        </div>
      )}

      {section.visual && <VisualContent visual={section.visual} lessonColor={lessonColor} pauseAnimations={pauseAnimations} />}

      {section.sources && section.sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookOpen size={12} className="text-[#8a8990]" />
            <span className="text-[11px] uppercase tracking-wide text-[#8a8990] font-semibold">Sources</span>
          </div>
          <div className="flex flex-col gap-1">
            {section.sources.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-start gap-1.5 text-xs text-[#9a99a2] hover:text-[#e8e6ef] transition-colors"
              >
                <ExternalLink size={11} className="mt-0.5 shrink-0 opacity-50 group-hover:opacity-100" />
                <span className="underline decoration-white/15 underline-offset-2 group-hover:decoration-white/40">
                  {source.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VisualContent({ visual, lessonColor, pauseAnimations }: { visual: AILessonVisual; lessonColor: string; pauseAnimations?: boolean }) {
  return (
    <div
      className="mt-4 p-4 rounded-[10px] border"
      style={{
        backgroundColor: '#151517',
        borderColor: hexToRgba(lessonColor, 0.15),
      }}
    >
      {visual.type === 'diagram' && (
        <div className="space-y-2">
          {visual.elements.map((el, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-3 rounded-[10px]"
              style={{ backgroundColor: hexToRgba(lessonColor, 0.08) }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hexToRgba(lessonColor, 0.4) }} />
              <span className="text-[13px] font-medium text-[#f5f5f5]">{el}</span>
            </div>
          ))}
        </div>
      )}

      {visual.type === 'comparison' && (
        <div className="flex gap-3">
          {visual.elements.map((el, i) => (
            <div
              key={i}
              className="flex-1 p-3 rounded-[10px] text-center"
              style={{
                backgroundColor: i % 2 === 0 ? hexToRgba(lessonColor, 0.12) : 'rgba(168, 85, 247, 0.12)',
              }}
            >
              <span className="text-xs font-medium text-[#f5f5f5]">{el}</span>
            </div>
          ))}
        </div>
      )}

      {visual.type === 'flow' && (
        <div className="flex flex-col items-center gap-1">
          {visual.elements.map((el, i) => (
            <div key={i} className="w-full flex flex-col items-center gap-1">
              <div
                className="w-full text-center py-2.5 px-4 rounded-[10px]"
                style={{ backgroundColor: hexToRgba(lessonColor, 0.12) }}
              >
                <span className="text-[13px] font-medium text-[#f5f5f5]">{el}</span>
              </div>
              {i < visual.elements.length - 1 && (
                <span style={{ color: hexToRgba(lessonColor, 0.6) }}>
                  <ArrowDown size={14} />
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {visual.type === 'scale' && (
        <div>
          <div className="flex gap-0.5 mb-2">
            {visual.elements.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-[30px] rounded"
                style={{ backgroundColor: hexToRgba(lessonColor, 0.2 + i * 0.15) }}
              />
            ))}
          </div>
          <div className="flex justify-between">
            {visual.elements[0] && (
              <span className="text-[11px] font-medium text-[#8a8990]">{visual.elements[0]}</span>
            )}
            {visual.elements[visual.elements.length - 1] && (
              <span className="text-[11px] font-medium text-[#8a8990]">{visual.elements[visual.elements.length - 1]}</span>
            )}
          </div>
        </div>
      )}

      {visual.type === 'neuralNetwork' && <NeuralNetworkAnimation color={lessonColor} />}
      {visual.type === 'tokenizer' && <TokenizerAnimation color={lessonColor} />}
      {visual.type === 'nextWord' && <NextWordAnimation color={lessonColor} />}
      {visual.type === 'confidenceMeter' && <ConfidenceMeterAnimation color={lessonColor} />}
      {visual.type === 'quiz' && <RedFlagQuizAnimation color={lessonColor} />}
      {visual.type === 'parameterScale' && <ParameterScaleAnimation color={lessonColor} />}
      {visual.type === 'embedding' && <EmbeddingFieldAnimation color={lessonColor} paused={pauseAnimations} />}
      {visual.type === 'tapTermDemo' && <TapTermDemo color={lessonColor} />}
      {visual.type === 'sectionExplorer' && <SectionExplorer color={lessonColor} />}
      {visual.type === 'searchDemo' && <SearchDemo color={lessonColor} />}
      {visual.type === 'layerStack' && <LayerStack3D color={lessonColor} />}
      {visual.type === 'attention' && <AttentionPlayground color={lessonColor} />}
      {visual.type === 'moeRouter' && <MoERouter color={lessonColor} />}
      {visual.type === 'trainingStages' && <TrainingStages color={lessonColor} />}
      {visual.type === 'thinkingBudget' && <ThinkingBudget color={lessonColor} />}
      {visual.type === 'agentLoop' && <AgentLoopSim color={lessonColor} />}
      {visual.type === 'chartCrime' && <ChartCrime color={lessonColor} />}
      {visual.type === 'injectionDemo' && <InjectionDemo color={lessonColor} />}
      {visual.type === 'quantizeSlider' && <QuantizeSlider color={lessonColor} />}

      {visual.caption && (
        <p className="text-xs font-medium text-[#8a8990] italic mt-3">{visual.caption}</p>
      )}
    </div>
  )
}

// MARK: - Interactive walkthrough: tap-a-term practice

function TaskRow({ done, label, color }: { done: boolean; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border"
        style={{
          backgroundColor: done ? color : 'transparent',
          borderColor: done ? color : 'rgba(255,255,255,0.2)',
          transform: done ? 'scale(1)' : 'scale(0.92)',
          transition: `all 300ms ${SPRING_BOUNCE}`,
        }}
      >
        {done && <Check size={12} strokeWidth={3} className="text-white" />}
      </div>
      <span
        className="text-[13px] font-medium"
        style={{ color: done ? '#f5f5f5' : '#8a8990', transition: 'color 300ms' }}
      >
        {label}
      </span>
    </div>
  )
}

type TapDemoCard =
  | { kind: 'term'; term: AITerm }
  | { kind: 'model'; model: AIModel; company: AICompany }

function TapTermDemo({ color }: { color: string }) {
  const [card, setCard] = useState<TapDemoCard | null>(null)
  const [tapped, setTapped] = useState(false)
  const [chained, setChained] = useState(false)

  const handleFirstTap = useCallback((term: AITerm) => {
    setCard({ kind: 'term', term })
    setTapped(true)
  }, [])

  const handleChainTerm = useCallback((term: AITerm) => {
    setCard({ kind: 'term', term })
    setChained(true)
  }, [])

  const handleChainModel = useCallback((info: { model: AIModel; company: AICompany; matched: string }) => {
    setCard({ kind: 'model', model: info.model, company: info.company })
    setChained(true)
  }, [])

  const noopModel = useCallback(() => {}, [])
  const done = tapped && chained
  const catColor = card?.kind === 'term' ? termCategoryColor[card.term.category] : color

  return (
    <div>
      {/* Task checklist */}
      <div className="flex flex-col gap-2 mb-4">
        <TaskRow done={tapped} label="1. Tap a highlighted word in the sentence below" color={color} />
        <TaskRow done={chained} label="2. Inside the definition, tap another highlighted word to chain" color={color} />
      </div>

      {/* Practice sentence */}
      <div className="p-4 rounded-[10px] bg-[#1c1c1f] border border-white/10">
        <TermHighlightedText
          text="Sometimes a large language model produces a hallucination — an answer that sounds right but isn't."
          className="text-[15px] text-[#d6d5db] leading-[1.8]"
          onTermTap={handleFirstTap}
          onModelTap={noopModel}
        />
      </div>

      {/* Inline definition card — mirrors the real popup so the skill transfers */}
      {card && (
        <div
          key={card.kind === 'term' ? card.term.id : card.model.id}
          className="mt-3 p-4 rounded-[10px] border"
          style={{
            backgroundColor: hexToRgba(catColor, 0.07),
            borderColor: hexToRgba(catColor, 0.3),
            animation: `tapDemoIn 350ms ${SPRING_BOUNCE}`,
          }}
        >
          <style>{`@keyframes tapDemoIn { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-[15px] font-bold text-[#f5f5f5]">
                {card.kind === 'term' ? card.term.term : card.model.name}
              </p>
              <span className="text-[10px] font-bold tracking-wide" style={{ color: catColor }}>
                {card.kind === 'term'
                  ? termCategoryLabel[card.term.category].toUpperCase()
                  : `MODEL · ${card.company.name.toUpperCase()}`}
              </span>
            </div>
            <button
              onClick={() => setCard(null)}
              className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[#8a8990]"
              aria-label="Close definition"
            >
              <X size={12} />
            </button>
          </div>
          <TermHighlightedText
            text={card.kind === 'term' ? card.term.fullExplanation : card.model.description}
            className="text-[13px] text-[#b3b2b8] leading-[1.7]"
            onTermTap={handleChainTerm}
            onModelTap={handleChainModel}
            excludeTermId={card.kind === 'term' ? card.term.id : undefined}
            excludeModelId={card.kind === 'model' ? card.model.id : undefined}
          />
          {card.kind === 'model' && (
            <p className="text-[11px] font-medium mt-2.5 text-[#8a8990]">
              Full specs, pricing, and myths for this model live in the Companies section.
            </p>
          )}
          {!chained && (
            <p className="text-[11px] font-medium mt-2.5" style={{ color: catColor }}>
              See the highlighted words above? Tap one to jump to its definition.
            </p>
          )}
        </div>
      )}

      {/* Success state */}
      {done && (
        <div
          className="mt-3 flex items-center gap-2.5 p-3 rounded-[10px]"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', animation: `tapDemoIn 350ms ${SPRING_BOUNCE}` }}
        >
          <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
          <span className="text-[13px] font-medium text-green-400">
            That&apos;s the skill! It works exactly like this on every page of the app.
          </span>
        </div>
      )}
    </div>
  )
}

// MARK: - Interactive walkthrough: app section explorer

function SectionExplorer({ color }: { color: string }) {
  const modelCount = getAllModels().length
  const sourceCount = getAllSources().length
  const sections = [
    {
      id: 'learn',
      label: 'Learn',
      icon: GraduationCap,
      blurb: "You're here now. Short visual lessons with saved progress, plus the Knowledge Check quiz — 10 illustrated questions to make the vocabulary stick. Finish this course and an advanced one (AI in Depth) unlocks.",
      chips: ['AI Fundamentals course', 'AI in Depth (advanced)', 'Knowledge Check quiz'],
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: Building2,
      blurb: `Every major AI lab and its models — specs, pricing, real capabilities, known limitations, and myth-vs-fact breakdowns.`,
      chips: [`${companies.length} companies`, `${modelCount} models`, 'Myths vs facts'],
    },
    {
      id: 'factcheck',
      label: 'Fact Check',
      icon: ShieldCheck,
      blurb: 'Clear answers to common AI questions, each tagged with a confidence level based on the strength of the evidence.',
      chips: [`${factCheckQAs.length} questions answered`, 'Confidence levels'],
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: ArrowLeftRight,
      blurb: 'Put any models side by side across quality, speed, context window, value, and versatility.',
      chips: ['Side-by-side specs', 'Radar charts'],
    },
    {
      id: 'sources',
      label: 'Sources',
      icon: LinkIcon,
      blurb: `The receipts: every document, paper, and article behind the claims in this app.`,
      chips: [`${sourceCount}+ sources`, 'Papers · docs · journalism'],
    },
  ]

  const [active, setActive] = useState<string | null>(null)
  const [visited, setVisited] = useState<Set<string>>(new Set())

  const open = (id: string) => {
    setActive(id)
    setVisited((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const activeSection = sections.find((s) => s.id === active)
  const allVisited = visited.size === sections.length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold tracking-wide text-[#8a8990]">
          TAP EACH SECTION TO EXPLORE
        </span>
        <span className="text-[11px] font-bold" style={{ color: allVisited ? '#4ade80' : color }}>
          {visited.size} of {sections.length}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {sections.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          const isVisited = visited.has(id)
          return (
            <button
              key={id}
              onClick={() => open(id)}
              className="relative flex flex-col items-center gap-1.5 py-3 px-1 rounded-[10px] border active:scale-[0.96]"
              style={{
                backgroundColor: isActive ? hexToRgba(color, 0.15) : '#1c1c1f',
                borderColor: isActive ? hexToRgba(color, 0.5) : 'rgba(255,255,255,0.08)',
                transition: `all 250ms ${SPRING}`,
              }}
            >
              {isVisited && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={9} strokeWidth={3.5} className="text-white" />
                </span>
              )}
              <Icon size={17} style={{ color: isActive ? color : '#8a8990', transition: 'color 250ms' }} />
              <span
                className="text-[9px] lg:text-[10px] font-bold leading-none"
                style={{ color: isActive ? '#f5f5f5' : '#8a8990' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {activeSection && (
        <div
          key={activeSection.id}
          className="mt-3 p-4 rounded-[10px] border"
          style={{
            backgroundColor: hexToRgba(color, 0.06),
            borderColor: hexToRgba(color, 0.2),
            animation: `tapDemoIn 300ms ${SPRING_BOUNCE}`,
          }}
        >
          <style>{`@keyframes tapDemoIn { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
          <p className="text-[13px] text-[#d6d5db] leading-[1.7]">{activeSection.blurb}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {activeSection.chips.map((chip) => (
              <span
                key={chip}
                className="text-[11px] font-semibold px-2 py-1 rounded-md"
                style={{ backgroundColor: hexToRgba(color, 0.14), color: '#c9c7f5' }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}

      {allVisited && (
        <div
          className="mt-3 flex items-center gap-2.5 p-3 rounded-[10px]"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', animation: `tapDemoIn 350ms ${SPRING_BOUNCE}` }}
        >
          <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
          <span className="text-[13px] font-medium text-green-400">
            You&apos;ve seen the whole map — the same icons live in the sidebar (or bottom bar on your phone).
          </span>
        </div>
      )}
    </div>
  )
}

// MARK: - Interactive walkthrough: live mini search

type MiniSearchResult = { kind: 'Company' | 'Model' | 'Term' | 'Question'; title: string; sub: string }

const MINI_SEARCH_KIND_COLOR: Record<MiniSearchResult['kind'], string> = {
  Company: '#60a5fa',
  Model: '#a78bfa',
  Term: '#4ade80',
  Question: '#fbbf24',
}

function buildMiniSearchIndex(): MiniSearchResult[] {
  const out: MiniSearchResult[] = []
  for (const c of companies) {
    out.push({ kind: 'Company', title: c.name, sub: c.headquarters })
    for (const m of c.models) {
      out.push({ kind: 'Model', title: m.name, sub: c.name })
    }
  }
  for (const t of allTerms) {
    out.push({ kind: 'Term', title: t.term, sub: t.shortDefinition })
  }
  for (const q of factCheckQAs) {
    out.push({ kind: 'Question', title: q.question, sub: 'Fact Check' })
  }
  return out
}

function SearchDemo({ color }: { color: string }) {
  const [query, setQuery] = useState('')
  const [tried, setTried] = useState(false)

  const index = useRef<MiniSearchResult[] | null>(null)
  if (index.current === null) {
    index.current = buildMiniSearchIndex()
  }

  const q = query.trim().toLowerCase()
  const results = q.length >= 2 ? index.current.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 5) : []

  const runQuery = (value: string) => {
    setQuery(value)
    if (value.trim().length >= 2) setTried(true)
  }

  const suggestions = ['Fable', 'Kimi', 'conscious', 'Gemini']

  return (
    <div>
      <div className="flex flex-col gap-2 mb-4">
        <TaskRow done={tried} label="Try a search — type below or tap a suggestion" color={color} />
      </div>

      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border bg-[#1c1c1f]"
        style={{ borderColor: q ? hexToRgba(color, 0.5) : 'rgba(255,255,255,0.1)', transition: 'border-color 200ms' }}
      >
        <Search size={15} className="text-[#8a8990] flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => runQuery(e.target.value)}
          placeholder="Search companies, models, questions…"
          className="flex-1 bg-transparent text-[14px] text-[#f5f5f5] placeholder-[#5f5e66] outline-none"
        />
        <kbd className="hidden lg:inline text-[10px] font-bold text-[#8a8990] bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => runQuery(s)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-white/10 text-[#b3b2b8] active:scale-95"
            style={{ backgroundColor: query === s ? hexToRgba(color, 0.15) : '#1c1c1f', transition: 'all 200ms' }}
          >
            {s}
          </button>
        ))}
      </div>

      {q.length >= 2 && (
        <div className="mt-3 rounded-[10px] border border-white/10 overflow-hidden" style={{ animation: `tapDemoIn 250ms ${SPRING}` }}>
          <style>{`@keyframes tapDemoIn { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
          {results.length === 0 ? (
            <p className="text-[13px] text-[#8a8990] p-3.5 bg-[#1c1c1f]">No matches — try one of the suggestions.</p>
          ) : (
            results.map((r, i) => (
              <div
                key={`${r.kind}-${r.title}`}
                className="flex items-center gap-3 px-3.5 py-2.5 bg-[#1c1c1f]"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <span
                  className="flex-shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded w-[62px] text-center"
                  style={{ color: MINI_SEARCH_KIND_COLOR[r.kind], backgroundColor: hexToRgba(MINI_SEARCH_KIND_COLOR[r.kind], 0.12) }}
                >
                  {r.kind.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#f5f5f5] truncate">{r.title}</p>
                  <p className="text-[11px] text-[#8a8990] truncate">{r.sub}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tried && (
        <div
          className="mt-3 flex items-center gap-2.5 p-3 rounded-[10px]"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', animation: `tapDemoIn 350ms ${SPRING_BOUNCE}` }}
        >
          <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
          <span className="text-[13px] font-medium text-green-400">
            In the real search, results are links. Press ⌘K (Mac) or Ctrl+K (Windows) to open it from any page.
          </span>
        </div>
      )}
    </div>
  )
}

// MARK: - Tokenizer Animation

function TokenizerAnimation({ color }: { color: string }) {
  const sentence = 'Understanding AI is important'
  const tokens = [
    { text: 'Under', id: '8667' },
    { text: 'standing', id: '18252' },
    { text: ' AI', id: '9012' },
    { text: ' is', id: '374' },
    { text: ' import', id: '12815' },
    { text: 'ant', id: '519' },
  ]
  const opacities = [1.0, 0.85, 0.7, 0.6, 0.5, 0.4]

  const [phase, setPhase] = useState(0)
  const [visibleTokens, setVisibleTokens] = useState(0)
  const [showIds, setShowIds] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function schedule(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms))
  }

  function startAnimation() {
    clearTimers()
    setPhase(0)
    setVisibleTokens(0)
    setShowIds(false)
    setShowStats(false)

    schedule(() => {
      setPhase(1)
      tokens.forEach((_, i) => {
        schedule(() => setVisibleTokens(i + 1), i * 250 + 200)
      })
      const done = tokens.length * 250 + 500
      schedule(() => setShowIds(true), done)
      schedule(() => { setPhase(2); setShowStats(true) }, done + 300)
    }, 100)
  }

  useEffect(() => clearTimers, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span
          className="text-[13px] font-medium"
          style={{ color: phase === 0 ? '#8a8990' : color, transition: `color 300ms ${SPRING}` }}
        >
          {phase === 0 ? 'Tap to tokenize' : phase === 1 ? 'Splitting...' : 'Done'}
        </span>
        {(phase === 0 || phase >= 2) && (
          <button
            onClick={startAnimation}
            className="text-xs font-semibold text-[#f5f5f5] px-3.5 py-1.5 rounded-[10px] active:scale-[0.96]"
            style={{ backgroundColor: color, transition: `transform 250ms ${SPRING}` }}
          >
            {phase >= 2 ? 'Replay' : 'Tokenize'}
          </button>
        )}
      </div>

      <div
        className="p-3.5 rounded-[10px] bg-[#161618] border border-white/10"
        style={{ transition: `all 350ms ${SPRING}` }}
      >
        {phase === 0 ? (
          <span className="font-mono text-base font-medium text-[#f5f5f5]">{sentence}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tokens.slice(0, visibleTokens).map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-0.5"
                style={{
                  animation: `tokenAppear 350ms ${SPRING_BOUNCE} forwards`,
                }}
              >
                <span
                  className="font-mono text-sm font-semibold text-[#f5f5f5] px-2 py-1.5 rounded-[10px]"
                  style={{ backgroundColor: hexToRgba(color, opacities[idx % opacities.length]) }}
                >
                  {t.text}
                </span>
                <span
                  className="font-mono text-[9px] text-[#8a8990]"
                  style={{
                    opacity: showIds ? 1 : 0,
                    transform: showIds ? 'translateY(0)' : 'translateY(-4px)',
                    transition: `opacity 300ms ${SPRING}, transform 300ms ${SPRING}`,
                  }}
                >
                  {t.id}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex"
        style={{
          opacity: showStats ? 1 : 0,
          transform: showStats ? 'translateY(0)' : 'translateY(6px)',
          transition: `opacity 350ms ${SPRING}, transform 350ms ${SPRING}`,
        }}
      >
        {[
          { label: 'Characters', value: `${sentence.length}`, valueColor: '#b3b2b8' },
          { label: 'Tokens', value: `${tokens.length}`, valueColor: color },
          { label: 'Ratio', value: `~${Math.floor(sentence.length / tokens.length)}:1`, valueColor: color },
        ].map((s) => (
          <div key={s.label} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold" style={{ color: s.valueColor }}>{s.value}</span>
            <span className="text-[10px] font-medium text-[#8a8990]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// MARK: - Next Word Prediction Animation

function NextWordAnimation({ color }: { color: string }) {
  const predictions = [
    { context: 'The cat sat on the', candidates: [{ word: 'mat', prob: 0.72 }, { word: 'floor', prob: 0.15 }, { word: 'bed', prob: 0.08 }, { word: 'roof', prob: 0.05 }] },
    { context: 'The cat sat on the mat', candidates: [{ word: 'and', prob: 0.42 }, { word: '.', prob: 0.32 }, { word: 'while', prob: 0.14 }, { word: 'until', prob: 0.12 }] },
    { context: 'The cat sat on the mat and', candidates: [{ word: 'purred', prob: 0.45 }, { word: 'slept', prob: 0.30 }, { word: 'meowed', prob: 0.18 }, { word: 'yawned', prob: 0.07 }] },
    { context: 'The cat sat on the mat and purred', candidates: [{ word: 'softly', prob: 0.55 }, { word: 'loudly', prob: 0.25 }, { word: 'happily', prob: 0.15 }, { word: '.', prob: 0.05 }] },
  ]
  const completeSentence = 'The cat sat on the mat and purred softly'

  const [currentWord, setCurrentWord] = useState(0)
  const [showCandidates, setShowCandidates] = useState(false)
  const [winnerChosen, setWinnerChosen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [barWidths, setBarWidths] = useState<number[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const isComplete = currentWord >= predictions.length
  const p = !isComplete ? predictions[currentWord] : null

  const headerText = isComplete
    ? 'Sentence complete'
    : !showCandidates && currentWord === 0
      ? 'Tap to predict'
      : `Predicting word ${currentWord + 1} of ${predictions.length}`

  const buttonText = isComplete
    ? 'Replay'
    : winnerChosen
      ? currentWord >= predictions.length - 1 ? 'Finish' : 'Next'
      : 'Predict'

  function clearAllTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function schedule(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms))
  }

  function startPrediction() {
    setIsAnimating(true)
    setShowCandidates(true)
    setBarWidths([0, 0, 0, 0])
    schedule(() => {
      const pred = predictions[currentWord]
      if (pred) setBarWidths(pred.candidates.map(c => c.prob * 100))
    }, 50)
    schedule(() => {
      setWinnerChosen(true)
      setIsAnimating(false)
    }, 1200)
  }

  function handleTap() {
    if (isComplete) {
      clearAllTimers()
      setCurrentWord(0)
      setShowCandidates(false)
      setWinnerChosen(false)
      setIsAnimating(false)
      setBarWidths([])
      return
    }
    if (winnerChosen) {
      setIsAnimating(true)
      setShowCandidates(false)
      setWinnerChosen(false)
      setBarWidths([])
      schedule(() => {
        const next = currentWord + 1
        setCurrentWord(next)
        schedule(() => {
          if (next < predictions.length) {
            startPrediction()
          } else {
            setIsAnimating(false)
          }
        }, 150)
      }, 250)
      return
    }
    startPrediction()
  }

  useEffect(() => clearAllTimers, [])

                  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span
          className="text-[13px] font-medium"
          style={{ color: !showCandidates && currentWord === 0 ? '#8a8990' : color, transition: `color 300ms ${SPRING}` }}
        >
          {headerText}
        </span>
        {!isAnimating && (
          <button
            onClick={handleTap}
            className="text-xs font-semibold text-[#f5f5f5] px-3.5 py-1.5 rounded-[10px] active:scale-[0.96]"
            style={{ backgroundColor: color, transition: `transform 250ms ${SPRING}` }}
          >
            {buttonText}
          </button>
        )}
      </div>

      <div className="p-3 rounded-[10px] bg-[#161618] border border-white/10">
        {isComplete ? (
          <span className="text-[15px] font-medium text-[#f5f5f5]">{completeSentence}</span>
        ) : (
          <span className="text-[15px] font-medium text-[#f5f5f5]">
            {p!.context}{' '}
            {winnerChosen ? (
              <span
                className="font-bold"
                style={{
                  color,
                  animation: `tokenAppear 300ms ${SPRING_BOUNCE} forwards`,
                }}
              >
                {p!.candidates[0].word}
              </span>
            ) : (
              <span className="font-bold" style={{ color: showCandidates ? color : hexToRgba(color, 0.25) }}>___</span>
            )}
          </span>
        )}
      </div>

      <div
        style={{
          maxHeight: showCandidates && !isComplete ? 200 : 0,
          opacity: showCandidates && !isComplete ? 1 : 0,
          overflow: 'hidden',
          transition: `max-height 400ms ${SPRING}, opacity 350ms ${SPRING}`,
        }}
      >
        {p && (
          <div className="space-y-1.5 pb-1">
            {p.candidates.map((c, idx) => {
              const isWinner = idx === 0 && winnerChosen
              const dimmed = winnerChosen && idx !== 0
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2"
                  style={{
                    opacity: dimmed ? 0.3 : 1,
                    transition: `opacity 400ms ${SPRING}`,
                  }}
                >
                  <span
                    className="font-mono text-[13px] w-[70px] text-right"
                    style={{
                      color: isWinner ? color : '#fff',
                      fontWeight: isWinner ? 700 : 500,
                      transition: `color 300ms ${SPRING}`,
                    }}
                  >
                    {c.word}
                  </span>
                  <div className="flex-1 h-[18px] rounded-sm bg-[#1e1e21] relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-sm"
                      style={{
                        width: `${barWidths[idx] ?? 0}%`,
                        backgroundColor: isWinner ? color : hexToRgba(color, 0.4),
                        transition: `width 800ms ${SPRING}, background-color 300ms ${SPRING}`,
                      }}
                    />
                  </div>
                  <span
                    className="font-mono text-[11px] font-bold w-8"
                    style={{ color: isWinner ? color : '#8a8990', transition: `color 300ms ${SPRING}` }}
                  >
                    {Math.round(c.prob * 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-[#8a8990] text-center">
        {isComplete ? 'Built one prediction at a time' : 'The model picks the most probable next token each time'}
      </p>
    </div>
  )
}

// MARK: - Confidence Meter Animation

function ConfidenceMeterAnimation({ color }: { color: string }) {
  const claims = [
    { text: 'The Eiffel Tower is in Paris, France', isCorrect: true, confidence: 0.97, explanation: 'Correct — AI handles well-known facts from training data reliably.' },
    { text: 'The Great Wall of China is visible from space', isCorrect: false, confidence: 0.92, explanation: 'Wrong — a popular myth AI repeats confidently because it appeared often in training data.' },
    { text: 'Python was created by Guido van Rossum', isCorrect: true, confidence: 0.95, explanation: 'Correct — well-documented technical facts are usually accurate.' },
    { text: 'Albert Einstein failed math in school', isCorrect: false, confidence: 0.89, explanation: 'Wrong — Einstein excelled at math. AI confidently repeats this popular misconception.' },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [meterWidth, setMeterWidth] = useState(0)
  const [contentKey, setContentKey] = useState(0)

  const isComplete = currentIndex >= claims.length
  const claim = !isComplete ? claims[currentIndex] : null

  useEffect(() => {
    setMeterWidth(0)
    if (claim) {
      const t = setTimeout(() => setMeterWidth(claim.confidence), 200)
      return () => clearTimeout(t)
    }
  }, [currentIndex])

  function revealAnswer() {
    setRevealed(true)
  }

  function nextClaim() {
    setCurrentIndex((p) => p + 1)
    setRevealed(false)
    setContentKey((k) => k + 1)
  }

  function reset() {
    setCurrentIndex(0)
    setRevealed(false)
    setContentKey((k) => k + 1)
  }

  const cardFade = useFadeIn(contentKey, 350)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color }}>Confidence test</span>
        {isComplete ? (
          <button
            onClick={reset}
            className="text-xs font-semibold text-[#f5f5f5] px-3.5 py-1.5 rounded-[10px] active:scale-[0.96]"
            style={{ backgroundColor: color, transition: `transform 250ms ${SPRING}` }}
          >
            Replay
          </button>
        ) : (
          <span className="text-xs font-medium text-[#8a8990]">{currentIndex + 1}/{claims.length}</span>
        )}
      </div>

      {claim ? (
        <div className="p-3.5 rounded-[10px] bg-[#161618] border border-white/10 space-y-3" style={cardFade}>
          <p className="text-[15px] font-medium text-[#f5f5f5]">&ldquo;{claim.text}&rdquo;</p>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#8a8990]">Confidence</span>
              <span className="text-xs font-bold font-mono" style={{ color }}>{Math.round(claim.confidence * 100)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#1e1e21] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${meterWidth * 100}%`,
                  backgroundColor: color,
                  transition: `width 1000ms ${SPRING}`,
                }}
              />
            </div>
          </div>

          <div
            style={{
              maxHeight: revealed ? 200 : 44,
              overflow: 'hidden',
              transition: `max-height 450ms ${SPRING}`,
            }}
          >
            {!revealed ? (
              <button
                onClick={revealAnswer}
                className="w-full text-center text-[13px] font-semibold py-2.5 rounded-[10px] active:scale-[0.97]"
                style={{
                  color,
                  backgroundColor: hexToRgba(color, 0.12),
                  transition: `transform 250ms ${SPRING}`,
                }}
              >
                Tap to reveal
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {claim.isCorrect ? (
                    <CheckCircle2 size={18} className="text-green-400" />
                  ) : (
                    <XCircle size={18} className="text-red-400" />
                  )}
                  <span className={`text-sm font-semibold ${claim.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {claim.isCorrect ? 'Actually correct' : 'Actually wrong'}
                  </span>
                </div>
                <p className="text-[13px] text-[#b3b2b8] leading-relaxed">{claim.explanation}</p>
                <button
                  onClick={nextClaim}
                  className="w-full text-center text-[13px] font-semibold text-[#f5f5f5] py-2.5 rounded-[10px] active:scale-[0.97]"
                    style={{ backgroundColor: color, transition: `transform 250ms ${SPRING}` }}
                  >
                    {currentIndex < claims.length - 1 ? 'Next' : 'See insight'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-[10px] bg-[#161618] border border-white/10 text-center space-y-3" style={cardFade}>
          <p className="text-[15px] font-bold text-[#f5f5f5]">Key Insight</p>
          <p className="text-sm text-[#b3b2b8] leading-relaxed">
            AI showed {Math.round(claims.reduce((a, c) => a + c.confidence, 0) / claims.length * 100)}% average confidence on all claims — even the wrong ones.
          </p>
          <p className="text-base font-semibold text-[#f5f5f5]">Confidence ≠ Accuracy</p>
        </div>
      )}
    </div>
  )
}

// MARK: - Red Flag Quiz Animation

function RedFlagQuizAnimation({ color }: { color: string }) {
  const quizClaims = [
    { text: 'GPT-4 truly understands the meaning of your questions', isRedFlag: true, explanation: "'Understands' implies consciousness. LLMs recognize patterns — they don't comprehend meaning." },
    { text: 'Claude can process up to 200K tokens of context', isRedFlag: false, explanation: "This is a verified technical specification from Anthropic's documentation." },
    { text: 'AI will replace all software engineers within 2 years', isRedFlag: true, explanation: 'Absolute predictions with short timelines are almost always hype.' },
    { text: 'LLMs can sometimes generate false information confidently', isRedFlag: false, explanation: "This is well-documented as 'hallucination' — a known limitation of current LLMs." },
    { text: 'This AI model is sentient and has real feelings', isRedFlag: true, explanation: 'No current AI is sentient. Claims of AI consciousness are not supported by evidence.' },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedIsRedFlag, setSelectedIsRedFlag] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [contentKey, setContentKey] = useState(0)

  const isComplete = currentIndex >= quizClaims.length
  const claim = !isComplete ? quizClaims[currentIndex] : null

  const cardFade = useFadeIn(contentKey, 350)

  function answer(isRedFlag: boolean) {
    setSelectedIsRedFlag(isRedFlag)
    setAnswered(true)
    if (claim && isRedFlag === claim.isRedFlag) {
      setScore((s) => s + 1)
    }
    setTimeout(() => setShowExplanation(true), 150)
  }

  function nextClaim() {
    setCurrentIndex((p) => p + 1)
    setAnswered(false)
    setSelectedIsRedFlag(null)
    setShowExplanation(false)
    setContentKey((k) => k + 1)
  }

  function reset() {
    setCurrentIndex(0)
    setAnswered(false)
    setSelectedIsRedFlag(null)
    setShowExplanation(false)
    setScore(0)
    setContentKey((k) => k + 1)
  }

            return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color }}>Spot the red flags</span>
        <span className="text-xs font-medium text-[#8a8990]">
          {score}/{isComplete ? quizClaims.length : Math.max(currentIndex, 0)}
        </span>
      </div>

      <div className="flex gap-1">
        {quizClaims.map((_, idx) => (
          <div
            key={idx}
            className="flex-1 h-[3px] rounded-sm"
            style={{
              backgroundColor: idx < currentIndex ? color : idx === currentIndex ? hexToRgba(color, 0.5) : '#1e1e21',
              transition: `background-color 350ms ${SPRING}`,
            }}
          />
        ))}
      </div>

      {claim ? (
        <div className="p-3.5 rounded-[10px] bg-[#161618] border border-white/10 space-y-3" style={cardFade}>
          <p className="text-[15px] font-medium text-[#f5f5f5]">{claim.text}</p>

          <div
            style={{
              maxHeight: answered ? 0 : 52,
              opacity: answered ? 0 : 1,
              overflow: 'hidden',
              transition: `max-height 350ms ${SPRING}, opacity 250ms ${SPRING}`,
            }}
          >
            <div className="flex gap-2.5">
              <button
                onClick={() => answer(false)}
                className="flex-1 text-[13px] font-semibold text-green-400 py-2.5 rounded-[10px] bg-[#102217] hover:bg-[#132a1c] active:scale-[0.97]"
                style={{ transition: `all 250ms ${SPRING}` }}
              >
                Legit
              </button>
              <button
                onClick={() => answer(true)}
                className="flex-1 text-[13px] font-semibold text-red-400 py-2.5 rounded-[10px] bg-[#241214] hover:bg-[#2a1618] active:scale-[0.97]"
                style={{ transition: `all 250ms ${SPRING}` }}
              >
                Red Flag
              </button>
            </div>
          </div>

          <div
            style={{
              maxHeight: showExplanation ? 250 : 0,
              opacity: showExplanation ? 1 : 0,
              overflow: 'hidden',
              transition: `max-height 450ms ${SPRING}, opacity 350ms ${SPRING}`,
            }}
          >
            {(() => {
              const isCorrectAnswer = selectedIsRedFlag === claim.isRedFlag
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isCorrectAnswer ? (
                      <CheckCircle2 size={18} className="text-green-400" />
                    ) : (
                      <XCircle size={18} className="text-red-400" />
                    )}
                    <span className={`text-sm font-semibold ${isCorrectAnswer ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrectAnswer ? 'Correct' : 'Not quite'}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#b3b2b8] leading-relaxed">{claim.explanation}</p>
                  <button
                    onClick={nextClaim}
                    className="w-full text-center text-[13px] font-semibold text-[#f5f5f5] py-2.5 rounded-[10px] active:scale-[0.97]"
                    style={{ backgroundColor: color, transition: `transform 250ms ${SPRING}` }}
                  >
                    {currentIndex < quizClaims.length - 1 ? 'Next' : 'See results'}
                  </button>
                </div>
              )
            })()}
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-[10px] bg-[#161618] border border-white/10 text-center space-y-3" style={cardFade}>
          <p className="text-[28px] font-bold" style={{ color }}>{score}/{quizClaims.length}</p>
          <p className="text-sm text-[#b3b2b8] leading-relaxed">
            {score / quizClaims.length >= 0.8
              ? 'Excellent — you can spot AI hype like a pro.'
              : score / quizClaims.length >= 0.6
                ? 'Good job — you\'re building strong AI literacy.'
                : 'Keep learning — these skills improve with practice.'}
          </p>
          <button
            onClick={reset}
            className="text-[13px] font-semibold text-[#f5f5f5] px-5 py-2.5 rounded-[10px] active:scale-[0.96]"
            style={{ backgroundColor: color, transition: `transform 250ms ${SPRING}` }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

// MARK: - Parameter Scale Animation

function ParameterScaleAnimation({ color }: { color: string }) {
  const BLUE = '#3b82f6', ORANGE = '#f97316', GREEN = '#22c55e', PURPLE = '#a855f7'

  const [step, setStep] = useState(0)
  const [lp, setLp] = useState(0)
  const tmrs = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearAll() { tmrs.current.forEach(clearTimeout); tmrs.current = [] }
  function sched(fn: () => void, ms: number) { tmrs.current.push(setTimeout(fn, ms)) }
  useEffect(() => {
    sched(() => setLp(1), 500)
    sched(() => setLp(2), 950)
    sched(() => setLp(3), 1400)
    sched(() => setLp(4), 1850)
    return clearAll
  }, [])

  function goToStep(s: number) {
    clearAll()
    setStep(s)
    setLp(0)
    sched(() => setLp(1), 350)
    sched(() => setLp(2), 800)
    sched(() => setLp(3), 1250)
    sched(() => setLp(4), 1700)
    if (s >= 1) sched(() => setLp(5), 2150)
  }

  const stepInfo = [
    { title: '2 Nodes = 6 Parameters', desc: 'Even the simplest connection has hidden complexity.' },
    { title: '3 Nodes = 15 Parameters', desc: 'One new node nearly triples the parameter count.' },
    { title: 'Now Imagine Billions...', desc: 'GPT-4 has ~1.8 trillion of these — the scale of modern AI.' },
  ]
  const info = stepInfo[step]
  const paramCounts = [6, 15, 0]

  function Pill({ text, accent, show }: { text: string; accent: string; show: boolean }) {
    return (
      <span
        className="inline-block text-[9px] font-bold font-mono px-1.5 py-0.5 rounded"
        style={{
          color: accent,
          backgroundColor: hexToRgba(accent, 0.15),
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1)' : 'scale(0.8)',
          transition: `opacity 350ms ${SPRING}, transform 350ms ${SPRING_BOUNCE}`,
        }}
      >
        {text}
      </span>
    )
  }

  function renderTwoNodes() {
    const W = 280, H = 130
    const ax = 70, ay = 65, bx = 210, by = 65
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block" overflow="visible">
        <line x1={ax} y1={ay} x2={bx} y2={by}
          stroke={color} strokeWidth={3} strokeLinecap="round"
          style={{ opacity: lp >= 3 ? 1 : 0.15, transition: `opacity 450ms ${SPRING}` }} />

        {/* Direction arrows on the line */}
        <polygon points={`${bx - 30},${by - 5} ${bx - 22},${by} ${bx - 30},${by + 5}`}
          fill={ORANGE}
          style={{ opacity: lp >= 4 ? 0.9 : 0, transition: `opacity 350ms ${SPRING}` }} />
        <polygon points={`${ax + 30},${ay + 5} ${ax + 22},${ay} ${ax + 30},${ay - 5}`}
          fill={PURPLE}
          style={{ opacity: lp >= 4 ? 0.9 : 0, transition: `opacity 350ms ${SPRING}` }} />

        {/* Nodes */}
        <circle cx={ax} cy={ay} r={20} fill={BLUE}
          style={{ animation: `tokenAppear 450ms ${SPRING_BOUNCE} forwards` }} />
        <text x={ax} y={ay + 4} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>N₁</text>

        <g style={{ animation: `tokenAppear 450ms ${SPRING_BOUNCE} 80ms forwards`, opacity: 0 }}>
          <circle cx={bx} cy={by} r={20} fill={GREEN} />
          <text x={bx} y={by + 4} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>N₂</text>
        </g>

        {/* Bias labels — above nodes */}
        <g style={{ opacity: lp >= 1 ? 1 : 0, transform: lp >= 1 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={ax - 24} y={ay - 40} width={48} height={16} rx={5} fill={hexToRgba(BLUE, 0.15)} />
          <text x={ax} y={ay - 28} textAnchor="middle" fill={BLUE} fontSize={9} fontWeight={700} fontFamily="monospace">bias=0.3</text>
        </g>
        <g style={{ opacity: lp >= 2 ? 1 : 0, transform: lp >= 2 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={bx - 24} y={by - 40} width={48} height={16} rx={5} fill={hexToRgba(GREEN, 0.15)} />
          <text x={bx} y={by - 28} textAnchor="middle" fill={GREEN} fontSize={9} fontWeight={700} fontFamily="monospace">bias=0.7</text>
        </g>

        {/* Connection weight — centered above line */}
        <g style={{ opacity: lp >= 3 ? 1 : 0, transform: lp >= 3 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={W / 2 - 18} y={ay - 20} width={36} height={16} rx={5} fill={hexToRgba(color, 0.15)} />
          <text x={W / 2} y={ay - 8} textAnchor="middle" fill={color} fontSize={9} fontWeight={700} fontFamily="monospace">w=0.5</text>
        </g>

        {/* Direction weight labels — below the line, spaced apart */}
        <g style={{ opacity: lp >= 4 ? 1 : 0, transform: lp >= 4 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={W / 2 + 6} y={ay + 14} width={40} height={16} rx={5} fill={hexToRgba(ORANGE, 0.15)} />
          <text x={W / 2 + 26} y={ay + 26} textAnchor="middle" fill={ORANGE} fontSize={9} fontWeight={700} fontFamily="monospace">→ 0.8</text>

          <rect x={W / 2 - 46} y={ay + 14} width={40} height={16} rx={5} fill={hexToRgba(PURPLE, 0.15)} />
          <text x={W / 2 - 26} y={ay + 26} textAnchor="middle" fill={PURPLE} fontSize={9} fontWeight={700} fontFamily="monospace">← 0.4</text>
        </g>
      </svg>
    )
  }

  function renderThreeNodes() {
    const W = 300, H = 210
    const ax = 60, ay = 55
    const bx = 240, by = 55
    const cx = 150, cy = 170

    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block" overflow="visible">
        {/* Connection lines */}
        <line x1={ax} y1={ay} x2={bx} y2={by}
          stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        <g style={{ animation: `tokenAppear 400ms ${SPRING_BOUNCE} 250ms forwards`, opacity: 0 }}>
          <line x1={ax} y1={ay} x2={cx} y2={cy}
            stroke={ORANGE} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        </g>
        <g style={{ animation: `tokenAppear 400ms ${SPRING_BOUNCE} 350ms forwards`, opacity: 0 }}>
          <line x1={bx} y1={by} x2={cx} y2={cy}
            stroke={PURPLE} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        </g>

        {/* Direction arrows on lines */}
        {[
          { x: ax + 36, y: ay, dx: 1, dy: 0, c: color },
          { x: bx - 36, y: by, dx: -1, dy: 0, c: color },
          { x: ax + 18, y: ay + 24, dx: 1, dy: 1, c: ORANGE },
          { x: cx - 18, y: cy - 24, dx: -1, dy: -1, c: ORANGE },
          { x: bx - 18, y: by + 24, dx: -1, dy: 1, c: PURPLE },
          { x: cx + 18, y: cy - 24, dx: 1, dy: -1, c: PURPLE },
        ].map((a, i) => {
          const angle = Math.atan2(a.dy, a.dx)
          return (
            <polygon key={i}
              transform={`translate(${a.x},${a.y}) rotate(${angle * 180 / Math.PI})`}
              points="0,-4 8,0 0,4"
              fill={a.c}
              style={{ opacity: lp >= 4 ? 0.8 : 0, transition: `opacity 350ms ${SPRING}` }}
            />
          )
        })}

        {/* Nodes */}
        <g style={{ animation: `tokenAppear 450ms ${SPRING_BOUNCE} forwards` }}>
          <circle cx={ax} cy={ay} r={18} fill={BLUE} />
          <text x={ax} y={ay + 4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>N₁</text>
        </g>
        <g style={{ animation: `tokenAppear 450ms ${SPRING_BOUNCE} 80ms forwards`, opacity: 0 }}>
          <circle cx={bx} cy={by} r={18} fill={GREEN} />
          <text x={bx} y={by + 4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>N₂</text>
        </g>
        <g style={{ animation: `tokenAppear 450ms ${SPRING_BOUNCE} 200ms forwards`, opacity: 0 }}>
          <circle cx={cx} cy={cy} r={18} fill={ORANGE} />
          <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>N₃</text>
        </g>

        {/* Bias labels — outside the triangle */}
        <g style={{ opacity: lp >= 1 ? 1 : 0, transform: lp >= 1 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={ax - 20} y={ay - 36} width={40} height={14} rx={4} fill={hexToRgba(BLUE, 0.15)} />
          <text x={ax} y={ay - 26} textAnchor="middle" fill={BLUE} fontSize={8} fontWeight={700} fontFamily="monospace">bias₁</text>
        </g>
        <g style={{ opacity: lp >= 1 ? 1 : 0, transform: lp >= 1 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={bx - 20} y={by - 36} width={40} height={14} rx={4} fill={hexToRgba(GREEN, 0.15)} />
          <text x={bx} y={by - 26} textAnchor="middle" fill={GREEN} fontSize={8} fontWeight={700} fontFamily="monospace">bias₂</text>
        </g>
        <g style={{ opacity: lp >= 2 ? 1 : 0, transform: lp >= 2 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={cx - 20} y={cy + 22} width={40} height={14} rx={4} fill={hexToRgba(ORANGE, 0.15)} />
          <text x={cx} y={cy + 32} textAnchor="middle" fill={ORANGE} fontSize={8} fontWeight={700} fontFamily="monospace">bias₃</text>
        </g>

        {/* Connection weight labels — positioned outside edges of the triangle */}
        <g style={{ opacity: lp >= 3 ? 1 : 0, transform: lp >= 3 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={(ax + bx) / 2 - 12} y={ay - 18} width={24} height={14} rx={4} fill={hexToRgba(color, 0.15)} />
          <text x={(ax + bx) / 2} y={ay - 8} textAnchor="middle" fill={color} fontSize={8} fontWeight={700} fontFamily="monospace">w₁₂</text>
        </g>
        <g style={{ opacity: lp >= 3 ? 1 : 0, transform: lp >= 3 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={30} y={(ay + cy) / 2 + 2} width={24} height={14} rx={4} fill={hexToRgba(ORANGE, 0.15)} />
          <text x={42} y={(ay + cy) / 2 + 12} textAnchor="middle" fill={ORANGE} fontSize={8} fontWeight={700} fontFamily="monospace">w₁₃</text>
        </g>
        <g style={{ opacity: lp >= 3 ? 1 : 0, transform: lp >= 3 ? 'translateY(0)' : 'translateY(3px)', transition: `all 350ms ${SPRING}` }}>
          <rect x={W - 54} y={(by + cy) / 2 + 2} width={24} height={14} rx={4} fill={hexToRgba(PURPLE, 0.15)} />
          <text x={W - 42} y={(by + cy) / 2 + 12} textAnchor="middle" fill={PURPLE} fontSize={8} fontWeight={700} fontFamily="monospace">w₂₃</text>
        </g>

        {/* Direction indicator — only after phase 4, placed below diagram */}
        <g style={{ opacity: lp >= 4 ? 1 : 0, transition: `opacity 350ms ${SPRING}` }}>
          <text x={W / 2} y={H + 2} textAnchor="middle" fill="#7a797f" fontSize={8} fontWeight={600}>
            + 6 direction weights (→ ← on each connection)
          </text>
        </g>
      </svg>
    )
  }

  function renderScale() {
    const tiers = [
      { params: 6, label: '2 nodes', accent: BLUE },
      { params: 15, label: '3 nodes', accent: ORANGE },
      { params: 190, label: '10 nodes', accent: color },
      { params: 19900, label: '100 nodes', accent: PURPLE },
    ]
    const maxP = tiers[tiers.length - 1].params

    return (
      <div className="space-y-3">
        <div className="space-y-2.5">
          {tiers.map((t, i) => {
            const vis = lp >= i + 1
            const barW = Math.max(2, (t.params / maxP) * 100)
            return (
              <div key={i} className="flex items-center gap-3"
                style={{
                  opacity: vis ? 1 : 0,
                  transform: vis ? 'translateX(0)' : 'translateX(-6px)',
                  transition: `opacity 450ms ${SPRING}, transform 450ms ${SPRING}`,
                  transitionDelay: `${i * 120}ms`,
                }}>
                <span className="text-[11px] font-semibold w-[60px] text-right shrink-0" style={{ color: t.accent }}>
                  {t.label}
                </span>
                <div className="flex-1 h-5 bg-[#161618] border border-white/10 rounded-[10px] overflow-hidden">
                  <div className="h-full rounded-[10px]" style={{
                    width: vis ? `${barW}%` : '0%',
                    backgroundColor: t.accent,
                    transition: `width 900ms ${SPRING}`,
                    transitionDelay: `${i * 150 + 250}ms`,
                  }} />
                </div>
                <span className="text-[11px] font-bold font-mono w-[52px] shrink-0" style={{ color: t.accent }}>
                  {t.params.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{
          opacity: lp >= 5 ? 1 : 0,
          transform: lp >= 5 ? 'translateY(0)' : 'translateY(8px)',
          transition: `opacity 450ms ${SPRING}, transform 450ms ${SPRING}`,
        }}>
          <div className="p-4 rounded-[10px] bg-[#161618] border border-white/10 text-center">
            <p className="text-[11px] text-[#8a8990] mb-1.5">GPT-4 has roughly</p>
            <p className="text-xl font-bold tracking-tight" style={{ color: GREEN }}>1,800,000,000,000</p>
            <p className="text-[11px] text-[#8a8990] mt-1.5">parameters — 1.8 trillion weights and biases</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold" style={{ color, transition: `color 300ms ${SPRING}` }}>
          {info.title}
        </span>
        {step < 2 && (
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md"
            style={{ color, backgroundColor: hexToRgba(color, 0.12) }}>
            {paramCounts[step]} params
          </span>
        )}
      </div>

      <div className="rounded-[10px] bg-[#151517] p-4 overflow-hidden">
        {step === 0 && renderTwoNodes()}
        {step === 1 && renderThreeNodes()}
        {step === 2 && renderScale()}
      </div>

      {step < 2 && (
        <div className="flex flex-wrap gap-1.5"
          style={{ opacity: lp >= 4 ? 1 : 0, transition: `opacity 350ms ${SPRING}` }}>
          {step === 0 && (
            <>
              <Pill text="bias₁" accent={BLUE} show={lp >= 1} />
              <Pill text="bias₂" accent={GREEN} show={lp >= 2} />
              <Pill text="weight" accent={color} show={lp >= 3} />
              <Pill text="→ dir" accent={ORANGE} show={lp >= 4} />
              <Pill text="← dir" accent={PURPLE} show={lp >= 4} />
              <Pill text="= 6 total" accent="#fff" show={lp >= 4} />
            </>
          )}
          {step === 1 && (
            <>
              <Pill text="3 biases" accent={BLUE} show={lp >= 1} />
              <Pill text="3 weights" accent={color} show={lp >= 3} />
              <Pill text="6 directions" accent={ORANGE} show={lp >= 4} />
              <Pill text="3 conn biases" accent={PURPLE} show={lp >= 4} />
              <Pill text="= 15 total" accent="#fff" show={lp >= 4} />
            </>
          )}
        </div>
      )}

      <p className="text-xs text-[#b3b2b8] leading-relaxed">{info.desc}</p>

      <div className="flex gap-2.5">
        {step > 0 && (
          <button onClick={() => goToStep(step - 1)}
            className="flex-1 text-[13px] font-semibold py-2.5 rounded-[10px] bg-[#161618] border border-white/10 text-[#b3b2b8] active:scale-[0.97]"
            style={{ transition: `transform 200ms ${SPRING}` }}>
            Back
          </button>
        )}
        {step < 2 ? (
          <button onClick={() => goToStep(step + 1)}
            className="flex-1 text-[13px] font-semibold py-2.5 rounded-[10px] text-[#f5f5f5] active:scale-[0.97]"
            style={{ backgroundColor: color, transition: `transform 200ms ${SPRING}` }}>
            {step === 0 ? 'Add 3rd Node' : 'See the Scale'}
          </button>
        ) : (
          <button onClick={() => goToStep(0)}
            className="flex-1 text-[13px] font-semibold py-2.5 rounded-[10px] text-[#f5f5f5] active:scale-[0.97]"
            style={{ backgroundColor: color, transition: `transform 200ms ${SPRING}` }}>
            Start Over
          </button>
        )}
      </div>
    </div>
  )
}

// MARK: - Neural Network Animation

function NeuralNetworkAnimation({ color }: { color: string }) {
  const INPUT = 3, HIDDEN = 4, OUTPUT = 2
  const BLUE = '#3b82f6', GREEN = '#22c55e', ORANGE = '#f97316', RED = '#ef4444'

  const [phase, setPhase] = useState(0)
  const [fwdL1, setFwdL1] = useState(0)
  const [fwdL2, setFwdL2] = useState(0)
  const [bkL2, setBkL2] = useState(0)
  const [bkL1, setBkL1] = useState(0)
  const [fwd2L1, setFwd2L1] = useState(0)
  const [fwd2L2, setFwd2L2] = useState(0)
  const [inputGlow, setInputGlow] = useState(false)
  const [hiddenGlow, setHiddenGlow] = useState(false)
  const [outputGlow, setOutputGlow] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorVal, setErrorVal] = useState('70%')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const rafs = useRef<number[]>([])

  function clearAll() {
    timers.current.forEach(clearTimeout); timers.current = []
    rafs.current.forEach(cancelAnimationFrame); rafs.current = []
  }
  function sched(fn: () => void, ms: number) { timers.current.push(setTimeout(fn, ms)) }

  useEffect(() => clearAll, [])

  const W = 300, H = 180
  const layerX = [40, 150, 260]

  function nodePos(layer: number, idx: number) {
    const counts = [INPUT, HIDDEN, OUTPUT]
    const spacing = H / (counts[layer] + 1)
    return { x: layerX[layer], y: spacing * (idx + 1) }
  }

  function animate(setter: (v: number) => void, duration: number) {
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      setter(1 - Math.pow(1 - t, 3))
      if (t < 1) { const id = requestAnimationFrame(tick); rafs.current.push(id) }
    }
    const id = requestAnimationFrame(tick); rafs.current.push(id)
  }

  /*
    Phases:
    0  Idle
    1  Input glow
    2  Forward L1 (input → hidden)
    3  Hidden glow
    4  Forward L2 (hidden → output)
    5  Output glow
    6  Show error 70%
    7  Backward L2 (output → hidden, orange)
    8  Backward L1 (hidden → input, orange)
    9  Update weights
    10 2nd Forward L1
    11 2nd Forward L2
    12 Show improved error 28%
    13 Done
  */

  const phaseInfo: Record<number, { text: string; explanation: string; dotColor: string }> = {
    0:  { text: 'Tap to Start',               explanation: 'See how data flows through a neural network',            dotColor: '#8a8990' },
    1:  { text: '① Input Data',               explanation: 'Input values enter the network (e.g., image pixels)',     dotColor: BLUE },
    2:  { text: '② Weighted Sum → Hidden',    explanation: 'Each input × weight, then all summed together',          dotColor: BLUE },
    3:  { text: '③ Hidden Activation',         explanation: 'Hidden neurons activate based on their inputs',          dotColor: color },
    4:  { text: '④ Weighted Sum → Output',    explanation: 'Hidden values × weights, sent to output',                dotColor: color },
    5:  { text: '⑤ Output Prediction',         explanation: 'Output neuron produces the prediction',                  dotColor: GREEN },
    6:  { text: '⑥ Calculate Error',           explanation: 'Compare prediction to correct answer — 70% error',      dotColor: RED },
    7:  { text: '⑦ Backprop: Output → Hidden', explanation: 'Error signal flows backward through layer 2',           dotColor: ORANGE },
    8:  { text: '⑦ Backprop: Hidden → Input',  explanation: 'Error signal continues backward through layer 1',       dotColor: ORANGE },
    9:  { text: '⑧ Update Weights',            explanation: 'Adjust all weights to reduce error',                     dotColor: color },
    10: { text: '⑨ 2nd Forward: Input → Hidden', explanation: 'Run the data through again with updated weights',    dotColor: BLUE },
    11: { text: '⑨ 2nd Forward: Hidden → Output', explanation: 'Data flows through updated layer 2',                dotColor: color },
    12: { text: '⑩ Improved Prediction',       explanation: 'Error dropped from 70% to 28% — the network learned!', dotColor: GREEN },
    13: { text: '✓ Learning Complete!',         explanation: 'Repeat many times to keep improving accuracy!',         dotColor: GREEN },
  }
  const info = phaseInfo[phase] ?? phaseInfo[0]
  const isBackward = phase === 7 || phase === 8

  function startAnimation() {
    clearAll()
    setPhase(0); setFwdL1(0); setFwdL2(0); setBkL2(0); setBkL1(0); setFwd2L1(0); setFwd2L2(0)
    setInputGlow(false); setHiddenGlow(false); setOutputGlow(false)
    setShowError(false); setErrorVal('70%')

    // First forward pass
    sched(() => { setPhase(1); setInputGlow(true) }, 100)
    sched(() => { setPhase(2); animate(setFwdL1, 1000) }, 700)
    sched(() => { setPhase(3); setHiddenGlow(true) }, 1800)
    sched(() => { setPhase(4); animate(setFwdL2, 1000) }, 2300)
    sched(() => { setPhase(5); setOutputGlow(true) }, 3400)
    sched(() => { setPhase(6); setShowError(true) }, 4000)

    // Backward pass — layer by layer, mirroring forward
    sched(() => { setPhase(7); animate(setBkL2, 1000) }, 4800)
    sched(() => { setPhase(8); animate(setBkL1, 1000) }, 5900)

    // Weight update
    sched(() => { setPhase(9) }, 7000)

    // Second forward pass — reset forward progress, replay
    sched(() => {
      setFwdL1(0); setFwdL2(0)
      setBkL2(0); setBkL1(0)
      setOutputGlow(false)
    }, 7600)
    sched(() => { setPhase(10); animate(setFwd2L1, 1000) }, 7800)
    sched(() => { setPhase(11); animate(setFwd2L2, 1000) }, 8900)
    sched(() => { setPhase(12); setOutputGlow(true); setErrorVal('28%') }, 10000)
    sched(() => { setPhase(13) }, 10800)
  }

  function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

  function renderLayerConnections(
    fromLayer: number, toLayer: number,
    fromCount: number, toCount: number,
    fwd: number, isFwd: boolean, fwdColor: string,
    bk: number, isBk: boolean,
  ) {
    const els: React.ReactNode[] = []
    for (let i = 0; i < fromCount; i++) {
      for (let j = 0; j < toCount; j++) {
        const f = nodePos(fromLayer, i)
        const t = nodePos(toLayer, j)
        const k = `${fromLayer}-${i}-${j}`

        els.push(
          <line key={`${k}-b`} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke="#2a2a2e" strokeWidth={1.2} />
        )

        if (isFwd && fwd > 0) {
          const ex = lerp(f.x, t.x, fwd), ey = lerp(f.y, t.y, fwd)
          els.push(
            <line key={`${k}-f`} x1={f.x} y1={f.y} x2={ex} y2={ey}
              stroke={fwdColor} strokeWidth={2.5} strokeLinecap="round" />
          )
          if (fwd > 0.02 && fwd < 0.98) {
            els.push(
              <circle key={`${k}-fd`} cx={ex} cy={ey} r={4} fill={fwdColor}>
                <animate attributeName="r" values="3;5;3" dur="0.8s" repeatCount="indefinite" />
              </circle>
            )
          }
        }

        if (isBk && bk > 0) {
          const bx = lerp(t.x, f.x, bk), by = lerp(t.y, f.y, bk)
          els.push(
            <line key={`${k}-bk`} x1={t.x} y1={t.y} x2={bx} y2={by}
              stroke={ORANGE} strokeWidth={2.5} strokeLinecap="round" />
          )
          if (bk > 0.02 && bk < 0.98) {
            els.push(
              <circle key={`${k}-bd`} cx={bx} cy={by} r={4} fill={ORANGE}>
                <animate attributeName="r" values="3;5;3" dur="0.8s" repeatCount="indefinite" />
              </circle>
            )
          }
        }
      }
    }
    return els
  }

  function renderNodes(layer: number, count: number, baseColor: string, isGlowing: boolean, labels: string[], isErrorNode = false) {
    return Array.from({ length: count }).map((_, i) => {
      const p = nodePos(layer, i)
      const r = 14
      const errActive = isErrorNode && showError && phase >= 6 && phase < 9
      return (
        <g key={`n-${layer}-${i}`}>
          {isGlowing && (
            <circle cx={p.x} cy={p.y} r={r + 6} fill={baseColor} opacity={0.25}>
              <animate attributeName="opacity" values="0.15;0.3;0.15" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={p.x} cy={p.y} r={r}
            fill={isGlowing ? baseColor : hexToRgba(baseColor, 0.25)}
            stroke={errActive ? RED : baseColor}
            strokeWidth={errActive ? 2 : 1}
            style={{ transition: `fill 400ms ${SPRING}, stroke 300ms ${SPRING}` }}
          />
          <text x={p.x} y={p.y + 3.5} textAnchor="middle" fill={isGlowing ? '#fff' : baseColor}
            fontSize={9} fontWeight={700} fontFamily="monospace"
            style={{ transition: `fill 400ms ${SPRING}` }}
          >
            {labels[i]}
          </text>
        </g>
      )
    })
  }

  const l1FwdActive = phase === 2
  const l2FwdActive = phase === 4
  const l1Fwd2Active = phase === 10
  const l2Fwd2Active = phase === 11

  const l1FwdProg = l1FwdActive ? fwdL1 : l1Fwd2Active ? fwd2L1 : (phase > 2 && phase < 7 ? 1 : phase >= 10 && phase > 10 ? 1 : 0)
  const l2FwdProg = l2FwdActive ? fwdL2 : l2Fwd2Active ? fwd2L2 : (phase > 4 && phase < 7 ? 1 : phase > 11 ? 1 : 0)
  const l1FwdColor = (phase >= 10 ? GREEN : BLUE)
  const l2FwdColor = (phase >= 10 ? GREEN : color)
  const showL1Fwd = l1FwdActive || (phase > 2 && phase < 7) || l1Fwd2Active || phase > 10
  const showL2Fwd = l2FwdActive || (phase > 4 && phase < 7) || l2Fwd2Active || phase > 11

  const errorBorderColor = errorVal === '28%' ? GREEN : RED

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.dotColor, transition: `background-color 300ms ${SPRING}` }} />
        <span className="text-[13px] font-bold" style={{ color: info.dotColor, transition: `color 300ms ${SPRING}` }}>
          {info.text}
        </span>
        <div className="flex-1" />
        {(phase === 0 || phase >= 13) && (
          <button
            onClick={startAnimation}
            className="flex items-center gap-1 text-xs font-semibold text-[#f5f5f5] px-3 py-1.5 rounded-[10px] active:scale-[0.95]"
            style={{ backgroundColor: color, transition: `transform 200ms ${SPRING}` }}
          >
            {phase >= 13 ? '↺ Replay' : '▶ Start'}
          </button>
        )}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
        {renderLayerConnections(0, 1, INPUT, HIDDEN,
          l1FwdProg, showL1Fwd, l1FwdColor,
          bkL1, phase === 8)}
        {renderLayerConnections(1, 2, HIDDEN, OUTPUT,
          l2FwdProg, showL2Fwd, l2FwdColor,
          bkL2, phase === 7)}

        {renderNodes(0, INPUT, BLUE, inputGlow, ['x1', 'x2', 'x3'])}
        {renderNodes(1, HIDDEN, color, hiddenGlow, ['h1', 'h2', 'h3', 'h4'])}
        {renderNodes(2, OUTPUT, GREEN, outputGlow, ['y1', 'y2'], true)}

        {showError && (
          <g>
            <rect x={W - 60} y={4} width={52} height={32} rx={8}
              fill={hexToRgba(errorBorderColor, 0.12)} stroke={errorBorderColor} strokeWidth={0.5}
              style={{ transition: `fill 500ms ${SPRING}, stroke 500ms ${SPRING}` }} />
            <text x={W - 34} y={16} textAnchor="middle" fill="#8a8990" fontSize={8} fontWeight={700}>Error</text>
            <text x={W - 34} y={30} textAnchor="middle"
              fill={errorBorderColor} fontSize={13} fontWeight={700}
              style={{ transition: `fill 500ms ${SPRING}` }}
            >
              {errorVal}
          </text>
          </g>
        )}
      </svg>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BLUE }} />
          <span className="text-[10px] text-[#8a8990]">Input</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[10px] text-[#8a8990]">Hidden</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN }} />
          <span className="text-[10px] text-[#8a8990]">Output</span>
        </div>
        <div className="flex-1" />
        {isBackward && (
          <div className="flex items-center gap-1" style={{ animation: `tokenAppear 350ms ${SPRING_BOUNCE} forwards` }}>
            <span className="text-[10px]" style={{ color: ORANGE }}>←</span>
            <span className="text-[10px] font-medium" style={{ color: ORANGE }}>Error flows back</span>
          </div>
        )}
        {(phase === 10 || phase === 11) && (
          <div className="flex items-center gap-1" style={{ animation: `tokenAppear 350ms ${SPRING_BOUNCE} forwards` }}>
            <span className="text-[10px]" style={{ color: GREEN }}>→</span>
            <span className="text-[10px] font-medium" style={{ color: GREEN }}>Updated weights</span>
          </div>
        )}
      </div>

      <p className="text-xs text-[#b3b2b8] text-center" style={{ transition: `opacity 300ms ${SPRING}` }}>
        {info.explanation}
      </p>
    </div>
  )
}

// MARK: - Embedding Field Animation
// A minimal 3D projection of a vector space: tokens ease into semantic clusters
// and the scene slowly rotates around the Y axis.
//
// Performance design (canvas, not SVG):
//   - The earlier SVG implementation hit a wall: ~76 SVG nodes × 3-5 setAttribute
//     calls per frame = ~300 layout-invalidating DOM writes per frame, which is
//     too expensive for 60fps without warming the device.
//   - Canvas eliminates that entirely. One <canvas> element, one rAF loop, no
//     DOM mutation on the hot path.
//   - All 36 intra-cluster relation lines collapse into a single Path2D that
//     is stroked once per frame.
//   - Phase transitions (scatter → cluster → auras → lines) are derived purely
//     from elapsed time inside the draw call — there is zero React state on
//     the hot path, so React's reconciler is never invoked while the scene is
//     animating.
//   - The loop pauses automatically when:
//       a) the canvas is off-screen (IntersectionObserver)
//       b) the tab/window is hidden (visibilitychange)
//       c) a TermPopup/ModelPopup/BenchmarkPopup is open over the lesson
//          (the `paused` prop)
//   - Render resolution tracks the canvas's actual display size × devicePixelRatio
//     (capped at 2x — 3x retina would otherwise demand 9x more pixels for no
//     perceptible gain on this kind of content).

type EmbCluster = 'animal' | 'place' | 'royal'
type EmbV3 = { x: number; y: number; z: number }
type EmbToken = { id: string; label: string; cluster: EmbCluster; final: EmbV3; scatter: EmbV3 }

const EMB_CLUSTER_LABEL: Record<EmbCluster, string> = {
  animal: 'Animals',
  place: 'Places',
  royal: 'Royalty',
}

const EMB_CLUSTER_CENTER: Record<EmbCluster, EmbV3 & { r: number }> = {
  animal: { x: -80, y: -30, z: -30, r: 42 },
  place: { x: 80, y: -40, z: 40, r: 46 },
  royal: { x: 0, y: 60, z: -10, r: 38 },
}

const EMB_TOKENS: EmbToken[] = [
  // Animals
  { id: 'dog', label: 'dog', cluster: 'animal', final: { x: -95, y: -40, z: -45 }, scatter: { x: 70, y: 60, z: 30 } },
  { id: 'puppy', label: 'puppy', cluster: 'animal', final: { x: -60, y: -20, z: -10 }, scatter: { x: -40, y: 70, z: -30 } },
  { id: 'cat', label: 'cat', cluster: 'animal', final: { x: -85, y: -5, z: -50 }, scatter: { x: 90, y: -60, z: 20 } },
  { id: 'kitten', label: 'kitten', cluster: 'animal', final: { x: -105, y: -20, z: -10 }, scatter: { x: 60, y: -20, z: 40 } },
  { id: 'wolf', label: 'wolf', cluster: 'animal', final: { x: -55, y: -55, z: -35 }, scatter: { x: 20, y: 80, z: 30 } },
  { id: 'puppy-pal', label: 'hound', cluster: 'animal', final: { x: -75, y: -65, z: -15 }, scatter: { x: 110, y: 10, z: -30 } },

  // Places
  { id: 'paris', label: 'Paris', cluster: 'place', final: { x: 70, y: -55, z: 25 }, scatter: { x: -80, y: -40, z: -20 } },
  { id: 'france', label: 'France', cluster: 'place', final: { x: 95, y: -35, z: 50 }, scatter: { x: 20, y: -70, z: 40 } },
  { id: 'rome', label: 'Rome', cluster: 'place', final: { x: 72, y: -20, z: 55 }, scatter: { x: -90, y: 30, z: 10 } },
  { id: 'italy', label: 'Italy', cluster: 'place', final: { x: 100, y: -8, z: 30 }, scatter: { x: -30, y: 80, z: -40 } },
  { id: 'tokyo', label: 'Tokyo', cluster: 'place', final: { x: 58, y: -55, z: 60 }, scatter: { x: -100, y: -20, z: 50 } },
  { id: 'japan', label: 'Japan', cluster: 'place', final: { x: 105, y: -45, z: 15 }, scatter: { x: -70, y: 60, z: 20 } },

  // Royalty
  { id: 'king', label: 'king', cluster: 'royal', final: { x: -22, y: 55, z: -5 }, scatter: { x: 100, y: 10, z: 60 } },
  { id: 'queen', label: 'queen', cluster: 'royal', final: { x: 28, y: 70, z: -15 }, scatter: { x: 50, y: 20, z: -40 } },
  { id: 'prince', label: 'prince', cluster: 'royal', final: { x: -8, y: 45, z: 18 }, scatter: { x: -110, y: -30, z: 20 } },
  { id: 'throne', label: 'throne', cluster: 'royal', final: { x: 18, y: 82, z: 8 }, scatter: { x: 70, y: -50, z: -25 } },
]

// Pre-resolve token references at module load so the rAF loop never has to
// do `.find()` lookups while the scene is animating. With ~36 pairs and
// ~30fps that's ~1,000 string compares per second saved, on a hot path.
const EMB_RELATIONS: [EmbToken, EmbToken][] = (() => {
  const byCluster: Record<EmbCluster, EmbToken[]> = { animal: [], place: [], royal: [] }
  for (const t of EMB_TOKENS) byCluster[t.cluster].push(t)
  const pairs: [EmbToken, EmbToken][] = []
  for (const c of Object.keys(byCluster) as EmbCluster[]) {
    const tokens = byCluster[c]
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        pairs.push([tokens[i], tokens[j]])
      }
    }
  }
  return pairs
})()

const EMB_AXIS_ENDS: { key: string; a: EmbV3; b: EmbV3 }[] = [
  { key: 'x', a: { x: -120, y: 0, z: 0 }, b: { x: 120, y: 0, z: 0 } },
  { key: 'z', a: { x: 0, y: 0, z: -120 }, b: { x: 0, y: 0, z: 120 } },
]

// View dimensions (the "viewBox" of our drawing). All draw coords are in this
// space; the canvas's actual pixel size is scaled to match the displayed CSS
// size × DPR, so output is crisp at any width.
const EMB_W = 340
const EMB_H = 240
const EMB_CX = EMB_W / 2
const EMB_CY = EMB_H / 2
const EMB_FOCAL = 260
const EMB_PITCH = 0.22
const EMB_COS_P = Math.cos(EMB_PITCH)
const EMB_SIN_P = Math.sin(EMB_PITCH)
const EMB_ROTATION_PERIOD_S = 26

// Phase timing (ms since mount). Mirrors the original CSS-transition feel.
const EMB_T_TOK_START = 200
const EMB_T_TOK_DUR = 1100
const EMB_T_AURA_START = 1500
const EMB_T_AURA_DUR = 700
const EMB_T_LINE_START = 2100
const EMB_T_LINE_DUR = 700

function EmbeddingFieldAnimation({ color, paused = false }: { color: string; paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Live ref to the `paused` prop so the rAF loop reads it without forcing
  // the entire setup effect to re-run (which would tear down the
  // IntersectionObserver and visibility listener every popup open/close).
  const pausedRef = useRef(paused)
  const ctrlRef = useRef<{ start: () => void; stop: () => void } | null>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const ctxEl = canvasEl.getContext('2d')
    if (!ctxEl) return
    // Re-bind with non-null types so nested function declarations (resize,
    // draw, start, stop) don't lose the null narrowing. TS's control-flow
    // analysis doesn't always carry through closure boundaries.
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = ctxEl

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Cap DPR at 2 — 3x retina would force 9x more pixels rendered for no
    // perceptible gain on this kind of vector content. Big battery win on
    // newer iPhones.
    const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
    let displayW = EMB_W
    let displayH = EMB_H

    function resize() {
      const rect = canvas.getBoundingClientRect()
      displayW = Math.max(1, rect.width)
      displayH = displayW * (EMB_H / EMB_W)
      const pixelW = Math.round(displayW * dpr)
      const pixelH = Math.round(displayH * dpr)
      if (canvas.width !== pixelW) canvas.width = pixelW
      if (canvas.height !== pixelH) canvas.height = pixelH
    }
    resize()

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(canvas)
    }

    // Pre-compute hex → "r,g,b" once; building rgba() strings per frame is
    // cheaper than re-parsing the hex 700+ times per second.
    const hex = color.replace('#', '')
    const cR = parseInt(hex.slice(0, 2), 16)
    const cG = parseInt(hex.slice(2, 4), 16)
    const cB = parseInt(hex.slice(4, 6), 16)
    const colorRgb = `${cR},${cG},${cB}`

    let rafId = 0
    let onScreen = true
    let pageVisible = typeof document === 'undefined' ? true : !document.hidden
    const startTime = performance.now()

    function projectXYZ(x: number, y: number, z: number, cosY: number, sinY: number) {
      const x1 = x * cosY + z * sinY
      const z1 = -x * sinY + z * cosY
      const y2 = y * EMB_COS_P - z1 * EMB_SIN_P
      const z2 = y * EMB_SIN_P + z1 * EMB_COS_P
      const s = EMB_FOCAL / (EMB_FOCAL + z2)
      return { x: EMB_CX + x1 * s, y: EMB_CY + y2 * s, s }
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }
    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3)
    }
    function clamp01(v: number) {
      return v < 0 ? 0 : v > 1 ? 1 : v
    }

    function draw(now: number) {
      const elapsedMs = now - startTime
      const yaw = reduced ? -0.55 : ((elapsedMs / 1000) * Math.PI * 2) / EMB_ROTATION_PERIOD_S
      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)

      // Time-derived phase alphas (replaces the React phase state and the
      // SVG/CSS opacity transitions of the previous implementation).
      const tokT =
        elapsedMs <= EMB_T_TOK_START
          ? 0
          : easeOut(clamp01((elapsedMs - EMB_T_TOK_START) / EMB_T_TOK_DUR))
      const auraAlpha = clamp01((elapsedMs - EMB_T_AURA_START) / EMB_T_AURA_DUR)
      const lineAlpha = 0.22 * clamp01((elapsedMs - EMB_T_LINE_START) / EMB_T_LINE_DUR)

      // Each frame: scale the drawing space (EMB_W × EMB_H) onto the actual
      // pixel canvas. This is the canvas equivalent of an SVG viewBox.
      const k = (displayW * dpr) / EMB_W
      ctx.setTransform(k, 0, 0, k, 0, 0)
      ctx.clearRect(0, 0, EMB_W, EMB_H)

      // ── Cluster auras + axes (fade in around the time the tokens land) ──
      if (auraAlpha > 0.01) {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        for (const ck of Object.keys(EMB_CLUSTER_CENTER) as EmbCluster[]) {
          const c = EMB_CLUSTER_CENTER[ck]
          const p = projectXYZ(c.x, c.y, c.z, cosY, sinY)
          const rd = Math.max(12, c.r * p.s)

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rd)
          grad.addColorStop(0, `rgba(${colorRgb},${0.22 * auraAlpha})`)
          grad.addColorStop(0.7, `rgba(${colorRgb},${0.05 * auraAlpha})`)
          grad.addColorStop(1, `rgba(${colorRgb},0)`)
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(p.x, p.y, rd, 0, Math.PI * 2)
          ctx.fill()

          ctx.font = `600 ${9 * Math.max(0.8, p.s)}px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`
          ctx.fillStyle = `rgba(128,128,128,${auraAlpha})`
          ctx.fillText(EMB_CLUSTER_LABEL[ck].toUpperCase(), p.x, p.y - rd - 4)
        }

        // Axes — soft white gradient, gives a sense of rotation.
        ctx.lineWidth = 0.8
        for (let i = 0; i < EMB_AXIS_ENDS.length; i++) {
          const ax = EMB_AXIS_ENDS[i]
          const pa = projectXYZ(ax.a.x, ax.a.y, ax.a.z, cosY, sinY)
          const pb = projectXYZ(ax.b.x, ax.b.y, ax.b.z, cosY, sinY)
          const ag = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y)
          ag.addColorStop(0, 'rgba(255,255,255,0)')
          ag.addColorStop(0.5, `rgba(255,255,255,${0.12 * auraAlpha})`)
          ag.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.strokeStyle = ag
          ctx.beginPath()
          ctx.moveTo(pa.x, pa.y)
          ctx.lineTo(pb.x, pb.y)
          ctx.stroke()
        }
      }

      // ── Intra-cluster relation lines (single batched stroke) ────────────
      // 36 lines collapse into one beginPath/stroke pair — this was the
      // single most expensive thing in the SVG version (36 elements, each
      // with 4 setAttribute calls per frame).
      if (lineAlpha > 0.005) {
        ctx.strokeStyle = `rgba(${colorRgb},${lineAlpha})`
        ctx.lineWidth = 0.7
        ctx.lineCap = 'round'
        ctx.setLineDash([1.5, 2.5])
        ctx.beginPath()
        for (let i = 0; i < EMB_RELATIONS.length; i++) {
          const [a, b] = EMB_RELATIONS[i]
          const pa = projectXYZ(
            lerp(a.scatter.x, a.final.x, tokT),
            lerp(a.scatter.y, a.final.y, tokT),
            lerp(a.scatter.z, a.final.z, tokT),
            cosY,
            sinY,
          )
          const pb = projectXYZ(
            lerp(b.scatter.x, b.final.x, tokT),
            lerp(b.scatter.y, b.final.y, tokT),
            lerp(b.scatter.z, b.final.z, tokT),
            cosY,
            sinY,
          )
          ctx.moveTo(pa.x, pa.y)
          ctx.lineTo(pb.x, pb.y)
        }
        ctx.stroke()
        ctx.setLineDash([])
      }

      // ── Tokens (dot + label) ────────────────────────────────────────────
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
      for (let i = 0; i < EMB_TOKENS.length; i++) {
        const tok = EMB_TOKENS[i]
        const p = projectXYZ(
          lerp(tok.scatter.x, tok.final.x, tokT),
          lerp(tok.scatter.y, tok.final.y, tokT),
          lerp(tok.scatter.z, tok.final.z, tokT),
          cosY,
          sinY,
        )
        const radius = Math.max(1.6, 3 * p.s)
        const fontSize = Math.max(8.5, 10 * p.s)
        const depthAlpha = Math.max(0.45, Math.min(1, p.s * 1.05))

        ctx.fillStyle = `rgba(${colorRgb},${depthAlpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = `500 ${fontSize}px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`
        ctx.fillStyle = `rgba(229,229,229,${depthAlpha})`
        ctx.fillText(tok.label, p.x + radius + 4, p.y + 3)
      }

      if (reduced) return
      if (onScreen && pageVisible && !pausedRef.current) {
        rafId = requestAnimationFrame(draw)
      }
    }

    function start() {
      cancelAnimationFrame(rafId)
      // Always render at least one frame so the canvas is never blank, even
      // if we're starting in a paused state (e.g. user already had a popup
      // open before the canvas mounted).
      draw(performance.now())
      if (reduced || pausedRef.current || !onScreen || !pageVisible) return
      rafId = requestAnimationFrame(draw)
    }

    function stop() {
      cancelAnimationFrame(rafId)
    }

    ctrlRef.current = { start, stop }

    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const wasOn = onScreen
            onScreen = e.isIntersecting
            if (!wasOn && onScreen) start()
            else if (!onScreen) stop()
          }
        },
        { threshold: 0.05 },
      )
      observer.observe(canvas)
    }

    function onVisibility() {
      const wasVisible = pageVisible
      pageVisible = !document.hidden
      if (!wasVisible && pageVisible) start()
      else if (!pageVisible) stop()
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility)
    }

    start()

    return () => {
      cancelAnimationFrame(rafId)
      ctrlRef.current = null
      if (observer) observer.disconnect()
      if (resizeObserver) resizeObserver.disconnect()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility)
      }
    }
  }, [color])

  // React to popup open/close without rebuilding the rAF loop.
  useEffect(() => {
    pausedRef.current = paused
    if (paused) ctrlRef.current?.stop()
    else ctrlRef.current?.start()
  }, [paused])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[13px] font-semibold tracking-tight text-[#f5f5f5]">Embedding Space</span>
      </div>
      <canvas
        ref={canvasRef}
        className="block w-full mx-auto"
        style={{ aspectRatio: `${EMB_W} / ${EMB_H}`, maxWidth: EMB_W }}
      />
    </div>
  )
}
