'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LogForm from '@/components/log/LogForm'
import TodayView from '@/components/log/TodayView'

interface Highlight {
  text: string
  tag?: string | null
}

interface StreakMet {
  id: string
  name: string
}

interface DayLog {
  highlights: Highlight[]
  dailyScore: number | null
  sharedToFriends: boolean
  streaksMet?: StreakMet[]
  dayTags?: string[]
}

function todayLabel() {
  const now = new Date()

  return {
    weekday: now.toLocaleDateString('en-US', {
      weekday: 'long',
    }),

    full: now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  }
}

export default function LogPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [dayLog, setDayLog] = useState<DayLog | null>(null)

  const [error, setError] = useState<string | null>(null)

  const date = todayLabel()

  useEffect(() => {
    async function load() {
      try {
        setError(null)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        // instant redirect
        if (!session) {
          router.replace('/auth')
          return
        }

        const res = await fetch('/api/log', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        // no log yet
        if (res.status === 404) {
          setDayLog(null)
          return
        }

        if (!res.ok) {
          throw new Error('Failed to load log')
        }

        const data = await res.json()

        setDayLog(data)
      } catch (err) {
        console.error('Log page error:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'Unknown error'
        )

        setDayLog(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  // loading
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-base-400">
          Loading…
        </span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-base-50 overflow-y-auto">
      <div className="max-w-xl mx-auto w-full px-6 py-8 md:px-10">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-[11px] text-base-400 mb-1 tracking-wide">
            {date.weekday}
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-base-700">
            {date.full}
          </h1>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* MAIN CARD */}
        <div className="rounded-xl border border-base-200 bg-white p-6">

          {dayLog ? (
            <TodayView
              highlights={dayLog.highlights}
              dailyScore={dayLog.dailyScore}
              sharedToFriends={dayLog.sharedToFriends}
              streaksMet={dayLog.streaksMet ?? []}
              dayTags={dayLog.dayTags ?? []}
            />
          ) : (
            <LogForm
              onSubmitted={(log) => {
                setDayLog(log as DayLog)
              }}
            />
          )}

        </div>
      </div>
    </div>
  )
}