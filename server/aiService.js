/**
 * Core42 Compass — OpenAI-compatible chat completions (server-side only).
 */

/** @typedef {Object} ChatMessage */
/** @property {'user' | 'assistant'} role */
/** @property {string} content */

const DEFAULT_BASE_URL = 'https://api.core42.ai/v1'
const DEFAULT_MODEL = 'gpt-4.1'
const DEFAULT_MAX_TOKENS = 512
const DEFAULT_TEMPERATURE = 0.35

function readApiKey(env = process.env) {
  return (env.CORE42_API_KEY || env.COMPASS_API_KEY || '').trim()
}

function readBaseUrl(env = process.env) {
  const raw = env.CORE42_BASE_URL || env.COMPASS_BASE_URL || DEFAULT_BASE_URL
  return raw.trim().replace(/\/$/, '')
}

export function isChatAiConfigured(env = process.env) {
  return Boolean(readApiKey(env))
}

/** @deprecated Use isChatAiConfigured — kept for imports that still reference Claude. */
export const isClaudeConfigured = isChatAiConfigured

export function getChatAiConfigStatus(env = process.env) {
  const apiKey = readApiKey(env)
  return {
    configured: Boolean(apiKey),
    needsBaseUrl: false,
    provider: 'core42',
    baseUrl: readBaseUrl(env),
  }
}

export const getClaudeConfigStatus = getChatAiConfigStatus

export function getChatAiSettings(env = process.env) {
  return {
    model: env.CORE42_MODEL?.trim() || env.COMPASS_MODEL?.trim() || DEFAULT_MODEL,
    maxTokens: Number(env.CORE42_MAX_TOKENS || env.COMPASS_MAX_TOKENS) || DEFAULT_MAX_TOKENS,
    temperature: Number(env.CORE42_TEMPERATURE || env.COMPASS_TEMPERATURE) || DEFAULT_TEMPERATURE,
  }
}

export const getClaudeSettings = getChatAiSettings

/**
 * Send a multi-turn chat request and return assistant text.
 */
export async function sendChatMessage(options, env = process.env) {
  const apiKey = readApiKey(env)
  if (!apiKey) {
    throw new Error('CORE42_API_KEY is not configured')
  }

  const {
    message,
    conversationHistory = [],
    systemPrompt = 'You are Aura, a helpful in-app insurance advisor for LIVA in the UAE.',
    maxTokens,
    temperature,
  } = options

  const settings = getChatAiSettings(env)
  const baseUrl = readBaseUrl(env)

  const messages = [
    { role: 'system', content: String(systemPrompt) },
    ...conversationHistory.map(({ role, content }) => ({
      role: role === 'assistant' ? 'assistant' : 'user',
      content: String(content),
    })),
    { role: 'user', content: String(message) },
  ]

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      max_tokens: maxTokens ?? settings.maxTokens,
      temperature: temperature ?? settings.temperature,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail =
      data?.error?.message || data?.message || data?.error || `HTTP ${response.status}`
    throw new Error(typeof detail === 'string' ? detail : 'Core42 chat request failed')
  }

  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) {
    throw new Error('Core42 returned an empty response')
  }

  return text
}