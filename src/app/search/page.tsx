'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/search/SearchBar'
import TagFilterChips from '@/components/search/TagFilterChips'
import DayLogCard from '@/components/search/DayLogCard'
import { Search } from 'lucide-react'

interface Highlight {
  text: string
  tag?: string | null
}

interface DayLog {
  id: string
  date: string
  highlights: Highlight[]
  dailyScore: number | null
}

export default function SearchPage() {
  const router = useRouter()

  const [dayLogs, setDayLogs] = useState<DayLog[]>([])
  const [userTags, setUserTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  async function initSearch() {
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/auth')
        return
      }

      const profileRes = await fetch('/api/tags', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (profileRes.ok) {
        setUserTags(await profileRes.json())
      }

      await fetchLogs(true, null, null)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLogs(
    reset = false,
    tagToUse: string | null = selectedTag,
    queryToUse: string | null = activeQuery
  ) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return

    const url = new URL('/api/search', window.location.origin)

    if (tagToUse) url.searchParams.append('tag', tagToUse)
    if (queryToUse) url.searchParams.append('q', queryToUse)
    if (!reset && nextCursor) url.searchParams.append('cursor', nextCursor)

    url.searchParams.append('limit', '10')

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (res.ok) {
      const data = await res.json()

      if (reset) {
        setDayLogs(data.dayLogs || [])
      } else {
        setDayLogs((prev) => [...prev, ...(data.dayLogs || [])])
      }

      setNextCursor(data.nextCursor || null)
    }
  }

  useEffect(() => {
    initSearch()
  }, [])

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setActiveQuery(searchQuery)
    await fetchLogs(true, selectedTag, searchQuery)
  }

  async function handleSelectTag(tag: string | null) {
    setSelectedTag(tag)
    await fetchLogs(true, tag, activeQuery)
  }

  async function handleLoadMore() {
    setLoadingMore(true)
    await fetchLogs(false, selectedTag, activeQuery)
    setLoadingMore(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-base-400">Loading history…</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-base-50 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-6 py-8 lg:px-12">

        {/* HEADER (MATCHES LOG + STREAK STYLE) */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-base-700 tracking-tight">
            Search & History
          </h1>

          <p className="mt-2 text-sm text-base-400">
            Search your past logs or filter them by tags.
          </p>
        </div>

        {/* SEARCH CONTROLS */}
        <div className="mb-8 space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            loading={loading}
          />

          {userTags.length > 0 && (
            <TagFilterChips
              tags={userTags}
              selectedTag={selectedTag}
              onSelectTag={handleSelectTag}
            />
          )}
        </div>

        {/* RESULTS */}
        {dayLogs.length > 0 ? (
          <div className="space-y-6">
            {dayLogs.map((log) => (
              <DayLogCard
                key={log.id}
                date={log.date}
                dailyScore={log.dailyScore}
                highlights={log.highlights}
              />
            ))}

            {nextCursor && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 rounded-xl border border-base-200 bg-white hover:bg-base-100 text-xs font-medium text-base-600 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading…' : 'Load older logs'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full bg-white border border-base-200 rounded-xl p-12 text-center flex flex-col items-center gap-3">
            <Search size={32} className="text-base-300" />

            <div>
              <p className="text-sm font-medium text-base-600">
                No entries found
              </p>
              <p className="text-xs text-base-400 mt-1">
                Try adjusting your search or removing filters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}