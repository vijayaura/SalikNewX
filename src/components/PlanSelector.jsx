import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { formatAED, PLANS } from '../data'

export default function PlanSelector({ selectedPlan, onSelect, disabled }) {
  const [expanded, setExpanded] = useState(null)

  const toggleCovers = (planId) => {
    setExpanded((prev) => (prev === planId ? null : planId))
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {PLANS.map((plan) => {
        const selected = selectedPlan === plan.id
        const isExpanded = expanded === plan.id
        const isRecommended = plan.recommended

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-lg border transition-colors overflow-hidden ${
              isRecommended || selected
                ? 'texture-card-accent border-liva-orange shadow-elevated'
                : 'texture-card border-gray-200 shadow-soft'
            } ${disabled ? 'opacity-60' : ''}`}
          >
            <div className="flex flex-1 flex-col p-2 pb-2 min-h-[88px]">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(plan.id)}
                className="text-left"
              >
                <p className="text-[11px] font-semibold text-gray-900 leading-snug pr-1">
                  {plan.name}
                </p>
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(plan.id)}
                className="mt-1.5 flex items-center justify-between gap-1"
              >
                <p className="text-xs font-bold text-gray-900 tabular-nums">{formatAED(plan.price)}</p>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected ? 'bg-liva-orange border-liva-orange' : 'border-gray-300 bg-white'
                  }`}
                >
                  {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
              </button>

              <div className={`mt-auto pt-2 ${isRecommended ? 'flex flex-col gap-1.5' : ''}`}>
                <button
                  type="button"
                  onClick={() => toggleCovers(plan.id)}
                  className={`inline-flex items-center gap-0.5 text-[10px] font-medium transition-colors ${
                    isExpanded ? 'text-liva-orange' : 'text-gray-500 hover:text-liva-orange'
                  }`}
                >
                  View more
                  <ChevronDown
                    className={`w-3 h-3 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isRecommended && (
                  <span className="self-end inline-flex items-center rounded-md bg-liva-orange text-white text-[8px] font-bold px-1.5 py-0.5">
                    Recommended
                  </span>
                )}
              </div>
            </div>

            {isExpanded && (
              <ul className="mx-2 mb-2 border-t border-gray-100 divide-y divide-gray-100">
                {plan.covers.map((cover) => (
                  <li key={cover} className="text-[10px] text-gray-600 flex items-start gap-1 py-1.5 leading-snug">
                    <span className="mt-1 w-1 h-1 rounded-full bg-liva-orange shrink-0" />
                    {cover}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
