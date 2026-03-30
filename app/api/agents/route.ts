import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createRequestId, jsonError, jsonOk } from '@/lib/api/response'

export async function GET() {
  const requestId = createRequestId()
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return jsonError(401, { error: 'Unauthorized', code: 'unauthorized' }, requestId)
    }

    const { data, error } = await supabase
      .from('user_agent_assignments')
      .select(`
        virtual_receptionists!inner(
          id,
          slug,
          name,
          agent_id,
          voice_id,
          description,
          sort_order,
          is_active
        )
      `)
      .eq('user_id', user.id)
      .eq('virtual_receptionists.is_active', true)

    if (error) {
      console.error('Error listing agents:', error)
      return jsonError(
        500,
        { error: 'Failed to load assigned agents', code: 'load_assigned_agents_failed', details: error },
        requestId
      )
    }

    const agents = (data ?? [])
      .map((row) => row.virtual_receptionists)
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .sort((a, b) => {
        const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0)
        return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name)
      })
      .map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        agent_id: row.agent_id,
        voice_id: row.voice_id,
        description: row.description,
        sort_order: row.sort_order,
      }))

    return jsonOk({ agents }, 200, requestId)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load agents'
    console.error('GET /api/agents:', error)
    return jsonError(500, { error: message, code: 'internal_error' }, requestId)
  }
}
