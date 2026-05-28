'use client'

import { Star } from 'lucide-react'

interface Highlight {
  text: string
}

interface FriendCardProps {
  friendUsername: string
  dailyScore: number | null
  highlights: Highlight[]
  onClick: () => void
}

export default function FriendCard({
  friendUsername,
  dailyScore,
  highlights,
  onClick,
}: FriendCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-base-200 rounded-xl px-6 py-5 cursor-pointer transition-all hover:border-base-300 hover:shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-accent-light text-accent flex items-center justify-center font-semibold text-sm shrink-0">
            {friendUsername[0]?.toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-base-700 text-sm truncate">
              @{friendUsername}
            </h3>

            <p className="text-[11px] text-base-400 mt-0.5">
              Shared today
            </p>
          </div>
        </div>

        {dailyScore !== null && (
          <div className="flex items-center gap-1.5 text-accent shrink-0">
            <Star size={13} className="fill-current" />

            <span className="text-[12px] font-semibold">
              {dailyScore}
            </span>
          </div>
        )}
      </div>

      {/* Highlights */}
      <div className="space-y-3">
        {highlights.map((h, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3"
          >
            <span className="text-[11px] text-base-400 font-medium pt-[2px] shrink-0">
              {String(idx + 1).padStart(2, '0')}
            </span>

            <p className="text-sm leading-relaxed text-base-600">
              {h.text}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-base-100 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.18em] text-base-400 font-medium">
          What Your friends did today
        </span>

        <span className="text-[11px] font-medium text-accent">
          View streaks
        </span>
      </div>
    </div>
  )
}