export type Modality = 'Text' | 'Image' | 'Audio' | 'Video' | 'Code'

export type CapabilityRating = 'poor' | 'fair' | 'good' | 'excellent' | 'exceptional'

export type MythVerdict = 'confirmed' | 'busted' | 'plausible' | 'misleading' | 'exaggerated'

export type SourceType = 'officialDocs' | 'github' | 'researchPaper' | 'blogPost' | 'newsArticle' | 'apiReference'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type TermCategory = 'fundamentals' | 'architecture' | 'training' | 'inference' | 'performance' | 'safety' | 'practical'

export interface Source {
  id: string
  title: string
  url: string
  type: SourceType
  dateAccessed: string
}

export interface Capability {
  id: string
  name: string
  description: string
  rating: CapabilityRating
  isVerified: boolean
}

export interface Myth {
  id: string
  claim: string
  verdict: MythVerdict
  explanation: string
  source?: Source
}

export interface Pricing {
  inputPricePerMillionTokens?: number
  outputPricePerMillionTokens?: number
  freeTierAvailable: boolean
  notes?: string
}

export interface ModelSpecs {
  parameterCount?: string
  contextWindow: number
  trainingDataCutoff?: string
  architecture: string
  inputModalities: Modality[]
  outputModalities: Modality[]
  averageLatency?: string
  tokensPerSecond?: string
  resourceRequirements?: string
}

export interface AIModel {
  id: string
  name: string
  version: string
  releaseDate: string
  description: string
  specs: ModelSpecs
  capabilities: Capability[]
  limitations: string[]
  myths: Myth[]
  pricing?: Pricing
  sources: Source[]
  isOpenSource: boolean
}

export interface AICompany {
  id: string
  name: string
  shortName: string
  description: string
  foundedYear: number
  headquarters: string
  website: string
  logoIcon: string
  accentColor: string
  models: AIModel[]
  sources: Source[]
}

export interface FactCheckQA {
  id: string
  question: string
  answer: string
  confidence: ConfidenceLevel
  relatedModels: string[]
  sources: Source[]
  tags: string[]
}

export interface AITerm {
  id: string
  term: string
  shortDefinition: string
  fullExplanation: string
  category: TermCategory
  relatedTerms: string[]
  example?: string
}

export interface AILessonVisual {
  type: 'diagram' | 'comparison' | 'flow' | 'scale' | 'neuralNetwork' | 'tokenizer' | 'nextWord' | 'confidenceMeter' | 'quiz' | 'parameterScale' | 'embedding'
  elements: string[]
  caption?: string
}

export interface AILessonSection {
  heading?: string
  content: string
  visual?: AILessonVisual
  bullets?: string[]
}

export interface AILesson {
  category: string
  title: string
  subtitle: string
  icon: string
  color: string
  sections: AILessonSection[]
  keyTakeaway?: string
}

export const ratingValue: Record<CapabilityRating, number> = {
  poor: 1, fair: 2, good: 3, excellent: 4, exceptional: 5,
}
export const ratingLabel: Record<CapabilityRating, string> = {
  poor: 'Poor', fair: 'Fair', good: 'Good', excellent: 'Excellent', exceptional: 'Exceptional',
}
export const ratingColor: Record<CapabilityRating, string> = {
  poor: '#b91c1c', fair: '#c2410c', good: '#a16207', excellent: '#15803d', exceptional: '#0f766e',
}

export const verdictLabel: Record<MythVerdict, string> = {
  confirmed: 'Confirmed', busted: 'Busted', plausible: 'Plausible', misleading: 'Misleading', exaggerated: 'Exaggerated',
}
export const verdictColor: Record<MythVerdict, string> = {
  confirmed: '#15803d', busted: '#b91c1c', plausible: '#a16207', misleading: '#c2410c', exaggerated: '#7e22ce',
}

export const confidenceLabel: Record<ConfidenceLevel, string> = {
  high: 'High Confidence', medium: 'Medium Confidence', low: 'Low Confidence',
}
export const confidenceColor: Record<ConfidenceLevel, string> = {
  high: '#15803d', medium: '#a16207', low: '#c2410c',
}

export const sourceTypeLabel: Record<SourceType, string> = {
  officialDocs: 'Official Documentation', github: 'GitHub', researchPaper: 'Research Paper',
  blogPost: 'Blog Post', newsArticle: 'News Article', apiReference: 'API Reference',
}
export const sourceTypeColor: Record<SourceType, string> = {
  officialDocs: '#1d4ed8', github: '#7e22ce', researchPaper: '#c2410c',
  blogPost: '#15803d', newsArticle: '#0e7490', apiReference: '#be185d',
}

export const termCategoryLabel: Record<TermCategory, string> = {
  fundamentals: 'Fundamentals', architecture: 'Architecture', training: 'Training',
  inference: 'Inference', performance: 'Performance', safety: 'Safety & Ethics', practical: 'Practical Usage',
}
export const termCategoryColor: Record<TermCategory, string> = {
  fundamentals: '#1d4ed8', architecture: '#7e22ce', training: '#c2410c',
  inference: '#15803d', performance: '#0e7490', safety: '#b91c1c', practical: '#0f766e',
}

export const modalityIcon: Record<Modality, string> = {
  Text: 'AlignLeft', Image: 'Image', Audio: 'AudioWaveform', Video: 'Video', Code: 'Code2',
}
