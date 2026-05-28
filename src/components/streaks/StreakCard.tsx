'use client'

import HeatmapCalendar from './HeatmapCalendar'
import { Flame, Trash2 } from 'lucide-react'

interface Streak {
  id: string
  name: string
  condition: string
  currentStreak: number
  bestStreak: number
  isDefault: boolean
  history: string[] | Date[]
  createdAt: string | Date
}

interface StreakCardProps {
  streak: Streak
  onDelete?: (id: string) => void
}

export default function StreakCard({ streak, onDelete }: StreakCardProps) {
  const todayStr = new Date().toISOString().split('T')[0]
  const isMetToday = streak.history.some(
    (d) => new Date(d).toISOString().split('T')[0] === todayStr
  )

  return (
    <div className="bg-white border border-base-200 rounded-xl p-6 shadow-sm transition-all hover:border-base-300 flex flex-col gap-5">
      {/* Top Header Row: Spacious Title & Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-lg text-base-700">{streak.name}</h3>
            {streak.isDefault && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-light text-accent">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-base-500 leading-relaxed">
            {streak.condition}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isMetToday ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Met Today
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-base-100 text-base-500 border border-base-200">
              Not Met
            </span>
          )}

          {!streak.isDefault && onDelete && (
            <button
              onClick={() => onDelete(streak.id)}
              className="p-1.5 text-base-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
              aria-label="Delete custom streak"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Featured Streak Banner: Keep the streak alive! */}
      <div className="flex items-center justify-between bg-base-50 p-4 rounded-xl border border-base-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <Flame className={`w-6 h-6 ${streak.currentStreak > 0 ? 'text-accent fill-current' : 'text-base-300'}`} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-base-400 font-semibold">Current Streak</p>
            <p className="text-2xl font-bold text-base-700 leading-none mt-0.5">
              {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="text-right border-l border-base-200 pl-6">
          <p className="text-[10px] uppercase tracking-wider text-base-400 font-semibold">Best Streak</p>
          <p className="text-lg font-bold text-base-600 mt-0.5">
            {streak.bestStreak} day{streak.bestStreak !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Calendar Activity Section */}
      <div className="border-t border-base-100 pt-4">
        <HeatmapCalendar history={streak.history} createdAt={streak.createdAt} />
      </div>
    </div>
  )
}
