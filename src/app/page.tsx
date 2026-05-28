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
    weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
    full: now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  }
}

export default function LogPage() {
  const router = useRouter()

  const [dayLog, setDayLog] = useState<DayLog | null | undefined>(undefined)
  const [locked, setLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const date = todayLabel()

  useEffect(() => {
    async function load() {
      try {
        setError(null)

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.replace('/auth')
          return
        }

        const res = await fetch('/api/log', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        const text = await res.text()

        // handle non-OK responses safely
        if (!res.ok) {
          if (res.status === 409) {
            setDayLog(null)
            setLocked(true)
            return
          }

          throw new Error(text || 'Failed to load log')
        }

        // safe JSON parse
        const data = JSON.parse(text)

        setDayLog(data)
        setLocked(false)

      } catch (err) {
        console.error('Log page error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setDayLog(null)
        setLocked(false)
      }
    }

    load()
  }, [router])

  // loading state
  if (dayLog === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-base-400">Loading…</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8 md:px-10">

          {/* Header */}
          <div className="mb-8">
            <p className="text-[11px] text-base-400 mb-1 tracking-wide">
              {date.weekday}
            </p>
            <h1 className="text-xl font-medium text-base-700">
              {date.full}
            </h1>
          </div>

          {/* error banner */}
          {error && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Main card */}
          <div className="border border-base-200 rounded-md bg-white p-6">

            {/* locked state */}
            {locked ? (
              dayLog ? (
                <TodayView
                  highlights={dayLog.highlights}
                  dailyScore={dayLog.dailyScore}
                  sharedToFriends={dayLog.sharedToFriends}
                  streaksMet={dayLog.streaksMet ?? []}
                  dayTags={dayLog.dayTags ?? []}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-base-600 font-medium">
                    You already logged today
                  </p>
                  <p className="text-xs text-base-400 mt-1">
                    Come back tomorrow for a new entry
                  </p>
                </div>
              )
            ) : (
              <>
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
                    onSubmitted={(log) => setDayLog(log as any)}
                  />
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}