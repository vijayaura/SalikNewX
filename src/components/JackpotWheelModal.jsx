import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Volume2, VolumeX, X } from 'lucide-react'

const SEGMENTS = [
  { id: 'd15', label: '15% off', color: '#ea580c', text: '#fff', type: 'discount', percent: 15 },
  { id: 'retry', label: 'Spin again', color: '#facc15', text: '#422006', type: 'retry' },
  { id: 'd5', label: '5% off', color: '#fafaf9', text: '#1f2937', type: 'discount', percent: 5 },
  { id: 'd10', label: '10% off', color: '#ffedd5', text: '#9a3412', type: 'discount', percent: 10 },
  { id: 'card', label: 'Orange Card', color: '#22c55e', text: '#fff', type: 'orange-card' },
  { id: 'd8', label: '8% off', color: '#fdba74', text: '#7c2d12', type: 'discount', percent: 8 },
]

const WHEEL_SIZE = 220
const WHEEL_CX = WHEEL_SIZE / 2
const WHEEL_CY = WHEEL_SIZE / 2
const WHEEL_R = 102
const LABEL_R = 62

function wedgePath(cx, cy, r, startDeg, endDeg) {
  const rad = (deg) => (deg * Math.PI) / 180
  const x1 = cx + r * Math.sin(rad(startDeg))
  const y1 = cy - r * Math.cos(rad(startDeg))
  const x2 = cx + r * Math.sin(rad(endDeg))
  const y2 = cy - r * Math.cos(rad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
}

function labelAt(cx, cy, r, midDeg) {
  const rad = (midDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

function playToneSequence(frequencies, soundOn) {
  if (!soundOn) return
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const start = ctx.currentTime
    frequencies.forEach((freq, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = freq
      g.gain.setValueAtTime(0.0001, start + i * 0.12)
      g.gain.exponentialRampToValueAtTime(0.12, start + i * 0.12 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, start + i * 0.12 + 0.18)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(start + i * 0.12)
      o.stop(start + i * 0.12 + 0.2)
    })
  } catch {
    /* autoplay policies */
  }
}

function playSpinTick(soundOn) {
  if (!soundOn) return
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 180
    g.gain.setValueAtTime(0.06, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.06)
  } catch {
    /* ignore */
  }
}

export default function JackpotWheelModal({ open, onClose, onPrize }) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [resultLabel, setResultLabel] = useState(null)
  const [soundOn, setSoundOn] = useState(true)
  const tickRef = useRef(null)

  const slice = 360 / SEGMENTS.length

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const handleSpin = () => {
    if (spinning) return
    setResultLabel(null)
    setSpinning(true)

    const index = Math.floor(Math.random() * SEGMENTS.length)
    const prize = SEGMENTS[index]
    const spins = 5 + Math.floor(Math.random() * 2)
    const offset = 360 - index * slice - slice / 2
    const delta = spins * 360 + offset

    tickRef.current = setInterval(() => playSpinTick(soundOn), 120)

    setRotation((prev) => prev + delta)

    window.setTimeout(() => {
      clearTick()
      setSpinning(false)
      setResultLabel(prize.label)
      if (prize.type === 'discount') {
        playToneSequence([523.25, 659.25, 783.99], soundOn)
        onPrize?.({ type: 'discount', percent: prize.percent, label: prize.label })
      } else if (prize.type === 'orange-card') {
        playToneSequence([392, 523.25, 659.25, 783.99], soundOn)
        onPrize?.({ type: 'orange-card', label: prize.label })
      } else {
        playToneSequence([440, 493.88], soundOn)
      }
    }, 4200)
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-labelledby="wheel-title"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative mx-auto w-[calc(100%-8px)] max-w-[280px] rounded-2xl border border-gray-100 bg-white p-3.5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSoundOn((v) => !v)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-liva-orange">
            Your lucky moment
          </p>
          <h2 id="wheel-title" className="mt-0.5 text-center text-lg font-bold text-gray-900">
            Spin for a surprise
          </h2>
          <p className="mb-4 text-center text-[11px] text-gray-500">Your quote could get even better.</p>

          <div className="relative mx-auto mb-3 h-[200px] w-[200px] max-w-full">
            <div
              className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2"
              aria-hidden
            >
              <div className="h-0 w-0 border-x-[10px] border-t-[15px] border-x-transparent border-t-gray-900 drop-shadow-sm" />
            </div>

            <motion.div
              className="relative h-full w-full overflow-hidden rounded-full border-[5px] border-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
              animate={{ rotate: rotation }}
              transition={{ duration: 4.2, ease: [0.12, 0.8, 0.15, 1] }}
            >
              <svg
                width={WHEEL_SIZE}
                height={WHEEL_SIZE}
                viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                className="block h-full w-full"
                aria-hidden
              >
                {SEGMENTS.map((seg, i) => {
                  const start = i * slice
                  const end = (i + 1) * slice
                  const mid = start + slice / 2
                  const { x, y } = labelAt(WHEEL_CX, WHEEL_CY, LABEL_R, mid)
                  const fontSize = seg.label.length > 9 ? 7 : 8
                  const labelRotation = mid > 90 && mid < 270 ? mid + 180 : mid
                  return (
                    <g key={seg.id}>
                      <path d={wedgePath(WHEEL_CX, WHEEL_CY, WHEEL_R, start, end)} fill={seg.color} />
                      <text
                        x={x}
                        y={y}
                        fill={seg.text}
                        fontSize={fontSize}
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${labelRotation}, ${x}, ${y})`}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {seg.label.includes(' ') ? (
                          <>
                            <tspan x={x} dy="-0.35em">
                              {seg.label.split(' ')[0]}
                            </tspan>
                            <tspan x={x} dy="1.1em">
                              {seg.label.split(' ').slice(1).join(' ')}
                            </tspan>
                          </>
                        ) : (
                          seg.label
                        )}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </motion.div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-liva-orange shadow-lg shadow-liva-orange/40">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
          </div>

          <p className="mb-3 min-h-[16px] text-center text-[11px] font-medium text-gray-500">
            {spinning ? 'Spinning…' : resultLabel ? `You won: ${resultLabel}` : 'Good luck!'}
          </p>

          <button
            type="button"
            disabled={spinning}
            onClick={handleSpin}
            className="w-full rounded-xl bg-liva-orange py-3 text-sm font-semibold text-white shadow-btn-primary transition-colors hover:bg-liva-orange-light disabled:opacity-60"
          >
            {spinning ? 'Spinning…' : resultLabel ? 'Spin again' : 'Spin the wheel'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}