import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if user has a Supabase session token in cookies
  const supabaseSession = request.cookies.get('sb-auth-token')

  const protectedPaths = ['/log', '/feed', '/streaks', '/search', '/profile']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // If NOT logged in and trying to access protected pages, redirect to home
  if (isProtectedPath && !supabaseSession) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // If logged in and trying to access /auth, redirect to /log
  if (request.nextUrl.pathname === '/auth' && supabaseSession) {
    return NextResponse.redirect(new URL('/log', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/auth', '/log', '/feed', '/streaks', '/search', '/profile'],
}
