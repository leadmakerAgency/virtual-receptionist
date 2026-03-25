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

export default async function AdminAgentsPage() {
  const supabase = createAdminClient()
  const { data: rows, error } = await supabase
    .from('virtual_receptionists')
    .select('id, slug, name, agent_id, is_active, sort_order, updated_at')
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Agents</h1>
          <p className="mt-1 text-sm text-zinc-600">
            ElevenLabs conversational agents and their local metadata.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/agents/new">Create agent</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>ElevenLabs ID</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-zinc-500">
                  No agents yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              rows!.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-zinc-600">{row.slug}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs text-zinc-500">
                    {row.agent_id ?? '—'}
                  </TableCell>
                  <TableCell>{row.sort_order}</TableCell>
                  <TableCell>
                    {row.is_active ? (
                      <Badge className="bg-emerald-600">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
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
