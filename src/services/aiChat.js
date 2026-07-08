import { FAQS, FAQ_FALLBACK } from '../data/faqs'
import { SUPPORT } from '../data'
import { buildSystemPrompt as buildBaseSystemPrompt } from './buildChatContext'
import { getControversialFallback, isControversialQuery } from './contentGuard'
import { getLocalChatReply } from './localChat'

const CHAT_API_URL = '/api/chat'
const HEALTH_API_URL = '/api/chat/health'
const AI_ENABLED = import.meta.env.VITE_AI_ENABLED !== 'false'
const REQUEST_TIMEOUT_MS = 30_000

const AZURE_SETUP_HINT =
  'Your API key looks like Azure Foundry. Add ANTHROPIC_BASE_URL to .env (from the Azure portal), then restart the dev server.'

function buildFaqKnowledge() {
  return FAQS.map((faq) => `- ${faq.question} ${faq.answer}`).join('\n')
}

/**
 * Claude sometimes hallucinates legacy HSBC contact details for LIVA — force correct support info.
 */
function sanitizeAiReply(text, context) {
  const email = context?.supportEmail || SUPPORT.email

  return text
    .replace(/contactus\.uae@hsbc\.com/gi, email)
    .replace(/[\w.-]*@hsbc\.com/gi, email)
    .replace(
      /(Email:\s*)(?:[\w.-]+@hsbc\.com|contactus\.uae@hsbc\.com)/gi,
      `$1${email}`,
    )
}

/** Map in-app chat rows to the API conversationHistory shape. */
function toConversationHistory(history) {
  return history.slice(-8).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }))
}

function buildFullSystemPrompt(context) {
  return `${buildBaseSystemPrompt(context)}

You can answer general real-world questions (UAE driving, Salik, insurance concepts, etc.) using your knowledge — not only the FAQ list below.
When FAQ knowledge applies, prefer it for LIVA product facts.

Always format replies with Markdown (**bold**, *italics*, "- " bullet lines, blank lines between sections).

Reference knowledge (use when relevant):
${buildFaqKnowledge()}

Official LIVA support (use exactly — no other emails or partners):
- Phone: ${context.supportPhone}
- Email: ${context.supportEmail}`
}

/**
 * Call POST /api/chat — Claude runs on the server; the API key never reaches the browser.
 */
async function callClaudeChat(message, conversationHistory, systemPrompt) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory, systemPrompt }),
      signal: controller.signal,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || `Chat error ${response.status}`)
    }

    const text = data.response?.trim()
    if (!text) throw new Error('Claude returned an empty response')

    return text
  } finally {
    clearTimeout(timeout)
  }
}

let aiReady = null

async function fetchAiHealth(force = false) {
  if (!AI_ENABLED) {
    aiReady = false
    return false
  }

  if (!force && aiReady !== null) return aiReady

  try {
    const response = await fetch(HEALTH_API_URL, {
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) {
      aiReady = false
      return false
    }

    const data = await response.json()
    aiReady = Boolean(data.ok)
    return aiReady
  } catch {
    aiReady = false
    return false
  }
}

export async function getAiSetupHint() {
  try {
    const response = await fetch(HEALTH_API_URL, { signal: AbortSignal.timeout(4000) })
    const data = await response.json()
    if (data.needsBaseUrl) return AZURE_SETUP_HINT
  } catch {
    /* ignore */
  }
  return null
}

export async function getChatReply(query, { history = [], context }) {
  const trimmed = query.trim()
  if (!trimmed) {
    return { text: FAQ_FALLBACK, source: 'fallback' }
  }

  const localReply = () => ({ text: getLocalChatReply(trimmed, context), source: 'local' })

  if (isControversialQuery(trimmed)) {
    return { text: getControversialFallback(context), source: 'guard' }
  }

  if (!AI_ENABLED) {
    return localReply()
  }

  try {
    const conversationHistory = toConversationHistory(history)
    const systemPrompt = buildFullSystemPrompt(context)
    const rawText = await callClaudeChat(trimmed, conversationHistory, systemPrompt)
    const text = sanitizeAiReply(rawText, context)

    aiReady = true
    return { text, source: 'claude' }
  } catch (error) {
    aiReady = false

    const isTimeout = error?.name === 'AbortError'
    const local = getLocalChatReply(trimmed, context)
    const hasLocalAnswer = !/I'm not sure about that/i.test(local)

    if (hasLocalAnswer) {
      return { text: local, source: 'local' }
    }

    if (isTimeout) {
      return {
        text: 'That took too long — please try again in a moment.',
        source: 'error',
      }
    }

    const setupHint = await getAiSetupHint()
    if (setupHint) {
      return { text: setupHint, source: 'error' }
    }

    return {
      text: error?.message || 'Something went wrong reaching Claude. Please try again.',
      source: 'error',
    }
  }
}

export async function checkAiAvailable(force = false) {
  return fetchAiHealth(force)
}

export function getChatMode() {
  return AI_ENABLED ? 'claude' : 'local'
}
