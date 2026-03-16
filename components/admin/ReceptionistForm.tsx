'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReceptionistFormData, VirtualReceptionist } from '@/types/receptionist'

interface ReceptionistFormProps {
  receptionist?: VirtualReceptionist
  onSubmit: (data: ReceptionistFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Default ElevenLabs voice

export const ReceptionistForm = ({
  receptionist,
  onSubmit,
  onCancel,
  loading = false,
}: ReceptionistFormProps) => {
  const [formData, setFormData] = useState<ReceptionistFormData>({
    slug: receptionist?.slug || '',
    name: receptionist?.name || '',
    prompt: receptionist?.prompt || 'You are a helpful virtual receptionist. Be friendly, professional, and assist callers with their inquiries.',
    first_message: receptionist?.first_message || 'Hello! Thank you for calling. How can I assist you today?',
    voice_id: receptionist?.voice_id || DEFAULT_VOICE_ID,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ReceptionistFormData, string>>>({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ReceptionistFormData, string>> = {}

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Prompt is required'
    }

    if (!formData.first_message.trim()) {
      newErrors.first_message = 'First message is required'
    }

    if (!formData.voice_id.trim()) {
      newErrors.voice_id = 'Voice ID is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      await onSubmit(formData)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {receptionist ? 'Edit Receptionist' : 'Create New Receptionist'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value.toLowerCase() })
              }
              placeholder="john"
              disabled={!!receptionist}
            />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug}</p>
            )}
            <p className="text-xs text-gray-500">
              URL-friendly identifier. Will be used as: /{formData.slug || 'slug'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John's Virtual Receptionist"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">System Prompt *</Label>
            <textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="You are a helpful virtual receptionist..."
            />
            {errors.prompt && (
              <p className="text-sm text-red-500">{errors.prompt}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="first_message">First Message *</Label>
            <Input
              id="first_message"
              value={formData.first_message}
              onChange={(e) =>
                setFormData({ ...formData, first_message: e.target.value })
              }
              placeholder="Hello! Thank you for calling..."
            />
            {errors.first_message && (
              <p className="text-sm text-red-500">{errors.first_message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice_id">Voice ID *</Label>
            <Input
              id="voice_id"
              value={formData.voice_id}
              onChange={(e) => setFormData({ ...formData, voice_id: e.target.value })}
              placeholder="21m00Tcm4TlvDq8ikWAM"
            />
            {errors.voice_id && (
              <p className="text-sm text-red-500">{errors.voice_id}</p>
            )}
            <p className="text-xs text-gray-500">
              ElevenLabs voice ID. Default: {DEFAULT_VOICE_ID}
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : receptionist ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
