import { Check } from 'lucide-react'
import { formatAED, getAddonCatalog } from '../data'
import AddonIcon from './AddonIcon'

export default function AddonGrid({
  planId,
  selectedAddons,
  onToggle,
  disabled,
  onContinue,
  highlightNext = false,
  wheelOrangeCard = false,
}) {
  const addons = getAddonCatalog(planId, { includeOrangeCard: wheelOrangeCard })
  const selectedCount = selectedAddons.filter((id) => addons.some((a) => a.id === id)).length
  const selectedTotal = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0)

  if (addons.length === 0) return null

  return (
    <div className="mt-1 space-y-2">
      <div className="flex items-center gap-2 px-0.5">
        <p className="text-xs font-bold text-gray-900">
          {wheelOrangeCard ? 'Optional upgrades & rewards' : 'Optional Upgrades'}
        </p>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
          {wheelOrangeCard ? 'incl. wheel prize' : 'comprehensive only'}
        </span>
      </div>

      <div className="card-surface-muted divide-y divide-gray-100/80">
        {addons.map((addon) => {
          const isWheelPrize = addon.wheelPrize && wheelOrangeCard
          const selected = isWheelPrize || selectedAddons.includes(addon.id)
          const locked = isWheelPrize

          return (
            <button
              key={addon.id}
              type="button"
              disabled={disabled || locked}
              onClick={() => !locked && onToggle(addon.id)}
              className={`flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left transition-all ${
                isWheelPrize
                  ? 'bg-liva-orange/[0.06]'
                  : selected
                    ? 'bg-liva-orange/[0.04]'
                    : 'bg-white hover:bg-gray-50/80'
              } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
            >
              <div
                className={`w-0.5 shrink-0 self-stretch rounded-full transition-colors ${
                  selected ? 'bg-liva-orange' : 'bg-transparent'
                }`}
              />

              <AddonIcon id={addon.id} selected={selected} />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold leading-tight text-gray-900">
                  {addon.shortName}
                  {isWheelPrize && (
                    <span className="ml-1 rounded bg-liva-orange px-1 py-px text-[7px] font-bold uppercase text-white">
                      Wheel prize
                    </span>
                  )}
                </p>
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
