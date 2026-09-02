import type { AIModel } from '@/data/types'
import SourceLinks from './SourceLinks'

export default function CatalogEvidence({ model }: { model: AIModel }) {
  if (!model.verification) return null

  return (
    <div className="mt-4 text-xs">
      <details className="rounded-[10px] border border-amber-400/20 bg-amber-400/5 p-3" open>
        <summary className="cursor-pointer font-semibold text-amber-300">
          Verification notes · Checked {model.verification.checkedAt}
        </summary>
        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[#b3b2b8] leading-relaxed">
          {model.verification.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </details>
      <SourceLinks sources={model.sources} />
    </div>
  )
}
