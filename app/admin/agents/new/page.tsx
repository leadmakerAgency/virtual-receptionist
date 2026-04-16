import Link from 'next/link'
import { AgentForm } from '@/app/admin/agents/AgentForm'
import { DEFAULT_VOICE_ID } from '@/lib/elevenlabs/conversationConfig'

export default function NewAgentPage() {
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
          Create agent
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Creates an ElevenLabs conversational agent and saves it to Supabase.
        </p>
      </div>

      <AgentForm
        mode="create"
        initialValues={{
          slug: '',
          name: '',
          prompt: '',
          first_message: '',
          voice_id: DEFAULT_VOICE_ID,
          description: '',
          sort_order: 0,
          is_active: true,
        }}
      />
    </div>
  )
}
