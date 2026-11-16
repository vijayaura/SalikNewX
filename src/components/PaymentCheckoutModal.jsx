import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, CreditCard, X } from 'lucide-react'
import { formatAED } from '../data'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function currentYear() {
  return new Date().getFullYear()
}

export default function PaymentCheckoutModal({
  open,
  onClose,
  amount,
  customerName,
  processing = false,
  onPay,
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState(MONTHS[0])
  const [expiryYear, setExpiryYear] = useState(String(currentYear() + 1))

  useEffect(() => {
    if (!open) {
      setCardNumber('')
      setExpiryMonth(MONTHS[0])
      setExpiryYear(String(currentYear() + 1))
    }
  }, [open])

  const years = Array.from({ length: 12 }, (_, i) => String(currentYear() + i))

  const submit = () => {
    if (processing) return
    onPay?.()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-[110] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-labelledby="payment-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="relative flex max-h-[92%] w-full max-w-[360px] flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-[#f3f4f6] shadow-2xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-300/80 bg-white px-3 py-2">
            <h2 id="payment-title" className="text-sm font-semibold text-gray-800">
              Payment Details
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-0 rounded-lg border border-gray-300 bg-white text-[11px] text-gray-700">
              <DetailRow label="NAME:" value="Demo Merchant" />
              <DetailRow label="ORDER:" value={customerName || 'Customer'} />
              <DetailRow label="ORDER DESCRIPTION:" value="Motor Insurance" />
              <DetailRow
                label="AMOUNT TO PAY:"
                value={formatAED(amount)}
                bold
                last
              />
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold text-gray-800">Payment Using</p>
              <label className="block text-[10px] text-gray-600">Choose Payment Method</label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded border border-gray-400 bg-white py-2 pl-2 pr-8 text-[11px] text-gray-800"
                  defaultValue="card"
                  disabled={processing}
                >
                  <option value="card">Payment Card</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] text-gray-600">
              Click below to complete your payment
            </p>
            <button
              type="button"
              onClick={submit}
              disabled={processing}
              className="mt-2 flex w-full items-center justify-between rounded-md bg-black px-3 py-2.5 text-left disabled:opacity-60"
            >
              <span className="text-xs font-bold tracking-wide text-white">SAMSUNG</span>
              <span className="text-sm font-semibold text-white">Pay</span>
              <ChevronRight className="h-4 w-4 text-white" />
            </button>

            <p className="mt-4 text-center text-[10px] text-gray-600">
              Or enter your card details below
            </p>
            <div className="mt-1 flex items-center justify-center gap-3 opacity-90">
              <span className="rounded bg-[#1a1f71] px-2 py-0.5 text-[9px] font-bold text-white">
                VISA
              </span>
              <span className="flex h-5 w-8 items-center justify-center rounded bg-white ring-1 ring-gray-200">
                <span className="text-[8px] font-bold text-red-600">MC</span>
              </span>
            </div>

            <div className="mt-3 space-y-2 rounded border border-gray-300 bg-white p-2.5">
              <label className="block text-[10px] text-gray-600">Card number</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="•••• •••• •••• ••••"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  disabled={processing}
                  className="w-full rounded border border-gray-400 py-2 pl-2 pr-9 text-[11px] disabled:bg-gray-50"
                />
                <CreditCard className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] text-gray-600">Expiry month</label>
                  <div className="relative">
                    <select
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      disabled={processing}
                      className="w-full appearance-none rounded border border-gray-400 bg-white py-2 pl-2 pr-7 text-[11px]"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-gray-600">Expiry year</label>
                  <div className="relative">
                    <select
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      disabled={processing}
                      className="w-full appearance-none rounded border border-gray-400 bg-white py-2 pl-2 pr-7 text-[11px]"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={processing}
                className="mt-2 w-full rounded bg-[#2d6a4f] py-2.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {processing ? 'Processing payment…' : 'Pay now'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function DetailRow({ label, value, bold = false, last = false }) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-2 px-2.5 py-2 ${
        last ? '' : 'border-b border-gray-200'
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <span
        className={`text-right text-[11px] text-gray-800 ${bold ? 'font-bold tabular-nums' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}