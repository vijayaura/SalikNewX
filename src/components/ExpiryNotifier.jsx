import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { getDaysUntilExpiry, VEHICLE } from '../data'
import { COPY } from '../copy'

export default function ExpiryNotifier({ daysRemaining = getDaysUntilExpiry(VEHICLE.existingPolicyExpiry) }) {
  const urgency =
    daysRemaining <= 7 ? 'high' : daysRemaining <= 21 ? 'medium' : 'low'

  const { lead, sub } = COPY.expiry(daysRemaining)

  const styles = {
    low: {
      wrap: 'bg-amber-50/60 border-amber-100',
      accent: 'border-amber-300',
      icon: 'text-amber-500/70',
      lead: 'text-gray-700',
      sub: 'text-gray-500',
      badge: 'bg-amber-100/80 text-amber-800',
    },
    medium: {
      wrap: 'bg-amber-50 border-amber-200/90',
      accent: 'border-amber-400',
      icon: 'text-amber-600',
      lead: 'text-gray-800',
      sub: 'text-amber-900/60',
      badge: 'bg-amber-100 text-amber-800',
    },
    high: {
      wrap: 'bg-orange-50 border-orange-200',
      accent: 'border-liva-orange',
      icon: 'text-liva-orange',
      lead: 'text-gray-900',
      sub: 'text-gray-600',
      badge: 'bg-liva-orange/10 text-liva-orange',
    },
  }

  const s = styles[urgency]

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className={`mt-2.5 rounded-lg border border-l-[3px] px-2.5 py-2 ${s.wrap} ${s.accent}`}
    >
      <div className="flex items-start gap-2">
        <div className="relative shrink-0 mt-0.5">
          <Clock className={`w-3.5 h-3.5 ${s.icon}`} strokeWidth={2.25} />
          {urgency !== 'low' && (
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-medium leading-snug ${s.lead}`}>{lead}</p>
          <p className={`text-[10px] leading-snug mt-0.5 ${s.sub}`}>{sub}</p>
        </div>
      </div>
    </motion.div>
  )
}
