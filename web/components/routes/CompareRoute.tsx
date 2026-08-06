'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CompareView, { type CompareNavTarget } from '@/components/CompareView'
import { getAllModels } from '@/data/companies'

export default function CompareRoute() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialModelIds = useMemo(() => {
    const raw = searchParams.get('models')
    if (!raw) return []
    const valid = new Set(getAllModels().map((m) => m.id))
    return raw.split(',').filter((id) => valid.has(id))
    // Only read once on mount; CompareView owns the state afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNavigate = useCallback(
    (target: CompareNavTarget) => {
      if (target.kind === 'company') router.push(`/companies/${target.companyId}`)
      else if (target.kind === 'sources') router.push(`/sources?q=${encodeURIComponent(target.query)}`)
      else if (target.kind === 'factcheck') router.push(`/fact-check?q=${encodeURIComponent(target.query)}`)
    },
    [router]
  )

  return <CompareView initialModelIds={initialModelIds} onNavigate={handleNavigate} />
}
