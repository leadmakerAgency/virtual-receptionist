import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const nextUrl = new URL(request.url)
  const code = nextUrl.searchParams.get('code')

  if (!code) {
    const errorUrl = new URL('/auth/confirmed', nextUrl.origin)
    errorUrl.searchParams.set('status', 'missing_code')
    return NextResponse.redirect(errorUrl)
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  const redirectUrl = new URL('/auth/confirmed', nextUrl.origin)
  redirectUrl.searchParams.set('status', error ? 'error' : 'success')
  return NextResponse.redirect(redirectUrl)
}

