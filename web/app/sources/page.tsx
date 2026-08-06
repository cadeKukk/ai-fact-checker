import { Suspense } from 'react'
import SourcesRoute from '@/components/routes/SourcesRoute'

export default function SourcesPage() {
  return (
    <Suspense fallback={null}>
      <SourcesRoute />
    </Suspense>
  )
}
