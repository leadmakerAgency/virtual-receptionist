import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Overview</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage ElevenLabs conversational agents and their configuration in Supabase.
        </p>
      </div>

      <Card className="border-zinc-200">
        <CardHeader>
          <CardTitle className="text-lg">Agents</CardTitle>
          <CardDescription>
            Create agents with prompt, first line, and voice. Each agent syncs to ElevenLabs and is
            stored in your database for operations and integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/agents">Manage agents</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
