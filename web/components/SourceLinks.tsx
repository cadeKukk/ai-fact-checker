import { BookOpen, ExternalLink } from 'lucide-react'
import type { Source } from '@/data/types'

/** The same direct, tappable citations in lessons and catalog entries. */
export default function SourceLinks({ sources }: { sources?: Source[] }) {
  if (!sources?.length) return null

  return (
    <div className="mt-4 pt-3 border-t border-white/[0.06]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <BookOpen size={12} className="text-[#8a8990]" aria-hidden="true" />
        <span className="text-[11px] uppercase tracking-wide text-[#8a8990] font-semibold">Sources</span>
      </div>
      <div className="flex flex-col gap-1">
        {sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-start gap-1.5 rounded py-1 text-xs text-[#9a99a2] hover:text-[#e8e6ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 transition-colors"
          >
            <ExternalLink size={11} className="mt-0.5 shrink-0 opacity-50 group-hover:opacity-100" aria-hidden="true" />
            <span className="underline decoration-white/15 underline-offset-2 group-hover:decoration-white/40">
              {source.title}<span className="sr-only"> (opens in a new tab)</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
