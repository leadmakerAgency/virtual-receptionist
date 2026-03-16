'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Clock, PhoneCall, Calendar } from 'lucide-react'

export interface UserWithStats {
  id: string
  full_name: string | null
  email: string
  role: string
  created_at: string
  total_sessions: number
  total_duration_seconds: number
  last_session_at: string | null
}

interface UserTableProps {
  users: UserWithStats[]
}

const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '—'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

const formatDate = (isoString: string | null): string => {
  if (!isoString) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString))
}

export const UserTable = ({ users }: UserTableProps) => {
  if (users.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white py-12 text-center">
        <PhoneCall className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">No users yet</p>
        <p className="mt-1 text-xs text-gray-400">
          Users will appear here once they sign up.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700">User</TableHead>
            <TableHead className="font-semibold text-gray-700">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5" />
                Sessions
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Total Practice Time
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Last Session
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700">Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.full_name || 'Unnamed User'}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                {user.total_sessions > 0 ? (
                  <Badge
                    variant="outline"
                    className="border-indigo-200 bg-indigo-50 font-semibold text-indigo-700"
                  >
                    {user.total_sessions}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-400">0</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-gray-700">
                  {formatDuration(user.total_duration_seconds)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {formatDate(user.last_session_at)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
