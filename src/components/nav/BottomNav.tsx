'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PenLine, Users, Flame, Search, User } from 'lucide-react'

const tabs = [
  { href: '/',        label: 'Log',     icon: PenLine },
  { href: '/feed',    label: 'Feed',    icon: Users },
  { href: '/streaks', label: 'Streaks', icon: Flame },
  { href: '/search',  label: 'Search',  icon: Search },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function SideNav() {
  const pathname = usePathname()

  if (pathname === '/auth') return null

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-56 bg-base-100 border-r border-base-200 flex-col py-8 px-4">
      <div className="px-3 mb-10">
        <h1 className="text-lg font-semibold text-base-700 tracking-tight">highlights</h1>
      </div>

      <nav className="flex flex-col gap-1">
        {tabs.map(tab => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-base-500 hover:bg-base-200 hover:text-base-700'
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}