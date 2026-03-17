'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserTable, UserWithStats } from '@/components/admin/UserTable'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogOut, Settings, RefreshCw, Users, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalSessions: number
  totalPracticeTimeSeconds: number
  activeThisWeek: number
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m`
  return `${seconds}s`
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [users, setUsers] = useState<UserWithStats[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setAdminEmail(user.email ?? null)
    }
    init()
  }, [supabase])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'Failed to load users')
      }

      const { users: fetchedUsers } = await response.json()
      setUsers(fetchedUsers)

      // Compute summary stats
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const activeThisWeek = fetchedUsers.filter(
        (u: UserWithStats) =>
          u.last_session_at && new Date(u.last_session_at) >= weekAgo
      ).length

      setStats({
        totalUsers: fetchedUsers.length,
        totalSessions: fetchedUsers.reduce(
          (sum: number, u: UserWithStats) => sum + u.total_sessions,
          0
        ),
        totalPracticeTimeSeconds: fetchedUsers.reduce(
          (sum: number, u: UserWithStats) => sum + u.total_duration_seconds,
          0
        ),
        activeThisWeek,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load users'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <Image
                src="https://cdn.prod.website-files.com/635b136ad9dc07c8ea095fdb/6734c390a167ec14434b314a_LeadMaker%20Vector%20Logo-01%20-%20Copy-p-500.png"
                alt="LeadMaker logo"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <span className="font-semibold text-gray-900">Cold Call Coach</span>
              <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminEmail && (
              <span className="hidden text-sm text-gray-500 sm:block">
                {adminEmail}
              </span>
            )}
            <Link href="/admin/settings">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-gray-500 hover:text-gray-900"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Agent Settings</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 text-gray-500 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Team Performance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your team's cold call practice sessions and progress.
          </p>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="mt-0.5 text-sm text-gray-500">Total reps</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <PhoneCall className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              <p className="mt-0.5 text-sm text-gray-500">Total sessions</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(stats.totalPracticeTimeSeconds)}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">Total practice time</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeThisWeek}</p>
              <p className="mt-0.5 text-sm text-gray-500">Active this week</p>
            </div>
          </div>
        )}

        {/* Users section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Reps</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50" aria-live="assertive">
            <AlertDescription className="text-sm text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3 text-gray-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading users…</span>
            </div>
          </div>
        ) : (
          <UserTable users={users} />
        )}
      </main>
    </div>
  )
}
