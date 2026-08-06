'use client'

import { useSearchParams } from 'next/navigation'
import SourcesView from '@/components/SourcesView'

export default function SourcesRoute() {
  const searchParams = useSearchParams()
  return <SourcesView initialQuery={searchParams.get('q') ?? ''} />
}
