'use client'

import { Search, Loader2 } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  loading,
}: SearchBarProps) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search highlights (e.g. gym, reading)..."
          className="w-full border border-base-200 rounded-md pl-10 pr-24 py-3 text-sm text-base-700 placeholder-base-400 outline-none focus:border-base-300 transition-all bg-white"
        />
        <div className="absolute left-3.5 text-base-400">
          <Search size={16} />
        </div>
        <div className="absolute right-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 bg-base-700 hover:bg-base-600 disabled:opacity-50 text-white rounded text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
