'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Flame, Check, RotateCcw, ArrowRight, Award, Target, BarChart3 } from 'lucide-react'
import TermVisual, { PLAYABLE_TERM_IDS, TERM_VISUAL_KEYFRAMES, getPlayableTerm } from './TermVisuals'
import { termCategoryColor, termCategoryLabel, type AITerm } from '@/data/types'
import { recordPracticeRound } from '@/lib/practiceStats'

const SPRING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

const QUESTION_COUNT = 10

const GAME_KEYFRAMES = `
@keyframes pgShake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(4px) } }
@keyframes pgPop { 0% { transform: scale(.92) } 55% { transform: scale(1.04) } 100% { transform: scale(1) } }
@keyframes pgRise { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } }
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

interface QuizQuestion {
  /**
   * 'whichTerm': the question shows a definition (illustrated by the concept's
   * visual) and asks which term it describes.
   * 'whatMeans': the question shows a term (illustrated by its visual) and
   * asks which definition is correct.
   */
  mode: 'whichTerm' | 'whatMeans'
  answer: AITerm
  options: AITerm[] // 4 options including the answer, shuffled
}

/** Prefer same-category distractors so questions test real distinctions. */
function pickDistractors(answer: AITerm, pool: AITerm[], n: number): AITerm[] {
  const sameCat = shuffle(pool.filter((t) => t.id !== answer.id && t.category === answer.category))
  const others = shuffle(pool.filter((t) => t.id !== answer.id && t.category !== answer.category))
  return [...sameCat.slice(0, Math.min(2, n)), ...others].slice(0, n)
}

function buildQuiz(): QuizQuestion[] {
  const pool = PLAYABLE_TERM_IDS.map((id) => getPlayableTerm(id)!).filter(Boolean)
  const drawn = shuffle(pool).slice(0, QUESTION_COUNT)
  return drawn.map((answer, i) => ({
    mode: i % 2 === 0 ? 'whichTerm' : 'whatMeans',
    answer,
    options: shuffle([answer, ...pickDistractors(answer, pool, 3)]),
  }))
}

const PTS_CORRECT = 10
const PTS_STREAK_BONUS = 5 // extra per correct answer while streak >= 3

/* ----------------------------------------------------------- component */

interface PracticeGameProps {
  onExit: () => void
}

export default function PracticeGame({ onExit }: PracticeGameProps) {
  const [quiz, setQuiz] = useState<QuizQuestion[]>(() => buildQuiz())
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'done'>('playing')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [missedIds, setMissedIds] = useState<string[]>([])
  const [picked, setPicked] = useState<string | null>(null)

  const question = quiz[index]

  const recorded = useRef(false)
  useEffect(() => {
    if (phase === 'done' && !recorded.current) {
      recorded.current = true
      recordPracticeRound(score, bestStreak)
    }
  }, [phase, score, bestStreak])

  const handlePick = useCallback(
    (termId: string) => {
      if (picked !== null) return
      setPicked(termId)
      if (termId === question.answer.id) {
        const bonus = streak + 1 >= 3 ? PTS_STREAK_BONUS : 0
        setScore((v) => v + PTS_CORRECT + bonus)
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
    },
    [picked, question, streak],
  )

  const handleContinue = useCallback(() => {
    setPicked(null)
    if (index + 1 >= QUESTION_COUNT) {
      setPhase('done')
    } else {
      setIndex((i) => i + 1)
    }
  }, [index])

  const restart = useCallback(() => {
    recorded.current = false
    setQuiz(buildQuiz())
    setIndex(0)
    setPhase('playing')
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setCorrectCount(0)
    setMissedIds([])
    setPicked(null)
  }, [])

  const progress = phase === 'done' ? 1 : index / QUESTION_COUNT

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a] overflow-y-auto">
      <style>{TERM_VISUAL_KEYFRAMES + GAME_KEYFRAMES}</style>

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 sm:px-6 pt-5 pb-4 max-w-2xl w-full mx-auto flex-shrink-0">
        <button
          onClick={onExit}
          aria-label="Exit quiz"
          className="w-8 h-8 rounded-full bg-[#161618] flex items-center justify-center text-[#b3b2b8] hover:text-[#f5f5f5] flex-shrink-0"
          style={{ transition: `color 300ms ${SPRING}` }}
        >
          <X size={14} />
        </button>
        <div className="flex-1 h-2.5 rounded-full bg-[#161618] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#7065f0]"
            style={{ width: `${Math.max(progress * 100, 3)}%`, transition: `width 500ms ${SPRING}` }}
          />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-bold flex-shrink-0 ${streak >= 3 ? 'text-orange-400' : 'text-[#8a8990]'}`}
          key={`streak-${streak}`}
          style={streak >= 3 ? { animation: 'pgPop .4s ' + BOUNCE } : undefined}
        >
          <Flame size={15} className={streak >= 3 ? 'text-orange-400' : 'text-[#5c5b63]'} />
          {streak}
        </div>
        <div className="text-sm font-bold text-[#f5f5f5] flex-shrink-0 w-16 text-right">
          {score} <span className="text-[#8a8990] font-medium">pts</span>
        </div>
      </div>

      {phase === 'done' ? (
        <ResultsScreen
          score={score}
          bestStreak={bestStreak}
          correct={correctCount}
          total={QUESTION_COUNT}
          missedIds={missedIds}
          onRestart={restart}
          onExit={onExit}
        />
      ) : (
        <QuestionScreen
          key={index}
          index={index}
          question={question}
          picked={picked}
          onPick={handlePick}
          onContinue={handleContinue}
          isLast={index + 1 >= QUESTION_COUNT}
        />
      )}
    </div>
  )
}

/* ----------------------------------------------------------- question */

function QuestionScreen({
  index,
  question,
  picked,
  onPick,
  onContinue,
  isLast,
}: {
  index: number
  question: QuizQuestion
  picked: string | null
  onPick: (id: string) => void
  onContinue: () => void
  isLast: boolean
}) {
  const { mode, answer, options } = question
  const accent = termCategoryColor[answer.category]
  const answered = picked !== null
  const wasCorrect = picked === answer.id

  const optionState = (id: string): 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim' => {
    if (!answered) return 'idle'
    if (id === answer.id) return picked === id ? 'correct' : 'reveal'
    if (id === picked) return 'wrong'
    return 'dim'
  }

  const optionStyle = (st: ReturnType<typeof optionState>): React.CSSProperties => ({
    transition: `all 250ms ${SPRING}`,
    background:
      st === 'correct' || st === 'reveal'
        ? 'rgba(34,197,94,.1)'
        : st === 'wrong'
          ? 'rgba(239,68,68,.1)'
          : '#161618',
    borderColor:
      st === 'correct' || st === 'reveal' ? '#22c55e' : st === 'wrong' ? '#ef4444' : 'rgba(255,255,255,.08)',
    color: st === 'dim' ? '#5c5b63' : '#f5f5f5',
    animation: st === 'wrong' ? 'pgShake .4s ease' : st === 'correct' ? `pgPop .4s ${BOUNCE}` : undefined,
  })

  return (
    <div
      className="flex-1 flex flex-col items-center px-4 sm:px-6 pb-10 max-w-2xl w-full mx-auto"
      style={{ animation: `pgRise .35s ${SPRING}` }}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8990] mt-1 mb-4">
        Question {index + 1} of {QUESTION_COUNT}
      </p>

      {/* Question card: concept illustrated by its visual */}
      <div className="w-full rounded-2xl border border-white/[0.08] bg-[#161618] overflow-hidden mb-5">
        <div className="flex flex-col sm:flex-row items-stretch">
          <div
            className="sm:w-[240px] flex-shrink-0 p-3 flex items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #131316 0%, #0e0e11 100%)' }}
          >
            <TermVisual termId={answer.id} className="w-full max-w-[240px] h-auto" />
          </div>
          <div className="flex-1 p-5 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-white/[0.06]">
            {mode === 'whichTerm' ? (
              <>
                <h2 className="text-[17px] font-semibold text-[#f5f5f5] mb-2">
                  Which term describes this concept?
                </h2>
                <p className="text-[14px] text-[#b3b2b8] leading-relaxed">{answer.shortDefinition}</p>
              </>
            ) : (
              <>
                <h2 className="text-[17px] font-semibold text-[#f5f5f5] mb-1.5">
                  What does <span style={{ color: accent }}>{answer.term}</span> refer to?
                </h2>
                <span
                  className="self-start text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md"
                  style={{ color: accent, backgroundColor: `${accent}1f` }}
                >
                  {termCategoryLabel[answer.category]}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Answer options */}
      {mode === 'whichTerm' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {options.map((opt) => {
            const st = optionState(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => onPick(opt.id)}
                disabled={answered}
                className="rounded-xl border px-4 py-4 text-left font-semibold text-[15px]"
                style={optionStyle(st)}
              >
                <span className="flex items-center justify-between gap-2">
                  {opt.term}
                  {(st === 'correct' || st === 'reveal') && (
                    <Check size={16} className="text-green-400 flex-shrink-0" />
                  )}
                  {st === 'wrong' && <X size={16} className="text-red-400 flex-shrink-0" />}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full">
          {options.map((opt) => {
            const st = optionState(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => onPick(opt.id)}
                disabled={answered}
                className="rounded-xl border px-4 py-3.5 text-left text-[14px] font-medium leading-relaxed"
                style={optionStyle(st)}
              >
                <span className="flex items-start justify-between gap-3">
                  {opt.shortDefinition}
                  {(st === 'correct' || st === 'reveal') && (
                    <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  )}
                  {st === 'wrong' && <X size={16} className="text-red-400 flex-shrink-0 mt-0.5" />}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Explanation + continue */}
      {answered && (
        <div
          className="w-full mt-5 rounded-xl border p-5"
          style={{
            animation: `pgRise .3s ${SPRING}`,
            background: wasCorrect ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.05)',
            borderColor: wasCorrect ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.3)',
          }}
        >
          <p className={`text-[13px] font-bold mb-1.5 ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {wasCorrect ? 'Correct' : `Not quite — the answer is ${answer.term}`}
          </p>
          <p className="text-[14px] text-[#b3b2b8] leading-relaxed">
            <span className="font-semibold" style={{ color: accent }}>
              {answer.term}
            </span>{' '}
            — {answer.shortDefinition}
          </p>
          {answer.example && (
            <p className="text-[13px] text-[#8a8990] leading-relaxed mt-2 whitespace-pre-line border-l-2 pl-3" style={{ borderColor: `${accent}55` }}>
              {answer.example}
            </p>
          )}
          <button
            onClick={onContinue}
            className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-[10px] bg-[#7065f0] hover:bg-[#7d73f2] text-white font-semibold text-[14px] active:scale-[0.97]"
            style={{ transition: `all 250ms ${SPRING}` }}
          >
            {isLast ? 'See results' : 'Continue'}
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------- results */

function ResultsScreen({
  score,
  bestStreak,
  correct,
  total,
  missedIds,
  onRestart,
  onExit,
}: {
  score: number
  bestStreak: number
  correct: number
  total: number
  missedIds: string[]
  onRestart: () => void
  onExit: () => void
}) {
  const accuracy = Math.round((correct / total) * 100)
  const headline =
    accuracy === 100
      ? 'Perfect score'
      : accuracy >= 80
        ? 'Strong result'
        : accuracy >= 50
          ? 'Solid foundation'
          : 'Room to grow'
  const subline =
    accuracy === 100
      ? 'You answered every question correctly.'
      : accuracy >= 80
        ? 'You have a firm grasp of these concepts.'
        : accuracy >= 50
          ? 'A few concepts are worth revisiting below.'
          : 'Review the terms below and try again — repetition is how it sticks.'

  return (
    <div
      className="flex-1 flex flex-col items-center px-6 pb-12 max-w-xl w-full mx-auto"
      style={{ animation: `pgRise .4s ${SPRING}` }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mt-6 mb-4"
        style={{
          background: 'rgba(112,101,240,.15)',
          border: '1.5px solid rgba(112,101,240,.5)',
          animation: `pgPop .5s ${BOUNCE}`,
        }}
      >
        <Award size={34} className="text-[#9fa3fc]" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#f5f5f5] mb-1">{headline}</h1>
      <p className="text-sm text-[#8a8990] mb-7 text-center">{subline}</p>

      <div className="grid grid-cols-3 gap-3 w-full mb-7">
        {[
          { icon: BarChart3, label: 'Score', value: `${score} pts`, color: '#9fa3fc' },
          { icon: Target, label: 'Accuracy', value: `${accuracy}%`, color: '#22c55e' },
          { icon: Flame, label: 'Best streak', value: String(bestStreak), color: '#f97316' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl bg-[#161618] border border-white/[0.08] px-3 py-4 text-center">
            <Icon size={16} className="mx-auto mb-1.5" style={{ color }} />
            <p className="text-lg font-bold text-[#f5f5f5]">{value}</p>
            <p className="text-[11px] text-[#8a8990] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {missedIds.length > 0 && (
        <div className="w-full mb-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8990] mb-2.5">
            Review these terms
          </p>
          <div className="space-y-2">
            {missedIds.map((id) => {
              const t = getPlayableTerm(id)
              if (!t) return null
              const c = termCategoryColor[t.category]
              return (
                <div key={id} className="flex gap-3 items-start rounded-xl bg-[#161618] border border-white/[0.08] p-3.5">
                  <span
                    className="flex-shrink-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md mt-0.5"
                    style={{ color: c, backgroundColor: `${c}1a` }}
                  >
                    {termCategoryLabel[t.category]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#f5f5f5]">{t.term}</p>
                    <p className="text-[12.5px] text-[#8a8990] leading-relaxed mt-0.5">{t.shortDefinition}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full mt-auto sm:mt-2">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] bg-[#7065f0] hover:bg-[#7d73f2] text-white font-semibold text-[15px] active:scale-[0.97]"
          style={{ transition: `all 250ms ${SPRING}` }}
        >
          <RotateCcw size={15} />
          Take another quiz
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
