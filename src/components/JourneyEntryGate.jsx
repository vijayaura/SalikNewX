import { useState } from 'react'
import SalikConsentScreen from './entry/SalikConsentScreen'
import SalikWhatsAppScreen from './entry/SalikWhatsAppScreen'

/** WhatsApp → consent → main journey content, per phone lane. */
export default function JourneyEntryGate({ children }) {
  const [phase, setPhase] = useState('whatsapp')

  if (phase === 'whatsapp') {
    return <SalikWhatsAppScreen onOpenConsent={() => setPhase('consent')} />
  }

  if (phase === 'consent') {
    return <SalikConsentScreen onContinue={() => setPhase('journey')} />
  }

  return children
}