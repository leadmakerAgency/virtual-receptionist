import { NextResponse } from 'next/server'
import type { Json } from '@/types/database'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/auth/requireAdminApi'
import { createElevenLabsAgentRecord } from '@/lib/elevenlabs/agentLifecycle'
import { isValidSlug } from '@/lib/validation/slug'

type CreateBody = {
  slug?: string
  name?: string
  prompt?: string
  first_message?: string
  voice_id?: string
  description?: string | null
  sort_order?: number
  is_active?: boolean
}

export async function POST(request: Request) {
  const gate = await requireAdminApi()
  if (!gate.ok) return gate.response

  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const slug = (body.slug ?? '').trim().toLowerCase()
  const name = (body.name ?? '').trim()
  const prompt = body.prompt ?? ''
  const first_message = body.first_message ?? ''
  const voice_id = (body.voice_id ?? '').trim()
  const description = body.description?.trim() ?? null

  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json(
      { error: 'Slug must be lowercase letters, numbers, and single hyphens between words.' },
      { status: 400 }
    )
  }
  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }
  if (!prompt.trim()) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
  }
  if (!first_message.trim()) {
    return NextResponse.json({ error: 'First message is required.' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { data: existing } = await adminClient
    .from('virtual_receptionists')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'That slug is already in use.' }, { status: 409 })
  }

  let agentId: string
  let agentConfigSnapshot: Json

  try {
    const created = await createElevenLabsAgentRecord({
      name,
      prompt,
      firstMessage: first_message,
      voiceId: voice_id,
    })
    agentId = created.agentId
    agentConfigSnapshot = created.agentConfigSnapshot
  } catch (err) {
    console.error('ElevenLabs create agent failed:', err)
    const message = err instanceof Error ? err.message : 'Failed to create ElevenLabs agent'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const { data: row, error } = await adminClient
    .from('virtual_receptionists')
    .insert({
      slug,
      name,
      prompt,
      first_message,
      voice_id: voice_id || null,
      agent_id: agentId,
      agent_config: agentConfigSnapshot,
      description,
      sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
      is_active: body.is_active !== false,
      created_by: gate.userId,
    })
    .select('id')
    .single()

  if (error || !row) {
    console.error('Supabase insert after ElevenLabs create:', error)
    return NextResponse.json(
      {
        error:
          'Agent was created in ElevenLabs but saving to the database failed. Remove the orphan agent in ElevenLabs or retry.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ id: row.id, agent_id: agentId }, { status: 201 })
}
