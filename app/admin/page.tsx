'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ReceptionistList } from '@/components/admin/ReceptionistList'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { VirtualReceptionist } from '@/types/receptionist'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [receptionists, setReceptionists] = useState<VirtualReceptionist[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [receptionistToDelete, setReceptionistToDelete] = useState<VirtualReceptionist | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
        return
      }
      fetchReceptionists()
    }

    checkAuth()
  }, [router, supabase])

  const fetchReceptionists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/admin/receptionists', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch receptionists')
      }

      const data = await response.json()
      setReceptionists(data.receptionists || [])
    } catch (error) {
      console.error('Error fetching receptionists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    const receptionist = receptionists.find((r) => r.id === id)
    if (receptionist) {
      setReceptionistToDelete(receptionist)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (!receptionistToDelete) return

    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`/api/admin/receptionists/${receptionistToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete receptionist')
      }

      setReceptionists(receptionists.filter((r) => r.id !== receptionistToDelete.id))
      setDeleteDialogOpen(false)
      setReceptionistToDelete(null)
    } catch (error: any) {
      alert(error.message || 'Failed to delete receptionist')
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Virtual Receptionists</h1>
          <p className="text-gray-600">Manage your AI receptionists</p>
        </div>
        <Link href="/admin/receptionists/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      <ReceptionistList
        receptionists={receptionists}
        onDelete={handleDelete}
      />

      {receptionistToDelete && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          name={receptionistToDelete.name}
          loading={deleting}
        />
      )}
    </div>
  )
}
