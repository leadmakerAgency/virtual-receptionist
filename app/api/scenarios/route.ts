import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ScenarioCategory, ScenarioItem, ScenarioLevel, ScenariosResponse } from '@/types/scenario'

const SCENARIO_LEVELS: ScenarioLevel[] = ['beginner', 'intermediate', 'advanced']

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const { data: categories, error: categoryError } = await adminClient
      .from('scenario_categories')
      .select('id, key, label, description, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('label', { ascending: true })

    if (categoryError) throw categoryError

    const { data: scenarios, error: scenarioError } = await adminClient
      .from('scenarios')
      .select(
        'id, category_id, slug, name, level, brief, behavior_instructions, first_message_template, sort_order'
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (scenarioError) throw scenarioError

    const scenariosByCategory = new Map<string, ScenarioItem[]>()
    for (const scenario of scenarios ?? []) {
      const existing = scenariosByCategory.get(scenario.category_id) ?? []
      existing.push({
        id: scenario.id,
        slug: scenario.slug,
        name: scenario.name,
        level: scenario.level,
        brief: scenario.brief,
        behaviorInstructions: scenario.behavior_instructions,
        firstMessageTemplate: scenario.first_message_template,
        sortOrder: scenario.sort_order,
      })
      scenariosByCategory.set(scenario.category_id, existing)
    }

    const payload: ScenariosResponse = {
      categories: (categories ?? []).map((category): ScenarioCategory => {
        const categoryScenarios = scenariosByCategory.get(category.id) ?? []
        const levels: Record<ScenarioLevel, ScenarioItem[]> = {
          beginner: [],
          intermediate: [],
          advanced: [],
        }

        for (const level of SCENARIO_LEVELS) {
          levels[level] = categoryScenarios.filter((scenario) => scenario.level === level)
        }

        return {
          id: category.id,
          key: category.key,
          label: category.label,
          description: category.description,
          sortOrder: category.sort_order,
          levels,
        }
      }),
    }

    return NextResponse.json(payload)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch scenarios'
    console.error('Error fetching scenarios:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
