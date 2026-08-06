'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X, Flame, Zap, Check, RotateCcw, ArrowRight, Trophy, Target } from 'lucide-react'
import TermVisual, { PLAYABLE_TERM_IDS, TERM_VISUAL_KEYFRAMES, getPlayableTerm } from './TermVisuals'
import { termCategoryColor, termCategoryLabel, type AITerm } from '@/data/types'
import { recordPracticeRound } from '@/lib/practiceStats'

const SPRING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

const MCQ_COUNT = 8
const MATCH_PAIRS = 4
const TOTAL_STEPS = MCQ_COUNT + 1

const GAME_KEYFRAMES = `
@keyframes pgShake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(4px) } }
@keyframes pgPop { 0% { transform: scale(.92) } 55% { transform: scale(1.04) } 100% { transform: scale(1) } }
@keyframes pgRise { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } }
@keyframes pgConfetti { 0% { opacity: 1; transform: translateY(0) rotate(0deg) } 100% { opacity: 0; transform: translateY(78vh) rotate(var(--rot, 540deg)) } }
@keyframes pgXpFloat { 0% { opacity: 0; transform: translateY(4px) scale(.8) } 25% { opacity: 1; transform: translateY(-6px) scale(1.1) } 100% { opacity: 0; transform: translateY(-26px) scale(1) } }
`

/* ----------------------------------------------------------- helpers */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface McqQuestion {
  /** 'pickTerm': show the visual, choose the term. 'pickVisual': show the term, choose the visual. */
  mode: 'pickTerm' | 'pickVisual'
  answer: AITerm
  options: AITerm[] // 4 options including the answer, shuffled
}

interface Session {
  mcqs: McqQuestion[]
  matchTerms: AITerm[]
}

/** Prefer same-category distractors so questions actually teach distinctions. */
function pickDistractors(answer: AITerm, pool: AITerm[], n: number): AITerm[] {
  const sameCat = shuffle(pool.filter((t) => t.id !== answer.id && t.category === answer.category))
  const others = shuffle(pool.filter((t) => t.id !== answer.id && t.category !== answer.category))
  return [...sameCat.slice(0, Math.min(2, n)), ...others].slice(0, n)
}

function buildSession(): Session {
  const pool = PLAYABLE_TERM_IDS.map((id) => getPlayableTerm(id)!).filter(Boolean)
  const drawn = shuffle(pool)
  const mcqTerms = drawn.slice(0, MCQ_COUNT)
  const matchTerms = drawn.slice(MCQ_COUNT, MCQ_COUNT + MATCH_PAIRS)
  const mcqs: McqQuestion[] = mcqTerms.map((answer, i) => ({
    mode: i % 2 === 0 ? 'pickTerm' : 'pickVisual',
    answer,
    options: shuffle([answer, ...pickDistractors(answer, pool, 3)]),
  }))
  return { mcqs, matchTerms }
}

const XP_CORRECT = 10
const XP_STREAK_BONUS = 5 // extra per correct answer while streak >= 3
const XP_MATCH_PAIR = 5

/* ----------------------------------------------------------- component */

interface PracticeGameProps {
  onExit: () => void
}

export default function PracticeGame({ onExit }: PracticeGameProps) {
  const [session, setSession] = useState<Session>(() => buildSession())
  const [step, setStep] = useState(0) // 0..MCQ_COUNT-1 are MCQs, MCQ_COUNT is the match round
  const [phase, setPhase] = useState<'playing' | 'done'>('playing')
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [missedIds, setMissedIds] = useState<string[]>([])
  // MCQ answer state
  const [picked, setPicked] = useState<string | null>(null)
  const [xpBurst, setXpBurst] = useState<number | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current) }, [])

  const isMatchRound = step === MCQ_COUNT
  const question = !isMatchRound ? session.mcqs[step] : null

  const recorded = useRef(false)
  useEffect(() => {
    if (phase === 'done' && !recorded.current) {
      recorded.current = true
      recordPracticeRound(xp, bestStreak)
    }
  }, [phase, xp, bestStreak])

  const advance = useCallback(() => {
    setPicked(null)
    setXpBurst(null)
    if (step < MCQ_COUNT) setStep((s) => s + 1)
  }, [step])

  const handlePick = useCallback((termId: string) => {
    if (picked !== null || !question) return
    setPicked(termId)
    const correct = termId === question.answer.id
    if (correct) {
      const bonus = streak + 1 >= 3 ? XP_STREAK_BONUS : 0
      setXp((v) => v + XP_CORRECT + bonus)
      setXpBurst(XP_CORRECT + bonus)
      setCorrectCount((v) => v + 1)
      setStreak((s) => {
        const next = s + 1
        setBestStreak((b) => Math.max(b, next))
        return next
      })
    } else {
      setStreak(0)
      setMissedIds((m) => (m.includes(question.answer.id) ? m : [...m, question.answer.id]))
    }
    advanceTimer.current = setTimeout(advance, correct ? 950 : 1800)
  }, [picked, question, streak, advance])

  const restart = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    recorded.current = false
    setSession(buildSession())
    setStep(0)
    setPhase('playing')
    setXp(0)
    setStreak(0)
    setBestStreak(0)
    setCorrectCount(0)
    setMissedIds([])
    setPicked(null)
    setXpBurst(null)
  }, [])

  const totalAnswerable = MCQ_COUNT + MATCH_PAIRS
  const progress = Math.min(step / TOTAL_STEPS, 1)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a] overflow-y-auto">
      <style>{TERM_VISUAL_KEYFRAMES + GAME_KEYFRAMES}</style>

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 sm:px-6 pt-5 pb-4 max-w-2xl w-full mx-auto flex-shrink-0">
        <button
          onClick={onExit}
          aria-label="Exit practice"
          className="w-8 h-8 rounded-full bg-[#161618] flex items-center justify-center text-[#b3b2b8] hover:text-[#f5f5f5] flex-shrink-0"
          style={{ transition: `color 300ms ${SPRING}` }}
        >
          <X size={14} />
        </button>
        <div className="flex-1 h-3 rounded-full bg-[#161618] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#7065f0]"
            style={{ width: `${Math.max(progress * 100, 4)}%`, transition: `width 500ms ${SPRING}` }}
          />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-bold flex-shrink-0 ${streak >= 3 ? 'text-orange-400' : 'text-[#8a8990]'}`}
          style={streak >= 3 ? { animation: 'pgPop .4s ' + BOUNCE } : undefined}
          key={`streak-${streak}`}
        >
          <Flame size={15} className={streak >= 3 ? 'text-orange-400' : 'text-[#5c5b63]'} />
          {streak}
        </div>
        <div className="relative flex items-center gap-1 text-sm font-bold text-[#eab308] flex-shrink-0 w-16 justify-end">
          <Zap size={14} />
          {xp} XP
          {xpBurst !== null && (
            <span
              key={`burst-${step}`}
              className="absolute -top-1 right-0 text-xs font-extrabold text-green-400 pointer-events-none"
              style={{ animation: 'pgXpFloat 1s ease-out forwards' }}
            >
              +{xpBurst}
            </span>
          )}
        </div>
      </div>

      {phase === 'done' ? (
        <EndScreen
          xp={xp}
          bestStreak={bestStreak}
          correct={correctCount}
          total={totalAnswerable}
          missedIds={missedIds}
          onRestart={restart}
          onExit={onExit}
        />
      ) : isMatchRound ? (
        <MatchRound
          key={`match-${session.matchTerms.map((t) => t.id).join()}`}
          terms={session.matchTerms}
          onPair={(ok) => {
            if (ok) {
              setXp((v) => v + XP_MATCH_PAIR)
              setCorrectCount((v) => v + 1)
              setStreak((s) => { const n = s + 1; setBestStreak((b) => Math.max(b, n)); return n })
            } else {
              setStreak(0)
            }
          }}
          onMissed={(id) => setMissedIds((m) => (m.includes(id) ? m : [...m, id]))}
          onComplete={() => setTimeout(() => setPhase('done'), 700)}
        />
      ) : question ? (
        <McqScreen key={step} question={question} picked={picked} onPick={handlePick} />
      ) : null}
    </div>
  )
}

/* ----------------------------------------------------------- MCQ screen */

function McqScreen({
  question,
  picked,
  onPick,
}: {
  question: McqQuestion
  picked: string | null
  onPick: (id: string) => void
}) {
  const { mode, answer, options } = question
  const accent = termCategoryColor[answer.category]

  const optionState = (id: string): 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim' => {
    if (picked === null) return 'idle'
    if (id === answer.id) return picked === id ? 'correct' : 'reveal'
    if (id === picked) return 'wrong'
    return 'dim'
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 sm:px-6 pb-10 max-w-2xl w-full mx-auto" style={{ animation: `pgRise .35s ${SPRING}` }}>
      {mode === 'pickTerm' ? (
        <>
          <p className="text-[11px] font-bold tracking-[1.5px] text-[#7065f0] mt-2 mb-1">WHAT DOES THIS SHOW?</p>
          <p className="text-sm text-[#8a8990] mb-5">Watch the animation, then pick the matching term</p>
          <div
            className="w-full max-w-[420px] rounded-2xl border p-4 mb-7"
            style={{
              background: 'linear-gradient(160deg, #161618 0%, #101013 100%)',
              borderColor: `${accent}44`,
              boxShadow: `0 0 60px ${accent}14`,
            }}
          >
            <TermVisual termId={answer.id} className="w-full h-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {options.map((opt) => {
              const st = optionState(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => onPick(opt.id)}
                  disabled={picked !== null}
                  className="rounded-xl border px-4 py-4 text-left font-semibold text-[15px]"
                  style={{
                    transition: `all 250ms ${SPRING}`,
                    background: st === 'correct' || st === 'reveal' ? 'rgba(34,197,94,.12)' : st === 'wrong' ? 'rgba(239,68,68,.12)' : '#161618',
                    borderColor: st === 'correct' || st === 'reveal' ? '#22c55e' : st === 'wrong' ? '#ef4444' : 'rgba(255,255,255,.08)',
                    color: st === 'dim' ? '#5c5b63' : '#f5f5f5',
                    animation: st === 'wrong' ? 'pgShake .4s ease' : st === 'correct' ? `pgPop .4s ${BOUNCE}` : undefined,
                  }}
                >
                  <span className="flex items-center justify-between gap-2">
                    {opt.term}
                    {(st === 'correct' || st === 'reveal') && <Check size={16} className="text-green-400 flex-shrink-0" />}
                    {st === 'wrong' && <X size={16} className="text-red-400 flex-shrink-0" />}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <p className="text-[11px] font-bold tracking-[1.5px] text-[#7065f0] mt-2 mb-3">PICK THE MATCHING VISUAL</p>
          <div className="w-full rounded-xl bg-[#161618] border border-white/[0.08] px-5 py-4 mb-6 text-center">
            <span
              className="inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md mb-1.5"
              style={{ color: accent, backgroundColor: `${accent}1f` }}
            >
              {termCategoryLabel[answer.category]}
            </span>
            <h2 className="text-xl font-bold text-[#f5f5f5]">{answer.term}</h2>
            <p className="text-[13px] text-[#8a8990] mt-1 leading-relaxed">{answer.shortDefinition}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {options.map((opt) => {
              const st = optionState(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => onPick(opt.id)}
                  disabled={picked !== null}
                  className="rounded-2xl border p-3"
                  style={{
                    transition: `all 250ms ${SPRING}`,
                    background: st === 'correct' || st === 'reveal' ? 'rgba(34,197,94,.1)' : st === 'wrong' ? 'rgba(239,68,68,.1)' : 'linear-gradient(160deg, #161618 0%, #101013 100%)',
                    borderColor: st === 'correct' || st === 'reveal' ? '#22c55e' : st === 'wrong' ? '#ef4444' : 'rgba(255,255,255,.08)',
                    opacity: st === 'dim' ? 0.4 : 1,
                    animation: st === 'wrong' ? 'pgShake .4s ease' : st === 'correct' ? `pgPop .4s ${BOUNCE}` : undefined,
                  }}
                >
                  <TermVisual termId={opt.id} className="w-full h-auto" />
                </button>
              )
            })}
          </div>
        </>
      )}
      {picked !== null && picked !== answer.id && (
        <p className="mt-5 text-sm text-[#b3b2b8]" style={{ animation: `pgRise .3s ${SPRING}` }}>
          It was <span className="font-bold" style={{ color: accent }}>{answer.term}</span> — {answer.shortDefinition}
        </p>
      )}
    </div>
  )
}

/* ----------------------------------------------------------- match round */

function MatchRound({
  terms,
  onPair,
  onMissed,
  onComplete,
}: {
  terms: AITerm[]
  onPair: (correct: boolean) => void
  onMissed: (termId: string) => void
  onComplete: () => void
}) {
  const leftOrder = useMemo(() => shuffle(terms), [terms])
  const rightOrder = useMemo(() => shuffle(terms), [terms])
  const [selLeft, setSelLeft] = useState<string | null>(null)
  const [selRight, setSelRight] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null)
  const doneRef = useRef(false)

  // Evaluate whenever both sides are selected.
  useEffect(() => {
    if (!selLeft || !selRight) return
    if (selLeft === selRight) {
      onPair(true)
      setMatched((m) => {
        const next = new Set(m)
        next.add(selLeft)
        return next
      })
      setSelLeft(null)
      setSelRight(null)
    } else {
      onPair(false)
      onMissed(selLeft)
      setWrongPair([selLeft, selRight])
      const t = setTimeout(() => {
        setWrongPair(null)
        setSelLeft(null)
        setSelRight(null)
      }, 600)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selLeft, selRight])

  useEffect(() => {
    if (matched.size === terms.length && !doneRef.current) {
      doneRef.current = true
      onComplete()
    }
  }, [matched, terms.length, onComplete])

  const cardStyle = (id: string, side: 'l' | 'r'): React.CSSProperties => {
    const isMatched = matched.has(id)
    const isSelected = side === 'l' ? selLeft === id : selRight === id
    const isWrong = wrongPair !== null && (side === 'l' ? wrongPair[0] === id : wrongPair[1] === id)
    return {
      transition: `all 250ms ${SPRING}`,
      background: isMatched ? 'rgba(34,197,94,.08)' : isSelected ? 'rgba(112,101,240,.14)' : '#161618',
      borderColor: isMatched ? 'rgba(34,197,94,.5)' : isWrong ? '#ef4444' : isSelected ? '#7065f0' : 'rgba(255,255,255,.08)',
      opacity: isMatched ? 0.55 : 1,
      animation: isWrong ? 'pgShake .4s ease' : isMatched ? `pgPop .4s ${BOUNCE}` : undefined,
      pointerEvents: isMatched ? 'none' : undefined,
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 sm:px-6 pb-10 max-w-2xl w-full mx-auto" style={{ animation: `pgRise .35s ${SPRING}` }}>
      <p className="text-[11px] font-bold tracking-[1.5px] text-[#7065f0] mt-2 mb-1">FINAL ROUND</p>
      <p className="text-sm text-[#8a8990] mb-5">Match each term to its visual</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full">
        <div className="flex flex-col gap-3">
          {leftOrder.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelLeft(t.id)}
              className="rounded-xl border px-3 sm:px-4 text-left font-semibold text-[13px] sm:text-[14px] text-[#f5f5f5] h-[86px] sm:h-[96px]"
              style={cardStyle(t.id, 'l')}
            >
              {t.term}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rightOrder.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelRight(t.id)}
              className="rounded-xl border p-1 h-[86px] sm:h-[96px] flex items-center justify-center"
              style={cardStyle(t.id, 'r')}
            >
              <TermVisual termId={t.id} className="h-full w-auto max-w-full" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- end screen */

const CONFETTI_COLORS = ['#7065f0', '#22c55e', '#eab308', '#06b6d4', '#ec4899', '#f97316']

function EndScreen({
  xp,
  bestStreak,
  correct,
  total,
  missedIds,
  onRestart,
  onExit,
}: {
  xp: number
  bestStreak: number
  correct: number
  total: number
  missedIds: string[]
  onRestart: () => void
  onExit: () => void
}) {
  const accuracy = Math.round((correct / total) * 100)
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 7) * 0.12}s`,
        dur: `${2 + (i % 5) * 0.35}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rot: `${360 + (i % 4) * 180}deg`,
        size: 5 + (i % 3) * 3,
      })),
    [],
  )

  const headline = accuracy === 100 ? 'Perfect round!' : accuracy >= 75 ? 'Nice work!' : accuracy >= 50 ? 'Good effort!' : 'Keep practicing!'

  return (
    <div className="flex-1 flex flex-col items-center px-6 pb-12 max-w-xl w-full mx-auto relative" style={{ animation: `pgRise .4s ${SPRING}` }}>
      {accuracy >= 50 && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden>
          {confetti.map((f, i) => (
            <span
              key={i}
              className="absolute rounded-[2px]"
              style={{
                left: f.left,
                top: -10,
                width: f.size,
                height: f.size,
                backgroundColor: f.color,
                animation: `pgConfetti ${f.dur} ease-in ${f.delay} forwards`,
                ['--rot' as never]: f.rot,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mt-6 mb-4"
        style={{ background: 'rgba(112,101,240,.15)', border: '1.5px solid rgba(112,101,240,.5)', animation: `pgPop .5s ${BOUNCE}` }}
      >
        <Trophy size={34} className="text-[#9fa3fc]" />
      </div>
      <h1 className="text-2xl font-bold text-[#f5f5f5] mb-1">{headline}</h1>
      <p className="text-sm text-[#8a8990] mb-7">Round complete — here's how it went</p>

      <div className="grid grid-cols-3 gap-3 w-full mb-7">
        {[
          { icon: Zap, label: 'XP earned', value: `+${xp}`, color: '#eab308' },
          { icon: Target, label: 'Accuracy', value: `${accuracy}%`, color: '#22c55e' },
          { icon: Flame, label: 'Best streak', value: String(bestStreak), color: '#f97316' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl bg-[#161618] border border-white/[0.08] px-3 py-4 text-center">
            <Icon size={16} className="mx-auto mb-1.5" style={{ color }} />
            <p className="text-xl font-bold text-[#f5f5f5]">{value}</p>
            <p className="text-[11px] text-[#8a8990] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {missedIds.length > 0 && (
        <div className="w-full mb-7">
          <p className="text-[11px] font-bold tracking-[1.5px] text-[#8a8990] mb-2.5">WORTH ANOTHER LOOK</p>
          <div className="flex flex-wrap gap-2">
            {missedIds.map((id) => {
              const t = getPlayableTerm(id)
              if (!t) return null
              const c = termCategoryColor[t.category]
              return (
                <span key={id} className="text-[12px] font-semibold px-2.5 py-1 rounded-md" style={{ color: c, backgroundColor: `${c}1a` }}>
                  {t.term}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full mt-auto sm:mt-2">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] bg-[#7065f0] text-white font-semibold text-[15px] active:scale-[0.97]"
          style={{ transition: `all 250ms ${SPRING}` }}
        >
          <RotateCcw size={15} />
          Play again
        </button>
        <button
          onClick={onExit}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] bg-[#161618] border border-white/10 text-[#b3b2b8] font-semibold text-[15px] hover:bg-[#1b1b1e] active:scale-[0.97]"
          style={{ transition: `all 250ms ${SPRING}` }}
        >
          Back to Learn
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
