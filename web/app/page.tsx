'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Building2, ShieldCheck, ArrowLeftRight, BookOpen, Link } from 'lucide-react'
import type { AICompany, AIModel } from '@/data/types'
import { companies } from '@/data/companies'
import CompanyList from '@/components/CompanyList'
import CompanyDetail from '@/components/CompanyDetail'
import ModelDetail from '@/components/ModelDetail'
import FactCheckerView from '@/components/FactCheckerView'
import CompareView, { type CompareNavTarget } from '@/components/CompareView'
import TermsView from '@/components/TermsView'
import SourcesView from '@/components/SourcesView'

type Tab = 'companies' | 'factcheck' | 'compare' | 'terms' | 'sources'

const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'factcheck', label: 'Fact Check', icon: ShieldCheck },
  { id: 'compare', label: 'Compare', icon: ArrowLeftRight },
  { id: 'terms', label: 'Terms', icon: BookOpen },
  { id: 'sources', label: 'Sources', icon: Link },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('companies')
  const [selectedCompany, setSelectedCompany] = useState<AICompany | null>(null)
  const [selectedModel, setSelectedModel] = useState<{ model: AIModel; accentColor: string } | null>(null)
  // Pre-filter terms passed to Sources / Fact Check when cross-tab navigation
  // is initiated from Compare. We keep them as keyed objects so re-navigating
  // to the same query still triggers the receiving view to sync state.
  const [sourcesQuery, setSourcesQuery] = useState<{ key: number; value: string } | null>(null)
  const [factCheckQuery, setFactCheckQuery] = useState<{ key: number; value: string } | null>(null)

  const handleCompareNavigate = useCallback((target: CompareNavTarget) => {
    if (target.kind === 'company') {
      const company = companies.find((c) => c.id === target.companyId)
      if (!company) return
      setActiveTab('companies')
      setSelectedCompany(company)
      setSelectedModel(null)
      return
    }
    if (target.kind === 'sources') {
      setActiveTab('sources')
      setSourcesQuery({ key: Date.now(), value: target.query })
      return
    }
    if (target.kind === 'factcheck') {
      setActiveTab('factcheck')
      setFactCheckQuery({ key: Date.now(), value: target.query })
      return
    }
  }, [])

  // Reset window scroll to the top whenever we navigate between tabs, drill
  // into a company/model, or back out of a detail view. The very first mount
  // is skipped so the browser's natural restored scroll (e.g. on refresh) is
  // preserved.
  const isFirstNavRef = useRef(true)
  useEffect(() => {
    if (isFirstNavRef.current) {
      isFirstNavRef.current = false
      return
    }
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [activeTab, selectedCompany?.id, selectedModel?.model.id])

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    setSelectedCompany(null)
    setSelectedModel(null)
  }

  function renderContent() {
    switch (activeTab) {
      case 'companies':
        if (selectedModel) {
          return (
            <ModelDetail
              model={selectedModel.model}
              accentColor={selectedModel.accentColor}
              onBack={() => setSelectedModel(null)}
            />
          )
        }
        if (selectedCompany) {
          return (
            <CompanyDetail
              company={selectedCompany}
              onSelectModel={(model, accentColor) => setSelectedModel({ model, accentColor })}
              onBack={() => setSelectedCompany(null)}
            />
          )
        }
        return <CompanyList onSelectCompany={setSelectedCompany} />
      case 'factcheck':
        return <FactCheckerView initialQuery={factCheckQuery} />
      case 'compare':
        return <CompareView onNavigate={handleCompareNavigate} />
      case 'terms':
        return <TermsView />
      case 'sources':
        return <SourcesView initialQuery={sourcesQuery} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] lg:flex">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-60 bg-[#0a0a0a] border-r border-white/[0.08] z-50 py-10 px-6">
        <div className="mb-10">
          <h1 className="text-xl font-semibold tracking-tight text-[#f5f5f5]">AI Fact Checker</h1>
          <p className="text-xs text-[#8a8990] mt-1">Verified AI information</p>
        </div>
        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors duration-150 ${
                  isActive
                    ? 'bg-white/[0.06] text-[#f5f5f5]'
                    : 'text-[#8a8990] hover:text-[#f5f5f5] hover:bg-white/[0.03]'
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={2}
                  className={isActive ? 'text-[#9fa3fc]' : ''}
                />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="mt-auto pt-6">
          <a
            href="https://cadekukk.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#8a8990] hover:text-[#9fa3fc] transition-colors"
          >
            Built by Cade Kukk ↗
          </a>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:ml-60">
        <div className="max-w-lg lg:max-w-4xl mx-auto relative pb-24 lg:pb-8">
          {renderContent()}
        </div>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="flex items-stretch justify-around bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/[0.08]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2.5 flex-1 transition-colors duration-150 ${
                  isActive ? 'text-[#9fa3fc]' : 'text-[#8a8990] hover:text-[#f5f5f5]'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
