'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LogOut, UserRound } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { PracticeAgent } from '@/types/practiceAgent'

export default function PracticeAgentSelectionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [agents, setAgents] = useState<PracticeAgent[]>([])
  const [selectedAgentRecordId, setSelectedAgentRecordId] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUserEmail(user.email ?? null)

        const { data: sessionData } = await supabase.auth.getSession()
        const response = await fetch('/api/agents', {
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
        })
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: unknown } | null
          const message =
            payload && typeof payload.error === 'string' ? payload.error : 'Failed to load your assigned agents.'
          throw new Error(message)
        }

        const payload = (await response.json()) as { agents?: PracticeAgent[] }
        const list = payload.agents ?? []
        setAgents(list)
        if (list[0]) {
          setSelectedAgentRecordId(list[0].id)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load your assigned agents.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleContinue = () => {
    if (!selectedAgentRecordId) return
    router.push(`/practice?agent=${encodeURIComponent(selectedAgentRecordId)}`)
  }

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentRecordId) ?? null,
    [agents, selectedAgentRecordId]
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading assigned agents...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-zinc-50">
      <header className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-purple-100 bg-white/90 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Image
            src="https://cdn.prod.website-files.com/635b136ad9dc07c8ea095fdb/6734c390a167ec14434b314a_LeadMaker%20Vector%20Logo-01%20-%20Copy-p-500.png"
            alt="LeadMaker logo"
            width={120}
            height={120}
            className="h-10 w-auto object-contain"
          />
          <span className="font-semibold text-zinc-900">Cold Call Coach</span>
        </div>
        <div className="flex items-center gap-3">
          {userEmail ? <span className="text-sm text-zinc-500">{userEmail}</span> : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 text-zinc-500 hover:text-zinc-900"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-24">
        <h1 className="text-3xl font-bold text-zinc-900">Select Your Practice Agent</h1>
        <p className="mt-2 text-zinc-600">
          Choose one of the agents assigned to you by your admin, then continue to the practice setup.
        </p>

        {error ? (
          <Alert className="mt-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        ) : null}

        {!error && agents.length === 0 ? (
          <Alert className="mt-6 border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              No agents are assigned to your account yet. Contact your administrator.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {agents.map((agent) => {
            const isSelected = selectedAgentRecordId === agent.id
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgentRecordId(agent.id)}
                className={`rounded-xl border bg-white p-0 text-left transition ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-200'
                    : 'border-zinc-200 hover:border-purple-300'
                }`}
              >
                <Card className="border-none shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-zinc-900">
                      <span>{agent.name}</span>
                      {isSelected ? <CheckCircle2 className="size-5 text-purple-600" /> : null}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-zinc-600">
                      {agent.description || 'No description provided for this agent.'}
                    </p>
                    <p className="text-xs text-zinc-400">Slug: {agent.slug}</p>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>

        <div className="mt-8 rounded-xl border border-purple-100 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <UserRound className="size-4 text-purple-600" />
            Selected agent: <span className="font-medium text-zinc-900">{selectedAgent?.name ?? 'None'}</span>
          </div>
          <Button
            className="mt-4 bg-purple-600 text-white hover:bg-purple-700"
            disabled={!selectedAgentRecordId}
            onClick={handleContinue}
          >
            Continue to Ready to Practice
          </Button>
        </div>
      </main>
    </div>
  )
}
