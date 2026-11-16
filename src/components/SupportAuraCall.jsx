import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PhoneOff, Video } from 'lucide-react'
import { USER } from '../data'
import { buildAuraCallEmbedUrl, getAuraCallConfig, isAuraCallMessageEvent } from '../config/auraCall'

export default function SupportAuraCall({ onEndCall, onCallStarted }) {
  const config = useMemo(() => getAuraCallConfig(), [])
  const embedUrl = useMemo(
    () => (config.configured ? buildAuraCallEmbedUrl({ customerName: USER.name }) : ''),
    [config.configured],
  )

  useEffect(() => {
    if (!config.configured) return

    const handleMessage = (event) => {
      if (!isAuraCallMessageEvent(event, config.allowedOrigin)) return

      if (event.data?.type === 'liva-call-started') {
        onCallStarted?.(event.data)
      }
      if (event.data?.type === 'liva-call-ended') {
        onEndCall()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [config.allowedOrigin, config.configured, onCallStarted, onEndCall])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[120] flex min-h-0 flex-col bg-[#0f1115] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Video call with advisor"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#12151c] px-3 pb-2 pt-9">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-liva-orange/20">
            <Video className="h-4 w-4 text-liva-orange" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">Advisor video call</p>
            <p className="truncate text-[10px] text-white/55">Powered by Aura · in app</p>
          </div>
        </div>
      </header>

      {!config.configured ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold">Call embed not configured</p>
          <p className="mt-2 max-w-[280px] text-[11px] text-white/55">
            Set <span className="text-white/80">VITE_AURA_CALL_EMBED_URL</span> to your Aura embed call page.
          </p>
        </div>
      ) : (
        <iframe
          title="Aura advisor video call"
          src={embedUrl}
          className="min-h-0 w-full flex-1 border-0 bg-[#0f1115]"
          allow="camera; microphone; autoplay; fullscreen; display-capture; clipboard-write"
          allowFullScreen
        />
      )}

      <footer className="flex shrink-0 justify-center border-t border-white/10 bg-[#12151c] px-4 pb-5 pt-3">
        <button
          type="button"
          onClick={onEndCall}
          aria-label="Leave call"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600"
        >
          <PhoneOff className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </footer>
    </motion.div>
  )
}