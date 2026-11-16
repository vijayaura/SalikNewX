import { USER, VEHICLE } from '../data'

const DEFAULT_BASE = 'https://aura-motor.tech/embed/call'

export function getAuraCallConfig() {
  const base = (import.meta.env.VITE_AURA_CALL_EMBED_URL || DEFAULT_BASE).replace(/\/$/, '')
  const allowedOrigin = (
    import.meta.env.VITE_AURA_CALL_ORIGIN || 'https://aura-motor.tech'
  ).replace(/\/$/, '')
  const quoteRefOverride = (import.meta.env.VITE_AURA_CALL_QUOTE_REF || '').trim()

  return {
    base,
    allowedOrigin,
    quoteRefOverride,
    configured: Boolean(base),
  }
}

function buildQuoteRef(override) {
  if (override) return override
  const digits = VEHICLE.plate.replace(/\D/g, '')
  const suffix = digits || '48217'
  return `MTR-${new Date().getFullYear()}-${suffix}`
}

export function buildAuraCallEmbedUrl(options = {}) {
  const { base, quoteRefOverride } = getAuraCallConfig()
  const customerName = options.customerName ?? USER.name
  const quoteRef = options.quoteRef ?? buildQuoteRef(quoteRefOverride)

  const params = new URLSearchParams()
  if (customerName) params.set('name', customerName)
  if (quoteRef) params.set('ref', quoteRef)

  const query = params.toString()
  return query ? `${base}?${query}` : base
}

export function isAuraCallMessageEvent(event, allowedOrigin) {
  if (allowedOrigin && event.origin !== allowedOrigin) return false
  const type = event.data?.type
  return type === 'liva-call-started' || type === 'liva-call-ended'
}