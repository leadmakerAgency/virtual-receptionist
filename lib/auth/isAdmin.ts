import type { User } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const parseAdminEmailAllowlist = (): Set<string> => {
  const raw = process.env.ADMIN_EMAILS?.trim()
  if (!raw) return new Set()
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )
}

export type AdminUser = {
  user: User
  role: 'admin' | 'user'
}

/**
 * Returns the current session user with profile role if authenticated.
 */
export const getSessionWithProfile = async (): Promise<AdminUser | null> => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile) return null

  return { user, role: profile.role }
}

/**
 * True when profile.role is admin and (if ADMIN_EMAILS is set) email is allowlisted.
 */
export const isAdminUser = (session: AdminUser): boolean => {
  if (session.role !== 'admin') return false
  const allowlist = parseAdminEmailAllowlist()
  if (allowlist.size === 0) return true
  const email = session.user.email?.toLowerCase()
  if (!email) return false
  return allowlist.has(email)
}

export const getAdminUser = async (): Promise<AdminUser | null> => {
  const session = await getSessionWithProfile()
  if (!session || !isAdminUser(session)) return null
  return session
}
