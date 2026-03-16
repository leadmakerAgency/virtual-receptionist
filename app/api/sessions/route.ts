import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

    const body = await request.json().catch(() => ({}))
    const { conversation_id } = body

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('coaching_sessions')
      .insert({
        user_id: user.id,
        conversation_id: conversation_id ?? null,
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
