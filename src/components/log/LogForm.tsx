'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import HighlightInput from './HighlightInput'

interface Highlight {
  text: string
  tag?: string | null
}

interface LogFormProps {
  onSubmitted: (log: {
    highlights: Highlight[]
    dailyScore: number | null
    sharedToFriends: boolean
  }) => void
}

export default function LogForm({ onSubmitted }: LogFormProps) {
  const [highlights, setHighlights] = useState(['', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filled = highlights.filter((h) => h.trim()).length

  function updateHighlight(i: number, val: string) {
    setHighlights((prev) =>
      prev.map((h, idx) => (idx === i ? val : h))
    )
  }

  function addHighlight() {
    if (highlights.length >= 7) return
    setHighlights((prev) => [...prev, ''])
  }

  function removeHighlight(i: number) {
    if (highlights.length <= 3) return
    setHighlights((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    const trimmed = highlights
      .map((h) => h.trim())
      .filter(Boolean)

    if (trimmed.length < 3) {
      setError('Add at least 3 highlights to continue')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error('Not logged in')

      const res = await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ highlights: trimmed }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Something went wrong')
      }

      const log = await res.json()
      onSubmitted(log)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-base-400">
        Today's highlights
      </p>

      <div className="mb-2">
        {highlights.map((val, i) => (
          <HighlightInput
            key={i}
            index={i}
            value={val}
            onChange={(v) => updateHighlight(i, v)}
            onRemove={() => removeHighlight(i)}
            canRemove={highlights.length > 3}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {highlights.length < 7 ? (
          <button
            onClick={addHighlight}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-base-200 px-3 py-2 text-[12px] text-base-500 transition-all hover:border-base-300 hover:bg-base-100 hover:text-base-700"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>

            Add highlight
          </button>
        ) : (
          <div />
        )}

        <span
          className={`text-[12px] ${
            error ? 'text-red-500' : 'text-base-400'
          }`}
        >
          {error ??
            (filled < 3
              ? `${filled} of 3 minimum`
              : `${filled} highlight${
                  filled !== 1 ? 's' : ''
                }`)}
        </span>
      </div>

      <div className="mt-6 flex justify-end border-t border-base-200 pt-5">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-base-300 bg-base-700 px-4 py-2 text-[13px] font-medium text-base-50 transition-all hover:border-base-400 hover:bg-base-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          )}

          {loading ? 'Logging…' : 'Log my day'}
        </button>
      </div>
    </div>
  )
}