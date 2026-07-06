import {
  Car,
  Check,
  Globe2,
  HeartPulse,
  Mountain,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react'
import { ADDONS, formatAED } from '../data'

const ADDON_ICONS = {
  'driver-pa': { Icon: HeartPulse, bg: 'bg-blue-500', light: 'bg-blue-50' },
  'passenger-pa': { Icon: Users, bg: 'bg-violet-500', light: 'bg-violet-50' },
  ncd: { Icon: ShieldCheck, bg: 'bg-emerald-500', light: 'bg-emerald-50' },
  breakdown: { Icon: Truck, bg: 'bg-amber-500', light: 'bg-amber-50' },
  gcc: { Icon: Globe2, bg: 'bg-teal-500', light: 'bg-teal-50' },
  offroad: { Icon: Mountain, bg: 'bg-orange-600', light: 'bg-orange-50' },
}

function AddonIcon({ id, selected }) {
  const config = ADDON_ICONS[id] ?? { Icon: Car, bg: 'bg-gray-500', light: 'bg-gray-50' }
  const { Icon, bg, light } = config

  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
        selected ? bg : light
      }`}
    >
      <Icon
        className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-600'}`}
        strokeWidth={2}
      />
    </div>
  )
}

export default function AddonGrid({ selectedAddons, onToggle, disabled, onContinue, highlightNext = false }) {
  const selectedCount = selectedAddons.length
  const selectedTotal = ADDONS.filter((a) => selectedAddons.includes(a.id)).reduce(
    (sum, a) => sum + a.price,
    0,
  )

  return (
    <div className="mt-1 space-y-2">
      <div className="card-surface-muted divide-y divide-gray-100/80">
        {ADDONS.map((addon) => {
          const selected = selectedAddons.includes(addon.id)

          return (
            <button
              key={addon.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(addon.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 text-left transition-all ${
                selected ? 'bg-liva-orange/[0.04]' : 'bg-white hover:bg-gray-50/80'
              } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div
                className={`w-0.5 self-stretch rounded-full shrink-0 transition-colors ${
                  selected ? 'bg-liva-orange' : 'bg-transparent'
                }`}
              />

              <AddonIcon id={addon.id} selected={selected} />

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{addon.shortName}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{addon.desc}</p>
              </div>

              <div
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 shrink-0 text-[11px] font-semibold tabular-nums transition-colors ${
                  selected
                    ? 'bg-liva-orange text-white'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {selected && <Check className="w-3 h-3" strokeWidth={3} />}
                <span>{selected ? formatAED(addon.price) : `+${formatAED(addon.price)}`}</span>
              </div>
            </button>
          )
        })}
      </div>

      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          className={`relative w-full rounded-lg bg-liva-orange text-white py-2.5 px-3 text-xs font-semibold shadow-btn-primary transition-colors hover:bg-liva-orange-light disabled:opacity-50 ${
            highlightNext && !disabled ? 'action-shimmer action-shimmer-orange overflow-hidden' : ''
          }`}
        >
          {selectedCount > 0 ? (
            <span className="relative z-[1] flex items-center justify-center gap-1.5 tabular-nums">
              <span>{selectedCount} add-on{selectedCount > 1 ? 's' : ''}</span>
              <span className="opacity-60">·</span>
              <span>+{formatAED(selectedTotal)}</span>
              <span className="opacity-60">·</span>
              <span>Continue</span>
            </span>
          ) : (
            <span className="relative z-[1]">Continue</span>
          )}
        </button>
      )}
    </div>
  )
}
