import { LayoutGrid, MessageCircle } from 'lucide-react'

/** Icon-only switch: chat workflow vs step-by-step UI. */
export default function FlowModeToggle({ value, onChange }) {
  return (
    <div
      className="flex shrink-0 gap-0.5 rounded-full border border-gray-200 bg-gray-50 p-0.5"
      role="tablist"
      aria-label="Chat or renewal form"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'chat'}
        aria-label="Chat with Aura"
        title="Chat"
        onClick={() => onChange('chat')}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors outline-none ${
          value === 'chat'
            ? 'bg-white text-liva-orange shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'ui'}
        aria-label="Renewal steps"
        title="Renewal form"
        onClick={() => onChange('ui')}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors outline-none ${
          value === 'ui'
            ? 'bg-white text-liva-orange shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
    </div>
  )
}