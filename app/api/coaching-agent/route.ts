import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/coaching-agent — returns the active coaching agent's agent_id for authenticated users
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
      .from('virtual_receptionists')
      .select('agent_id, name')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (error || !data?.agent_id) {
      return NextResponse.json(
        { error: 'No active coaching agent configured. Please contact your administrator.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ agent_id: data.agent_id, name: data.name })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch coaching agent'
    console.error('Error fetching coaching agent:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
