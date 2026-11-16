import { motion } from 'framer-motion'
import { Video, X } from 'lucide-react'

const MEET_LINK = 'https://meet.google.com/cqj-iyzp-vqw'

export default function SupportGoogleMeet({ planHint, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="card-surface-warm relative overflow-hidden p-3.5 shadow-elevated"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-2 top-2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="pr-6 text-sm font-bold text-gray-900">Advisor help</p>
      <p className="mt-0.5 text-[10px] text-gray-500">
        {planHint ? `${planHint} · ` : ''}avg. wait under 30 seconds
      </p>

      <div className="mt-3 rounded-xl border border-liva-orange/30 bg-liva-orange/[0.06] p-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-liva-orange/15">
            <Video className="h-4 w-4 text-liva-orange" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900">Google Meet</p>
            <p className="mt-0.5 text-[10px] leading-snug text-gray-600">
              Video meeting created for you and your advisor
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-3 border-t border-liva-orange/20 pt-3 text-center"
        >
          <p className="text-[11px] font-semibold text-liva-orange">Meeting created. Waiting for your advisor…</p>
          <a
            href={MEET_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block break-all text-[10px] font-medium text-liva-orange underline decoration-liva-orange/40 underline-offset-2"
          >
            {MEET_LINK}
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
}