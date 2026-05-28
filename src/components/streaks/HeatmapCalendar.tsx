import { useMemo, useState } from 'react'
import { Flame, CheckCircle, AlertCircle } from 'lucide-react'

interface HeatmapCalendarProps {
  history: string[] | Date[]
  createdAt?: string | Date
}

export default function HeatmapCalendar({ history, createdAt }: HeatmapCalendarProps) {
  const [expanded, setExpanded] = useState(false)

  const historyDates = useMemo(() => {
    return new Set(
      history.map((d) => new Date(d).toISOString().split('T')[0])
    )
  }, [history])

  const todayStr = useMemo(
    () => new Date().toISOString().split('T')[0],
    []
  )

  const days = useMemo(() => {
    return Array.from({ length: 180 }, (_, idx) => {
      const d = new Date()
      d.setDate(d.getDate() - (179 - idx))
      return d
    })
  }, [])

  const stats = useMemo(() => {
    const last30 = days.slice(-30)
    const completed = last30.filter((d) =>
      historyDates.has(d.toISOString().split('T')[0])
    ).length
    const missed = last30.length - completed
    const streak = (() => {
      let count = 0
      for (let i = days.length - 1; i >= 0; i--) {
        const str = days[i].toISOString().split('T')[0]
        if (str > todayStr) continue
        if (historyDates.has(str)) count++
        else break
      }
      return count
    })()
    return { completed, missed, streak }
  }, [days, historyDates, todayStr])

  const daysMissedSinceCreation = useMemo(() => {
    if (!createdAt) return stats.missed
    
    const createdStr = new Date(createdAt).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    
    if (createdStr > today) return 0
    
    let countMissed = 0
    const start = new Date(createdStr)
    const end = new Date(today)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dStr = d.toISOString().split('T')[0]
      if (!historyDates.has(dStr)) {
        countMissed++
      }
    }
    return countMissed
  }, [createdAt, historyDates, stats.missed])

  function Day({ date, prevMet, nextMet }: { date: Date; prevMet?: boolean; nextMet?: boolean }) {
    const dateStr = date.toISOString().split('T')[0]
    const isMet = historyDates.has(dateStr)
    const isToday = dateStr === todayStr
    const isFuture = dateStr > todayStr

    return (
      <div className="relative group w-4 h-4">
        <div
          className={`
            w-4 h-4 transition-all z-10 relative
            ${isFuture
              ? 'bg-base-50 border border-base-200 rounded-sm'
              : isMet
                ? `bg-emerald-500 hover:bg-emerald-400 ${prevMet ? 'rounded-l-none' : 'rounded-l-sm'} ${nextMet ? 'rounded-r-none' : 'rounded-r-sm'}`
                : 'bg-base-200 hover:bg-base-300 rounded-sm'
            }
            ${isToday ? 'ring-2 ring-offset-1 ring-accent' : ''}
          `}
        />

        {isMet && nextMet && (
          <div className="absolute top-0 left-4 w-1 h-4 bg-emerald-500 z-0" />
        )}

        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-20 pointer-events-none">
          <div className="bg-base-100 border border-base-200 text-base-700 text-[10px] px-2 py-1.5 rounded-lg whitespace-nowrap shadow-md">
            <span className="font-medium text-base-700">
              {date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span
              className={`ml-1.5 font-medium ${
                isFuture
                  ? 'text-base-400'
                  : isMet
                    ? 'text-emerald-600'
                    : 'text-base-500'
              }`}
            >
              {isFuture ? '—' : isMet ? '· completed' : '· missed'}
            </span>
          </div>
          <div className="w-2 h-2 bg-base-100 border-b border-r border-base-200 rotate-45 mx-auto -mt-1" />
        </div>
      </div>
    )
  }

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

      {/* STATS ROW */}
      <div className="flex items-center gap-4 mb-3">
        {stats.streak > 0 && (stats.streak > 1 || expanded) && (
          <div className="flex items-center gap-1 text-orange-500">
            <Flame size={12} className="fill-current" />
            <span className="text-[11px] font-semibold text-base-700">
              {stats.streak} day streak
            </span>
          </div>
        )}

        {expanded && (
          <>
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle size={12} className="fill-current" />
              <span className="text-[11px] font-medium text-emerald-700">
                {stats.completed} completed
              </span>
            </div>

            <div className="flex items-center gap-1 text-base-500">
              <AlertCircle size={12} />
              <span className="text-[11px]">
                {daysMissedSinceCreation} missed
              </span>
            </div>
          </>
        )}
      </div>

      {/* COLLAPSED */}
      {!expanded && (
        <div className="flex flex-wrap gap-1">
          {previewDays.map((d, i) => {
            const dateStr = d.toISOString().split('T')[0]
            const isMet = historyDates.has(dateStr)
            
            const prevDay = previewDays[i - 1]
            const prevMet = prevDay ? historyDates.has(prevDay.toISOString().split('T')[0]) : false
            
            const nextDay = previewDays[i + 1]
            const nextMet = nextDay ? historyDates.has(nextDay.toISOString().split('T')[0]) : false
            
            return (
              <Day
                key={i}
                date={d}
                prevMet={isMet && prevMet}
                nextMet={isMet && nextMet}
              />
            )
          })}
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
                {monthDays.map((d, i) => {
                  const dateStr = d.toISOString().split('T')[0]
                  const isMet = historyDates.has(dateStr)
                  
                  const prevDay = monthDays[i - 1]
                  const prevMet = prevDay ? historyDates.has(prevDay.toISOString().split('T')[0]) : false
                  
                  const nextDay = monthDays[i + 1]
                  const nextMet = nextDay ? historyDates.has(nextDay.toISOString().split('T')[0]) : false
                  
                  return (
                    <Day
                      key={i}
                      date={d}
                      prevMet={isMet && prevMet}
                      nextMet={isMet && nextMet}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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