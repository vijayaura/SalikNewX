import { formatAED, calculateTotal, PLANS } from '../data'

export default function ActionBar({ stage, planId, selectedAddons, acceptedTerms, onAction, processing }) {
  const plan = PLANS.find((p) => p.id === planId)
  const { total } = calculateTotal(plan?.price ?? 0, selectedAddons)

  const config = {
    welcome: null,
    plan: {
      label: `Confirm ${plan?.name ?? 'plan'}`,
      sublabel: formatAED(plan?.price ?? 0),
      disabled: !planId,
    },
    payment: {
      label: processing ? 'Processing…' : `Pay ${formatAED(total)}`,
      sublabel: 'Click 2 of 3',
      disabled: !acceptedTerms || processing,
    },
    documents: {
      label: processing ? 'Verifying…' : 'Issue policy',
      sublabel: 'Click 3 of 3',
      disabled: processing,
    },
    complete: null,
  }

  const current = config[stage]
  if (!current) return null

  return (
    <div className="safe-bottom fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="px-4 py-3 max-w-lg mx-auto">
        <button
          type="button"
          disabled={current.disabled}
          onClick={onAction}
          className={`w-full rounded-xl py-4 px-5 text-left transition-colors ${
            current.disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-liva-orange text-white'
          }`}
        >
          <p className="font-semibold">{current.label}</p>
          <p className={`text-xs mt-0.5 ${current.disabled ? 'text-gray-400' : 'text-white/80'}`}>
            {current.sublabel}
          </p>
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">Powered by Aura</p>
      </div>
    </div>
  )
}

export function LiveTotal({ planId, selectedAddons, visible }) {
  const plan = PLANS.find((p) => p.id === planId)
  const { total } = calculateTotal(plan?.price ?? 0, selectedAddons)

  if (!visible || !planId) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto z-40">
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm">
        <span className="text-sm text-gray-500">Subtotal</span>
        <span className="text-lg font-bold text-liva-orange">{formatAED(total)}</span>
      </div>
    </div>
  )
}
