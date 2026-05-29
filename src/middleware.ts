import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Initialize Supabase safely
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update the request cookies so subsequent middleware/Server Components see them
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Recreate the response with the updated request headers
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // CRITICAL: Set ALL cookies on the final response object
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 4. Corrected Protected Paths
  // If your log page is actually just "/", we check for exact match coordinates.
  const protectedPaths = ['/feed', '/streaks', '/search', '/profile']
  const isProtectedPath = 
    pathname === '/' || protectedPaths.some((path) => pathname.startsWith(path))

  // 5. Redirect Logic
  // Not logged in -> Go to home
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Logged in and trying to access /auth -> Go to root (log page)
  if (pathname === '/auth' && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}