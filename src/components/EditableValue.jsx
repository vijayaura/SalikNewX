import { Minus, Plus } from 'lucide-react'
import { formatAED, VALUE_LIMITS } from '../data'

export default function EditableValue({
  value,
  onChange,
  compact = false,
  label = 'Insured Value',
}) {
  const { step, min, max } = VALUE_LIMITS

  const adjust = (delta) => {
    onChange(Math.min(max, Math.max(min, value + delta)))
  }

  if (compact) {
    return (
      <div className="p-2 min-h-[44px] flex flex-col justify-center">
        <p className="text-[10px] text-gray-400 leading-none mb-1">{label === 'Insured Value' ? 'Value' : label}</p>
        <div className="flex items-center gap-1">
          <StepButton onClick={() => adjust(-step)} disabled={value <= min} label="Decrease value">
            <Minus className="w-3 h-3" strokeWidth={2.5} />
          </StepButton>
          <span className="flex-1 text-center text-[10px] font-semibold text-gray-900 tabular-nums leading-tight px-0.5">
            {formatAED(value)}
          </span>
          <StepButton onClick={() => adjust(step)} disabled={value >= max} label="Increase value">
            <Plus className="w-3 h-3" strokeWidth={2.5} />
          </StepButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2.5 min-h-[40px] bg-gray-50">
      <span className="text-[11px] text-gray-600 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <StepButton onClick={() => adjust(-step)} disabled={value <= min} label="Decrease value">
          <Minus className="w-3 h-3" strokeWidth={2.5} />
        </StepButton>
        <span className="text-[11px] font-semibold text-gray-900 tabular-nums whitespace-nowrap min-w-[72px] text-center">
          {formatAED(value)}
        </span>
        <StepButton onClick={() => adjust(step)} disabled={value >= max} label="Increase value">
          <Plus className="w-3 h-3" strokeWidth={2.5} />
        </StepButton>
      </div>
    </div>
  )
}

function StepButton({ children, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="shrink-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm transition-all hover:border-liva-orange hover:text-liva-orange active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
    >
      {children}
    </button>
  )
}
