'use client'

import { VirtualReceptionist } from '@/types/receptionist'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ReceptionistListProps {
  receptionists: VirtualReceptionist[]
  onDelete: (id: string) => void
}

export const ReceptionistList = ({ receptionists, onDelete }: ReceptionistListProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receptionists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No receptionists found. Create your first one!
              </TableCell>
            </TableRow>
          ) : (
            receptionists.map((receptionist) => (
              <TableRow key={receptionist.id}>
                <TableCell className="font-medium">{receptionist.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                    {receptionist.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={receptionist.is_active ? 'default' : 'secondary'}>
                    {receptionist.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(receptionist.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/${receptionist.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/receptionists/${receptionist.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(receptionist.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
