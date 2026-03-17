'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogOut, ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface AgentRow {
  id: string
  name: string
  prompt: string | null
  first_message: string | null
  voice_id: string | null
  agent_id: string | null
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [agent, setAgent] = useState<AgentRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [voiceId, setVoiceId] = useState('')

  const fetchAgent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const response = await fetch('/api/admin/agent', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'Failed to load agent')
      }
      const { agent: fetchedAgent } = await response.json()
      if (fetchedAgent) {
        setAgent(fetchedAgent)
        setName(fetchedAgent.name ?? '')
        setPrompt(fetchedAgent.prompt ?? '')
        setFirstMessage(fetchedAgent.first_message ?? '')
        setVoiceId(fetchedAgent.voice_id ?? '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const response = await fetch('/api/admin/agent', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name,
          prompt,
          first_message: firstMessage,
          voice_id: voiceId,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'Failed to save agent')
      }

      const { agent: updated } = await response.json()
      setAgent(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save agent')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <Image
                src="https://cdn.prod.website-files.com/635b136ad9dc07c8ea095fdb/6734c390a167ec14434b314a_LeadMaker%20Vector%20Logo-01%20-%20Copy-p-500.png"
                alt="LeadMaker logo"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <span className="font-semibold text-gray-900">Cold Call Coach</span>
              <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
                Admin
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 text-gray-500 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Back nav */}
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Agent Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure the AI prospect your team practices against.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading agent settings…</span>
            </div>
          </div>
        ) : !agent ? (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              No active coaching agent found. Please create one via the admin API or
              ElevenLabs dashboard first.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSave}>
            {error && (
              <Alert className="mb-5 border-red-200 bg-red-50" aria-live="assertive">
                <AlertDescription className="text-sm text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert
                className="mb-5 border-green-200 bg-green-50"
                aria-live="polite"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-700">
                  Agent settings saved and synced to ElevenLabs.
                </AlertDescription>
              </Alert>
            )}

            <Card className="mb-5 border-gray-200">
              <CardContent className="p-6">
                <h2 className="mb-4 text-base font-semibold text-gray-900">
                  Basic Info
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="agent-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Agent name
                    </Label>
                    <Input
                      id="agent-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Cold Call Prospect"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="voice-id"
                      className="text-sm font-medium text-gray-700"
                    >
                      ElevenLabs Voice ID
                    </Label>
                    <Input
                      id="voice-id"
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                    />
                    <p className="text-xs text-gray-400">
                      Find voice IDs in your{' '}
                      <a
                        href="https://elevenlabs.io/voice-library"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-gray-600"
                      >
                        ElevenLabs voice library
                      </a>
                      .
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="first-message"
                      className="text-sm font-medium text-gray-700"
                    >
                      First message (opening line)
                    </Label>
                    <Input
                      id="first-message"
                      value={firstMessage}
                      onChange={(e) => setFirstMessage(e.target.value)}
                      placeholder='e.g. "Hello?"'
                    />
                    <p className="text-xs text-gray-400">
                      The first thing the AI prospect says when the call connects.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 border-gray-200">
              <CardContent className="p-6">
                <h2 className="mb-1 text-base font-semibold text-gray-900">
                  System Prompt
                </h2>
                <p className="mb-4 text-xs text-gray-500">
                  Instructions that define how the AI prospect behaves during the call.
                </p>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={14}
                  placeholder="You are a prospect who just received a cold call..."
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </CardContent>
            </Card>

            {agent.agent_id && (
              <p className="mb-4 text-xs text-gray-400">
                ElevenLabs Agent ID:{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 font-mono">
                  {agent.agent_id}
                </code>
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save & Sync to ElevenLabs
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
