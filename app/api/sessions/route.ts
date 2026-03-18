import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'

const MAX_PROSPECT_NAME_LENGTH = 120
const MAX_COMPANY_NAME_LENGTH = 160

const sanitizeText = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

const sanitizeConversationId = (value: unknown) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

// POST /api/sessions — create a new coaching session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const conversationId = sanitizeConversationId(body.conversation_id)
    const scenarioId = sanitizeConversationId(body.scenario_id)
    const prospectName = sanitizeText(body.prospect_name, MAX_PROSPECT_NAME_LENGTH)
    const prospectCompanyName = sanitizeText(body.prospect_company_name, MAX_COMPANY_NAME_LENGTH)
    const scenarioSnapshot =
      body.scenario_snapshot && typeof body.scenario_snapshot === 'object'
        ? (body.scenario_snapshot as Json)
        : null

    const adminClient = createAdminClient()

    if (scenarioId) {
      const { data: scenario, error: scenarioError } = await adminClient
        .from('scenarios')
        .select('id')
        .eq('id', scenarioId)
        .eq('is_active', true)
        .single()

      if (scenarioError || !scenario) {
        return NextResponse.json({ error: 'Invalid or inactive scenario selected' }, { status: 400 })
      }
    }

    const { data, error } = await adminClient
      .from('coaching_sessions')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        scenario_id: scenarioId,
        prospect_name: prospectName,
        prospect_company_name: prospectCompanyName,
        scenario_snapshot: scenarioSnapshot,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session: data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create session'
    console.error('Error creating session:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET /api/sessions — list the current user's sessions
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

    const { data, error } = await adminClient
      .from('coaching_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ sessions: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sessions'
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
