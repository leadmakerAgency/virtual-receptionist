import { NextResponse } from 'next/server'
import type { Json } from '@/types/database'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/auth/requireAdminApi'
import { updateElevenLabsAgent } from '@/lib/elevenlabs/agentLifecycle'
import { isValidSlug } from '@/lib/validation/slug'

type PatchBody = {
  slug?: string
  name?: string
  prompt?: string
  first_message?: string
  voice_id?: string
  description?: string | null
  sort_order?: number
  is_active?: boolean
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi()
  if (!gate.ok) return gate.response

  const { id } = await ctx.params

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data: existing, error: fetchError } = await adminClient
    .from('virtual_receptionists')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })
  }

  if (!existing.agent_id) {
    return NextResponse.json({ error: 'This record has no ElevenLabs agent id.' }, { status: 400 })
  }

  const slug = body.slug !== undefined ? body.slug.trim().toLowerCase() : existing.slug
  if (body.slug !== undefined) {
    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Slug must be lowercase letters, numbers, and single hyphens between words.' },
        { status: 400 }
      )
    }
    if (slug !== existing.slug) {
      const { data: clash } = await adminClient
        .from('virtual_receptionists')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .maybeSingle()
      if (clash) {
        return NextResponse.json({ error: 'That slug is already in use.' }, { status: 409 })
      }
    }
  }

  const name = body.name !== undefined ? body.name.trim() : existing.name
  const prompt = body.prompt !== undefined ? body.prompt : (existing.prompt ?? '')
  const first_message =
    body.first_message !== undefined ? body.first_message : (existing.first_message ?? '')
  const voice_id =
    body.voice_id !== undefined ? body.voice_id.trim() : (existing.voice_id ?? '')

  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }
  if (!String(prompt).trim()) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
  }
  if (!String(first_message).trim()) {
    return NextResponse.json({ error: 'First message is required.' }, { status: 400 })
  }

  let agentConfigSnapshot: Json | null = existing.agent_config
  try {
    const updated = await updateElevenLabsAgent(existing.agent_id, {
      name,
      prompt: String(prompt),
      firstMessage: String(first_message),
      voiceId: String(voice_id),
    })
    agentConfigSnapshot = updated.agentConfigSnapshot
  } catch (err) {
    console.error('ElevenLabs update agent failed:', err)
    const message = err instanceof Error ? err.message : 'Failed to update ElevenLabs agent'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const description =
    body.description !== undefined ? (body.description?.trim() ?? null) : existing.description
  const sort_order =
    typeof body.sort_order === 'number' ? body.sort_order : existing.sort_order ?? 0
  const is_active = body.is_active !== undefined ? body.is_active : existing.is_active

  const { error: saveError } = await adminClient
    .from('virtual_receptionists')
    .update({
      slug,
      name,
      prompt,
      first_message,
      voice_id: voice_id || null,
      agent_config: agentConfigSnapshot,
      description,
      sort_order,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (saveError) {
    console.error('Supabase update after ElevenLabs:', saveError)
    return NextResponse.json(
      { error: 'ElevenLabs was updated but saving to the database failed.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi()
  if (!gate.ok) return gate.response

  const { id } = await ctx.params
  const adminClient = createAdminClient()

  const { data: existing, error: fetchError } = await adminClient
    .from('virtual_receptionists')
    .select('agent_id, is_active')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })
  }

  const { error } = await adminClient
    .from('virtual_receptionists')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to deactivate agent.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
