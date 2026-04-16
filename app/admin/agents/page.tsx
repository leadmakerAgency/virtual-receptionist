import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CoachLinkActions } from '@/components/admin/CoachLinkActions'

export default async function AdminAgentsPage() {
  const supabase = createAdminClient()
  const { data: rows, error } = await supabase
    .from('virtual_receptionists')
    .select('id, slug, coach_public_id, name, agent_id, is_active, sort_order, updated_at')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Failed to load agents. Check the server logs and Supabase configuration.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-zinc-900 via-admin-accent to-admin-accent-mid bg-clip-text text-transparent">
              Agents
            </span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-600">
            ElevenLabs conversational agents and their local metadata.
          </p>
        </div>
        <Button
          asChild
          className="rounded-lg border-0 bg-gradient-to-r from-admin-accent via-admin-accent-mid to-admin-accent-light text-white shadow-md shadow-admin-accent/25 transition-[box-shadow,filter] hover:brightness-[1.05] hover:shadow-lg hover:shadow-admin-accent/30 focus-visible:ring-admin-accent/40"
        >
          <Link href="/admin/agents/new">Create agent</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-violet-200/50 bg-white/90 shadow-lg shadow-violet-900/[0.06] ring-1 ring-violet-100/80 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-violet-200/50 bg-gradient-to-r from-violet-50/90 via-purple-50/50 to-admin-accent-faint/40 hover:bg-gradient-to-r hover:from-violet-50/90 hover:via-purple-50/50 hover:to-admin-accent-faint/40">
              <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-violet-900/70">
                Name
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-violet-900/70">
                Slug
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-violet-900/70">
                ElevenLabs ID
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-violet-900/70">
                Order
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-violet-900/70">
                Status
              </TableHead>
              <TableHead className="h-11 text-right text-xs font-semibold uppercase tracking-wider text-violet-900/70">
                Coach link
              </TableHead>
              <TableHead className="h-11 text-right text-xs font-semibold uppercase tracking-wider text-violet-900/70">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-12 text-center text-sm text-zinc-500">
                  No agents yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              rows!.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-violet-100/60 transition-colors hover:bg-gradient-to-r hover:from-violet-50/40 hover:to-transparent"
                >
                  <TableCell className="font-medium text-zinc-900">{row.name}</TableCell>
                  <TableCell className="font-mono text-xs text-violet-900/75">{row.slug}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs text-zinc-500">
                    {row.agent_id ?? '—'}
                  </TableCell>
                  <TableCell className="tabular-nums text-zinc-700">{row.sort_order}</TableCell>
                  <TableCell>
                    {row.is_active ? (
                      <Badge className="border-0 bg-gradient-to-r from-admin-accent to-admin-accent-mid text-white shadow-sm shadow-admin-accent/25">
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="border border-violet-200/80 bg-violet-50/80 text-violet-800"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.is_active && row.coach_public_id ? (
                      <CoachLinkActions coachPublicId={row.coach_public_id} />
                    ) : row.is_active && !row.coach_public_id ? (
                      <span className="text-xs text-amber-600">
                        Run DB migration (coach_public_id), then save agent
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">Activate to share</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-violet-300/80 text-violet-900 hover:border-admin-accent/50 hover:bg-admin-accent-faint/90 hover:text-admin-accent"
                    >
                      <Link href={`/admin/agents/${row.id}/edit`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
