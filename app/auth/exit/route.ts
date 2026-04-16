import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Clears the Supabase session in a Route Handler (reliable cookie writes)
 * when a signed-in user is not allowed to use the admin app.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('notice', 'forbidden')
  return NextResponse.redirect(url)
}
