'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (!session && pathname !== '/auth') {
        router.replace('/auth')
      } else if (session && pathname === '/auth') {
        router.replace('/')
      } else {
        setLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (!session && pathname !== '/auth') {
        router.replace('/auth')
      } else if (session && pathname === '/auth') {
        router.replace('/')
      } else {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [pathname, router])

  if (loading && pathname !== '/auth') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-50">
        <span className="text-sm text-base-400">Loading…</span>
      </div>
    )
  }

  return <>{children}</>
}
