'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserPlus, X } from 'lucide-react'

interface Friend {
  id: string
  username: string
}

interface FriendRequestsProps {
  friends: Friend[]
  receivedRequests: Friend[]
  onActionSuccess: () => void
}

export default function FriendRequests({
  friends = [],
  receivedRequests = [],
  onActionSuccess,
}: FriendRequestsProps) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function sendRequest() {
    if (!username.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username: username.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send request')
      }

      setUsername('')
      setMessage('Friend request sent')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleAcceptRequest(userId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ requestId: userId, action: 'accept' }),
      })

      const data = await res.json()

      console.log('ACCEPT FRIEND RESPONSE:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept request')
      }

      onActionSuccess()
    } catch (error) {
      console.error('ACCEPT FRIEND ERROR:', error)
    }
  }

  async function handleRemoveFriend(friendId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const res = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ friendId }),
      })

      if (!res.ok) {
        throw new Error('Failed to remove friend')
      }

      onActionSuccess()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="bg-white border border-base-200 rounded-xl p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-base-700">
          Friends
        </h2>

        <p className="text-xs text-base-400 mt-1">
          Manage your social connections
        </p>
      </div>

      {/* ADD FRIEND */}
      <div className="flex gap-3 mb-6">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Add by username"
          className="flex-1 border border-base-200 rounded-xl px-3 py-2 text-sm"
        />

        <button
          onClick={sendRequest}
          disabled={loading}
          className="px-4 py-2 bg-base-700 hover:bg-base-600 text-base-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <UserPlus size={15} />
          Add
        </button>
      </div>

      {message && (
        <div className="mb-6 text-xs text-base-500">
          {message}
        </div>
      )}

      {/* FRIENDS LIST */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-base-400">
            Current Friends
          </p>

          <span className="text-xs text-base-400">
            {friends.length}
          </span>
        </div>

        {friends.length > 0 ? (
          <div className="divide-y divide-base-100">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center text-sm font-semibold">
                    {friend.username[0]?.toUpperCase()}
                  </div>

                  <span className="text-sm text-base-700 font-medium">
                    @{friend.username}
                  </span>
                </div>

                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="p-1 text-base-400 hover:text-red-500 transition-colors"
                  aria-label="Remove friend"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-400">
            No friends yet.
          </p>
        )}
      </div>

      {/* FRIEND REQUESTS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-base-400">
            Friend Requests
          </p>

          <span className="text-xs text-base-400">
            {receivedRequests.length}
          </span>
        </div>

        {receivedRequests.length > 0 ? (
          <div className="space-y-3">
            {receivedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between border border-base-200 rounded-xl px-4 py-3"
              >
                <span className="text-sm text-base-700">
                  @{request.username}
                </span>

                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-400">
            No pending requests.
          </p>
        )}
      </div>
    </div>
  )
}