import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Build a response we can attach cookies to
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  )

  // Refresh session — required for Server Components to access auth state
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes that never require auth
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/')

  if (!user) {
    // Unauthenticated — redirect everything except public routes to /login
    if (!isPublicRoute) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // User is authenticated — look up their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'user'

  // Redirect /login for already-authenticated users to their home
  if (pathname === '/login') {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = role === 'admin' ? '/admin' : '/practice'
    return NextResponse.redirect(homeUrl)
  }

  // Role-based access guards
  if (pathname.startsWith('/admin') && role !== 'admin') {
    const practiceUrl = request.nextUrl.clone()
    practiceUrl.pathname = '/practice'
    return NextResponse.redirect(practiceUrl)
  }

  if (pathname.startsWith('/practice') && role !== 'user') {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = '/admin'
    return NextResponse.redirect(adminUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
