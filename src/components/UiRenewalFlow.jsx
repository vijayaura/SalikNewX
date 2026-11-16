import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, ChevronRight, Download, ShieldCheck } from 'lucide-react'
import {
  addMonthsToDate,
  calculateTotal,
  formatAED,
  formatChatDate,
  clampPolicyStartDate,
  fromInputDate,
  getAddonCatalog,
  getTodayDate,
  getPlanById,
  getPlansWithPricing,
  getValueLimits,
  isComprehensivePlan,
  toInputDate,
} from '../data'
import AddonIcon from './AddonIcon'
import DocumentUpload, { PolicyReady } from './DocumentUpload'
import PlanCoverageModal from './PlanCoverageModal'

function ToggleSwitch({ on, onToggle, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={`flex h-7 w-[2.875rem] shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:ring-offset-1 ${
        on ? 'bg-emerald-500' : 'bg-gray-200'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        aria-hidden
        className={`block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ease-out ${
          on ? 'translate-x-[1.125rem]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function UiRenewalFlow({
  stage,
  vehicleValue,
  onVehicleValueChange,
  selectedPlan,
  onSelectPlan,
  selectedAddons,
  onToggleAddon,
  policyStart,
  onPolicyStartChange,
  onDownloadQuote,
  onAgreePay,
  onVerifyDocs,
  onDownloadPolicy,
  processing,
  wheelOrangeCard,
  premiumDiscountPercent = 0,
}) {
  const [coversPlan, setCoversPlan] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [hasClaims, setHasClaims] = useState(false)
  const [termsOk, setTermsOk] = useState(false)
  const [accuracyOk, setAccuracyOk] = useState(false)
  const [footerPremiumPulse, setFooterPremiumPulse] = useState(false)
  const vehicleValueInitialized = useRef(false)

  useEffect(() => {
    if (!vehicleValueInitialized.current) {
      vehicleValueInitialized.current = true
      return
    }
    setFooterPremiumPulse(true)
    const hideTimer = setTimeout(() => setFooterPremiumPulse(false), 1500)
    return () => clearTimeout(hideTimer)
  }, [vehicleValue])

  const plans = getPlansWithPricing(vehicleValue)
  const plan = selectedPlan ? getPlanById(selectedPlan, vehicleValue) : null
  const addons = getAddonCatalog(selectedPlan, { includeOrangeCard: wheelOrangeCard })
  const calcOpts = { includeOrangeCard: wheelOrangeCard, premiumDiscountPercent }
  const { subtotal, vat, total, preDiscountSubtotal, planSavings } = calculateTotal(
    plan?.price ?? 0,
    selectedAddons,
    selectedPlan,
    calcOpts,
  )
  const limits = useMemo(() => getValueLimits(), [])
  const minPolicyStart = useMemo(() => toInputDate(getTodayDate()), [])
  const policyEnd = policyStart ? addMonthsToDate(policyStart, 13) : ''

  const payReady = Boolean(selectedPlan && termsOk && accuracyOk && !processing)

  if (stage === 'complete') {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col bg-[#f7f4f0]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto px-3 py-4">
          <PolicyReady onDownload={onDownloadPolicy} />
        </motion.div>
      </div>
    )
  }

  if (stage === 'documents') {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col bg-[#f7f4f0]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-3 text-center text-sm font-bold text-gray-900">Upload your documents</p>
          <DocumentUpload
            uploaded={false}
            uploading={processing}
            onVerify={onVerifyDocs}
            highlightNext
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#f7f4f0]">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-28 pt-2">
        <div className="mb-3 grid grid-cols-3 gap-1.5">
          {plans.map((p) => {
            const active = selectedPlan === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPlan(p.id)}
                className={`rounded-xl border px-2 py-2 text-center transition-colors ${
                  active
                    ? 'border-liva-orange bg-liva-orange text-white shadow-btn-primary'
                    : 'border-gray-200 bg-white text-gray-800'
                }`}
              >
                <p className="text-[10px] font-semibold leading-tight">{p.name}</p>
                <p className={`mt-0.5 text-xs font-bold tabular-nums ${active ? 'text-white' : 'text-liva-orange'}`}>
                  {formatAED(p.price)}
                </p>
              </button>
            )
          })}
        </div>

        {plan && (
          <motion.div
            layout
            className="relative mb-3 overflow-hidden rounded-2xl border border-liva-orange/20 bg-gradient-to-r from-white via-white to-liva-orange/[0.07] p-3.5 shadow-elevated"
          >
            <div
              className="pointer-events-none absolute -right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-liva-orange/[0.1] blur-2xl"
              aria-hidden
            />
            <div className="relative flex gap-3">
              <div className="relative shrink-0">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-liva-orange to-liva-orange-light shadow-btn-primary">
                  <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                {plan.badge && (
                  <span
                    className={`pointer-events-none absolute -right-1.5 -top-1.5 z-10 max-w-[4.25rem] rounded-md px-1 py-0.5 text-center text-[7px] font-bold leading-tight uppercase shadow-sm ${
                      plan.badge === 'BY LAW' ? 'bg-gray-900 text-white' : 'bg-white text-liva-orange ring-1 ring-liva-orange/30'
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {isComprehensivePlan(plan.id) && (
                      <span className="mb-0.5 inline-block rounded-full bg-liva-orange/10 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-liva-orange">
                        Comprehensive
                      </span>
                    )}
                    <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-gray-500">{plan.subtitle}</p>
                  </div>

                  <div className="shrink-0 text-right leading-none">
                    <p className="text-xl font-bold tabular-nums text-gray-900">{formatAED(plan.price)}</p>
                    <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                      per year
                    </p>
                  </div>
                </div>

                <ul className="mt-2 flex flex-wrap gap-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-md border border-gray-100/80 bg-white/80 px-1.5 py-0.5 text-[9px] font-medium text-gray-600"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCoversPlan(plan)}
              className="relative mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-liva-orange/25 bg-white/90 px-3 py-2.5 text-left text-[11px] font-semibold text-liva-orange shadow-soft transition-colors hover:border-liva-orange/40 hover:bg-liva-orange hover:text-white"
            >
              <span>View what&apos;s covered</span>
              <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}

        {addons.length > 0 && (
          <div className="mb-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-soft">
            <p className="mb-2 text-[10px] font-semibold text-gray-500">
              {wheelOrangeCard ? 'Add-ons & rewards' : 'Optional upgrades'}{' '}
              {isComprehensivePlan(selectedPlan) && (
                <span className="text-gray-400">· comprehensive only</span>
              )}
            </p>
            <div className="divide-y divide-gray-100/80 rounded-xl border border-gray-100/80 overflow-hidden">
              {addons.map((addon) => {
                const isWheelPrize = addon.wheelPrize && wheelOrangeCard
                const on = isWheelPrize || selectedAddons.includes(addon.id)
                const locked = isWheelPrize
                return (
                  <div
                    key={addon.id}
                    role={locked ? undefined : 'button'}
                    tabIndex={locked ? undefined : 0}
                    onClick={locked ? undefined : () => onToggleAddon(addon.id)}
                    onKeyDown={
                      locked
                        ? undefined
                        : (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onToggleAddon(addon.id)
                            }
                          }
                    }
                    className={`flex w-full items-center gap-2 px-2 py-2.5 text-left transition-colors ${
                      locked ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      isWheelPrize
                        ? 'bg-liva-orange/[0.06]'
                        : on
                          ? 'bg-liva-orange/[0.04]'
                          : 'bg-white hover:bg-gray-50/80'
                    }`}
                  >
                    <div
                      className={`w-0.5 shrink-0 self-stretch rounded-full ${
                        on ? 'bg-liva-orange' : 'bg-transparent'
                      }`}
                    />
                    <AddonIcon id={addon.id} selected={on} compact />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold leading-tight text-gray-900">
                        {addon.shortName ?? addon.name}
                        {isWheelPrize && (
                          <span className="ml-1 rounded bg-liva-orange px-1 py-px text-[7px] font-bold uppercase text-white">
                            Wheel prize
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-snug text-gray-500">{addon.desc}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-semibold tabular-nums ${
                        on ? 'bg-liva-orange text-white' : 'border border-gray-200 bg-gray-100 text-gray-700'
                      }`}
                    >
                      {on && <Check className="h-3 w-3" strokeWidth={3} />}
                      {on ? formatAED(addon.price) : `+${formatAED(addon.price)}`}
                    </span>
                    {locked ? null : (
                      <ToggleSwitch on={on} onToggle={() => onToggleAddon(addon.id)} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <motion.div layout className="rounded-2xl border border-gray-100 bg-white shadow-soft">
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-left"
          >
            <span className="text-xs font-semibold text-gray-900">Edit more details</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {detailsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-gray-100 px-3 pb-3"
              >
                <div className="pt-3">
                  <motion.div layout className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-medium text-gray-600">Vehicle value</span>
                    <span className="text-sm font-bold tabular-nums text-gray-900">
                      {formatAED(vehicleValue)}
                    </span>
                  </motion.div>
                  <input
                    type="range"
                    min={limits.min}
                    max={limits.max}
                    step={limits.step}
                    value={vehicleValue}
                    onChange={(e) => onVehicleValueChange(Number(e.target.value))}
                    className="ui-range mt-2 w-full"
                    style={{
                      '--range-pct': `${((vehicleValue - limits.min) / (limits.max - limits.min)) * 100}%`,
                    }}
                  />
                  <motion.div layout className="mt-1 flex justify-between text-[9px] text-gray-500">
                    <span>Min {formatAED(limits.min)}</span>
                    <span>Max {formatAED(limits.max)}</span>
                  </motion.div>
                </div>

                <motion.div layout className="mt-4">
                  <p className="mb-1.5 text-[11px] font-medium text-gray-600">Any claims in the last year?</p>
                  <div className="flex rounded-full border border-gray-200 bg-gray-50 p-0.5">
                    {['No', 'Yes'].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setHasClaims(label === 'Yes')}
                        className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold ${
                          hasClaims === (label === 'Yes')
                            ? 'bg-white text-liva-orange shadow-sm'
                            : 'text-gray-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div layout className="mt-4 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] font-medium text-gray-500">Starts</span>
                    <input
                      type="date"
                      value={toInputDate(policyStart)}
                      min={minPolicyStart}
                      onChange={(e) => {
                        if (!e.target.value) return
                        onPolicyStartChange(clampPolicyStartDate(fromInputDate(e.target.value)))
                      }}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[11px]"
                    />
                  </label>
                  <div>
                    <span className="text-[10px] font-medium text-gray-500">Ends (auto)</span>
                    <p className="mt-1 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 text-[11px] text-gray-700">
                      {policyEnd ? formatChatDate(policyEnd) : '—'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div layout className="mt-3 space-y-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-soft">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={accuracyOk}
              onChange={(e) => setAccuracyOk(e.target.checked)}
              className="mt-0.5 accent-liva-orange"
            />
            <span className="text-[11px] leading-snug text-gray-700">
              I confirm the vehicle and driver details provided are accurate
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={termsOk}
              onChange={(e) => setTermsOk(e.target.checked)}
              className="mt-0.5 accent-liva-orange"
            />
            <span className="text-[11px] leading-snug text-gray-700">
              I have read and accept the policy terms and the schedule of benefits
            </span>
          </label>
        </motion.div>

        <button
          type="button"
          onClick={onDownloadQuote}
          disabled={!selectedPlan}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-[11px] font-semibold text-gray-800 shadow-soft disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Download quote
        </button>
      </div>

      <div className="safe-bottom absolute bottom-0 left-0 right-0 border-t border-gray-200/80 bg-white/95 px-3 pb-2 pt-2 backdrop-blur-sm">
        <motion.div
          layout
          className={`relative mb-2 rounded-xl px-1 py-1.5 transition-colors ${
            footerPremiumPulse ? 'bg-liva-orange/[0.14] ring-1 ring-liva-orange/40' : ''
          }`}
          animate={
            footerPremiumPulse
              ? { scale: [1, 1.035, 1], y: [0, -5, 0] }
              : { scale: 1, y: 0 }
          }
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence>
            {footerPremiumPulse && (
              <motion.span
                initial={{ opacity: 0, y: 6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-none absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-liva-orange px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-md"
              >
                Premium updated
              </motion.span>
            )}
          </AnimatePresence>
          <div className="grid grid-cols-3 gap-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-500">
            <motion.div layout>
              <p>Premium</p>
              {premiumDiscountPercent > 0 && planSavings > 0 && (
                <p className="mb-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-600">
                  {premiumDiscountPercent}% wheel offer
                </p>
              )}
              {premiumDiscountPercent > 0 && planSavings > 0 && (
                <p className="text-[10px] font-medium text-gray-400 line-through tabular-nums">
                  {formatAED(preDiscountSubtotal)}
                </p>
              )}
              <motion.p
                key={`prem-${subtotal}`}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                className="text-xs font-bold text-gray-900 tabular-nums"
              >
                {formatAED(subtotal)}
              </motion.p>
            </motion.div>
            <motion.div layout>
              <p>VAT (5%)</p>
              <motion.p
                key={`vat-${vat}`}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                className="text-xs font-bold text-gray-900 tabular-nums"
              >
                {formatAED(vat)}
              </motion.p>
            </motion.div>
            <motion.div layout>
              <p>Total</p>
              <motion.p
                key={`tot-${total}`}
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                className="text-sm font-bold text-liva-orange tabular-nums"
              >
                {formatAED(total)}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
        <button
          type="button"
          onClick={onAgreePay}
          disabled={!payReady}
          className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-liva-orange py-2.5 text-[11px] font-semibold text-white shadow-btn-primary disabled:bg-gray-200 disabled:text-gray-400"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {processing ? 'Processing…' : 'Agree & Pay'}
        </button>
      </div>

      <AnimatePresence>
        {coversPlan && (
          <PlanCoverageModal plan={coversPlan} onClose={() => setCoversPlan(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}