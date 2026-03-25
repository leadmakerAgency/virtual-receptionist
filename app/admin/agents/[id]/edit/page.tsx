import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { AgentForm } from '@/app/admin/agents/AgentForm'
import { DEFAULT_VOICE_ID } from '@/lib/elevenlabs/conversationConfig'

type Props = { params: Promise<{ id: string }> }

export default async function EditAgentPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: row, error } = await supabase.from('virtual_receptionists').select('*').eq('id', id).single()

  if (error || !row) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/agents" className="text-sm text-zinc-600 hover:text-zinc-900">
          ← Back to agents
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">Edit agent</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Updates ElevenLabs and Supabase. Slug cannot be changed after creation.
        </p>
      </div>

      <AgentForm
        mode="edit"
        agentId={row.id}
        initialValues={{
          slug: row.slug,
          name: row.name,
          prompt: row.prompt ?? '',
          first_message: row.first_message ?? '',
          voice_id: row.voice_id ?? DEFAULT_VOICE_ID,
          description: row.description ?? '',
          sort_order: row.sort_order,
          is_active: row.is_active ?? true,
        }}
      />
    </div>
  )
}
