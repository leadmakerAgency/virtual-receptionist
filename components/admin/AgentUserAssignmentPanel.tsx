'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Users } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AssignmentUser = {
  id: string
  email: string
  full_name: string | null
}

type UsersResponse = { users: AssignmentUser[] }
type AssignmentResponse = { userIds: string[] }

const formatError = async (res: Response, fallback: string) => {
  const contentType = res.headers.get('content-type') ?? ''
  const requestId = res.headers.get('x-request-id')
  if (contentType.includes('application/json')) {
    const data = (await res.json()) as { error?: unknown; code?: unknown; requestId?: unknown }
    const base = typeof data.error === 'string' && data.error.trim() ? data.error : fallback
    const code = typeof data.code === 'string' ? ` [${data.code}]` : ''
    const id =
      (typeof data.requestId === 'string' && data.requestId.length > 0 ? data.requestId : null) ??
      requestId
    return id ? `${base}${code} (request: ${id})` : `${base}${code}`
  }

  const text = (await res.text()).trim()
  return requestId ? `${text || fallback} (request: ${requestId})` : text || fallback
}

type AgentUserAssignmentPanelProps = {
  agentId: string
}

export const AgentUserAssignmentPanel = ({ agentId }: AgentUserAssignmentPanelProps) => {
  const [users, setUsers] = useState<AssignmentUser[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const [usersRes, assignedRes] = await Promise.all([
          fetch('/api/admin/agent-assignments/users'),
          fetch(`/api/admin/agent-assignments/${agentId}`),
        ])

        if (!usersRes.ok) {
          setError(await formatError(usersRes, 'Failed to load users'))
          return
        }

        if (!assignedRes.ok) {
          setError(await formatError(assignedRes, 'Failed to load current assignments'))
          return
        }

        const usersPayload = (await usersRes.json()) as UsersResponse
        const assignedPayload = (await assignedRes.json()) as AssignmentResponse
        setUsers(usersPayload.users ?? [])
        setSelectedUserIds(assignedPayload.userIds ?? [])
      } catch {
        setError('Failed to load assignments.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [agentId])

  const handleToggleUser = (userId: string) => {
    setError(null)
    setSuccess(null)
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSaveAssignments = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/admin/agent-assignments/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds }),
      })

      if (!res.ok) {
        setError(await formatError(res, 'Failed to save assignments'))
        return
      }

      setSuccess(`Assignments saved for ${selectedUserIds.length} user${selectedUserIds.length === 1 ? '' : 's'}.`)
    } catch {
      setError('Failed to save assignments.')
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users
    return users.filter((user) => {
      const email = user.email.toLowerCase()
      const fullName = (user.full_name ?? '').toLowerCase()
      return email.includes(query) || fullName.includes(query)
    })
  }, [search, users])

  return (
    <Card className="border-purple-100 bg-purple-50/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-900">
          <Users className="size-5 text-purple-600" />
          Assign Agent to Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-search">Search users</Label>
          <Input
            id="user-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email or name"
            disabled={loading}
            className="border-purple-200 focus-visible:ring-purple-200"
          />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Loader2 className="size-4 animate-spin" />
            Loading users and assignments...
          </div>
        ) : (
          <div className="max-h-64 space-y-2 overflow-auto rounded-md border border-purple-100 bg-white p-3">
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-zinc-500">No users found.</p>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id)
                return (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-purple-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-zinc-900">{user.email}</span>
                      {user.full_name ? (
                        <span className="block truncate text-xs text-zinc-500">{user.full_name}</span>
                      ) : null}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleUser(user.id)}
                      className="size-4 rounded border-zinc-300 accent-purple-600"
                    />
                  </label>
                )
              })
            )}
          </div>
        )}

        <p className="text-xs text-zinc-600">
          Assigned users: <span className="font-semibold text-purple-700">{selectedUserIds.length}</span>
        </p>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {success ? (
          <Alert className="border-purple-200 bg-purple-50 text-purple-900">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="button"
          onClick={handleSaveAssignments}
          disabled={loading || saving}
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Confirm Assignments
        </Button>
      </CardContent>
    </Card>
  )
}
