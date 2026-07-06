import { FAQS, FAQ_FALLBACK } from '../data/faqs'
import { buildSystemPrompt } from './buildChatContext'
import { getLocalChatReply } from './localChat'

const isDev = import.meta.env.DEV
const configuredUrl = import.meta.env.VITE_OLLAMA_URL?.trim()
const OLLAMA_URL = configuredUrl || (isDev ? '/api/ollama' : '')
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2'
const AI_ENABLED =
  import.meta.env.VITE_AI_ENABLED !== 'false' && Boolean(OLLAMA_URL)
const REQUEST_TIMEOUT_MS = 20_000

function buildFaqKnowledge() {
  return FAQS.map((faq) => `- ${faq.question} ${faq.answer}`).join('\n')
}

function toOllamaMessages(history, query, systemPrompt) {
  const messages = [{ role: 'system', content: systemPrompt }]

  for (const msg of history.slice(-8)) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })
  }

  messages.push({ role: 'user', content: query })
  return messages
}

async function callOllama(messages) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: 0.35,
          num_predict: 220,
        },
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`)
    }

    const data = await response.json()
    const content = data.message?.content?.trim()

    if (!content) {
      throw new Error('Ollama returned an empty response')
    }

    return content
  } finally {
    clearTimeout(timeout)
  }
}

export async function getChatReply(query, { history = [], context }) {
  const trimmed = query.trim()
  if (!trimmed) {
    return { text: FAQ_FALLBACK, source: 'fallback' }
  }

  if (!AI_ENABLED) {
    return { text: getLocalChatReply(trimmed, context), source: 'local' }
  }

  const systemPrompt = `${buildSystemPrompt(context)}

Reference knowledge (use when relevant):
${buildFaqKnowledge()}`

  try {
    const messages = toOllamaMessages(history, trimmed, systemPrompt)
    const text = await callOllama(messages)
    return { text, source: 'ollama' }
  } catch {
    return { text: getLocalChatReply(trimmed, context), source: 'local' }
  }
}

export async function checkAiAvailable() {
  if (!AI_ENABLED) return false

  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) return false

    const data = await response.json()
    const models = data.models ?? []
    const hasModel = models.some((m) => {
      const name = m.name ?? ''
      return name === OLLAMA_MODEL || name.startsWith(`${OLLAMA_MODEL}:`)
    })

    return hasModel || models.length > 0
  } catch {
    return false
  }
}

export function getChatMode() {
  return AI_ENABLED ? 'ollama-capable' : 'local'
}
