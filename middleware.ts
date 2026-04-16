import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { isPublicCoachPathname } from '@/lib/validation/coachPublicId'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Avoid middleware-originated 5xx for API calls; API routes handle auth and JSON errors.
    if (pathname.startsWith('/api/')) {
      return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({ request })
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase public env vars for middleware auth checks.')
      return NextResponse.next({ request })
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isPublicCoachPath = isPublicCoachPathname(pathname)

    const isPublicRoute =
      pathname === '/login' || pathname.startsWith('/auth/') || isPublicCoachPath

    if (!user && !isPublicRoute) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    if (user && pathname === '/login') {
      const adminUrl = request.nextUrl.clone()
      adminUrl.pathname = '/admin/agents'
      return NextResponse.redirect(adminUrl)
    }

    return supabaseResponse
  } catch (error) {
    console.error('middleware failure:', error)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
