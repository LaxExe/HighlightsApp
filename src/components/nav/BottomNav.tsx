'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PenLine, Users, Flame, Search, User } from 'lucide-react'

const tabs = [
  { href: '/',        label: 'Log',     icon: PenLine },
  { href: '/feed',    label: 'Feed',    icon: Users },
  { href: '/streaks', label: 'Streaks', icon: Flame },
  { href: '/search',  label: 'Search',  icon: Search },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (pathname === '/auth') return null

  const handleNavClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      alert('Please sign up or log in first to access this page!')
    }
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-base-200">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={handleNavClick}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                isActive ? 'text-accent' : 'text-base-400'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}