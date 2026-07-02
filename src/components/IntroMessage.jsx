import { Minus, Plus } from 'lucide-react'
import { USER, VEHICLE, VALUE_LIMITS, formatAED, getDaysUntilExpiry } from '../data'

const firstName = USER.name.split(' ')[0]

function expiryPhrase(days) {
  if (days <= 0) return 'expired'
  if (days === 1) return 'expires in 1 day'
  return `expires in ${days} days`
}

export default function IntroMessage({ value, onValueChange }) {
  const vehicleName = `${VEHICLE.model} ${VEHICLE.year}`
  const days = getDaysUntilExpiry(VEHICLE.existingPolicyExpiry)
  const expiry = expiryPhrase(days)
  const { step, min, max } = VALUE_LIMITS

  const adjust = (delta) => {
    onValueChange(Math.min(max, Math.max(min, value + delta)))
  }

  return (
    <p className="text-[13px] leading-snug text-gray-800">
      Hi {firstName}! Your{' '}
      <span className="font-bold text-liva-orange">{vehicleName}</span> policy{' '}
      <span className="font-semibold text-gray-900">{expiry}</span>. Get your plan for a sum insured of{' '}
      <span className="inline-flex items-center gap-0.5 align-middle whitespace-nowrap">
        <ValueButton onClick={() => adjust(-step)} disabled={value <= min} label="Decrease value">
          <Minus className="w-3 h-3" strokeWidth={2.5} />
        </ValueButton>
        <span className="font-semibold text-gray-900 tabular-nums px-0.5">{formatAED(value)}</span>
        <ValueButton onClick={() => adjust(step)} disabled={value >= max} label="Increase value">
          <Plus className="w-3 h-3" strokeWidth={2.5} />
        </ValueButton>
      </span>
      .
    </p>
  )
}

function ValueButton({ children, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex items-center justify-center w-5 h-5 rounded text-gray-400 transition-colors hover:text-liva-orange active:scale-95 disabled:opacity-25 disabled:pointer-events-none"
    >
      {children}
    </button>
  )
}
