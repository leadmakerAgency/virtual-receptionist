import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/receptionists/[slug] - Get receptionist by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { slug } = await params

    const { data, error } = await supabase
      .from('virtual_receptionists')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Receptionist not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ receptionist: data })
  } catch (error: any) {
    console.error('Error getting receptionist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get receptionist' },
      { status: 500 }
    )
  }
}
