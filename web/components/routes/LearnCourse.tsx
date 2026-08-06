'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import GettingStartedView from '@/components/GettingStartedView'

export default function LearnCourse() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonParam = searchParams.get('lesson')
  const parsed = lessonParam !== null ? Number(lessonParam) : NaN
  const initialLesson = Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined

  return <GettingStartedView initialLesson={initialLesson} onClose={() => router.push('/')} />
}
