export interface CourseProgress {
  /** Lesson index the user was last on. */
  current: number
  /** Furthest lesson index the user has reached. */
  max: number
  /** True once the user has finished the final lesson. */
  completed: boolean
}

const KEY = 'aifc-course-progress'

export function loadProgress(): CourseProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CourseProgress>
    if (typeof parsed.current !== 'number') return null
    return {
      current: parsed.current,
      max: typeof parsed.max === 'number' ? parsed.max : parsed.current,
      completed: Boolean(parsed.completed),
    }
  } catch {
    return null
  }
}

export function saveProgress(update: Partial<CourseProgress> & { current: number }) {
  if (typeof window === 'undefined') return
  const prev = loadProgress()
  const next: CourseProgress = {
    current: update.current,
    max: Math.max(update.current, update.max ?? 0, prev?.max ?? 0),
    completed: update.completed ?? prev?.completed ?? false,
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage full or blocked — progress just won't persist
  }
}
