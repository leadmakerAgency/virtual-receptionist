'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ReceptionistForm } from '@/components/admin/ReceptionistForm'
import { DeleteDialog } from '@/components/admin/DeleteDialog'
import { VirtualReceptionist, ReceptionistFormData } from '@/types/receptionist'
import { createClient } from '@/lib/supabase/client'

export default function EditReceptionistPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [receptionist, setReceptionist] = useState<VirtualReceptionist | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchReceptionist = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        const response = await fetch(`/api/admin/receptionists/${id}`, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch receptionist')
        }

        const data = await response.json()
        setReceptionist(data.receptionist)
      } catch (error) {
        console.error(error)
        router.push('/admin')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchReceptionist()
    }
  }, [id, router, supabase])

  const handleSubmit = async (formData: ReceptionistFormData) => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`/api/admin/receptionists/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update receptionist')
      }

      router.push('/admin')
    } catch (error: any) {
      alert(error.message || 'Failed to update receptionist')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`/api/admin/receptionists/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete receptionist')
      }

      router.push('/admin')
    } catch (error: any) {
      alert(error.message || 'Failed to delete receptionist')
      console.error(error)
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (!receptionist) {
    return (
      <div className="container mx-auto py-8">
        <p>Receptionist not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <ReceptionistForm
        receptionist={receptionist}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin')}
        loading={saving}
      />

      <div className="mt-6">
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Delete Receptionist
        </button>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        name={receptionist.name}
        loading={deleting}
      />
    </div>
  )
}
