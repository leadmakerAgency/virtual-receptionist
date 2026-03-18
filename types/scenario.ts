export type ScenarioLevel = 'beginner' | 'intermediate' | 'advanced'

export interface ScenarioItem {
  id: string
  slug: string
  name: string
  level: ScenarioLevel
  brief: string
  behaviorInstructions: string
  firstMessageTemplate: string | null
  sortOrder: number
}

export interface ScenarioCategory {
  id: string
  key: string
  label: string
  description: string | null
  sortOrder: number
  levels: Record<ScenarioLevel, ScenarioItem[]>
}

export interface ScenariosResponse {
  categories: ScenarioCategory[]
}

export interface SessionScenarioSnapshot {
  scenarioId: string
  scenarioSlug: string
  scenarioName: string
  scenarioLevel: ScenarioLevel
  scenarioCategoryKey: string
  scenarioCategoryLabel: string
  scenarioBrief: string
}

export interface ConversationDynamicVariables {
  [key: string]: string | number | boolean
  prospect_name: string
  company_name: string
  scenario_name: string
  scenario_category: string
  scenario_level: ScenarioLevel
  scenario_brief: string
  scenario_behavior_instructions: string
}
