'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEFAULT_VOICE_ID } from '@/lib/elevenlabs/conversationConfig'
import { AgentUserAssignmentPanel } from '@/components/admin/AgentUserAssignmentPanel'

export type AgentFormValues = {
  slug: string
  name: string
  prompt: string
  first_message: string
  voice_id: string
  description: string
  sort_order: number
  is_active: boolean
}

const textareaClass =
  'border-input placeholder:text-muted-foreground flex min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm'

type AgentFormProps = {
  mode: 'create' | 'edit'
  agentId?: string
  initialValues: AgentFormValues
}

export const AgentForm = ({ mode, agentId, initialValues }: AgentFormProps) => {
  const router = useRouter()
  const [values, setValues] = useState<AgentFormValues>(initialValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange =
    (field: keyof AgentFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value
      if (field === 'sort_order') {
        const n = parseInt(v, 10)
        setValues((prev) => ({ ...prev, sort_order: Number.isNaN(n) ? 0 : n }))
        return
      }
      setValues((prev) => ({ ...prev, [field]: v }))
    }

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, is_active: e.target.checked }))
  }

  const readErrorMessage = async (res: Response, fallback: string) => {
    const requestId = res.headers.get('x-request-id')
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as { error?: unknown; requestId?: unknown; code?: unknown }
      const base = typeof data.error === 'string' && data.error.trim() ? data.error : fallback
      const id = (typeof data.requestId === 'string' && data.requestId) || requestId
      const code = typeof data.code === 'string' && data.code ? ` [${data.code}]` : ''
      return id ? `${base}${code} (request: ${id})` : `${base}${code}`
    }

    const text = await res.text()
    if (text.includes('<!doctype html') || text.includes('<html')) {
      return requestId
        ? `${fallback}. Server returned a non-JSON error (likely an unhandled server exception). (request: ${requestId})`
        : `${fallback}. Server returned a non-JSON error (likely an unhandled server exception).`
    }
    return requestId ? `${text.trim() || fallback} (request: ${requestId})` : text.trim() || fallback
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: values.slug.trim().toLowerCase(),
            name: values.name.trim(),
            prompt: values.prompt,
            first_message: values.first_message,
            voice_id: values.voice_id.trim(),
            description: values.description.trim() || null,
            sort_order: values.sort_order,
            is_active: values.is_active,
          }),
        })
        if (!res.ok) {
          setError(await readErrorMessage(res, 'Failed to create agent'))
          return
        }
        router.push('/admin/agents')
        router.refresh()
        return
      }

      if (!agentId) {
        setError('Missing agent id.')
        return
      }

      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: values.slug.trim().toLowerCase(),
          name: values.name.trim(),
          prompt: values.prompt,
          first_message: values.first_message,
          voice_id: values.voice_id.trim(),
          description: values.description.trim() || null,
          sort_order: values.sort_order,
          is_active: values.is_active,
        }),
      })
      if (!res.ok) {
        setError(await readErrorMessage(res, 'Failed to save'))
        return
      }
      router.push('/admin/agents')
      router.refresh()
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!agentId) return
    if (!window.confirm('Deactivate this agent? Users will no longer see it in practice.')) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, { method: 'DELETE' })
      if (!res.ok) {
        setError(await readErrorMessage(res, 'Failed to deactivate'))
        return
      }
      router.push('/admin/agents')
      router.refresh()
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[760px] space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={values.slug}
          onChange={handleChange('slug')}
          required
          disabled={mode === 'edit'}
          className={cn(mode === 'edit' && 'bg-zinc-50')}
          placeholder="e.g. skeptical-smb"
        />
        <p className="text-xs text-zinc-500">Lowercase letters, numbers, and hyphens. URL-safe.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={handleChange('name')}
          required
          placeholder="Friendly name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          value={values.description}
          onChange={handleChange('description')}
          className={textareaClass}
          rows={3}
          placeholder="Short note for learners"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">System prompt</Label>
        <textarea
          id="prompt"
          value={values.prompt}
          onChange={handleChange('prompt')}
          className={textareaClass}
          rows={8}
          required
          placeholder="Base instructions for the AI prospect"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="first_message">First line</Label>
        <textarea
          id="first_message"
          value={values.first_message}
          onChange={handleChange('first_message')}
          className={textareaClass}
          rows={3}
          required
          placeholder="What the agent says first when the call starts"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="voice_id">Voice ID</Label>
        <Input
          id="voice_id"
          value={values.voice_id}
          onChange={handleChange('voice_id')}
          placeholder={DEFAULT_VOICE_ID}
        />
        <p className="text-xs text-zinc-500">ElevenLabs voice id for TTS.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort order</Label>
          <Input
            id="sort_order"
            type="number"
            value={values.sort_order}
            onChange={handleChange('sort_order')}
          />
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input
            id="is_active"
            type="checkbox"
            checked={values.is_active}
            onChange={handleActiveChange}
            className="size-4 rounded border-zinc-300"
          />
          <Label htmlFor="is_active" className="cursor-pointer font-normal">
            Active (visible to users)
          </Label>
        </div>
      </div>

      {mode === 'edit' && agentId ? <AgentUserAssignmentPanel agentId={agentId} /> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {mode === 'create' ? 'Create agent' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        {mode === 'edit' && agentId && (
          <Button type="button" variant="destructive" onClick={handleDeactivate} disabled={loading}>
            Deactivate
          </Button>
        )}
      </div>
    </form>
  )
}
