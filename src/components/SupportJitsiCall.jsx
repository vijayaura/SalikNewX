import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PhoneOff, Video } from 'lucide-react'
import { USER } from '../data'
import { buildJitsiEmbedUrl, getJitsiSupportConfig } from '../config/jitsiSupport'

export default function SupportJitsiCall({ onEndCall }) {
  const config = useMemo(() => getJitsiSupportConfig(), [])
  const displayName = USER.name || `${USER.firstName} ${USER.lastName}`.trim()

  const embedUrl = useMemo(
    () =>
      config.configured
        ? buildJitsiEmbedUrl({
            server: config.server,
            room: config.room,
            displayName,
            lobby: config.lobby,
          })
        : '',
    [config, displayName],
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[120] flex min-h-0 flex-col bg-[#1a1f2e] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Video call with advisor"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#12151c] px-3 pb-2 pt-9">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#17a0fd]/20">
            <Video className="h-4 w-4 text-[#17a0fd]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{config.advisorName}</p>
            <p className="truncate text-[10px] text-white/55">
              {config.lobby ? 'Lobby — advisor will admit you' : 'Live video · in app'}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-medium text-white/40">Jitsi</span>
      </header>

      {!config.configured ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold">Jitsi is not configured</p>
          <p className="mt-2 max-w-[280px] text-[11px] text-white/55">
            Set <span className="text-white/80">VITE_JITSI_ROOM</span> in your environment. Advisor joins the same room
            on standby.
          </p>
        </div>
      ) : (
        <iframe
          title={`Video call — ${config.room}`}
          src={embedUrl}
          className="min-h-0 w-full flex-1 border-0 bg-[#1a1f2e]"
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
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