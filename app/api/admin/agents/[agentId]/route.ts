import { NextRequest, NextResponse } from 'next/server'
import { elevenlabsClient } from '@/lib/elevenlabs/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UpdateAgentRequest } from '@/lib/elevenlabs/types'

// GET /api/admin/agents/[agentId] - Get a specific agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agentId } = await params
    const agent = await elevenlabsClient.conversationalAI.agents.get(agentId)

    return NextResponse.json({ agent })
  } catch (error: any) {
    console.error('Error getting agent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get agent' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/agents/[agentId] - Update an agent
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agentId } = await params
    const body: UpdateAgentRequest = await request.json()

    const agent = await elevenlabsClient.conversationalAI.agents.update(agentId, body)

    return NextResponse.json({ agent })
  } catch (error: any) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update agent' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/agents/[agentId] - Delete an agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agentId } = await params
    await elevenlabsClient.conversationalAI.agents.delete(agentId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
