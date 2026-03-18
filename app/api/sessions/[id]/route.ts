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

// PATCH /api/sessions/[id] — update a session (end time, duration, conversation_id)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const { ended_at, duration_seconds } = body

    const adminClient = createAdminClient()

    // Verify the session belongs to this user before updating
    const { data: existing, error: fetchError } = await adminClient
      .from('coaching_sessions')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}
    if (ended_at !== undefined) updates.ended_at = ended_at
    if (duration_seconds !== undefined) updates.duration_seconds = duration_seconds
    if (body.conversation_id !== undefined) {
      updates.conversation_id = sanitizeConversationId(body.conversation_id)
    }
    if (body.scenario_id !== undefined) {
      const scenarioId = sanitizeConversationId(body.scenario_id)
      if (scenarioId) {
        const { data: scenario, error: scenarioError } = await adminClient
          .from('scenarios')
          .select('id')
          .eq('id', scenarioId)
          .single()
        if (scenarioError || !scenario) {
          return NextResponse.json({ error: 'Invalid scenario selected' }, { status: 400 })
        }
      }
      updates.scenario_id = scenarioId
    }
    if (body.prospect_name !== undefined) {
      updates.prospect_name = sanitizeText(body.prospect_name, MAX_PROSPECT_NAME_LENGTH)
    }
    if (body.prospect_company_name !== undefined) {
      updates.prospect_company_name = sanitizeText(body.prospect_company_name, MAX_COMPANY_NAME_LENGTH)
    }
    if (body.scenario_snapshot !== undefined) {
      updates.scenario_snapshot =
        body.scenario_snapshot && typeof body.scenario_snapshot === 'object'
          ? (body.scenario_snapshot as Json)
          : null
    }

    const { data, error } = await adminClient
      .from('coaching_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update session'
    console.error('Error updating session:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
