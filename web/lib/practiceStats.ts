export interface PracticeStats {
  /** Lifetime XP earned across all practice rounds. */
  xp: number
  /** Number of completed practice rounds. */
  rounds: number
  /** Best answer streak ever reached. */
  bestStreak: number
}

const KEY = 'aifc-practice-stats'

export function loadPracticeStats(): PracticeStats | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<PracticeStats>
    if (typeof p.xp !== 'number') return null
    return { xp: p.xp, rounds: p.rounds ?? 0, bestStreak: p.bestStreak ?? 0 }
  } catch {
    return null
  }
}

export function recordPracticeRound(earnedXp: number, streak: number) {
  if (typeof window === 'undefined') return
  const prev = loadPracticeStats()
  const next: PracticeStats = {
    xp: (prev?.xp ?? 0) + earnedXp,
    rounds: (prev?.rounds ?? 0) + 1,
    bestStreak: Math.max(prev?.bestStreak ?? 0, streak),
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage blocked — stats just won't persist
  }
}
