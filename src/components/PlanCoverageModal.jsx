import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

const PLAN_COVERAGE_DETAIL = {
  agency: {
    highlights: [
      'Genuine manufacturer parts',
      'Authorised dealer workshops',
      'Full own-damage + third party',
    ],
    mainCover: [
      'Loss or damage to your vehicle',
      'Third party liability for property damage',
      'Third party liability to family and passengers',
      'Ambulance cover',
    ],
    freeExtras: [
      'Personal accident benefit — driver',
      'Personal accident benefit — passengers',
      'Breakdown recovery',
      'Perils of nature',
      'Emergency medical expense',
    ],
  },
  'non-agency': {
    highlights: [
      'Repair at any garage you trust',
      'Theft & fire included',
      'Full own-damage + third party',
    ],
    mainCover: [
      'Loss or damage to your vehicle',
      'Theft & fire protection',
      'Third party liability',
      'Natural calamities',
    ],
    freeExtras: [
      'Personal accident benefit — driver',
      'Breakdown recovery',
      'Taxi fare',
      'Emergency medical expense',
    ],
  },
  'third-party': {
    highlights: ['Legal minimum cover', 'Third party property damage', 'Lowest annual price'],
    mainCover: [
      'Third party bodily injury',
      'Third party property damage',
      'Legal liability cover',
    ],
    freeExtras: [],
  },
}

export default function PlanCoverageModal({ plan, onClose }) {
  if (!plan) return null

  const detail = PLAN_COVERAGE_DETAIL[plan.id] ?? {
    highlights: plan.features,
    mainCover: plan.covers,
    freeExtras: [],
  }

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black/45 p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[min(82%,28rem)] w-full overflow-y-auto overscroll-contain rounded-2xl bg-white p-4 shadow-elevated"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              What&apos;s covered · {plan.name}
            </h2>
            <p className="mt-0.5 text-[11px] text-gray-500">{plan.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <ul className="mb-3 space-y-2">
          {detail.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[11px] text-gray-700">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>

        <div className="space-y-3 rounded-xl bg-liva-orange/[0.06] p-3">
          <section>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-liva-orange">Main cover</p>
            <ul className="space-y-1.5">
              {detail.mainCover.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[11px] text-gray-800">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-liva-orange" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          {detail.freeExtras.length > 0 && (
            <section>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-liva-orange">
                Free extras
              </p>
              <ul className="space-y-1.5">
                {detail.freeExtras.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[11px] text-gray-800">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-liva-orange" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  )
}