import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronDown, Pencil } from 'lucide-react'
import {
  ADDONS,
  USER,
  VEHICLE,
  addMonthsToDate,
  calculateTotal,
  formatAED,
  formatDisplayDate,
  formatVehicleLabel,
  fromInputDate,
  getPlanById,
  getTodayDate,
  toInputDate,
} from '../data'
import { COPY } from '../copy'

const COLOR_OPTIONS = ['White', 'Black', 'Silver', 'Grey', 'Blue', 'Red', 'Pearl White']

export default function ConfirmDetailsCard({
  planId,
  selectedAddons,
  vehicleValue,
  policyStart,
  onPolicyStartChange,
  detailsExpanded,
  onToggleDetails,
  onDownloadQuote,
  onProceed,
  processing,
  highlightNext = false,
}) {
  const [hasClaims, setHasClaims] = useState(false)
  const [email, setEmail] = useState(USER.email)
  const [mobile, setMobile] = useState(USER.mobile)
  const [color, setColor] = useState(VEHICLE.color)
  const [emiratesIdExpiry, setEmiratesIdExpiry] = useState(USER.emiratesIdExpiry)

  const plan = getPlanById(planId, vehicleValue)
  const { vat, total } = calculateTotal(plan?.price ?? 0, selectedAddons)
  const selectedAddonItems = ADDONS.filter((a) => selectedAddons.includes(a.id))
  const policyEnd = addMonthsToDate(policyStart, 13)
  const minPolicyStart = toInputDate(getTodayDate())

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {detailsExpanded && (
          <motion.div
            key="details-review"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden space-y-3"
          >
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="space-y-3"
            >
              <p className="text-sm font-bold text-gray-900 text-center">{COPY.cards.confirmTitle}</p>

              <Section title={COPY.cards.carModel}>
                <DetailRow
                  label="Vehicle Model"
                  value={formatVehicleLabel(VEHICLE.model, VEHICLE.year)}
                  bold
                  shaded
                />
                <DetailRow label="Plate Number" value={VEHICLE.plate} />
                <EditableColorRow value={color} onChange={setColor} shaded />
                <DetailRow label="Place Of Registration" value={VEHICLE.placeOfRegistration} />
                <DetailRow
                  label="First Date of Regn."
                  value={formatDisplayDate(VEHICLE.firstRegistrationDate)}
                  shaded
                />
                <DetailRow label="Chassis Number" value={VEHICLE.chassisNumber} />
              </Section>

              <Section title={COPY.cards.yourDetails}>
                <DetailRow label="Full Name" value={USER.name} bold shaded />
                <EditableTextRow label="Email" value={email} onChange={setEmail} type="email" />
                <DetailRow label="Nationality" value={USER.nationality} bold shaded />
                <DetailRow label="Emirates ID" value={USER.emiratesId} />
                <EditableTextRow label="Mobile Number" value={mobile} onChange={setMobile} type="tel" shaded />
                <DetailRow label="Date of Birth" value={formatDisplayDate(USER.dateOfBirth)} />
                <EditableDateRow
                  label="Emirates ID Expiry Date"
                  value={emiratesIdExpiry}
                  onChange={setEmiratesIdExpiry}
                  shaded
                />
                <DetailRow
                  label="UAE License Issue Date"
                  value={formatDisplayDate(USER.licenseIssueDate)}
                />
              </Section>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Section
        title={COPY.cards.policyDetails}
        trailing={
          <button
            type="button"
            onClick={onToggleDetails}
            className="inline-flex items-center gap-0.5 text-[11px] text-liva-orange font-medium hover:underline transition-colors shrink-0"
          >
            {COPY.buttons.reviewDetails}
            <ChevronDown
              className={`w-3 h-3 shrink-0 transition-transform ${detailsExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        }
      >
        <DetailRow label="Plate Number" value={VEHICLE.plate} shaded />
        <DetailRow label="Insured Value" value={formatAED(vehicleValue)} />
        <EditableDateRow
          label="Policy Start Date"
          value={policyStart}
          onChange={onPolicyStartChange}
          min={minPolicyStart}
          shaded
        />
        <DetailRow label="Policy End Date" value={formatDisplayDate(policyEnd)} bold />
        <div className="px-3 py-2.5 bg-liva-cream/50">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-gray-600 leading-snug pr-2">{COPY.cards.premiumNote}</p>
            <div className="flex gap-1 shrink-0">
              <TogglePill active={hasClaims} onClick={() => setHasClaims(true)}>
                Yes
              </TogglePill>
              <TogglePill active={!hasClaims} onClick={() => setHasClaims(false)}>
                No
              </TogglePill>
            </div>
          </div>
        </div>
      </Section>

      <div className="card-surface-warm p-3 space-y-1.5">
        <p className="text-xs font-bold text-gray-900">{COPY.cards.yourPlan}</p>
        <PriceRow label={plan?.name ?? 'Plan'} value={formatAED(plan?.price ?? 0)} />
        {selectedAddonItems.map((addon) => (
          <PriceRow key={addon.id} label={addon.shortName} value={formatAED(addon.price)} />
        ))}
        <PriceRow label="VAT" value={formatAED(vat)} />
        <div className="flex justify-between pt-1.5 border-t border-liva-orange/15">
          <span className="text-xs font-bold text-gray-900">Total Premium (with VAT)</span>
          <span className="text-sm font-bold text-gray-900 tabular-nums">{formatAED(total)}</span>
        </div>
      </div>

      <div className="flex items-start gap-2 w-full">
        <Checkbox checked />
        <p className="text-[10px] text-gray-600 leading-relaxed">{COPY.cards.terms}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDownloadQuote}
          className="flex-1 rounded-full border-2 border-liva-orange text-liva-orange text-xs font-semibold py-2.5 transition-colors hover:bg-liva-orange/5"
        >
          {COPY.buttons.downloadQuote}
        </button>
        <button
          type="button"
          onClick={onProceed}
          disabled={processing}
          className={`relative flex-1 rounded-full bg-liva-orange text-white text-xs font-semibold py-2.5 shadow-btn-primary transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none overflow-hidden ${
            highlightNext && !processing ? 'action-shimmer action-shimmer-orange' : ''
          }`}
        >
          <span className="relative z-[1]">
            {processing ? 'Processing…' : COPY.buttons.proceedToPayment}
          </span>
        </button>
      </div>
    </div>
  )
}

function Section({ title, trailing, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 min-h-[18px]">
        <p className="text-xs font-bold text-gray-900">{title}</p>
        {trailing}
      </div>
      <div className="card-surface divide-y divide-gray-100/80">
        {children}
      </div>
    </div>
  )
}

function DetailRow({ label, value, bold, shaded }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-3 py-2.5 min-h-[40px] ${
        shaded ? 'bg-gray-50' : 'bg-white'
      }`}
    >
      <span className="text-[11px] text-gray-600 shrink-0">{label}</span>
      <span
        className={`text-[11px] text-gray-900 text-right flex items-center gap-1 min-w-0 ${
          bold ? 'font-bold' : 'font-medium'
        }`}
      >
        <span className="truncate">{value}</span>
      </span>
    </div>
  )
}

function EditableTextRow({ label, value, onChange, type = 'text', shaded }) {
  const [editing, setEditing] = useState(false)

  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 min-h-[40px] ${
        shaded ? 'bg-gray-50' : 'bg-white'
      } ${editing ? 'ring-1 ring-inset ring-liva-orange/30' : ''}`}
    >
      <span className="text-[11px] text-gray-600 shrink-0">{label}</span>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          autoFocus
          className="flex-1 min-w-0 text-right text-[11px] font-medium text-gray-900 bg-transparent outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 min-w-0 text-right group"
        >
          <span className="text-[11px] font-medium text-gray-900 truncate">{value}</span>
          <Pencil className="w-3 h-3 text-gray-400 shrink-0 group-hover:text-liva-orange" />
        </button>
      )}
    </div>
  )
}

function EditableColorRow({ value, onChange, shaded }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`relative flex items-center justify-between gap-2 px-3 py-2 min-h-[40px] ${
        shaded ? 'bg-gray-50' : 'bg-white'
      }`}
    >
      <span className="text-[11px] text-gray-600 shrink-0">Color</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 min-w-0 group"
      >
        <span className="text-[11px] font-medium text-gray-900">{value}</span>
        <ChevronDown
          className={`w-3 h-3 text-gray-400 shrink-0 transition-transform group-hover:text-liva-orange ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="absolute right-3 top-full z-10 mt-1 w-36 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
              className={`w-full px-3 py-1.5 text-left text-[11px] hover:bg-liva-orange/5 ${
                option === value ? 'text-liva-orange font-semibold' : 'text-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EditableDateRow({ label, value, onChange, shaded, min }) {
  const [editing, setEditing] = useState(false)
  const inputValue = toInputDate(value)

  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 min-h-[40px] ${
        shaded ? 'bg-gray-50' : 'bg-white'
      } ${editing ? 'ring-1 ring-inset ring-liva-orange/30' : ''}`}
    >
      <span className="text-[11px] text-gray-600 shrink-0">{label}</span>
      {editing ? (
        <input
          type="date"
          value={inputValue}
          min={min}
          onChange={(e) => {
            if (e.target.value) onChange(fromInputDate(e.target.value))
          }}
          onBlur={() => setEditing(false)}
          autoFocus
          className="text-[11px] font-medium text-gray-900 bg-transparent outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 group"
        >
          <span className="text-[11px] font-medium text-gray-900">{formatDisplayDate(value)}</span>
          <Calendar className="w-3 h-3 text-gray-400 shrink-0 group-hover:text-liva-orange" />
        </button>
      )}
    </div>
  )
}

function PriceRow({ label, value }) {
  return (
    <div className="flex justify-between text-[11px] gap-2">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold text-gray-900 tabular-nums shrink-0">{value}</span>
    </div>
  )
}

function TogglePill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
        active
          ? 'bg-liva-orange text-white border-liva-orange'
          : 'bg-white text-gray-600 border-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function Checkbox({ checked }) {
  return (
    <div
      className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
        checked ? 'bg-liva-orange border-liva-orange' : 'border-gray-300 bg-white'
      }`}
    >
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </div>
  )
}
