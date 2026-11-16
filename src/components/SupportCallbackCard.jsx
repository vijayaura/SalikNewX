import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Headset, Phone, Video } from 'lucide-react'
import { USER, formatDisplayDate, fromInputDate, getTodayDate, toInputDate } from '../data'
import SupportGoogleMeet from './SupportGoogleMeet'

function formatUaeMobile(mobile) {
  const digits = mobile.replace(/\D/g, '')
  if (digits.length === 9) {
    return `+971 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  }
  return `+971 ${digits}`
}

function formatTimeLabel(date) {
  return date.toLocaleTimeString('en-AE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatScheduledDateTime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date(year, month - 1, day, hours, minutes)
  return `${date.toLocaleDateString('en-AE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })} at ${formatTimeLabel(date)}`
}

function getIn15MinutesLabel() {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 15)
  return formatTimeLabel(date)
}

const PHONE_CALLBACK_OPTIONS = [
  {
    id: 'now',
    label: 'Call now',
    desc: 'Live video with your advisor in the app',
    Icon: Phone,
  },
  {
    id: '15min',
    label: 'Call me in 15 minutes',
    desc: 'We will ring you shortly',
    Icon: Clock,
  },
  {
    id: 'schedule',
    label: 'Schedule a call',
    desc: 'Pick a date and time',
    Icon: Calendar,
  },
  {
    id: 'meet',
    label: 'Google Meet',
    desc: 'Video meeting with your advisor',
    Icon: Video,
  },
]

function SupportOptionButton({ id, label, desc, Icon, onSelect, primary = false }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
        primary
          ? 'border-liva-orange bg-liva-orange text-white shadow-btn-primary hover:bg-liva-orange-light'
          : 'border-gray-200 bg-white hover:border-liva-orange/35 hover:bg-liva-orange/[0.03]'
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          primary ? 'bg-white/20' : 'bg-liva-orange/10'
        }`}
      >
        <Icon className={`h-4 w-4 ${primary ? 'text-white' : 'text-liva-orange'}`} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold leading-tight ${primary ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </p>
        <p className={`mt-0.5 text-[10px] ${primary ? 'text-white/80' : 'text-gray-500'}`}>{desc}</p>
      </div>
    </button>
  )
}

function SupportPulseIcon() {
  return (
    <div className="relative mx-auto mb-3 h-14 w-14">
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
        <Headset className="h-6 w-6 text-white" strokeWidth={2} />
      </div>
    </div>
  )
}

function OnTheWayIndicator() {
  return (
    <motion.div
      className="mt-3 flex items-center justify-center gap-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-liva-orange"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      <span className="ml-1 text-[10px] font-medium text-liva-orange">On the way</span>
    </motion.div>
  )
}

export default function SupportCallbackCard({ onClose, planHint, onTeamsCallNow }) {
  const [step, setStep] = useState('choose')
  const [choice, setChoice] = useState(null)
  const [scheduleDate, setScheduleDate] = useState(toInputDate(getTodayDate()))
  const [scheduleTime, setScheduleTime] = useState('10:00')

  const minScheduleDate = useMemo(() => toInputDate(getTodayDate()), [])
  const phoneLabel = formatUaeMobile(USER.mobile)

  const handleChoose = (optionId) => {
    setChoice(optionId)
    if (optionId === 'now') {
      if (onTeamsCallNow) {
        onTeamsCallNow()
        return
      }
      return
    }
    if (optionId === 'meet') {
      setStep('google-meet')
      return
    }
    if (optionId === 'schedule') {
      setStep('schedule')
      return
    }
    setStep('confirmed')
  }

  const handleConfirmSchedule = () => {
    setStep('confirmed')
  }

  if (step === 'google-meet') {
    return (
      <SupportGoogleMeet
        planHint={planHint}
        onClose={() => {
          setChoice(null)
          if (onClose) onClose()
          else setStep('choose')
        }}
      />
    )
  }

  if (step === 'choose') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="card-surface-warm p-3.5 shadow-elevated"
      >
        <SupportPulseIcon />

        <p className="mb-1 text-center text-xs font-bold text-gray-900">Need support?</p>
        <p className="mx-auto mb-3 max-w-[240px] text-center text-[11px] leading-relaxed text-gray-600">
          Choose how you would like our customer care team to reach you.
        </p>

        <div className="space-y-2">
          {PHONE_CALLBACK_OPTIONS.map(({ id, label, desc, Icon }) => (
            <SupportOptionButton
              key={id}
              id={id}
              label={label}
              desc={desc}
              Icon={Icon}
              primary={id === 'now'}
              onSelect={handleChoose}
            />
          ))}
        </div>
      </motion.div>
    )
  }

  if (step === 'schedule') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="card-surface-warm p-3.5 shadow-elevated"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-liva-orange/10">
            <Calendar className="h-4 w-4 text-liva-orange" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Schedule your callback</p>
            <p className="text-[10px] text-gray-500">We will call {phoneLabel}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Date
            </span>
            <input
              type="date"
              value={scheduleDate}
              min={minScheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-liva-orange focus:outline-none focus:ring-1 focus:ring-liva-orange/30"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Time
            </span>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-liva-orange focus:outline-none focus:ring-1 focus:ring-liva-orange/30"
            />
          </label>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setStep('choose')
              setChoice(null)
            }}
            className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirmSchedule}
            className="flex-1 rounded-lg bg-liva-orange py-2 text-xs font-semibold text-white shadow-btn-primary transition-colors hover:bg-liva-orange-light"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    )
  }

  const scheduledLabel =
    choice === '15min'
      ? getIn15MinutesLabel()
      : choice === 'schedule'
        ? formatScheduledDateTime(scheduleDate, scheduleTime)
        : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="card-surface-warm p-3.5 text-center shadow-elevated"
    >
      <SupportPulseIcon />

      <>
          <p className="mb-1 text-xs font-bold text-gray-900">Callback scheduled</p>
          <p className="mx-auto max-w-[240px] text-[11px] leading-relaxed text-gray-600">
            {choice === '15min' ? (
              <>
                We will call you at <span className="font-semibold text-gray-900">{scheduledLabel}</span> on{' '}
                {phoneLabel}.
              </>
            ) : (
              <>
                Your callback is booked for{' '}
                <span className="font-semibold text-gray-900">{scheduledLabel}</span> on {phoneLabel}.
              </>
            )}
          </p>
          <motion.div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-liva-orange/10 px-3 py-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Clock className="h-3 w-3 text-liva-orange" strokeWidth={2.5} />
            <span className="text-[10px] font-semibold text-liva-orange">
              {choice === '15min'
                ? 'In 15 minutes'
                : formatDisplayDate(fromInputDate(scheduleDate))}
            </span>
          </motion.div>
      </>
    </motion.div>
  )
}
