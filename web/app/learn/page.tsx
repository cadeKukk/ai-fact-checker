import { Suspense } from 'react'
import LearnCourse from '@/components/routes/LearnCourse'

export default function LearnPage() {
  return (
    <Suspense fallback={null}>
      <LearnCourse />
    </Suspense>
  )
}
