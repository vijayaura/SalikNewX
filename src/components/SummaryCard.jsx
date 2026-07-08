import { formatAED, ADDONS, calculateTotal, getPlanById, USER, VEHICLE } from '../data'
import { InlineButton } from './ChatBubble'
import UaeCarPlate from './UaeCarPlate'
import VehicleBadge from './VehicleBadge'
import { COPY } from '../copy'

export default function SummaryCard({
  planId,
  selectedAddons,
  vehicleValue,
  acceptedTerms,
  onToggleTerms,
  onPay,
  processing,
}) {
  const plan = getPlanById(planId, vehicleValue)
  const { vat, total } = calculateTotal(plan?.price ?? 0, selectedAddons)
  const selectedAddonItems = ADDONS.filter((a) => selectedAddons.includes(a.id))

  return (
    <div className="card mt-1 divide-y divide-gray-200/80 overflow-hidden">
      <div className="p-2.5 space-y-2">
        <p className="text-xs font-semibold text-gray-900">{COPY.cards.summary}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <VehicleBadge model={VEHICLE.model} year={VEHICLE.year} compact />
          </div>
          <UaeCarPlate plate={VEHICLE.plate} emirate={VEHICLE.emirate ?? 'Dubai'} compact />
        </div>
        <Row label="Period" value={`${VEHICLE.policyStart} – ${VEHICLE.policyEnd}`} />
      </div>

      <div className="p-2.5 space-y-1">
        <Row label={`Plan (${plan?.name})`} value={formatAED(plan?.price ?? 0)} />
        {selectedAddonItems.map((addon) => (
          <Row key={addon.id} label={addon.name} value={formatAED(addon.price)} />
        ))}
        <Row label="VAT (5%)" value={formatAED(vat)} muted />
        <div className="flex justify-between pt-1.5 border-t border-gray-200">
          <span className="text-xs font-semibold">Total</span>
          <span className="text-base font-bold text-liva-orange">{formatAED(total)}</span>
        </div>
      </div>

      <div className="p-2.5 space-y-2">
        <div className="text-xs">
          <p className="text-gray-500 text-[10px] mb-0.5">Payment</p>
          <p className="font-medium">{USER.cardName}</p>
          <p className="text-gray-500 font-mono text-[11px]">•••• •••• •••• 4289</p>
        </div>

        <button type="button" onClick={onToggleTerms} className="flex items-start gap-2 w-full text-left">
          <div
            className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
              acceptedTerms ? 'bg-liva-orange border-liva-orange' : 'border-gray-300'
            }`}
          >
            {acceptedTerms && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <p className="text-[10px] text-gray-600 leading-relaxed">
            I accept the <span className="text-liva-orange underline">Terms & Conditions</span>.
          </p>
        </button>

        {onPay && (
          <InlineButton onClick={onPay} disabled={!acceptedTerms} processing={processing}>
            Pay {formatAED(total)}
          </InlineButton>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, muted }) {
  return (
    <div className="flex justify-between text-xs gap-2">
      <span className={`truncate mr-1 ${muted ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      <span className={`font-medium shrink-0 ${muted ? 'text-gray-400' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}

export { calculateTotal }
