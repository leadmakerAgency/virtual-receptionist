'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReceptionistForm } from '@/components/admin/ReceptionistForm'
import { ReceptionistFormData } from '@/types/receptionist'
import { createClient } from '@/lib/supabase/client'

export default function NewReceptionistPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (data: ReceptionistFormData) => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/admin/receptionists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create receptionist')
      }

      router.push('/admin')
    } catch (error: any) {
      alert(error.message || 'Failed to create receptionist')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <ReceptionistForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin')}
        loading={loading}
      />
    </div>
  )
}
