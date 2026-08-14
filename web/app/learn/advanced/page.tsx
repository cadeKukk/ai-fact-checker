import { Suspense } from 'react'
import type { Metadata } from 'next'
import AdvancedCourse from '@/components/routes/AdvancedCourse'

export const metadata: Metadata = {
  title: 'AI in Depth — AI Fact Checker',
  description:
    'The advanced course: transformers, training pipelines, reasoning, agents, benchmark literacy, AI security, and the open-weight ecosystem.',
}

export default function AdvancedCoursePage() {
  return (
    <Suspense fallback={null}>
      <AdvancedCourse />
    </Suspense>
  )
}
