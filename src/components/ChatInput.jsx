import { useState } from 'react'
import { Send } from 'lucide-react'
import { COPY } from '../copy'

export default function ChatInput({
  onSend,
  onSupport,
  disabled,
  suggestions = [],
  aiConnected = false,
}) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="shrink-0">
      <div className="relative overflow-hidden rounded-2xl border border-gray-100/90 shadow-elevated">
        <div className="dock-wave-bg absolute inset-0" aria-hidden />
        <div className="relative z-10 space-y-2 p-2.5">
          {(suggestions.length > 0 || COPY.cards.needSupport) && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              <button
                type="button"
                onClick={onSupport}
                disabled={disabled}
                className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-liva-orange text-white font-semibold shadow-btn-primary transition-colors hover:bg-liva-orange-light disabled:opacity-50"
              >
                {COPY.cards.needSupport}
              </button>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSend(s)}
                  disabled={disabled}
                  className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/90 text-gray-600 border border-gray-200/80 shadow-soft hover:border-liva-orange/40 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 pl-3.5 pr-1.5 py-1 shadow-input-bar backdrop-blur-sm">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={
                aiConnected
                  ? 'Ask Aura anything…'
                  : 'Ask Aura about plans, claims, docs…'
              }
              className="flex-1 min-w-0 bg-transparent py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={submit}
              disabled={disabled || !value.trim()}
              aria-label="Send message"
              className="shrink-0 w-8 h-8 rounded-full bg-liva-orange text-white flex items-center justify-center shadow-btn-primary disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
