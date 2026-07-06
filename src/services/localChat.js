import { FAQS, FAQ_FALLBACK } from '../data/faqs'

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'what', 'how', 'do', 'does', 'did', 'can', 'could', 'would', 'should',
  'i', 'my', 'me', 'you', 'your', 'we', 'our', 'they', 'their',
  'for', 'to', 'of', 'and', 'or', 'in', 'on', 'at', 'by', 'with',
  'it', 'this', 'that', 'these', 'those', 'about', 'tell', 'explain',
  'please', 'want', 'need', 'know', 'get', 'give', 'show',
])

function tokenize(text) {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
    ),
  ]
}

function scoreFaq(query, faq) {
  const queryTokens = tokenize(query)
  const normalized = query.toLowerCase()
  const corpus = `${faq.question} ${faq.answer} ${faq.keywords.join(' ')}`.toLowerCase()
  let score = 0

  for (const keyword of faq.keywords) {
    if (normalized.includes(keyword)) {
      score += keyword.length * 2
    }
  }

  for (const token of queryTokens) {
    if (corpus.includes(token)) {
      score += token.length
    }
  }

  const questionTokens = tokenize(faq.question)
  for (const token of queryTokens) {
    if (questionTokens.includes(token)) {
      score += 4
    }
  }

  return score
}

function findBestFaq(query) {
  let bestMatch = null
  let bestScore = 0

  for (const faq of FAQS) {
    const score = scoreFaq(query, faq)
    if (score > bestScore) {
      bestScore = score
      bestMatch = faq
    }
  }

  return bestScore >= 4 ? bestMatch : null
}

function greetingReply(context) {
  return `Hi ${context.customerName}! I can help with your ${context.vehicle} renewal. You're at the ${context.stage} step with ${context.selectedPlan}. Ask me about plans, add-ons, documents, payment, or claims.`
}

function contextReply(query, context) {
  const lower = query.toLowerCase()

  if (/\b(my plan|which plan|current plan|selected plan|plan i (?:chose|picked|selected)|what plan)\b/.test(lower)) {
    return `You've selected ${context.selectedPlan} for your ${context.vehicle} (sum insured ${context.insuredValue}). Comprehensive gives full damage cover; Third Party covers others only. You can switch plans anytime before payment.`
  }

  if (/\b(how much|total|premium|price|cost|pay|payment)\b/.test(lower)) {
    return `Your current selection is ${context.selectedPlan} with add-ons: ${context.selectedAddons}. The full premium with 5% VAT is in your summary card — tap Proceed to Payment when you're ready.`
  }

  if (/\b(car|vehicle|land cruiser|toyota|plate)\b/.test(lower)) {
    return `Your vehicle is a ${context.vehicle} (${context.plate}), sum insured at ${context.insuredValue}. Policy start: ${context.policyStart}.`
  }

  if (/\b(addon|add-on|upgrade|optional|extra)\b/.test(lower)) {
    return `Optional add-ons are 60 AED each — Personal Accident, NCD Protection, breakdown recovery, GCC extension, and Off Road cover. Your current add-ons: ${context.selectedAddons}.`
  }

  if (/\b(document|upload|emirates id|license|papers)\b/.test(lower)) {
    return 'You will need your Emirates ID and UAE driving license. Upload them after payment, or pull them securely from your profile.'
  }

  if (/\b(claim|accident|crash|damage)\b/.test(lower)) {
    return 'Report any incident within 24 hours on 800 722 or via the LIVA app. Keep your policy number, license, and police report (if needed) handy.'
  }

  if (/\b(support|contact|call|email|help|phone)\b/.test(lower)) {
    return `Call ${context.supportPhone} or email ${context.supportEmail} for live support with quotes, claims, or policy questions.`
  }

  if (/\b(renew|expir|valid|how long|duration)\b/.test(lower)) {
    return 'Policies run for 12 months from your start date. You will be notified before renewal is due.'
  }

  return null
}

export function getLocalChatReply(query, context) {
  const trimmed = query.trim()
  if (!trimmed) return FAQ_FALLBACK

  const lower = trimmed.toLowerCase()

  if (/^(hi|hello|hey|good (?:morning|afternoon|evening)|salam|assalam|marhaba)\b/i.test(lower)) {
    return greetingReply(context)
  }

  if (/^(thanks|thank you|ok|okay|got it|great|perfect)\b/i.test(lower)) {
    return `You're welcome, ${context.customerName}! Let me know if you have any other questions about your renewal.`
  }

  const contextual = contextReply(trimmed, context)
  if (contextual) return contextual

  const faq = findBestFaq(trimmed)
  if (faq) return faq.answer

  return `I'm Aura, your LIVA assistant. For your ${context.vehicle} renewal I can help with plans, pricing, add-ons, documents, and claims. Try "What does Comprehensive cover?" or "How do I make a claim?"`
}

export function findFaqAnswer(query) {
  const faq = findBestFaq(query.trim())
  return faq?.answer ?? null
}

export function detectRevisionIntent(query) {
  const q = query.toLowerCase().trim()

  const changeVerb =
    /\b(change|switch|update|redo|pick another|select (?:a )?different|want (?:a )?different|new|replace)\b/
  const wantChange =
    /\b(i want to|i'd like to|i would like to|let me|can i|need to|want to|like to)\s+(change|switch|update|pick|choose|select)\b/

  if (
    (changeVerb.test(q) && /\b(plan|cover|coverage|policy type|comprehensive|third party)\b/.test(q)) ||
    (wantChange.test(q) && /\b(plan|cover|coverage)\b/.test(q)) ||
    /\b(change|switch) (?:my )?plan\b/.test(q) ||
    /\bplan\b.*\b(change|switch|update)\b/.test(q) ||
    /\b(go to|take me to|show|open|back to)\b.*\b(plan|cover)\b/.test(q)
  ) {
    return 'plan'
  }

  if (
    (changeVerb.test(q) && /\b(add-?ons?|upgrades?|optional|extras?)\b/.test(q)) ||
    (wantChange.test(q) && /\b(add-?ons?|upgrades?|optional|extras?)\b/.test(q)) ||
    /\b(change|switch) (?:my )?add-?ons?\b/.test(q) ||
    /\badd-?ons?\b.*\b(change|switch|update)\b/.test(q) ||
    /\b(go to|take me to|show|open|back to)\b.*\b(add-?ons?|upgrades?|optional)\b/.test(q)
  ) {
    return 'addons'
  }

  return null
}
