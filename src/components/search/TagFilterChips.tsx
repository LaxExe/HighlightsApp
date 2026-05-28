'use client'

interface TagFilterChipsProps {
  tags: string[]
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
}

export default function TagFilterChips({
  tags,
  selectedTag,
  onSelectTag,
}: TagFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-[10px] font-semibold text-base-400 uppercase tracking-wider mr-1">
        Filter by tag:
      </span>

      <button
        onClick={() => onSelectTag(null)}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
          selectedTag === null
            ? 'bg-accent-light border-accent text-accent'
            : 'bg-white border-base-200 text-base-500 hover:border-base-300'
        }`}
      >
        All
      </button>

      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(tag)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            selectedTag === tag
              ? 'bg-accent-light border-accent text-accent'
              : 'bg-white border-base-200 text-base-500 hover:border-base-300'
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}
