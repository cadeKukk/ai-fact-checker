'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import GettingStartedView from '@/components/GettingStartedView'
import { advancedLessons } from '@/data/advancedLessons'
import { ADVANCED_COURSE_KEY } from '@/lib/courseProgress'

export default function AdvancedCourse() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonParam = searchParams.get('lesson')
  const parsed = lessonParam !== null ? Number(lessonParam) : NaN
  const initialLesson = Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined

  return (
    <GettingStartedView
      initialLesson={initialLesson}
      courseLessons={advancedLessons}
      progressKey={ADVANCED_COURSE_KEY}
      courseLabel="AI IN DEPTH"
      onClose={() => router.push('/')}
    />
  )
}
