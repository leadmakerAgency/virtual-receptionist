import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const body = await request.json()
    const { ended_at, duration_seconds, conversation_id } = body

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
    if (conversation_id !== undefined) updates.conversation_id = conversation_id

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
