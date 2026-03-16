import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/users — returns all users with aggregated coaching session stats
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Verify the requesting user is an admin
    const { data: requestingProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (requestingProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all profiles with role='user'
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('role', 'user')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Get auth users for email addresses (service role allows this)
    const { data: authUsersResponse } = await adminClient.auth.admin.listUsers()
    const authUsers = authUsersResponse?.users ?? []
    const emailMap = new Map(authUsers.map((u) => [u.id, u.email ?? '']))

    // Get aggregated session stats per user
    const userIds = profiles.map((p) => p.id)
    const { data: sessions, error: sessionsError } = await adminClient
      .from('coaching_sessions')
      .select('user_id, duration_seconds, started_at')
      .in('user_id', userIds)

    if (sessionsError) throw sessionsError

    // Build stats map
    const statsMap = new Map<
      string,
      { totalSessions: number; totalDurationSeconds: number; lastSession: string | null }
    >()

    for (const session of sessions ?? []) {
      const existing = statsMap.get(session.user_id) ?? {
        totalSessions: 0,
        totalDurationSeconds: 0,
        lastSession: null,
      }
      existing.totalSessions += 1
      existing.totalDurationSeconds += session.duration_seconds ?? 0
      if (
        !existing.lastSession ||
        new Date(session.started_at) > new Date(existing.lastSession)
      ) {
        existing.lastSession = session.started_at
      }
      statsMap.set(session.user_id, existing)
    }

    // Compose final user list
    const users = profiles.map((profile) => {
      const stats = statsMap.get(profile.id) ?? {
        totalSessions: 0,
        totalDurationSeconds: 0,
        lastSession: null,
      }
      return {
        id: profile.id,
        full_name: profile.full_name,
        email: emailMap.get(profile.id) ?? '',
        role: profile.role,
        created_at: profile.created_at,
        total_sessions: stats.totalSessions,
        total_duration_seconds: stats.totalDurationSeconds,
        last_session_at: stats.lastSession,
      }
    })

    return NextResponse.json({ users })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users'
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
