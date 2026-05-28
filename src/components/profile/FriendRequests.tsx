'use client'

import { useState } from 'react'
import { Plus, UserCheck, UserX, Users } from 'lucide-react'

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
  friends,
  receivedRequests,
  onActionSuccess,
}: FriendRequestsProps) {
  const [usernameInput, setUsernameInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!usernameInput.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const sessionStr = localStorage.getItem('sb-ovdhumnqyhthbwdnkfui-auth-token')
      let token = ''
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr)
        token = parsed.access_token ?? ''
      }

      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: usernameInput.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to send request')
      }

      setMessage({ text: data.message || 'Friend request sent!', isError: false })
      setUsernameInput('')
      onActionSuccess()
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Something went wrong',
        isError: true,
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleResponse(requestId: string, action: 'accept' | 'decline') {
    setMessage(null)
    try {
      const sessionStr = localStorage.getItem('sb-ovdhumnqyhthbwdnkfui-auth-token')
      let token = ''
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr)
        token = parsed.access_token ?? ''
      }

      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to respond to request')
      }

      onActionSuccess()
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Something went wrong',
        isError: true,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Friend Form */}
      <div className="bg-white border border-base-200 rounded-md p-6">
        <h2 className="text-sm font-semibold text-base-700 mb-1">Add Friend</h2>
        <p className="text-[10px] text-base-400 mb-4">
          Add friends by entering their username.
        </p>

        <form onSubmit={handleSendRequest} className="flex gap-2">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Search username (e.g. alex)..."
            className="flex-1 border border-base-200 rounded px-3 py-1.5 text-xs text-base-755 placeholder-base-400 outline-none focus:border-base-350 bg-white"
          />
          <button
            type="submit"
            disabled={loading || !usernameInput.trim()}
            className="px-3.5 py-1.5 bg-base-700 hover:bg-base-650 disabled:opacity-50 text-base-700 rounded text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
          >
            <Plus size={12} /> Add
          </button>
        </form>

        {message && (
          <p
            className={`text-xs mt-2 ${
              message.isError ? 'text-red-500' : 'text-emerald-600 font-medium'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* Pending Requests */}
      {receivedRequests.length > 0 && (
        <div className="bg-white border border-base-200 rounded-md p-6">
          <h2 className="text-sm font-semibold text-base-700 mb-3 flex items-center gap-2">
            Friend Requests
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-accent-light text-accent">
              {receivedRequests.length}
            </span>
          </h2>

          <div className="divide-y divide-base-100">
            {receivedRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
              >
                <span className="text-xs font-medium text-base-650">@{req.username}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(req.id, 'accept')}
                    className="p-1 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 border border-transparent hover:border-emerald-250 rounded transition-all cursor-pointer flex items-center gap-1 text-[10px] px-1.5"
                  >
                    <UserCheck size={11} /> Accept
                  </button>
                  <button
                    onClick={() => handleResponse(req.id, 'decline')}
                    className="p-1 hover:bg-red-50 text-red-500 hover:text-red-600 border border-transparent hover:border-red-250 rounded transition-all cursor-pointer flex items-center gap-1 text-[10px] px-1.5"
                  >
                    <UserX size={11} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="bg-white border border-base-200 rounded-md p-6">
        <h2 className="text-sm font-semibold text-base-700 mb-3 flex items-center gap-2">
          <Users size={14} className="text-base-450" />
          Friends ({friends.length})
        </h2>

        {friends.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {friends.map((f) => (
              <div
                key={f.id}
                className="bg-base-50/50 border border-base-200/50 rounded p-2 text-xs font-medium text-base-650 truncate"
              >
                @{f.username}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-base-400 italic">No friends added yet.</p>
        )}
      </div>
    </div>
  )
}
