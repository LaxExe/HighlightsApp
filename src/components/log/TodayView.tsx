interface Highlight {
  text: string
  tag?: string | null
}

interface TodayViewProps {
  highlights: Highlight[]
  dailyScore: number | null
  sharedToFriends: boolean
  streaksMet?: { id: string; name: string }[]
  dayTags?: string[]
}

export default function TodayView({
  highlights,
  dailyScore,
  sharedToFriends,
  streaksMet = [],
  dayTags = [],
}: TodayViewProps) {
  return (
    <div>
      {/* HEADER */}
      <p className="text-[11px] font-medium tracking-widest uppercase text-base-400 mb-4">
        Today's highlights
      </p>

      {/* SCORE */}
      {dailyScore !== null && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-baseline gap-0.5 bg-base-100 rounded-xl px-3 py-1.5">
            <span className="text-2xl font-medium text-base-700 leading-none">
              {dailyScore}
            </span>
            <span className="text-[12px] text-base-400">/10</span>
          </div>
          <span className="text-[12px] text-base-500">today's score</span>
        </div>
      )}

      {/* 🔥 STREAKS */}
      {streaksMet.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-base-400 mb-2">
            Streaks completed
          </p>

          <div className="flex flex-wrap gap-2">
            {streaksMet.map((s) => (
              <span
                key={s.id}
                className="px-2 py-1 rounded-xl bg-accent-light text-accent text-[11px] font-medium border border-base-200"
              >
                🔥 {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 🏷️ TAGS */}
      {dayTags.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider text-base-400 mb-2">
            Tags
          </p>

          <div className="flex flex-wrap gap-2">
            {dayTags.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="px-2 py-1 rounded-xl bg-base-100 text-base-600 text-[11px] border border-base-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* HIGHLIGHTS */}
      <div className="mb-5">
        {highlights.map((h, i) => (
          <div
            key={`${h.text}-${i}`}
            className="flex items-start gap-3 py-2.5 border-b border-base-100 last:border-b-0 first:border-t first:border-base-100"
          >
            <span className="text-[11px] text-base-300 w-4 text-right shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-base-600 leading-relaxed">
              {h.text}
            </span>
          </div>
        ))}
      </div>

      {/* STATUS */}
      <div className="flex items-center gap-2 text-[12px] text-base-400">
        {sharedToFriends ? (
          <span>👥 Shared with your friends today</span>
        ) : (
          <span>🔒 Not shared today — check back tomorrow</span>
        )}
      </div>
    </div>
  )
}