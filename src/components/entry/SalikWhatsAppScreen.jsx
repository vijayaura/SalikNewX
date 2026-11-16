import { ChevronLeft, Mic, Paperclip, Phone, Video } from 'lucide-react'
import { VEHICLE, formatChatDate, getTodayDate } from '../../data'
import salikLogo from '../../assets/salik-logo.png'

function WhatsAppLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left text-[13px] font-medium text-[#039be5] underline decoration-[#039be5]/40 underline-offset-2"
    >
      {children}
    </button>
  )
}

export default function SalikWhatsAppScreen({ onOpenConsent }) {
  const expiry = formatChatDate(getTodayDate())

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#e8dfd4]">
      <div className="shrink-0 bg-[#008069] px-2 pb-2 pt-12 text-white shadow-md">
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-0.5 p-1" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-xs tabular-nums">14</span>
          </button>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-white/30">
            <img src={salikLogo} alt="" className="h-full w-full object-contain p-1" draggable={false} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-sm font-medium leading-tight">
              SALIK
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#53bdeb] text-[8px] text-white">
                ✓
              </span>
            </p>
            <p className="text-[10px] text-white/80">Business account</p>
          </div>
          <Video className="h-5 w-5 opacity-90" strokeWidth={2} />
          <Phone className="h-5 w-5 opacity-90" strokeWidth={2} />
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5b9ab' fill-opacity='0.18'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-22V8h-2v4h-4v2h4v4h2V12h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="flex justify-center py-1">
          <span className="rounded-md bg-white/60 px-2 py-0.5 text-[10px] font-medium text-gray-600 shadow-sm">
            Today
          </span>
        </div>

        <div className="mt-1.5 max-w-[92%] rounded-lg rounded-tl-none bg-white px-2.5 py-1.5 shadow-sm">
          <p className="text-[12.5px] leading-snug text-gray-900">
            Welcome to Salik&apos;s official WhatsApp channel.
          </p>
          <p className="mt-1.5 text-[12.5px] leading-snug text-gray-900">
            Your insurance for vehicle{' '}
            <span className="font-semibold">{VEHICLE.plate}</span> expires on{' '}
            <span className="font-semibold">{expiry}</span>.
          </p>
          <p className="mt-1.5 text-[12.5px] text-gray-900">
            Click{' '}
            <WhatsAppLink onClick={onOpenConsent}>salik.ae/c/LIVA-renew</WhatsAppLink> to renew.
          </p>
          <p className="mt-1.5 text-[11px] text-gray-500">This is an automated message.</p>
          <p className="mt-0.5 text-right text-[10px] text-gray-400 tabular-nums">9:06 AM</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 bg-[#f0f2f5] px-2 pb-3 pt-1.5">
        <Paperclip className="h-5 w-5 text-gray-500" strokeWidth={2} />
        <div className="min-h-9 flex-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-400">
          Message
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008069] text-white shadow-sm">
          <Mic className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}