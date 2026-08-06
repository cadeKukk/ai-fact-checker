'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { companies } from '@/data/companies'
import CompanyDetail from '@/components/CompanyDetail'

export default function CompanyPage() {
  const { companyId } = useParams<{ companyId: string }>()
  const router = useRouter()
  const company = companies.find((c) => c.id === companyId)

  if (!company) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-[#8a8990]">Company not found.</p>
        <Link href="/companies" className="text-sm text-[#9fa3fc] hover:underline">
          Back to companies
        </Link>
      </div>
    )
  }

  return (
    <CompanyDetail
      company={company}
      onSelectModel={(model) => router.push(`/companies/${company.id}/${model.id}`)}
      onBack={() => router.push('/companies')}
    />
  )
}
