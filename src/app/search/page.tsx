'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DayLogCard from '@/components/search/DayLogCard'
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Hash,
} from 'lucide-react'

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

/* ───────────────────────────────────────────────────────────── */

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/* ───────────────────────────────────────────────────────────── */

function MiniCalendar({
  selected,
  onSelect,
  logDates,
}: {
  selected: string | null
  onSelect: (date: string | null) => void
  logDates: Set<string>
}) {
  const today = new Date()

  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })

  function prevMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month - 1)

      return {
        year: d.getFullYear(),
        month: d.getMonth(),
      }
    })
  }

  function nextMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month + 1)

      return {
        year: d.getFullYear(),
        month: d.getMonth(),
      }
    })
  }

  const firstDay = new Date(view.year, view.month, 1).getDay()

  const daysInMonth = new Date(
    view.year,
    view.month + 1,
    0
  ).getDate()

  function fmt(day: number) {
    return `${view.year}-${String(view.month + 1).padStart(
      2,
      '0'
    )}-${String(day).padStart(2, '0')}`
  }

  return (
    <div className="rounded-xl border border-base-200 bg-white p-4 shadow-lg select-none">
      {/* nav */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          className="rounded-md p-1 text-base-400 transition-colors hover:bg-base-100 hover:text-base-700 focus:outline-none"
        >
          <ChevronLeft size={15} />
        </button>

        <span className="text-xs font-semibold tracking-wide text-base-700">
          {MONTHS[view.month]} {view.year}
        </span>

        <button
          onClick={nextMonth}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          className="rounded-md p-1 text-base-400 transition-colors hover:bg-base-100 hover:text-base-700 focus:outline-none"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* weekdays */}
      <div className="mb-1 grid grid-cols-7">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-medium text-base-300"
          >
            {d}
          </div>
        ))}
      </div>

      {/* days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1

          const dateStr = fmt(day)

          const isSelected = selected === dateStr

          const hasLog = logDates.has(dateStr)

          const isToday =
            today.getFullYear() === view.year &&
            today.getMonth() === view.month &&
            today.getDate() === day

          return (
            <button
              key={day}
              disabled={!hasLog && !isSelected}
              onClick={() =>
                onSelect(isSelected ? null : dateStr)
              }
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className={`
                relative flex h-8 w-full items-center justify-center rounded-md text-[12px] transition-all focus:outline-none
                ${
                  isSelected
                    ? 'bg-base-700 font-semibold text-base-700'
                    : isToday
                    ? 'font-semibold text-base-700 ring-1 ring-base-300'
                    : hasLog
                    ? 'font-medium text-base-600 hover:bg-base-100'
                    : 'cursor-default text-base-300'
                }
              `}
            >
              {day}

              {hasLog && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-base-400" />
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <button
          onClick={() => onSelect(null)}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          className="mt-3 w-full text-center text-[11px] text-base-400 transition-colors hover:text-base-600 focus:outline-none"
        >
          Clear date
        </button>
      )}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────── */

function FilterPill({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-100 px-2.5 py-1 text-[11px] font-medium text-base-600">
      {label}

      <button
        onClick={onRemove}
        className="text-base-400 transition-colors hover:text-base-700"
      >
        <X size={11} />
      </button>
    </span>
  )
}

/* ───────────────────────────────────────────────────────────── */

export default function SearchPage() {
  const router = useRouter()

  const [dayLogs, setDayLogs] = useState<DayLog[]>([])

  const [allLogDates, setAllLogDates] = useState<Set<string>>(
    new Set()
  )

  const [userTags, setUserTags] = useState<string[]>([])

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null)

  const [selectedTag, setSelectedTag] =
    useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')

  const [committedQuery, setCommittedQuery] =
    useState('')

  const [loading, setLoading] = useState(true)

  const [loadingMore, setLoadingMore] =
    useState(false)

  const [nextCursor, setNextCursor] =
    useState<string | null>(null)

  const [activePanel, setActivePanel] = useState<
    'calendar' | 'tags' | null
  >(null)

  const panelRef = useRef<HTMLDivElement>(null)

  /* outside click */
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setActivePanel(null)
      }
    }

    document.addEventListener(
      'pointerdown',
      onPointerDown
    )

    return () =>
      document.removeEventListener(
        'pointerdown',
        onPointerDown
      )
  }, [])

  async function getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session
  }

  async function initSearch() {
    setLoading(true)

    try {
      const session = await getSession()

      if (!session) {
        router.replace('/auth')
        return
      }

      const tagRes = await fetch('/api/tags', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (tagRes.ok) {
        setUserTags(await tagRes.json())
      }

      const datesRes = await fetch('/api/log/dates', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (datesRes.ok) {
        const dates: string[] =
          await datesRes.json()

        setAllLogDates(new Set(dates))
      }

      await fetchLogs({ reset: true })
    } finally {
      setLoading(false)
    }
  }

  async function fetchLogs({
    reset = false,
    tag = selectedTag,
    query = committedQuery,
    date = selectedDate,
  }: {
    reset?: boolean
    tag?: string | null
    query?: string
    date?: string | null
  } = {}) {
    const session = await getSession()

    if (!session) return

    const url = new URL(
      '/api/search',
      window.location.origin
    )

    if (tag) {
      url.searchParams.append('tag', tag)
    }

    if (query) {
      url.searchParams.append('q', query)
    }

    if (date) {
      url.searchParams.append('date', date)
    }

    if (!reset && nextCursor) {
      url.searchParams.append('cursor', nextCursor)
    }

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
        setDayLogs((prev) => [
          ...prev,
          ...(data.dayLogs || []),
        ])
      }

      setNextCursor(data.nextCursor || null)
    }
  }

  useEffect(() => {
    initSearch()
  }, [])

  useEffect(() => {
    if (loading) return

    fetchLogs({
      reset: true,
      tag: selectedTag,
      query: committedQuery,
      date: selectedDate,
    })
  }, [selectedTag, committedQuery, selectedDate])

  function handleSearchKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === 'Enter') {
      setCommittedQuery(searchQuery)
      setActivePanel(null)
    }

    if (e.key === 'Escape') {
      setSearchQuery('')
      setCommittedQuery('')
    }
  }

  async function handleLoadMore() {
    setLoadingMore(true)

    await fetchLogs({ reset: false })

    setLoadingMore(false)
  }

  const hasFilters =
    !!selectedDate ||
    !!selectedTag ||
    !!committedQuery

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-base-400">
          Loading history…
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-base-50">
      <div className="mx-auto min-h-full w-full max-w-7xl px-6 py-8 lg:px-12">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-base-700">
            Search & History
          </h1>

          <p className="mt-2 text-sm text-base-400">
            Search by keyword, filter by tag, or jump
            to a specific day.
          </p>
        </div>

        {/* FILTER BAR */}
        <div
          ref={panelRef}
          className="relative mb-6"
        >
          <div className="flex items-center gap-2">

            {/* search */}
            <div className="relative flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="Search highlights… (Enter to search)"
                className="w-full rounded-lg border border-base-200 bg-white py-2.5 pl-9 pr-9 text-sm text-base-700 outline-none transition-colors placeholder:text-base-300 focus:border-base-400"
              />

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setCommittedQuery('')
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-300 transition-colors hover:text-base-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* calendar */}
            <button
              onClick={() =>
                setActivePanel((p) =>
                  p === 'calendar'
                    ? null
                    : 'calendar'
                )
              }
              style={{
                WebkitTapHighlightColor:
                  'transparent',
              }}
              className={`
                inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-[12px] font-medium transition-all
                focus:outline-none focus:ring-0 active:scale-[0.98]
                ${
                  activePanel === 'calendar' ||
                  selectedDate
                    ? 'border-base-400 bg-base-700 text-base-700'
                    : 'border-base-200 bg-white text-base-500 hover:border-base-300 hover:text-base-700'
                }
              `}
            >
              <Calendar size={13} />

              <span className="hidden sm:inline">
                {selectedDate
                  ? new Date(
                      selectedDate + 'T00:00:00'
                    ).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Date'}
              </span>
            </button>

            {/* tags */}
            <button
              onClick={() =>
                setActivePanel((p) =>
                  p === 'tags'
                    ? null
                    : 'tags'
                )
              }
              style={{
                WebkitTapHighlightColor:
                  'transparent',
              }}
              className={`
                inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-[12px] font-medium transition-all
                focus:outline-none focus:ring-0 active:scale-[0.98]
                ${
                  activePanel === 'tags' ||
                  selectedTag
                    ? 'border-base-400 bg-base-700 text-base-700'
                    : 'border-base-200 bg-white text-base-500 hover:border-base-300 hover:text-base-700'
                }
              `}
            >
              <Tag size={13} />

              <span className="hidden sm:inline">
                {selectedTag ?? 'Tags'}
              </span>
            </button>
          </div>

          {/* CALENDAR PANEL */}
          {activePanel === 'calendar' && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-72">
              <MiniCalendar
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d)
                  setActivePanel(null)
                }}
                logDates={allLogDates}
              />
            </div>
          )}

          {/* TAG PANEL */}
          {activePanel === 'tags' &&
            userTags.length > 0 && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-64 rounded-xl border border-base-200 bg-white p-3 shadow-lg">
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-base-300">
                  Filter by tag
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {userTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(
                          selectedTag === tag
                            ? null
                            : tag
                        )

                        setActivePanel(null)
                      }}
                      className={`
                        inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all
                        ${
                          selectedTag === tag
                            ? 'border-base-700 bg-base-700 text-base-700'
                            : 'border-base-200 text-base-500 hover:border-base-400 hover:text-base-700'
                        }
                      `}
                    >
                      <Hash size={9} />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* ACTIVE FILTERS */}
        {hasFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-base-400">
              Filtering by:
            </span>

            {committedQuery && (
              <FilterPill
                label={`"${committedQuery}"`}
                onRemove={() => {
                  setSearchQuery('')
                  setCommittedQuery('')
                }}
              />
            )}

            {selectedDate && (
              <FilterPill
                label={new Date(
                  selectedDate + 'T00:00:00'
                ).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                onRemove={() =>
                  setSelectedDate(null)
                }
              />
            )}

            {selectedTag && (
              <FilterPill
                label={`#${selectedTag}`}
                onRemove={() =>
                  setSelectedTag(null)
                }
              />
            )}
          </div>
        )}

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
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-xl border border-base-200 bg-white px-4 py-2 text-xs font-medium text-base-600 transition-colors hover:bg-base-100 disabled:opacity-50"
                >
                  {loadingMore
                    ? 'Loading…'
                    : 'Load older logs'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-base-200 bg-white p-12 text-center">
            <Search
              size={28}
              className="text-base-300"
            />

            <div>
              <p className="text-sm font-medium text-base-600">
                No entries found
              </p>

              <p className="mt-1 text-xs text-base-400">
                {hasFilters
                  ? 'Try adjusting your filters or clearing the date selection.'
                  : 'You have no logs yet. Start by logging your first day!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}