'use client'

import {
  Flame,
  Hash,
  Share2,
  Lock,
  Trophy,
} from 'lucide-react'

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
      <div className="mb-8">
        <p className="mb-1 text-[11px] tracking-wide text-base-400">
          Day Summary
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-base-700">
          Your highlights today
        </h2>
      </div>

      {/* SCORE */}
      {dailyScore !== null && (
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-end gap-1 rounded-xl border border-base-200 bg-base-100 px-5 py-3">
            <span className="text-3xl font-semibold leading-none text-base-700">
              {dailyScore}
            </span>

            <span className="mb-1 text-sm text-base-400">
              /10
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Trophy
                size={15}
                className="text-base-400"
              />

              <p className="text-sm font-semibold text-base-700">
                Daily score
              </p>
            </div>

            <p className="mt-1 text-xs text-base-400">
              AI-generated reflection score
            </p>
          </div>
        </div>
      )}

      {/* STREAKS */}
      <div className="mb-8">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <Flame
              size={15}
              className="text-base-700"
            />

            <p className="text-sm font-semibold text-base-700">
              Streaks completed
            </p>
          </div>

          <p className="mt-1 text-xs text-base-400">
            Habits you successfully maintained today
          </p>
        </div>

        {streaksMet.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {streaksMet.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-green-200 bg-green-50 px-3 py-2"
              >
                <span className="text-[12px] font-semibold text-green-700">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-base-200 bg-base-50 px-4 py-3">
            <p className="text-sm font-medium text-base-600">
              No streaks met today
            </p>

            <p className="mt-1 text-xs text-base-400">
              Complete your habits to continue your streaks.
            </p>
          </div>
        )}
      </div>

      {/* TAGS */}
      <div className="mb-8">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <Hash
              size={15}
              className="text-base-400"
            />

            <p className="text-sm font-semibold text-base-700">
              Themes & tags
            </p>
          </div>

          <p className="mt-1 text-xs text-base-400">
            Topics detected from your highlights
          </p>
        </div>

        {dayTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dayTags.map((tag, i) => (
              <div
                key={`${tag}-${i}`}
                className="rounded-xl border border-base-200 bg-base-100 px-3 py-2"
              >
                <span className="text-[12px] font-medium text-base-600">
                  #{tag}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-base-200 bg-base-50 px-4 py-3">
            <p className="text-sm font-medium text-base-600">
              No tags detected
            </p>

            <p className="mt-1 text-xs text-base-400">
              Tags will appear once your highlights are categorized.
            </p>
          </div>
        )}
      </div>

      {/* HIGHLIGHTS */}
      <div className="mb-8">
        <div className="mb-3">
          <p className="text-sm font-semibold text-base-700">
            Highlights
          </p>

          <p className="mt-1 text-xs text-base-400">
            Your submitted reflections for today
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-base-200 bg-white">
          {highlights.map((h, i) => (
            <div
              key={`${h.text}-${i}`}
              className="flex items-start gap-4 border-b border-base-100 px-5 py-4 last:border-b-0"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-base-200 bg-base-100">
                <span className="text-[11px] font-semibold text-base-500">
                  {i + 1}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-sm leading-relaxed text-base-700">
                  {h.text}
                </p>

                {h.tag && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-lg border border-base-200 bg-base-50 px-2 py-1">
                    <Hash
                      size={11}
                      className="text-base-400"
                    />

                    <span className="text-[11px] text-base-500">
                      {h.tag}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHARE STATUS */}
      <div className="rounded-xl border border-base-200 bg-base-50 px-4 py-3">
        <div className="flex items-center gap-2">
          {sharedToFriends ? (
            <>
              <Share2
                size={15}
                className="text-base-500"
              />

              <div>
                <p className="text-sm font-medium text-base-700">
                  Shared with friends
                </p>

                <p className="text-xs text-base-400">
                  Your highlights were visible in the feed today
                </p>
              </div>
            </>
          ) : (
            <>
              <Lock
                size={15}
                className="text-base-500"
              />

              <div>
                <p className="text-sm font-medium text-base-700">
                  Not shared today
                </p>

                <p className="text-xs text-base-400">
                  Your entry stayed private today
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}