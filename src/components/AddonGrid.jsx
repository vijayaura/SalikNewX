import { Car, Check, Globe2, Mountain, ShieldCheck } from 'lucide-react'
import { formatAED, getAddonsForPlan } from '../data'

const ADDON_ICONS = {
  gcc: { Icon: Globe2, bg: 'bg-teal-500', light: 'bg-teal-50' },
  ncd: { Icon: ShieldCheck, bg: 'bg-emerald-500', light: 'bg-emerald-50' },
  'rent-a-car': { Icon: Car, bg: 'bg-blue-500', light: 'bg-blue-50' },
  offroad: { Icon: Mountain, bg: 'bg-orange-600', light: 'bg-orange-50' },
}

function AddonIcon({ id, selected }) {
  const config = ADDON_ICONS[id] ?? { Icon: Car, bg: 'bg-gray-500', light: 'bg-gray-50' }
  const { Icon, bg, light } = config

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
        selected ? bg : light
      }`}
    >
      <Icon
        className={`h-4 w-4 ${selected ? 'text-white' : 'text-gray-600'}`}
        strokeWidth={2}
      />
    </div>
  )
}

export default function AddonGrid({
  planId,
  selectedAddons,
  onToggle,
  disabled,
  onContinue,
  highlightNext = false,
}) {
  const addons = getAddonsForPlan(planId)
  const selectedCount = selectedAddons.filter((id) => addons.some((a) => a.id === id)).length
  const selectedTotal = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0)

  if (addons.length === 0) return null

  return (
    <div className="mt-1 space-y-2">
      <div className="flex items-center gap-2 px-0.5">
        <p className="text-xs font-bold text-gray-900">Optional Upgrades</p>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
          comprehensive only
        </span>
      </div>

      <div className="card-surface-muted divide-y divide-gray-100/80">
        {addons.map((addon) => {
          const selected = selectedAddons.includes(addon.id)

          return (
            <button
              key={addon.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(addon.id)}
              className={`flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left transition-all ${
                selected ? 'bg-liva-orange/[0.04]' : 'bg-white hover:bg-gray-50/80'
              } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
            >
              <div
                className={`w-0.5 shrink-0 self-stretch rounded-full transition-colors ${
                  selected ? 'bg-liva-orange' : 'bg-transparent'
                }`}
              />

              <AddonIcon id={addon.id} selected={selected} />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold leading-tight text-gray-900">{addon.shortName}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-gray-500">{addon.desc}</p>
              </div>

              <div
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums transition-colors ${
                  selected
                    ? 'bg-liva-orange text-white'
                    : 'border border-gray-200 bg-gray-100 text-gray-700'
                }`}
              >
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
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
          className={`relative w-full rounded-lg bg-liva-orange px-3 py-2.5 text-xs font-semibold text-white shadow-btn-primary transition-colors hover:bg-liva-orange-light disabled:opacity-50 ${
            highlightNext && !disabled ? 'action-shimmer action-shimmer-orange overflow-hidden' : ''
          }`}
        >
          {selectedCount > 0 ? (
            <span className="relative z-[1] flex items-center justify-center gap-1.5 tabular-nums">
              <span>
                {selectedCount} add-on{selectedCount > 1 ? 's' : ''}
              </span>
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
