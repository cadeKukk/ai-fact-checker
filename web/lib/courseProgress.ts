export interface CourseProgress {
  /** Lesson index the user was last on. */
  current: number
  /** Furthest lesson index the user has reached. */
  max: number
  /** True once the user has finished the final lesson. */
  completed: boolean
}

/** Storage key for the intro course (AI Fundamentals). */
export const INTRO_COURSE_KEY = 'aifc-course-progress'
/** Storage key for the advanced course (AI in Depth). */
export const ADVANCED_COURSE_KEY = 'aifc-advanced-progress'

export function loadProgress(key: string = INTRO_COURSE_KEY): CourseProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
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

export function saveProgress(
  update: Partial<CourseProgress> & { current: number },
  key: string = INTRO_COURSE_KEY,
) {
  if (typeof window === 'undefined') return
  const prev = loadProgress(key)
  const next: CourseProgress = {
    current: update.current,
    max: Math.max(update.current, update.max ?? 0, prev?.max ?? 0),
    completed: update.completed ?? prev?.completed ?? false,
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(next))
  } catch {
    // storage full or blocked — progress just won't persist
  }
}
