'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TagManager from '@/components/profile/TagManager'
import FriendRequests from '@/components/profile/FriendRequests'
import { User } from 'lucide-react'

interface Friend {
  id: string
  username: string
}

export default function ProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{
    username: string
    email: string
    tags: string[]
    logCount: number
    friends: Friend[]
    receivedFriendRequests: Friend[]
  } | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [updatingUser, setUpdatingUser] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{
    text: string
    isError: boolean
  } | null>(null)

  async function fetchProfile() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/auth')
        return
      }

      const res = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setUsername(data.username)
        setEmail(data.email)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setUpdatingUser(true)
    setUpdateMessage(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      if (username !== profile?.username) {
        const dbRes = await fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ username }),
        })

        if (!dbRes.ok) throw new Error('Username update failed')

        await supabase.auth.updateUser({
          data: { username },
        })
      }

      if (email !== profile?.email) {
        const { error } = await supabase.auth.updateUser({ email })
        if (error) throw error
      }

      if (password) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setPassword('')
      }

      setUpdateMessage({
        text: 'Profile updated successfully',
        isError: false,
      })

      await fetchProfile()
    } catch (err) {
      setUpdateMessage({
        text: err instanceof Error ? err.message : 'Update failed',
        isError: true,
      })
    } finally {
      setUpdatingUser(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-base-400">Loading settings…</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-base-50 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-6 py-8 lg:px-12 space-y-10">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-base-700">
              Profile & Settings
            </h1>
            <p className="mt-2 text-sm text-base-400">
              Manage your account, tags, and social connections.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* ACCOUNT CARD */}
        <div className="w-full bg-white border border-base-200 rounded-xl p-6 lg:p-7">
          <h2 className="text-sm font-semibold text-base-700 mb-6 flex items-center gap-2">
            <User size={15} />
            Account Credentials
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-5">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-base-500">Username</label>
                <input
                  className="w-full mt-1 border border-base-200 rounded-xl px-3 py-2 text-sm text-base-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-base-500">Email</label>
                <input
                  className="w-full mt-1 border border-base-200 rounded-xl px-3 py-2 text-sm text-base-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-base-500">New Password</label>
              <input
                type="password"
                className="w-full mt-1 border border-base-200 rounded-xl px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {updateMessage && (
              <p
                className={`text-xs p-3 rounded-xl border ${
                  updateMessage.isError
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {updateMessage.text}
              </p>
            )}

            <div className="flex justify-end pt-4 border-t border-base-100">
              <button
                type="submit"
                disabled={updatingUser}
                className="px-4 py-2 bg-base-700 hover:bg-base-600 text-base-700 rounded-xl text-sm"
              >
                {updatingUser ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* TAGS */}
        {profile && (
          <div className="w-full rounded-xl">
            <TagManager
              tags={profile.tags}
              logCount={profile.logCount}
              onTagsUpdated={(newTags) =>
                setProfile((prev) =>
                  prev ? { ...prev, tags: newTags } : null
                )
              }
            />
          </div>
        )}

        {/* FRIENDS */}
        {profile && (
          <div className="w-full rounded-xl">
            <FriendRequests
              friends={profile.friends}
              receivedRequests={profile.receivedFriendRequests}
              onActionSuccess={fetchProfile}
            />
          </div>
        )}

      </div>
    </div>
  )
}