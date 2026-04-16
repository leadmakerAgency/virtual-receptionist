import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { isCoachPublicId } from '@/lib/validation/coachPublicId'
import { CoachPracticeFlow } from '@/components/coach/CoachPracticeFlow'
import type { PracticeAgent } from '@/types/practiceAgent'

type Props = { params: Promise<{ coachPublicId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { coachPublicId: raw } = await params
  const coachPublicId = decodeURIComponent(raw ?? '').trim()
  if (!isCoachPublicId(coachPublicId)) {
    return { title: 'Cold Call Coach' }
  }

  const supabase = createAdminClient()
  const { data: row } = await supabase
    .from('virtual_receptionists')
    .select('name, is_active')
    .eq('coach_public_id', coachPublicId)
    .maybeSingle()

  if (!row || !row.is_active) {
    return { title: 'Cold Call Coach' }
  }

  return {
    title: `${row.name} · Cold Call Coach`,
    description: 'Practice your pitch with an AI prospect powered by ElevenLabs.',
  }
}

export default async function CoachPublicPage({ params }: Props) {
  const { coachPublicId: raw } = await params
  const coachPublicId = decodeURIComponent(raw ?? '').trim()

  if (!isCoachPublicId(coachPublicId)) {
    notFound()
  }

  const supabase = createAdminClient()
  const { data: row, error } = await supabase
    .from('virtual_receptionists')
    .select('id, slug, name, agent_id, voice_id, description, sort_order, is_active, coach_public_id')
    .eq('coach_public_id', coachPublicId)
    .maybeSingle()

  if (error || !row || !row.is_active || !row.coach_public_id || !row.agent_id) {
    notFound()
  }

  const agent: PracticeAgent = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    agent_id: row.agent_id,
    voice_id: row.voice_id,
    description: row.description,
    sort_order: row.sort_order,
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <CoachPracticeFlow publicCoachId={row.coach_public_id} agent={agent} />
    </div>
  )
}
