import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'
import { USER } from '../data'
import LivaLogo from './LivaLogo'

const ADVISOR = {
  name: 'Sara Nasser',
  title: 'Senior motor insurance advisor',
  initials: 'SN',
}

export default function SupportVideoCall({ onEndCall }) {
  const [micOn, setMicOn] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [phase, setPhase] = useState('calling')

  useEffect(() => {
    const t = setTimeout(() => setPhase('connected'), 2800)
    return () => clearTimeout(t)
  }, [])

  const userInitials = `${USER.firstName?.[0] ?? ''}${USER.lastName?.[0] ?? ''}`.toUpperCase() || 'RK'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="relative -ml-9 flex min-h-[min(520px,70dvh)] w-[calc(100%+2.25rem)] flex-col overflow-hidden rounded-2xl bg-[#141414] shadow-elevated"
    >
      <div className="relative flex flex-1 flex-col px-4 pb-28 pt-4">
        <div className="flex items-start justify-between">
          <LivaLogo size="lg" className="!h-6 brightness-110" />
          <span className="text-[10px] font-medium text-white/40">
            {phase === 'calling' ? 'Calling your advisor…' : 'Connected'}
          </span>
        </div>

        <motion.p
          key={phase}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center text-[11px] text-white/55"
        >
          {phase === 'calling' ? 'Calling your advisor…' : 'You are connected with your advisor'}
        </motion.p>

        <div className="flex flex-1 flex-col items-center justify-center">
          <motion.div
            animate={phase === 'calling' ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={phase === 'calling' ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-lg shadow-black/40"
          >
            <span className="text-3xl font-bold tracking-tight text-liva-orange">{ADVISOR.initials}</span>
          </motion.div>
          <p className="mt-4 text-base font-bold text-white">{ADVISOR.name}</p>
          <p className="mt-0.5 max-w-[200px] text-center text-[11px] text-white/50">{ADVISOR.title}</p>

          {phase === 'calling' && (
            <motion.div
              className="mt-4 flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full bg-liva-orange"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {videoOn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-24 right-3 h-[88px] w-[68px] overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 shadow-lg"
            >
              <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-black/20">
                <span className="text-sm font-bold text-white/90">{userInitials}</span>
                <span className="text-[8px] font-medium text-white/50">You</span>
              </div>
              <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 py-px text-[7px] text-white/80">
                Camera on
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-white px-4 pb-4 pt-3">
        <div className="flex items-center justify-center gap-3">
          <CallControl
            active={micOn}
            onClick={() => setMicOn((v) => !v)}
            onIcon={Mic}
            offIcon={MicOff}
            label={micOn ? 'Mute' : 'Unmute'}
          />
          <CallControl
            active={videoOn}
            onClick={() => setVideoOn((v) => !v)}
            onIcon={Video}
            offIcon={VideoOff}
            label={videoOn ? 'Stop video' : 'Start video'}
          />
          <button
            type="button"
            onClick={onEndCall}
            aria-label="End call"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
          >
            <PhoneOff className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function CallControl({ active, onClick, onIcon: OnIcon, offIcon: OffIcon, label }) {
  const Icon = active ? OnIcon : OffIcon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
        active ? 'bg-[#f5ebe0] text-gray-800' : 'bg-gray-200 text-gray-500'
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </button>
  )
}