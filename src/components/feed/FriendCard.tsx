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
      className="bg-white border border-base-200 rounded-md p-5 cursor-pointer transition-all hover:border-base-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center font-medium text-sm">
            {friendUsername[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-base-700 text-sm">
              @{friendUsername}
            </h3>
            <p className="text-[10px] text-base-400">Shared today</p>
          </div>
        </div>

        {dailyScore !== null && (
          <div className="flex items-center gap-1 bg-accent-light/50 border border-accent-light px-2 py-1 rounded text-xs font-semibold text-accent">
            <Star size={12} className="fill-current" />
            <span className="text-[11px]">Score</span>
            <span className="font-bold">{dailyScore}</span>
          </div>
        )}
      </div>

      <ul className="space-y-2 mb-1">
        {highlights.map((h, idx) => (
          <li
            key={idx}
            className="text-xs text-base-600 flex items-start gap-2 bg-base-50/50 p-2 rounded border border-base-200/30"
          >
            <span className="text-base-400 font-medium">{idx + 1}.</span>
            <span className="flex-1">{h.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-base-200 text-center">
        <span className="text-[10px] font-medium text-accent hover:text-accent-hover transition-colors uppercase tracking-wider">
          Tap to view streaks
        </span>
      </div>
    </div>
  )
}
