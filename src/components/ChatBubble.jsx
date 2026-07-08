import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { LivaAvatar } from './LivaLogo'

export default function ChatBubble({ role, children, delay = 0, scrollAnchor = false }) {
  const isAI = role === 'ai'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`flex gap-2 items-start ${isAI ? '' : 'flex-row-reverse'}`}
      {...(scrollAnchor ? { 'data-scroll-anchor': true } : {})}
    >
      {isAI ? (
        <LivaAvatar />
      ) : (
        <div className="shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-gray-500" />
        </div>
      )}

      <div className={`max-w-[88%] ${isAI ? '' : 'text-right'}`}>
        <div
          className={`rounded-xl px-3 py-2 text-[13px] ${
            isAI
              ? 'text-gray-800 rounded-tl-sm border border-gray-100 shadow-bubble-ai texture-bubble leading-relaxed'
              : 'bg-liva-orange text-white rounded-tr-sm shadow-bubble-user leading-snug'
          }`}
        >
          {children}
        </div>
      </div>
    </motion.div>
  )
}

export function ChatBlock({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex gap-2 items-start"
    >
      <LivaAvatar />
      <div className="flex-1 min-w-0 max-w-[88%]">
        <div className="card-surface rounded-xl rounded-tl-sm overflow-hidden">
          {title && (
            <p className="px-3 pt-2.5 pb-1.5 text-[13px] text-gray-800 font-medium">{title}</p>
          )}
          <div className={title ? 'px-3 pb-2.5' : 'p-2.5'}>{children}</div>
        </div>
      </div>
    </motion.div>
  )
}

export function UserAction({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay }}
      className="flex justify-end pt-1"
    >
      <div className="max-w-[85%] rounded-xl rounded-tr-sm px-3 py-1.5 bg-liva-orange text-white text-xs font-medium shadow-bubble-user">
        {children}
      </div>
    </motion.div>
  )
}

export function InlineButton({ children, onClick, disabled, processing }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || processing}
      className={`w-full mt-2 rounded-lg py-2 px-3 text-xs font-semibold transition-colors ${
        disabled || processing
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-liva-orange text-white shadow-btn-primary'
      }`}
    >
      {processing ? 'Processing…' : children}
    </button>
  )
}
