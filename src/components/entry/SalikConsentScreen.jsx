import { VEHICLE, formatChatDate, getTodayDate } from '../../data'
import LivaLogo from '../LivaLogo'
import SalikLogo from '../SalikLogo'

export default function SalikConsentScreen({ onContinue }) {
  const expiry = formatChatDate(getTodayDate())

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f4f5f7]">
      <header className="shrink-0 border-b border-gray-200 bg-white px-3 pb-2 pt-7">
        <div className="flex items-center justify-between gap-2">
          <SalikLogo size="md" />
          <button
            type="button"
            className="rounded-md border border-sky-600/40 px-2 py-1 text-[10px] font-semibold text-sky-700"
          >
            Sign in
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5">
        <h1 className="text-center text-lg font-bold leading-snug text-gray-900">
          Seamless Insurance
          <br />
          in Under 5 Minutes!
        </h1>

        <p className="mt-4 text-center text-[12px] leading-relaxed text-gray-700">
          Dear customer,
          <br />
          Your insurance for vehicle{' '}
          <span className="font-semibold text-gray-900">{VEHICLE.plate}</span> expires on{' '}
          <span className="font-semibold text-gray-900">{expiry}</span>
        </p>

        <span
          id="consent-dialog-desc"
          className="mt-5 block rounded-xl border border-gray-200/80 bg-white px-4 py-4 shadow-sm"
        >
          <p className="text-center text-[11px] font-bold leading-snug text-gray-900">
            Salik in collaboration with LIVA Insurance brings you an easy and quick vehicle insurance
            in less than 5 minutes!
          </p>
          <div className="mt-3 flex justify-center">
            <LivaLogo size="sm" className="!h-5 opacity-90" />
          </div>
          <ul className="mt-4 space-y-2.5 text-[11px] text-gray-700">
            {['Competitive Rates', 'Immediate Policy Issuance', 'Tailored Coverage'].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 text-gray-400">➢</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </span>

        <p className="mt-4 text-center text-[10px] leading-relaxed text-gray-500">
          By continuing, you agree to share your Salik profile and vehicle details with LIVA for quote
          and policy issuance.
        </p>

        <button
          type="button"
          onClick={onContinue}
          aria-describedby="consent-dialog-desc"
          className="mt-5 w-full rounded-lg bg-sky-700 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-sky-800"
        >
          Agree &amp; continue
        </button>
      </div>
    </div>
  )
}