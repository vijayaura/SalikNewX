import { motion } from 'framer-motion'
import { Headset } from 'lucide-react'

export default function SupportCallbackCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="card-surface-warm p-3.5 text-center shadow-elevated"
    >
      <div className="relative mx-auto w-14 h-14 mb-3">
        <motion.span
          className="absolute inset-0 rounded-full bg-liva-orange/25"
          animate={{ scale: [1, 1.45, 1], opacity: [0.45, 0, 0.45] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="absolute inset-1 rounded-full bg-liva-orange/15"
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.1, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-liva-orange shadow-md shadow-liva-orange/25">
          <Headset className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
      </div>

      <p className="text-xs font-bold text-gray-900 mb-1">Connecting you to support</p>
      <p className="text-[11px] text-gray-600 leading-relaxed max-w-[220px] mx-auto">
        A customer care executive will call you in a moment.
      </p>

      <motion.div
        className="mt-3 flex items-center justify-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-liva-orange"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
        <span className="text-[10px] font-medium text-liva-orange ml-1">On the way</span>
      </motion.div>
    </motion.div>
  )
}
