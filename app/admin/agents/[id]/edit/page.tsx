import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { AgentForm } from '@/app/admin/agents/AgentForm'
import { DEFAULT_VOICE_ID } from '@/lib/elevenlabs/conversationConfig'
import { CoachLinkActions } from '@/components/admin/CoachLinkActions'
import { buildCoachUrlForCurrentRequest } from '@/lib/public/coachUrlForRequest'

type Props = { params: Promise<{ id: string }> }

export default async function EditAgentPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: row, error } = await supabase.from('virtual_receptionists').select('*').eq('id', id).single()

  if (error || !row) {
    notFound()
  }

  const coachDisplayUrl =
    row.coach_public_id != null && row.coach_public_id !== ''
      ? await buildCoachUrlForCurrentRequest(row.coach_public_id)
      : null

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/agents"
          className="text-sm text-violet-700/90 transition-colors hover:text-admin-accent"
        >
          ← Back to agents
        </Link>
        <h1 className="mt-1 bg-gradient-to-r from-zinc-900 via-admin-accent to-admin-accent-mid bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
          Edit agent
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Updates ElevenLabs and Supabase. Slug cannot be changed after creation.
        </p>
      </div>

      <div className="rounded-2xl border border-violet-200/50 bg-white/90 p-5 shadow-md shadow-violet-900/[0.05] ring-1 ring-violet-100/80">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-900/60">Public coach URL</p>
        <p className="mt-1 break-all font-mono text-sm text-zinc-800">
          {coachDisplayUrl ?? '— (apply Supabase migration + save agent)'}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Anyone with this link can open the practice page for this agent when it is active.
        </p>
        {row.is_active && row.coach_public_id ? (
          <div className="mt-3">
            <CoachLinkActions coachPublicId={row.coach_public_id} />
          </div>
        ) : row.is_active && !row.coach_public_id ? (
          <p className="mt-3 text-sm text-amber-700">
            Apply the <code className="rounded bg-zinc-100 px-1">coach_public_id</code> migration in Supabase, then
            save this agent once to generate the public link.
          </p>
        ) : (
          <p className="mt-3 text-sm text-amber-700">Activate this agent to enable the public coach link.</p>
        )}
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
