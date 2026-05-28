'use client'

import { useMemo, useState } from 'react'

interface HeatmapCalendarProps {
  history: string[] | Date[]
}

export default function HeatmapCalendar({ history }: HeatmapCalendarProps) {
  const [expanded, setExpanded] = useState(false)

  const historyDates = useMemo(() => {
    return new Set(
      history.map((d) => new Date(d).toISOString().split('T')[0])
    )
  }, [history])

  const todayStr = new Date().toISOString().split('T')[0]

  const days = useMemo(() => {
    return Array.from({ length: 180 }, (_, idx) => {
      const d = new Date()
      d.setDate(d.getDate() - (179 - idx))
      return d
    })
  }, [])

  function Day({ date }: { date: Date }) {
    const dateStr = date.toISOString().split('T')[0]
    const isMet = historyDates.has(dateStr)
    const isToday = dateStr === todayStr

    return (
      <div className="relative group w-4 h-4">
        <div
          className={`
            w-4 h-4 rounded-sm transition-all
            ${isMet ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-base-100 border border-base-200'}
            ${isToday ? 'ring-2 ring-accent' : ''}
          `}
        />

        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
          <div className="bg-base-700 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
            <span className="text-base-300 ml-1">
              {isMet ? '• completed' : '• empty'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // COLLAPSED VIEW (last 30 days)
  const previewDays = days.slice(-30)

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider text-base-400">
          Activity
        </span>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] text-base-500 hover:text-base-700 transition"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* COLLAPSED */}
      {!expanded && (
        <div className="flex flex-wrap gap-1">
          {previewDays.map((d, i) => (
            <Day key={i} date={d} />
          ))}
        </div>
      )}

      {/* EXPANDED */}
      {expanded && (
        <div className="space-y-4 overflow-x-auto pb-2">

          {groupByMonth(days).map(([label, monthDays]) => (
            <div key={label} className="flex items-start gap-3">

              <div className="w-10 shrink-0 text-[10px] text-base-400 pt-1">
                {label}
              </div>

              <div className="flex flex-wrap gap-1">
                {monthDays.map((d, i) => (
                  <Day key={i} date={d} />
                ))}
              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  )
}

// helper
function groupByMonth(days: Date[]) {
  const map: Record<string, Date[]> = {}

  days.forEach((d) => {
    const key = d.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })

    if (!map[key]) map[key] = []
    map[key].push(d)
  })

  return Object.entries(map)
}