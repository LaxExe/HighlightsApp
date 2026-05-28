'use client'

import { useState } from 'react'
import { Sparkles, Trash2, Plus, Loader2, Check } from 'lucide-react'

interface TagManagerProps {
  tags: string[]
  logCount: number
  onTagsUpdated: (newTags: string[]) => void
}

export default function TagManager({
  tags,
  logCount,
  onTagsUpdated,
}: TagManagerProps) {
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Tag suggestions state
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [addedSuggestions, setAddedSuggestions] = useState<string[]>([])

  async function handleAddTag(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!newTag.trim()) return

    setLoading(true)
    setError(null)

    try {
      const sessionStr = localStorage.getItem('sb-ovdhumnqyhthbwdnkfui-auth-token')
      let token = ''
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr)
        token = parsed.access_token ?? ''
      }

      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tag: newTag.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to add tag')
      }

      const updatedTags = await res.json()
      onTagsUpdated(updatedTags)
      setNewTag('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteTag(tagToDelete: string) {
    setError(null)
    try {
      const sessionStr = localStorage.getItem('sb-ovdhumnqyhthbwdnkfui-auth-token')
      let token = ''
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr)
        token = parsed.access_token ?? ''
      }

      const res = await fetch(`/api/tags?tag=${encodeURIComponent(tagToDelete)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to delete tag')
      }

      const updatedTags = await res.json()
      onTagsUpdated(updatedTags)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function handleGenerateTags() {
    setGenerating(true)
    setError(null)
    setSuggestedTags([])
    setAddedSuggestions([])

    try {
      const sessionStr = localStorage.getItem('sb-ovdhumnqyhthbwdnkfui-auth-token')
      let token = ''
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr)
        token = parsed.access_token ?? ''
      }

      const res = await fetch('/api/tags/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to generate tags')
      }

      const data = await res.json()
      setSuggestedTags(data.suggestedTags || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  async function handleAddSuggestedTag(tag: string) {
    try {
      const sessionStr = localStorage.getItem('sb-ovdhumnqyhthbwdnkfui-auth-token')
      let token = ''
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr)
        token = parsed.access_token ?? ''
      }

      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tag }),
      })

      if (res.ok) {
        const updatedTags = await res.json()
        onTagsUpdated(updatedTags)
        setAddedSuggestions((prev) => [...prev, tag])
      }
    } catch (err) {
      console.error('Failed to add suggested tag:', err)
    }
  }

  return (
    <div className="bg-white border border-base-200 rounded-md p-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-base-100">
        <div>
          <h2 className="text-sm font-semibold text-base-700">Manage Tags</h2>
          <p className="text-[10px] text-base-400">
            Tags are only displayed on the Search & History page.
          </p>
        </div>

        {logCount >= 7 && (
          <button
            onClick={handleGenerateTags}
            disabled={generating}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-accent-light px-2.5 py-1 text-[11px] font-semibold text-accent border border-accent/20 hover:bg-accent-light/80 transition-colors disabled:opacity-55"
          >
            {generating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            AI Tag Suggestions
          </button>
        )}
      </div>

      {/* Suggested Tags Area */}
      {suggestedTags.length > 0 && (
        <div className="bg-accent-light/35 border border-accent/15 p-4 rounded-md mb-4 animate-in fade-in duration-200">
          <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-2">
            AI Suggestions based on your last 7 days:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => {
              const isAdded = tags.includes(tag) || addedSuggestions.includes(tag)
              return (
                <button
                  key={tag}
                  disabled={isAdded}
                  onClick={() => handleAddSuggestedTag(tag)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
                    isAdded
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white hover:bg-accent-light border-base-200 text-base-600'
                  }`}
                >
                  {isAdded && <Check size={11} />}
                  #{tag}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Tag list */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-base-50 px-2.5 py-1 rounded text-xs text-base-600 border border-base-200"
            >
              #{tag}
              <button
                onClick={() => handleDeleteTag(tag)}
                className="text-base-400 hover:text-red-500 rounded transition-colors ml-0.5 cursor-pointer"
              >
                &times;
              </button>
            </span>
          ))
        ) : (
          <p className="text-xs text-base-400 italic">No tags added yet.</p>
        )}
      </div>

      {/* Add tag form */}
      <form onSubmit={handleAddTag} className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="New tag (e.g. ece-105, coding)..."
          className="flex-1 border border-base-200 rounded px-3 py-1.5 text-xs text-base-700 placeholder-base-400 outline-none focus:border-base-300 bg-white"
        />
        <button
          type="submit"
          disabled={loading || !newTag.trim()}
          className="px-3 py-1.5 bg-base-700 hover:bg-base-600 disabled:opacity-50 text-base-700 rounded text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
        >
          <Plus size={12} /> Add
        </button>
      </form>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  )
}
