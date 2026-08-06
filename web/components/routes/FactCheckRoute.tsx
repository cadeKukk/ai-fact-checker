'use client'

import { useSearchParams } from 'next/navigation'
import FactCheckerView from '@/components/FactCheckerView'

export default function FactCheckRoute() {
  const searchParams = useSearchParams()
  return <FactCheckerView initialQuery={searchParams.get('q') ?? ''} />
}
