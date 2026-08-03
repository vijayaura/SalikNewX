import { useState } from 'react'
import { Car, Check, ChevronDown, Shield, ShieldCheck } from 'lucide-react'
import { formatAED, getPlansWithPricing } from '../data'

const PLAN_ICONS = {
  agency: Car,
  'non-agency': ShieldCheck,
  'third-party': Shield,
}

export default function PlanSelector({
  selectedPlan,
  onSelect,
  disabled,
  highlightNext = false,
  vehicleValue,
}) {
  const [expanded, setExpanded] = useState(null)
  const plans = getPlansWithPricing(vehicleValue)

  const toggleCovers = (planId, e) => {
    e.stopPropagation()
    setExpanded((prev) => (prev === planId ? null : planId))
  }

  return (
    <div className="flex flex-col gap-2">
      {plans.map((plan) => {
        const selected = selectedPlan === plan.id
        const isExpanded = expanded === plan.id
        const isRecommended = plan.recommended
        const PlanIcon = PLAN_ICONS[plan.id] ?? Shield
        const showShimmer = highlightNext && !disabled

        return (
          <div
            key={plan.id}
            className={`relative flex w-full flex-col rounded-xl border transition-all overflow-hidden ${
              selected
                ? 'texture-card-accent border-liva-orange shadow-elevated'
                : isRecommended
                  ? 'texture-card-accent border-liva-orange/40 shadow-soft'
                  : 'texture-card border-gray-200 shadow-soft'
            } ${disabled ? 'opacity-60' : ''} ${showShimmer ? 'action-shimmer action-shimmer-plan ring-1 ring-liva-orange/25' : ''}`}
          >
            <div className="relative p-3">
              {plan.badge && (
                <span
                  className={`pointer-events-none absolute top-2.5 right-2.5 rounded px-1.5 py-0.5 text-[7px] font-bold leading-tight uppercase tracking-wide ${
                    plan.badge === 'BY LAW'
                      ? 'bg-gray-800 text-white'
                      : 'bg-liva-orange text-white'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(plan.id)}
                className="flex w-full items-start gap-3 text-left"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    selected || isRecommended ? 'bg-liva-orange/10' : 'bg-gray-100'
                  }`}
                >
                  <PlanIcon
                    className={`h-4 w-4 ${selected || isRecommended ? 'text-liva-orange' : 'text-gray-500'}`}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0 flex-1 pr-8">
                  <p className="text-sm font-bold leading-tight text-gray-900">{plan.name}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-gray-500">{plan.subtitle}</p>
                  <ul className="mt-1.5 space-y-0.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-[10px] leading-snug text-gray-600">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-gray-900">{formatAED(plan.price)}</p>
                  <p className="text-[10px] font-medium text-gray-500">/yr</p>
                </div>
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(plan.id)}
                className="absolute bottom-3 right-3"
                aria-label={selected ? 'Selected' : `Select ${plan.name}`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-liva-orange bg-liva-orange' : 'border-gray-300 bg-white'
                  }`}
                >
                  {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => toggleCovers(plan.id, e)}
                className={`mt-2 inline-flex items-center gap-0.5 pl-12 text-[10px] font-medium transition-colors ${
                  isExpanded ? 'text-liva-orange' : 'text-gray-500 hover:text-liva-orange'
                }`}
              >
                View what&apos;s covered
                <ChevronDown
                  className={`h-3 w-3 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {isExpanded && (
              <ul className="mx-3 mb-3 border-t border-gray-100 divide-y divide-gray-100">
                {plan.covers.map((cover) => (
                  <li key={cover} className="flex items-start gap-1 py-1.5 text-[10px] leading-snug text-gray-600">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-liva-orange" />
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
