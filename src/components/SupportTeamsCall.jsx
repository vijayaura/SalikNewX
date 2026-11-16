import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, PhoneOff } from 'lucide-react'
import { getTeamsSupportConfig } from '../config/teamsSupport'

function TeamsMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="4" fill="#464EB8" />
      <path
        fill="#fff"
        d="M6.2 8.4h3.1v7.2H6.2V8.4zm4.6 0h3.1v7.2h-3.1V8.4zm4.6 0H18v7.2h-2.6V8.4z"
      />
    </svg>
  )
}

export default function SupportTeamsCall({ onEndCall }) {
  const config = useMemo(() => getTeamsSupportConfig(), [])
  const [launched, setLaunched] = useState(false)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const autoOpenedRef = useRef(false)

  const openInTeams = useCallback(() => {
    if (!config.joinUrl) return false
    const opened = window.open(config.joinUrl, '_blank', 'noopener,noreferrer')
    if (!opened) {
      setPopupBlocked(true)
      return false
    }
    setPopupBlocked(false)
    return true
  }, [config.joinUrl])

  const handleJoin = useCallback(() => {
    openInTeams()
    setLaunched(true)
  }, [openInTeams])

  useEffect(() => {
    if (!config.configured || autoOpenedRef.current) return
    autoOpenedRef.current = true
    if (openInTeams()) setLaunched(true)
  }, [config.configured, openInTeams])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[120] flex min-h-0 flex-col bg-[#201f1f] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Microsoft Teams video call"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#292828] px-3 pb-2 pt-9">
        <div className="flex min-w-0 items-center gap-2">
          <TeamsMark className="h-7 w-7 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{config.contactName}</p>
            <p className="truncate text-[10px] text-white/55">{config.contactTitle}</p>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-medium text-white/45">Microsoft Teams</span>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col px-4 py-6">
        {!config.configured ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <TeamsMark className="mb-4 h-14 w-14" />
            <p className="text-sm font-semibold">Teams is not configured yet</p>
            <p className="mt-2 max-w-[280px] text-[11px] leading-relaxed text-white/55">
              Add <span className="text-white/80">VITE_TEAMS_MEETING_URL</span> or{' '}
              <span className="text-white/80">VITE_TEAMS_CONTACT_EMAIL</span> in your environment.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={launched ? { scale: 1 } : { scale: [1, 1.04, 1] }}
              transition={launched ? {} : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg shadow-black/30"
            >
              <TeamsMark className="h-12 w-12" />
            </motion.div>

            <p className="text-base font-bold">
              {launched ? 'Microsoft Teams opened' : `Calling ${config.contactName}…`}
            </p>
            <p className="mt-2 max-w-[270px] text-[11px] leading-relaxed text-white/55">
              Teams cannot run inside this frame for security reasons. Your video call with{' '}
              <span className="font-medium text-white/75">{config.contactName}</span> opens in a new
              browser tab — allow camera and microphone when Teams asks.
            </p>

            {config.contactEmail && (
              <p className="mt-3 text-[10px] text-white/40">{config.contactEmail}</p>
            )}

            {popupBlocked && (
              <p className="mt-3 max-w-[260px] rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] text-amber-100">
                Pop-up blocked. Tap the button below to open Teams.
              </p>
            )}

            <button
              type="button"
              onClick={handleJoin}
              className="mt-5 flex w-full max-w-[260px] items-center justify-center gap-2 rounded-lg bg-[#464EB8] py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#5b5fc7]"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2} />
              {launched ? 'Open Teams again' : 'Open Microsoft Teams'}
            </button>

            {launched && (
              <motion.div
                className="mt-4 flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[#464EB8]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
                <span className="ml-1 text-[10px] text-white/45">Waiting in Teams</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <footer className="flex shrink-0 justify-center border-t border-white/10 bg-[#292828] px-4 pb-5 pt-3">
        <button
          type="button"
          onClick={onEndCall}
          aria-label="End call"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600"
        >
          <PhoneOff className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </footer>
    </motion.div>
  )
}