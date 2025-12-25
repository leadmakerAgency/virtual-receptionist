import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { elevenlabsClient } from '@/lib/elevenlabs/client'
import { ReceptionistFormData } from '@/types/receptionist'
import { AgentConfig } from '@/lib/elevenlabs/types'

// GET /api/admin/receptionists/[id] - Get a specific receptionist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Use admin client to bypass RLS for admin operations
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('virtual_receptionists')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ receptionist: data })
  } catch (error: any) {
    console.error('Error getting receptionist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get receptionist' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/receptionists/[id] - Update a receptionist
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body: Partial<ReceptionistFormData> = await request.json()

    // Use admin client to bypass RLS for admin operations
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()

    // Get existing receptionist
    const { data: existing, error: fetchError } = await adminClient
      .from('virtual_receptionists')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (!existing.agent_id) {
      return NextResponse.json(
        { error: 'Agent ID not found' },
        { status: 400 }
      )
    }

    // Update agent in ElevenLabs if config changed
    if (body.prompt || body.first_message || body.voice_id) {
      const agentConfig: AgentConfig = {
        agent: {
          language: 'en',
          prompt: {
            prompt: body.prompt || existing.prompt || '',
            built_in_tools: ['language_detection', 'end_call'],
          },
          first_message: body.first_message || existing.first_message || '',
        },
        asr: {
          quality: 'high',
          provider: 'elevenlabs',
        },
        tts: {
          model_id: 'eleven_turbo_v2',
          voice_id: body.voice_id || existing.voice_id || '',
        },
      }

      await elevenlabsClient.conversationalAi.agents.update(existing.agent_id, {
        name: body.name || existing.name,
        conversation_config: agentConfig,
      })
    }

    // Update in Supabase
    const updateData: any = {}
    if (body.slug) updateData.slug = body.slug
    if (body.name) updateData.name = body.name
    if (body.prompt) updateData.prompt = body.prompt
    if (body.first_message) updateData.first_message = body.first_message
    if (body.voice_id) updateData.voice_id = body.voice_id

    const { data: receptionist, error } = await adminClient
      .from('virtual_receptionists')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ receptionist })
  } catch (error: any) {
    console.error('Error updating receptionist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update receptionist' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/receptionists/[id] - Delete a receptionist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Use admin client to bypass RLS for admin operations
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()

    // Get existing receptionist
    const { data: existing, error: fetchError } = await adminClient
      .from('virtual_receptionists')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Delete agent from ElevenLabs
    if (existing.agent_id) {
      try {
        await elevenlabsClient.conversationalAi.agents.delete(existing.agent_id)
      } catch (deleteError) {
        console.error('Failed to delete agent from ElevenLabs:', deleteError)
        // Continue with database deletion even if ElevenLabs deletion fails
      }
    }

    // Delete from Supabase
    const { error } = await adminClient
      .from('virtual_receptionists')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting receptionist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete receptionist' },
      { status: 500 }
    )
  }
}
