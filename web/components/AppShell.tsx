'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowLeftRight,
  Link as LinkIcon,
  Search,
} from 'lucide-react'
import SearchPalette from './SearchPalette'
import { TermPopup, ModelPopup, BenchmarkPopup, useTermPopup } from './TermHighlight'
import { APP_VERSION, LAST_UPDATED } from '@/lib/appMeta'

const navItems = [
  { href: '/', label: 'Learn', icon: GraduationCap },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/fact-check', label: 'Fact Check', icon: ShieldCheck },
  { href: '/compare', label: 'Compare', icon: ArrowLeftRight },
  { href: '/sources', label: 'Sources', icon: LinkIcon },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname.startsWith('/learn')
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const {
    activeTerm,
    activeModel,
    activeBenchmark,
    showTerm,
    showModel,
    showBenchmark,
    selectTerm,
    clearTerm,
    clearModel,
    clearBenchmark,
    back,
    canGoBack,
  } = useTermPopup()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // The course takes over the full screen; hide the chrome there.
  const immersive = pathname.startsWith('/learn')

  return (
    <div className="min-h-screen bg-[#0a0a0a] lg:flex">
      {/* Desktop sidebar */}
      {!immersive && (
        <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-60 bg-[#0a0a0a] border-r border-white/[0.08] z-50 py-10 px-6">
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-[#f5f5f5]">AI Fact Checker</h1>
            <p className="text-xs text-[#8a8990] mt-1">Verified AI information</p>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2 mb-6 rounded-[10px] bg-white/[0.04] border border-white/10 text-[#8a8990] hover:text-[#f5f5f5] hover:bg-white/[0.06] transition-colors"
          >
            <Search size={15} />
            <span className="text-[13px]">Search</span>
            <kbd className="ml-auto text-[10px] bg-white/[0.06] border border-white/10 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </button>

          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors duration-150 ${
                    active
                      ? 'bg-white/[0.06] text-[#f5f5f5]'
                      : 'text-[#8a8990] hover:text-[#f5f5f5] hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon size={17} strokeWidth={2} className={active ? 'text-[#9fa3fc]' : ''} />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto pt-6 space-y-1.5">
            <a
              href="https://cadekukk.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#8a8990] hover:text-[#9fa3fc] transition-colors"
            >
              Built by Cade Kukk ↗
            </a>
            <p className="text-[11px] text-[#5c5b63]">
              v{APP_VERSION} · Updated {LAST_UPDATED}
            </p>
          </div>
        </aside>
      )}

      {/* Mobile top bar */}
      {!immersive && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/[0.08]">
          <span className="text-[15px] font-semibold tracking-tight text-[#f5f5f5]">AI Fact Checker</span>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8a8990] hover:text-[#f5f5f5] bg-white/[0.04] border border-white/10"
          >
            <Search size={15} />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className={immersive ? 'flex-1' : 'flex-1 lg:ml-60 pt-12 lg:pt-0'}>
        <div className={immersive ? '' : 'max-w-lg lg:max-w-4xl mx-auto relative pb-24 lg:pb-8'}>
          {children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      {!immersive && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="flex items-stretch justify-around bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/[0.08]">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2.5 flex-1 transition-colors duration-150 ${
                    active ? 'text-[#9fa3fc]' : 'text-[#8a8990] hover:text-[#f5f5f5]'
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} onShowTerm={showTerm} />

      {/* Global glossary popups (opened from search) */}
      {activeTerm && (
        <TermPopup
          term={activeTerm}
          onClose={clearTerm}
          onBack={canGoBack ? back : undefined}
          onTermTap={selectTerm}
          onModelTap={showModel}
          onBenchmarkTap={showBenchmark}
        />
      )}
      {activeModel && (
        <ModelPopup
          payload={activeModel}
          onClose={clearModel}
          onBack={canGoBack ? back : undefined}
          onTermTap={showTerm}
          onModelTap={showModel}
          onBenchmarkTap={showBenchmark}
        />
      )}
      {activeBenchmark && (
        <BenchmarkPopup
          benchmark={activeBenchmark}
          onClose={clearBenchmark}
          onBack={canGoBack ? back : undefined}
          onTermTap={showTerm}
          onModelTap={showModel}
          onBenchmarkTap={showBenchmark}
        />
      )}
    </div>
  )
}
