import { NextRequest, NextResponse } from 'next/server'
import { elevenlabsClient } from '@/lib/elevenlabs/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CreateAgentRequest } from '@/lib/elevenlabs/types'

// GET /api/admin/agents - List all agents
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const agents = await elevenlabsClient.conversationalAi.agents.list()
    
    return NextResponse.json({ agents })
  } catch (error: any) {
    console.error('Error listing agents:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list agents' },
      { status: 500 }
    )
  }
}

// POST /api/admin/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateAgentRequest = await request.json()

    const agent = await elevenlabsClient.conversationalAi.agents.create(body)

    return NextResponse.json({ agent }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    )
  }
}
