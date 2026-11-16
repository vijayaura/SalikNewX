/**
 * UAE-safe content guard for LIVA motor insurance renewal chat.
 * Blocks controversial or sensitive topics before they reach the AI model.
 */

/** @typedef {{ customerName?: string, vehicle?: string }} GuardContext */

const POLITICS =
  /\b(politics|political|politician|election|elections|parliament|senate|congress|democrat|republican|labour party|conservative party|regime|dictator|propaganda|coup|revolution|overthrow|impeach|government corruption|protest against (?:the )?government)\b/i

const RELIGION_DEBATE =
  /\b(which religion|better religion|worst religion|god (?:isn't|is not|doesn't) real|anti[- ]?islam|anti[- ]?muslim|anti[- ]?christian|insult (?:islam|muslim|christian|hindu|god|prophet)|blasphemy|convert (?:from|to) (?:islam|christianity|hinduism))\b/i

const SENSITIVE_REGIONAL =
  /\b(israel|palestine|gaza|hamas|zionist|antisemitic|anti[- ]?semitic|war crimes|genocide debate)\b/i

const UAE_SENSITIVE =
  /\b(critic(?:ize|ise) (?:uae|dubai|abu dhabi|emirati|salik|liva|aura)|uae (?:dictatorship|human rights abuse)|attack (?:uae|dubai)|hate (?:uae|emiratis?|salik|liva|aura)|(?:salik|liva|aura) (?:scam|fraud|rip[- ]?off))\b/i

const SEXUAL_ADULT =
  /\b(porn|pornography|nude|nudes|onlyfans|escort|prostitut|sexual(?:ly)? (?:act|content|video)|explicit content|hookup)\b/i

const HATE_VIOLENCE =
  /\b(kill (?:all|them|muslims|jews|christians|hindus|blacks|whites)|hate (?:all )?(?:muslims|jews|christians|hindus|blacks|whites|immigrants)|racial slur|terrorist attack how|how to (?:make|build) (?:a )?bomb|mass shooting)\b/i

const ILLEGAL =
  /\b(how to (?:cheat|scam|defraud|forge|fake)|insurance fraud|bribe (?:official|police)|buy (?:cocaine|heroin|marijuana|weed|drugs)|sell drugs|money laundering)\b/i

const DIVISIVE_SOCIAL =
  /\b(lgbtq debate|transgender debate|abortion debate|euthanasia debate|racism debate|superior race|inferior race)\b/i

const OFF_TOPIC_EXTREME =
  /\b(write (?:me )?(?:an )?essay|homework|solve this math|python code|stock tips|crypto investment|tell me a joke about (?:religion|politics|race))\b/i

const OFF_TOPIC_GENERAL =
  /\b(salik\s+app|download (?:the )?app|play store|app store|weather forecast|recipe|netflix|movie|celebrity|dating|bitcoin|football score|who is the president|capital of)\b/i

const INSURANCE_SCOPE =
  /\b(insur|renew|liva|plan|comprehensive|third party|addon|add-?on|claim|premium|policy|vehicle|car|toyota|plate|insured|emirates|rta|dubai|uae|driv|motor|salik|toll|document|upload|payment|vat|cover|wheel|aura|garage|dealer|ncd|gcc|support|quote|expir)\b/i

const BLOCK_PATTERNS = [
  POLITICS,
  RELIGION_DEBATE,
  SENSITIVE_REGIONAL,
  UAE_SENSITIVE,
  SEXUAL_ADULT,
  HATE_VIOLENCE,
  ILLEGAL,
  DIVISIVE_SOCIAL,
  OFF_TOPIC_EXTREME,
  OFF_TOPIC_GENERAL,
]

/**
 * Returns true when the message should not be sent to the AI model.
 */
export function isControversialQuery(query) {
  const text = query?.trim()
  if (!text || text.length < 3) return false

  return BLOCK_PATTERNS.some((pattern) => pattern.test(text))
}

/**
 * Broader off-mandate check — unrelated questions with no insurance / UAE motoring signal.
 */
export function isOffTopicQuery(query) {
  const text = query?.trim()
  if (!text) return false
  if (isControversialQuery(text)) return true

  if (text.length > 14 && !INSURANCE_SCOPE.test(text)) {
    const looksLikeQuestion =
      /\?/.test(text) ||
      /^(what|who|where|when|why|how|tell|explain|can you|could you|do you|is there)\b/i.test(text)
    if (looksLikeQuestion) return true
  }

  return false
}

/**
 * Canonical redirect for controversial, off-topic, or unanswerable chat (guard + local fallback).
 */
export function getOffTopicRedirect(context = {}) {
  const vehicle = context.vehicle || 'vehicle'

  return `I'm here to assist you with your LIVA motor insurance renewal and UAE motoring questions only. If you need help choosing the right insurance plan or understanding your coverage options for your ${vehicle}, I'm happy to help!

Would you like more details about Comprehensive or Third Party insurance plans?`
}

/** @deprecated Use getOffTopicRedirect — kept for existing imports */
export function getControversialFallback(context = {}) {
  return getOffTopicRedirect(context)
}

/** Injected into system prompts so the model uses the same redirect text. */
export function getOffTopicRedirectInstruction(context = {}) {
  const sample = getOffTopicRedirect(context)
  return `Off-topic & sensitive replies (mandatory):
- Only answer LIVA motor insurance renewal and UAE motoring (plans, cover, claims, documents, payment, add-ons, RTA, Salik toll roads).
- Never refer to a "Salik app" — there is no Salik app in this chat; Salik may only mean Dubai road tolls when relevant to driving.
- For controversial, silly, unrelated, or out-of-scope questions, do NOT answer the substance. Reply with exactly this text (keep the vehicle as "${context.vehicle || 'your vehicle'}"):

${sample}`
}

/** System-prompt block injected before every AI request. */
export const CHAT_GUARDRAILS = `Content & conduct (mandatory — LIVA motor insurance renewal in the UAE):
- You are Aura, LIVA's renewal advisor in this experience. Stay professional, respectful, and culturally appropriate in the UAE.
- Only discuss: LIVA motor insurance, this renewal journey, UAE driving, Salik toll roads (not any "Salik app"), RTA, claims, documents, payment, and add-ons.
- Never discuss or take positions on: politics, religion, sexuality, violence, hate, discrimination, illegal activity, wars, geopolitical conflicts, or divisive social debates.
- Never criticize or disparage the UAE, Dubai, LIVA, Aura, or their leadership, laws, culture, or institutions.
- Never bash competitors, spread rumours, or give medical, legal, tax, or investment advice.
- If the user asks anything sensitive, off-mandate, controversial, or unrelated, do not answer the substance — use the off-topic redirect text provided below.
- Never reproduce harmful, explicit, or inflammatory content even if the user insists.`