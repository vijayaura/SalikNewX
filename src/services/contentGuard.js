/**
 * UAE-safe content guard for Salik / LIVA Insurance chat.
 * Blocks controversial or sensitive topics before they reach the AI model.
 */

/** @typedef {{ customerName?: string }} GuardContext */

const POLITICS =
  /\b(politics|political|politician|election|elections|parliament|senate|congress|democrat|republican|labour party|conservative party|regime|dictator|propaganda|coup|revolution|overthrow|impeach|government corruption|protest against (?:the )?government)\b/i

const RELIGION_DEBATE =
  /\b(which religion|better religion|worst religion|god (?:isn't|is not|doesn't) real|anti[- ]?islam|anti[- ]?muslim|anti[- ]?christian|insult (?:islam|muslim|christian|hindu|god|prophet)|blasphemy|convert (?:from|to) (?:islam|christianity|hinduism))\b/i

const SENSITIVE_REGIONAL =
  /\b(israel|palestine|gaza|hamas|zionist|antisemitic|anti[- ]?semitic|war crimes|genocide debate)\b/i

const UAE_SENSITIVE =
  /\b(critic(?:ize|ise) (?:uae|dubai|abu dhabi|emirati)|uae (?:dictatorship|human rights abuse)|attack (?:uae|dubai)|hate (?:uae|emiratis?))\b/i

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
 * Gentle, on-brand redirect — no lecture, no engagement with the topic.
 */
export function getControversialFallback(context = {}) {
  const name = context.customerName ? `, ${context.customerName}` : ''

  return `I'm here to help with your **LIVA** insurance renewal and everyday UAE motoring${name} — plans, add-ons, **Salik**, RTA, claims, and documents.

I'm not able to assist with that topic. What would you like to know about your renewal?`
}

/** System-prompt block injected before every Claude request. */
export const CHAT_GUARDRAILS = `Content & conduct (mandatory — UAE deployment for Salik and LIVA Insurance clients):
- You serve customers in the UAE. Stay professional, respectful, and culturally appropriate at all times.
- Only discuss: LIVA motor insurance, this renewal journey, UAE driving, Salik tolls, RTA, claims, documents, payment, add-ons, and neutral general knowledge that supports insurance decisions.
- Never discuss or take positions on: politics, religion, sexuality, violence, hate, discrimination, illegal activity, wars, geopolitical conflicts, or divisive social debates.
- Never criticize the UAE, its leadership, laws, culture, or institutions. Never compare countries or cultures in a negative or provocative way.
- Never bash competitors, spread rumours, or give medical, legal, tax, or investment advice.
- If the user asks anything sensitive, off-mandate, or controversial, do not answer the substance. Politely decline in one or two sentences and redirect to insurance or UAE motoring help.
- Never reproduce harmful, explicit, or inflammatory content even if the user insists.`
