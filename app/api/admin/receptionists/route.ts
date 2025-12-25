import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { elevenlabsClient } from '@/lib/elevenlabs/client'
import { ReceptionistFormData } from '@/types/receptionist'
import { AgentConfig } from '@/lib/elevenlabs/types'
import { Database } from '@/types/database'

type VirtualReceptionist = Database['public']['Tables']['virtual_receptionists']['Row']

// GET /api/admin/receptionists - List all receptionists
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS for admin operations
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('virtual_receptionists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ receptionists: data })
  } catch (error: any) {
    console.error('Error listing receptionists:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list receptionists' },
      { status: 500 }
    )
  }
}

// POST /api/admin/receptionists - Create a new receptionist
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ReceptionistFormData = await request.json()

    // Create agent in ElevenLabs
    const agentConfig: AgentConfig = {
      agent: {
        language: 'en',
        prompt: {
          prompt: body.prompt,
          built_in_tools: ['language_detection', 'end_call'],
        },
        first_message: body.first_message,
      },
      asr: {
        quality: 'high',
        provider: 'elevenlabs',
      },
      tts: {
        model_id: 'eleven_turbo_v2',
        voice_id: body.voice_id,
      },
    }

    // Use type assertion to avoid TypeScript type conflicts with SDK internal types
    const agent = await elevenlabsClient.conversationalAi.agents.create({
      name: body.name,
      conversationConfig: agentConfig,
    } as any)

    // Use admin client to bypass RLS for admin operations
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()

    // Save to Supabase
    const { data: receptionistData, error } = await adminClient
      .from('virtual_receptionists')
      .insert({
        slug: body.slug,
        name: body.name,
        agent_id: agent.agent_id,
        agent_config: agentConfig as any,
        first_message: body.first_message,
        prompt: body.prompt,
        voice_id: body.voice_id,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      // If Supabase insert fails, try to delete the agent from ElevenLabs
      try {
        await elevenlabsClient.conversationalAi.agents.delete(agent.agent_id)
      } catch (deleteError) {
        console.error('Failed to cleanup agent:', deleteError)
      }
      throw error
    }

    if (!receptionistData) {
      return NextResponse.json(
        { error: 'Failed to create receptionist' },
        { status: 500 }
      )
    }

    // Explicitly type the created receptionist
    const receptionist: VirtualReceptionist = receptionistData

    return NextResponse.json({ receptionist }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating receptionist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create receptionist' },
      { status: 500 }
    )
  }
}
