import { Suspense } from 'react'
import CompareRoute from '@/components/routes/CompareRoute'

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareRoute />
    </Suspense>
  )
}
