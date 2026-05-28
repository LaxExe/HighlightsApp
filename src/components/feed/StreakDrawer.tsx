'use client'

import { X } from 'lucide-react'
import FriendStreakCard from '@/components/feed/FriendStreakCard'

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

interface StreakDrawerProps {
  isOpen: boolean
  friendUsername: string | null
  streaks: Streak[]
  onClose: () => void
}

export default function StreakDrawer({
  isOpen,
  friendUsername,
  streaks,
  onClose,
}: StreakDrawerProps) {
  if (!isOpen || !friendUsername) return null

  const activeStreaks = streaks.filter(
    (streak) => streak.currentStreak > 0
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-base-700/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full flex flex-col shadow-2xl border-l border-base-200 animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-200 bg-white">
          <div>
            <h2 className="text-base font-semibold text-base-700">
              @{friendUsername}'s Streaks
            </h2>

            <p className="text-[11px] text-base-400">
              Currently active streaks
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-base-400 hover:text-base-600 hover:bg-base-100 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeStreaks.length > 0 ? (
            activeStreaks.map((streak) => (
              <FriendStreakCard
                key={streak.id}
                streak={streak}
              />
            ))
          ) : (
            <div className="bg-white border border-base-200 rounded-md p-8 text-center">
              <p className="text-sm text-base-500">
                @{friendUsername} has no active streaks today.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}