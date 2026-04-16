import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { isCoachSlug } from '@/lib/validation/slug'
import { CoachSession } from '@/components/coach/CoachSession'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw ?? '').trim().toLowerCase()
  if (!isCoachSlug(slug)) {
    return { title: 'Cold Call Coach' }
  }

  const supabase = createAdminClient()
  const { data: row } = await supabase
    .from('virtual_receptionists')
    .select('name, is_active')
    .eq('slug', slug)
    .maybeSingle()

  if (!row || !row.is_active) {
    return { title: 'Cold Call Coach' }
  }

  return {
    title: `${row.name} · Cold Call Coach`,
    description: 'Practice your pitch with an AI prospect powered by ElevenLabs.',
  }
}

export default async function CoachPage({ params }: Props) {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw ?? '').trim().toLowerCase()

  if (!isCoachSlug(slug)) {
    notFound()
  }

  const supabase = createAdminClient()
  const { data: row, error } = await supabase
    .from('virtual_receptionists')
    .select('name, description, slug, is_active')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !row || !row.is_active) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <CoachSession
        slug={row.slug}
        agentDisplayName={row.name}
        description={row.description ?? ''}
      />
    </div>
  )
}
