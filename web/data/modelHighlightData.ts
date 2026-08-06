import { companies } from './companies'
import type { AICompany, AIModel } from './types'

export type ModelHighlightRef = {
  model: AIModel
  company: AICompany
  pattern: string
}

/** Product / family names that map to a specific catalog model for mini-definitions.
 *
 * Includes historical references that frequently appear in educational copy
 * (e.g. "GPT-4", "GPT-3.5") so they highlight to the closest available
 * catalog entry. The popup explicitly shows the mention vs. the resolved
 * model so the substitution is transparent to the user. */
const PRODUCT_NAME_ALIASES: { modelId: string; patterns: string[] }[] = [
  { modelId: 'gpt56sol', patterns: ['ChatGPT', 'GPT-5.6'] },
  { modelId: 'gpt4o', patterns: ['GPT-4 Turbo', 'GPT-4V', 'GPT-4o mini', 'GPT-4', 'GPT-3.5', 'GPT-3'] },
  { modelId: 'claudeopus5', patterns: ['Claude'] },
  { modelId: 'claudefable5', patterns: ['Fable 5', 'Mythos 5', 'Claude Fable'] },
  { modelId: 'gemini25pro', patterns: ['Gemini'] },
  { modelId: 'grok45', patterns: ['Grok', 'Grok 4'] },
  { modelId: 'deepseekv4', patterns: ['DeepSeek'] },
  { modelId: 'kimik3', patterns: ['Kimi'] },
  { modelId: 'mistralmedium35', patterns: ['Mistral', 'Mixtral'] },
  { modelId: 'llama4maverick', patterns: ['LLaMA', 'Llama 3', 'Llama 2'] },
]

const modelById = (() => {
  const m = new Map<string, { model: AIModel; company: AICompany }>()
  for (const c of companies) {
    for (const model of c.models) {
      m.set(model.id, { model, company: c })
    }
  }
  return m
})()

function collectModelRefs(): ModelHighlightRef[] {
  const refs: ModelHighlightRef[] = []
  for (const company of companies) {
    for (const model of company.models) {
      if (model.name.length >= 2) {
        refs.push({ model, company, pattern: model.name })
      }
    }
  }
  for (const { modelId, patterns } of PRODUCT_NAME_ALIASES) {
    const b = modelById.get(modelId)
    if (!b) continue
    for (const p of patterns) {
      if (p.length >= 2) {
        refs.push({ model: b.model, company: b.company, pattern: p })
      }
    }
  }
  // Longest first so regex alternation prefers specific models (e.g. GPT-5.4 over GPT-5)
  return refs.sort((a, b) => b.pattern.length - a.pattern.length)
}

const REFS = collectModelRefs()

const patternToRef = (() => {
  const map = new Map<string, ModelHighlightRef>()
  for (const r of REFS) {
    const k = r.pattern.toLowerCase()
    if (!map.has(k)) map.set(k, r)
  }
  return map
})()

export const MODEL_PATTERNS_SORTED: ModelHighlightRef[] = REFS

export function findModelRefByMatch(matched: string): ModelHighlightRef | undefined {
  return patternToRef.get(matched.toLowerCase())
}

export function getModelById(id: string): { model: AIModel; company: AICompany } | undefined {
  return modelById.get(id)
}
