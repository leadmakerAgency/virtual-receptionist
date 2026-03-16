import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { elevenlabsClient } from '@/lib/elevenlabs/client'
import { AgentConfig } from '@/lib/elevenlabs/types'

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, error: 'Unauthorized', status: 401 }

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { user: null, error: 'Forbidden', status: 403 }

  return { user, error: null, status: 200 }
}

// GET /api/admin/agent — fetch the active coaching agent
export async function GET() {
  try {
    const { error, status } = await verifyAdmin()
    if (error) return NextResponse.json({ error }, { status })

    const adminClient = createAdminClient()
    const { data, error: dbError } = await adminClient
      .from('virtual_receptionists')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (dbError) throw dbError

    return NextResponse.json({ agent: data ?? null })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch agent'
    console.error('Error fetching agent:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH /api/admin/agent — update the active coaching agent
export async function PATCH(request: NextRequest) {
  try {
    const { error, status } = await verifyAdmin()
    if (error) return NextResponse.json({ error }, { status })

    const body = await request.json()
    const { name, prompt, first_message, voice_id } = body

    const adminClient = createAdminClient()

    // Get the current agent
    const { data: existing, error: fetchError } = await adminClient
      .from('virtual_receptionists')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'No active coaching agent found' }, { status: 404 })
    }

    if (!existing.agent_id) {
      return NextResponse.json({ error: 'Agent has no ElevenLabs agent ID' }, { status: 400 })
    }

    // Build updated config
    const agentConfig: AgentConfig = {
      agent: {
        language: 'en',
        prompt: {
          prompt: prompt ?? existing.prompt ?? '',
          built_in_tools: ['language_detection', 'end_call'],
        },
        first_message: first_message ?? existing.first_message ?? '',
      },
      asr: {
        quality: 'high',
        provider: 'elevenlabs',
      },
      tts: {
        model_id: 'eleven_turbo_v2',
        voice_id: voice_id ?? existing.voice_id ?? '',
      },
    }

    // Sync to ElevenLabs
    await elevenlabsClient.conversationalAi.agents.update(existing.agent_id, {
      name: name ?? existing.name,
      conversationConfig: agentConfig,
    } as never)

    // Persist to Supabase
    const { data: updated, error: updateError } = await adminClient
      .from('virtual_receptionists')
      .update({
        name: name ?? existing.name,
        prompt: prompt ?? existing.prompt,
        first_message: first_message ?? existing.first_message,
        voice_id: voice_id ?? existing.voice_id,
        agent_config: agentConfig as never,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ agent: updated })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update agent'
    console.error('Error updating agent:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
