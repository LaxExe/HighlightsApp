import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export async function getUserId(req: NextRequest): Promise<string | null> {
  // 1. Try Authorization header first since client-side supabase-js uses Authorization headers
  const authHeader = req.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error) {
        console.error('Supabase auth.getUser error:', error)
      }
      if (user) {
        return user.id
      }
    } catch (fetchErr) {
      console.warn('Supabase fetch failed, falling back to local JWT decoding:', fetchErr)
    }

    // Local JWT decoding fallback in case of connection reset / network issues
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payloadB64 = parts[1]
        const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8')
        const payload = JSON.parse(payloadStr)
        if (payload && payload.sub) {
          if (payload.exp && Date.now() / 1000 > payload.exp) {
            console.warn('Decoded JWT is expired')
            return null
          }
          return payload.sub
        }
      }
    } catch (jwtErr) {
      console.error('Failed to decode JWT locally:', jwtErr)
    }
  }

  // 2. Fallback to cookies
  try {
    const cookieStore = await cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )
    const { data: { session }, error } = await supabaseServer.auth.getSession()
    if (error) {
      console.error('Supabase cookie auth error:', error)
    }
    return session?.user?.id ?? null
  } catch (e) {
    console.error('Fallback cookie error:', e)
    return null
  }
}
