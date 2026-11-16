import { motion } from 'framer-motion'
import WheelMiniIcon from './WheelMiniIcon'

export default function WheelCornerTab({ visible, onOpen, containerRef }) {
  if (!visible) return null

  return (
    <motion.button
      type="button"
      drag
      dragConstraints={containerRef}
      dragElastic={0.15}
      dragMomentum={false}
      onClick={onOpen}
      initial={{ x: 4, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 8, opacity: 0 }}
      className="absolute bottom-28 right-0 z-[90] flex cursor-grab touch-none items-center gap-1 rounded-l-lg border border-liva-orange/30 border-r-0 bg-liva-orange py-1 pl-1 pr-1.5 text-white shadow-md active:cursor-grabbing"
      aria-label="Open spin wheel"
    >
      <WheelMiniIcon className="h-3 w-3 shrink-0" />
      <span className="text-[8px] font-bold leading-none">Spin</span>
    </motion.button>
  )
}