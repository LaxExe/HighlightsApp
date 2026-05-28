'use client'

import { Star } from 'lucide-react'

interface Highlight {
  text: string
  tag?: string | null
}

interface DayLogCardProps {
  date: string | Date
  dailyScore: number | null
  highlights: Highlight[]
}

export default function DayLogCard({
  date,
  dailyScore,
  highlights,
}: DayLogCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-white border border-base-200 rounded-md p-5 transition-all hover:border-base-300">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-100">
        <h3 className="font-semibold text-base-700 text-sm">{formattedDate}</h3>

        {dailyScore !== null && (
          <div className="flex items-center gap-1 bg-accent-light text-accent px-2 py-0.5 rounded text-xs font-semibold">
            <Star size={11} className="fill-current" />
            <span className="text-[10px]">Score</span>
            <span className="font-bold">{dailyScore}</span>
          </div>
        )}
      </div>

      <ul className="space-y-3">
        {highlights.map((h, idx) => (
          <li key={idx} className="flex flex-col gap-1">
            <div className="flex items-start gap-2 text-xs text-base-650">
              <span className="text-base-400 font-medium">{idx + 1}.</span>
              <span className="flex-1 leading-relaxed">{h.text}</span>
            </div>
            {h.tag && (
              <div className="pl-5 flex">
                <span className="inline-flex items-center rounded-full bg-base-100 px-2 py-0.5 text-[9px] font-medium text-base-500 border border-base-200/50">
                  #{h.tag}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
