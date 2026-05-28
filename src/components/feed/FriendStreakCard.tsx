'use client'

import { Flame } from 'lucide-react'

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

interface FriendStreakCardProps {
  streak: Streak
}

export default function FriendStreakCard({
  streak,
}: FriendStreakCardProps) {
  return (
    <div className="bg-white border border-base-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base text-base-700 truncate">
              {streak.name}
            </h3>

            {streak.isDefault && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-light text-accent shrink-0">
                Default
              </span>
            )}
          </div>

          <p className="text-xs text-base-500 leading-relaxed">
            {streak.condition}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-accent-light/40 border border-accent-light px-3 py-2 rounded-lg shrink-0">
          <Flame
            className={`w-4 h-4 ${
              streak.currentStreak > 0
                ? 'text-accent fill-current'
                : 'text-base-300'
            }`}
          />

          <span className="text-sm font-bold text-base-700">
            {streak.currentStreak}
          </span>
        </div>
      </div>
    </div>
  )
}