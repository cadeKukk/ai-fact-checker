'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { companies } from '@/data/companies'
import ModelDetail from '@/components/ModelDetail'

export default function ModelPage() {
  const { companyId, modelId } = useParams<{ companyId: string; modelId: string }>()
  const router = useRouter()
  const company = companies.find((c) => c.id === companyId)
  const model = company?.models.find((m) => m.id === modelId)

  if (!company || !model) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-[#8a8990]">Model not found.</p>
        <Link href="/companies" className="text-sm text-[#9fa3fc] hover:underline">
          Back to companies
        </Link>
      </div>
    )
  }

  return (
    <ModelDetail
      model={model}
      accentColor={company.accentColor}
      onBack={() => router.push(`/companies/${company.id}`)}
    />
  )
}
