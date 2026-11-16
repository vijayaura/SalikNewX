import { useState } from 'react'
import MobileFrame from './MobileFrame'
import PhoneShell from './PhoneShell'
import SalikConsentScreen from './entry/SalikConsentScreen'
import SalikWhatsAppScreen from './entry/SalikWhatsAppScreen'

export default function DemoOrchestrator() {
  const [phase, setPhase] = useState('whatsapp')

  if (phase === 'journeys') {
    return <MobileFrame />
  }

  return (
    <div className="relative flex h-[100dvh] w-full flex-col items-center overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 px-3 pb-2 pt-3 sm:px-5 sm:pt-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-1/3 h-[520px] w-[520px] rounded-full bg-liva-orange/[0.09] blur-[110px]" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-sky-500/[0.06] blur-[90px]" />
      </div>

      <div className="relative z-10 flex min-h-0 w-full max-w-[390px] flex-1 flex-col items-center gap-1.5">
        <h2 className="demo-lane-title w-full shrink-0">
          {phase === 'whatsapp' ? 'Customer notification' : 'Consent & handoff'}
        </h2>
        <PhoneShell compact fillRemaining>
          {phase === 'whatsapp' ? (
            <SalikWhatsAppScreen onOpenConsent={() => setPhase('consent')} />
          ) : (
            <SalikConsentScreen onContinue={() => setPhase('journeys')} />
          )}
        </PhoneShell>
      </div>
    </div>
  )
}