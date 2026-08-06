import { Suspense } from 'react'
import FactCheckRoute from '@/components/routes/FactCheckRoute'

export default function FactCheckPage() {
  return (
    <Suspense fallback={null}>
      <FactCheckRoute />
    </Suspense>
  )
}
