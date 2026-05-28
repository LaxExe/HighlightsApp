'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import StreakCard from '@/components/streaks/StreakCard'
import NewStreakModal from '@/components/streaks/NewStreakModal'
import { Plus } from 'lucide-react'

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

export default function StreaksPage() {
  const router = useRouter()
  const [streaks, setStreaks] = useState<Streak[] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchStreaks() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/auth')
        return
      }

      const res = await fetch('/api/streaks', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setStreaks(data)
      }
    } catch (error) {
      console.error('Error fetching streaks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this streak?')) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const res = await fetch(`/api/streaks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        setStreaks((prev) =>
          prev ? prev.filter((s) => s.id !== id) : null
        )
      }
    } catch (error) {
      console.error('Error deleting streak:', error)
    }
  }

  useEffect(() => {
    fetchStreaks()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-base-400">Loading streaks…</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-base-50 overflow-y-auto">
      {/* FULL WIDTH PAGE CONTAINER */}
      <div className="w-full max-w-7xl mx-auto px-6 py-8 lg:px-12">
        
        {/* HEADER */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-base-700">
              Streaks
            </h1>
            <p className="mt-2 text-sm text-base-400">
              Track consistency and compound habits.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-base-300 bg-base-100 px-4 py-2.5 text-sm font-medium text-base-700 transition-all hover:bg-base-200 cursor-pointer"
          >
            <Plus size={16} />
            New Streak
          </button>
        </div>

        {/* LINEAR FULL WIDTH LIST */}
        {streaks && streaks.length > 0 ? (
          <div className="flex flex-col gap-6">
            {streaks.map((streak) => (
              <StreakCard
                key={streak.id}
                streak={streak}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-base-200 bg-white p-16 text-center shadow-sm flex flex-col items-center gap-4 animate-in fade-in duration-200">
            <div>
              <p className="mb-2 text-base font-medium text-base-600">
                No streaks yet
              </p>
              <p className="text-sm text-base-400">
                Create your first streak to start tracking consistency.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-700 transition-all hover:bg-base-200 cursor-pointer"
            >
              <Plus size={16} />
              Create First Streak
            </button>
          </div>
        )}
      </div>

      <NewStreakModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchStreaks}
      />
    </div>
  )
}