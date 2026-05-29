'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NewStreakModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function NewStreakModal({
  isOpen,
  onClose,
  onCreated,
}: NewStreakModalProps) {
  const [name, setName] = useState('')
  const [condition, setCondition] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !condition.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get the local token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ''

      const res = await fetch('/api/streaks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          condition: condition.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create streak')
      }

      setName('')
      setCondition('')
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-700/40 backdrop-blur-sm">
      <div className="bg-white border border-base-200 rounded-md w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h2 className="text-base font-semibold text-base-700">Create New Streak</h2>
          <button
            onClick={onClose}
            className="p-1 text-base-400 hover:text-base-600 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-base-500 font-medium">Streak Name</label>
            <input
              type="text"
              className="border border-base-200 rounded-md px-3 py-2 text-sm text-base-700 outline-none focus:border-base-400 transition-colors bg-white"
              placeholder="No Junk Food, 1 Hour Coding, Gym Day"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-base-500 font-medium">
              Natural Language Condition
            </label>
            <textarea
              className="border border-base-200 rounded-md px-3 py-2 text-sm text-base-700 outline-none focus:border-base-400 transition-colors min-h-[80px] bg-white resize-none"
              placeholder="e.g. user did not eat fast food or sweets today"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            />
            <p className="text-[10px] text-base-400">
              The AI will read this condition to automatically evaluate your highlights each day.
            </p>
          </div>

          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

          <div className="flex justify-end gap-3 mt-4 border-t border-base-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-base-200 hover:bg-base-100 rounded-md text-[13px] font-medium text-base-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-base-100 hover:bg-base-200 text-base-700 border border-base-300 rounded-md text-[13px] font-medium transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Streak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
