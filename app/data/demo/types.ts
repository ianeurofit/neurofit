/**
 * Tipos del caso demo de tamizaje cognitivo de Neurofit IA.
 * El contenido proviene del guión conversacional del piloto.
 */

export type RiskLevel = 'low' | 'moderate' | 'high'

export type StageId =
  | 'screening'
  | 'summary'
  | 'findings'
  | 'risk'
  | 'index'
  | 'plan'
  | 'recommendations'

export interface ChatMessage {
  /** `ai` = Neurofit IA, `patient` = la persona evaluada */
  from: 'ai' | 'patient'
  text: string
  /** Nota clínica que se revela junto al mensaje (ej. respuesta incorrecta) */
  note?: string
}

export interface FindingGroup {
  key: string
  title: string
  icon: string
  items: string[]
}

export interface RiskFactorGroup {
  key: string
  title: string
  level: RiskLevel | 'protective'
  items: string[]
}

export interface ScoreMetric {
  key: string
  label: string
  value: number
}

export interface PlanBlock {
  key: string
  title: string
  icon: string
  items: string[]
}

export interface RecommendationBlock {
  key: string
  timeframe: string
  items: string[]
}

export interface DemoPatient {
  id: string
  name: string
  initials: string
  age: number
  /** ISO date de la evaluación */
  evaluatedAt: string
  risk: RiskLevel
  score: number
  reason: string
  /** Solo el caso completo del guión es navegable */
  hasFullCase: boolean
}

export interface DemoCase {
  patient: DemoPatient
  meta: {
    duration: string
    type: string
    reason: string
  }
  screening: {
    intro: string
    messages: ChatMessage[]
    summaryTitle: string
    reasonLabel: string
    durationLabel: string
    typeLabel: string
  }
  summary: {
    label: string
    text: string
    durationLabel: string
    scoreLabel: string
  }
  findings: FindingGroup[]
  risk: {
    levelLabel: string
    levelTitle: string
    levelText: string
    groups: RiskFactorGroup[]
  }
  index: {
    label: string
    title: string
    global: number
    metrics: ScoreMetric[]
  }
  plan: {
    goal: string
    blocks: PlanBlock[]
  }
  recommendations: {
    blocks: RecommendationBlock[]
    alertsTitle: string
    alerts: string[]
  }
}

export interface DemoContent {
  /** Textos de la interfaz del panel demo */
  ui: {
    panelName: string
    listTitle: string
    listSubtitle: string
    newScreening: string
    activePatients: string
    highRisk: string
    moderateRisk: string
    lowRisk: string
    backToPatients: string
    stagesLabel: string
    stageOf: string
    progressLabel: string
    scheduleAppointment: string
    generateReport: string
    viewCase: string
    demoOnly: string
    demoOnlyHint: string
    evaluatedOn: string
    years: string
    prev: string
    next: string
    openStages: string
    replayChat: string
    showAll: string
    playChat: string
    pauseChat: string
    scrollHint: string
    disclaimer: string
    ctaTitle: string
    ctaText: string
    ctaButton: string
  }
  riskLabels: Record<RiskLevel, string>
  stages: Record<StageId, string>
  patients: DemoPatient[]
  case: DemoCase
}
