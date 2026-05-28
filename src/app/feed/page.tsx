'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import FriendCard from '@/components/feed/FriendCard'
import StreakDrawer from '@/components/feed/StreakDrawer'
import { Users } from 'lucide-react'

interface Streak {
  id: string
  name: string
  condition: string
  currentStreak: number
  bestStreak: number
  isDefault: boolean
  history: string[] | Date[]
}

interface Friend {
  id: string
  username: string
  avatarUrl: string | null
  streaks: Streak[]
}

interface FeedItem {
  id: string
  fromUserId: string
  toUserId: string
  date: string
  dayLogSnapshot: {
    highlights: Array<{ text: string }>
    dailyScore: number | null
  }
  fromUser: {
    id: string
    username: string
    avatarUrl: string | null
  }
}

export default function FeedPage() {
  const router = useRouter()

  const [friends, setFriends] = useState<Friend[]>([])
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  async function fetchFeed() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/auth')
        return
      }

      const res = await fetch('/api/friends', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setFriends(data.friends || [])
        setFeedItems(data.feedItems || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [])

  function handleCardClick(fromUserId: string) {
    const friend = friends.find((f) => f.id === fromUserId)

    if (friend) {
      setSelectedFriend(friend)
      setIsDrawerOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-base-400">Loading feed…</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-base-50 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-6 py-8 lg:px-12">

        {/* HEADER (NEW UNIFIED HIERARCHY) */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-base-700 tracking-tight">
            Friends Feed
          </h1>

          <p className="mt-2 text-sm text-base-400">
            A randomized daily look into your friends’ highlights.
          </p>
        </div>

        {/* FEED */}
        {feedItems.length > 0 ? (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <FriendCard
                key={item.id}
                friendUsername={item.fromUser.username}
                dailyScore={item.dayLogSnapshot.dailyScore}
                highlights={item.dayLogSnapshot.highlights}
                onClick={() => handleCardClick(item.fromUserId)}
              />
            ))}
          </div>
        ) : (
          <div className="w-full bg-white border border-base-200 rounded-xl p-12 text-center flex flex-col items-center gap-3">
            <Users size={34} className="text-base-300" />

            <div>
              <p className="text-sm font-medium text-base-600">
                No highlights shared today
              </p>
              <p className="text-xs text-base-400 mt-1 max-w-md mx-auto">
                Highlights are shared randomly with friends. Add more friends or check back later.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* DRAWER (unchanged behavior) */}
      <StreakDrawer
        isOpen={isDrawerOpen}
        friendUsername={selectedFriend?.username || null}
        streaks={selectedFriend?.streaks || []}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedFriend(null)
        }}
      />
    </div>
  )
}