import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('virtual_receptionists')
      .select('id, slug, name, agent_id, voice_id, description, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error listing agents:', error)
      return NextResponse.json({ error: 'Failed to load agents' }, { status: 500 })
    }

    return NextResponse.json({ agents: data ?? [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load agents'
    console.error('GET /api/agents:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
