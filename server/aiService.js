import Anthropic from '@anthropic-ai/sdk'
import { AnthropicFoundry } from '@anthropic-ai/foundry-sdk'

/**
 * @typedef {Object} ChatMessage
 * @property {'user' | 'assistant'} role
 * @property {string} content
 */

/**
 * @typedef {Object} SendChatMessageOptions
 * @property {string} message - Latest user message
 * @property {ChatMessage[]} [conversationHistory] - Prior turns (user/assistant only)
 * @property {string} [systemPrompt] - Optional system instructions for Claude
 * @property {number} [maxTokens] - Response length cap
 * @property {number} [temperature] - Sampling temperature (0–1)
 */

/** Azure deployment name — override via ANTHROPIC_MODEL. */
const DEFAULT_MODEL = 'claude-sonnet-4-6'
const DEFAULT_MAX_TOKENS = 512
const DEFAULT_TEMPERATURE = 0.35

/** Lazy singleton so we don't recreate the client on every request. */
let cachedClient = null
let cachedClientKey = ''

function readApiKey(env = process.env) {
  return (
    env.ANTHROPIC_API_KEY ||
    env.ANTHROPIC_FOUNDRY_API_KEY ||
    env.CLAUDE_API_KEY ||
    ''
  ).trim()
}

function readBaseUrl(env = process.env) {
  const explicit =
    env.ANTHROPIC_FOUNDRY_BASE_URL ||
    env.ANTHROPIC_BASE_URL ||
    ''

  if (explicit.trim()) {
    return explicit.trim().replace(/\/$/, '')
  }

  const resource = env.ANTHROPIC_FOUNDRY_RESOURCE?.trim()
  if (resource) {
    return `https://${resource}.services.ai.azure.com/anthropic`
  }

  return ''
}

function readResourceName(env = process.env) {
  const explicit = env.ANTHROPIC_FOUNDRY_RESOURCE?.trim()
  if (explicit) return explicit

  const baseUrl = readBaseUrl(env)
  const match = baseUrl.match(/https:\/\/([^.]+)\.services\.ai\.azure\.com/)
  return match?.[1] || ''
}

function isDirectAnthropicKey(apiKey) {
  return typeof apiKey === 'string' && apiKey.startsWith('sk-ant-')
}

function usesFoundry(env = process.env) {
  return Boolean(readBaseUrl(env) || env.ANTHROPIC_FOUNDRY_RESOURCE?.trim())
}

/**
 * Build a Claude client.
 * - Azure Foundry → AnthropicFoundry (matches Azure portal Python sample)
 * - Direct Anthropic API → Anthropic
 */
function createClient(env = process.env) {
  const apiKey = readApiKey(env)
  if (!apiKey) return null

  const baseUrl = readBaseUrl(env)
  const resource = readResourceName(env)
  const cacheKey = `${apiKey}|${baseUrl}|${resource}|${usesFoundry(env)}`

  if (cachedClient && cachedClientKey === cacheKey) {
    return cachedClient
  }

  if (usesFoundry(env)) {
    /** @type {import('@anthropic-ai/foundry-sdk').FoundryClientOptions} */
    const foundryOptions = { apiKey }

    // SDK requires baseURL OR resource — not both
    if (baseUrl) {
      foundryOptions.baseURL = baseUrl
    } else if (resource) {
      foundryOptions.resource = resource
    }

    cachedClient = new AnthropicFoundry(foundryOptions)
  } else {
    cachedClient = new Anthropic({ apiKey })
  }

  cachedClientKey = cacheKey
  return cachedClient
}

/** True when an API key is present (does not verify the key works). */
export function isClaudeConfigured(env = process.env) {
  return Boolean(readApiKey(env))
}

/** Surface config gaps before calling Claude (e.g. Azure key without base URL). */
export function getClaudeConfigStatus(env = process.env) {
  const apiKey = readApiKey(env)
  const baseUrl = readBaseUrl(env)
  const foundry = usesFoundry(env)
  const needsBaseUrl = Boolean(apiKey) && !isDirectAnthropicKey(apiKey) && !foundry

  return {
    configured: Boolean(apiKey) && !needsBaseUrl,
    needsBaseUrl,
    provider: foundry ? 'azure-foundry' : 'anthropic',
    resource: readResourceName(env) || undefined,
    baseUrl: baseUrl || undefined,
  }
}

/** Read model / generation settings from env with sensible defaults. */
export function getClaudeSettings(env = process.env) {
  return {
    model: env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL,
    maxTokens: Number(env.ANTHROPIC_MAX_TOKENS) || DEFAULT_MAX_TOKENS,
    temperature: Number(env.ANTHROPIC_TEMPERATURE) || DEFAULT_TEMPERATURE,
  }
}

/**
 * Send a multi-turn chat request to Claude and return the assistant text.
 * All API keys stay server-side — never pass the key from the frontend.
 */
export async function sendChatMessage(options, env = process.env) {
  const status = getClaudeConfigStatus(env)
  if (!readApiKey(env)) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  if (status.needsBaseUrl) {
    throw new Error('Set ANTHROPIC_FOUNDRY_BASE_URL for Azure Foundry keys (from Azure portal)')
  }

  const client = createClient(env)
  if (!client) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const {
    message,
    conversationHistory = [],
    systemPrompt = 'You are a helpful assistant.',
    maxTokens,
    temperature,
  } = options

  const settings = getClaudeSettings(env)

  // Map prior turns, then append the latest user message
  const messages = [
    ...conversationHistory.map(({ role, content }) => ({
      role: role === 'assistant' ? 'assistant' : 'user',
      content: String(content),
    })),
    { role: 'user', content: String(message) },
  ]

  const response = await client.messages.create({
    model: settings.model,
    max_tokens: maxTokens ?? settings.maxTokens,
    temperature: temperature ?? settings.temperature,
    system: systemPrompt,
    messages,
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()

  if (!text) {
    throw new Error('Claude returned an empty response')
  }

  return text
}
