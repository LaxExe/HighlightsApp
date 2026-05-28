'use client'

interface HighlightInputProps {
  index: number
  value: string
  onChange: (value: string) => void
  onRemove: () => void
  canRemove: boolean
  placeholder?: string
}

const PLACEHOLDERS = [
  'Something meaningful you did today…',
  'Another win, big or small…',
  'One more thing worth noting…',
  'Great job today! What else did you do?',
  'Spending time with friends is worth noting!',
  'Visit any place new or interesting?',
  'Last one — make it count…',
]

export default function HighlightInput({
  index,
  value,
  onChange,
  onRemove,
  canRemove,
  placeholder,
}: HighlightInputProps) {
  return (
    <div className="group flex items-center gap-3 border-b border-base-200 focus-within:border-base-500 transition-colors py-2.5">
      <span className="text-[11px] text-base-300 w-4 text-right shrink-0 select-none">
        {index + 1}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? PLACEHOLDERS[index] ?? PLACEHOLDERS[2]}
        aria-label={`Highlight ${index + 1}`}
        className="flex-1 bg-transparent border-none outline-none text-sm text-base-700 placeholder:text-base-300 py-0"
      />
      {canRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove highlight ${index + 1}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-base-300 hover:text-base-600 p-0 flex items-center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  )
}