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
    <div className="bg-white border border-base-600 rounded-md p-5 transition-all hover:border-base-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-base-700 truncate">{streak.name}</h3>
            {streak.isDefault && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-light text-accent">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-base-500 line-clamp-2">
            {streak.condition}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isMetToday ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Flame size={12} className="fill-current" />
              Met Today
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-base-100 text-base-500 border border-base-200">
              Not Met
            </span>
          )}

          {!streak.isDefault && onDelete && (
            <button
              onClick={() => onDelete(streak.id)}
              className="p-1.5 text-base-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete custom streak"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 bg-base-50 p-3 rounded-md border border-base-200/50">
        <div className="text-center border-r border-base-200">
          <p className="text-[10px] uppercase tracking-wider text-base-400 font-medium mb-0.5">
            Current Streak
          </p>
          <p className="text-2xl font-semibold text-base-750 flex items-center justify-center gap-1">
            <Flame className={`w-5 h-5 ${streak.currentStreak > 0 ? 'text-accent fill-current' : 'text-base-300'}`} />
            {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-base-400 font-medium mb-0.5">
            Best Streak
          </p>
          <p className="text-2xl font-semibold text-base-750">
            {streak.bestStreak} day{streak.bestStreak !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <HeatmapCalendar history={streak.history} />
    </div>
  )
}
