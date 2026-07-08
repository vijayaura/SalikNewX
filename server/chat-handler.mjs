import { getClaudeConfigStatus, getClaudeSettings, isClaudeConfigured, sendChatMessage } from './aiService.js'
import { getControversialFallback, isControversialQuery } from '../src/services/contentGuard.js'

/**
 * Validate POST /api/chat body.
 * Required: message (string). Optional: conversationHistory (array).
 */
export function validateChatRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' }
  }

  if (typeof body.message !== 'string' || !body.message.trim()) {
    return { ok: false, error: 'message is required and must be a non-empty string' }
  }

  if (body.conversationHistory !== undefined) {
    if (!Array.isArray(body.conversationHistory)) {
      return { ok: false, error: 'conversationHistory must be an array' }
    }

    for (const [index, entry] of body.conversationHistory.entries()) {
      if (!entry || typeof entry !== 'object') {
        return { ok: false, error: `conversationHistory[${index}] must be an object` }
      }
      if (!['user', 'assistant'].includes(entry.role)) {
        return { ok: false, error: `conversationHistory[${index}].role must be "user" or "assistant"` }
      }
      if (typeof entry.content !== 'string' || !entry.content.trim()) {
        return { ok: false, error: `conversationHistory[${index}].content must be a non-empty string` }
      }
    }
  }

  return { ok: true }
}

export function applyCors(res, origin = process.env.ALLOWED_ORIGIN || '*') {
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

/** Health check — confirms the server has a key configured (no Claude call). */
export function getChatHealth(env = process.env) {
  const settings = getClaudeSettings(env)
  const status = getClaudeConfigStatus(env)

  return {
    ok: status.configured,
    provider: status.provider,
    model: settings.model,
    configured: status.configured,
    needsBaseUrl: status.needsBaseUrl,
  }
}

/**
 * Core handler: validate input, call Claude via aiService, return { response }.
 */
export async function handleChatRequest(body, env = process.env) {
  const validation = validateChatRequest(body)
  if (!validation.ok) {
    const error = new Error(validation.error)
    error.statusCode = 400
    throw error
  }

  if (!isClaudeConfigured(env)) {
    const error = new Error('Claude API is not configured on the server')
    error.statusCode = 503
    throw error
  }

  const configStatus = getClaudeConfigStatus(env)
  if (configStatus.needsBaseUrl) {
    const error = new Error('Set ANTHROPIC_BASE_URL for Azure Foundry keys')
    error.statusCode = 503
    throw error
  }

  if (isControversialQuery(body.message)) {
    return { response: getControversialFallback() }
  }

  const response = await sendChatMessage(
    {
      message: body.message.trim(),
      conversationHistory: body.conversationHistory ?? [],
      // Optional extension for this app — keeps the public contract intact
      systemPrompt: typeof body.systemPrompt === 'string' ? body.systemPrompt : undefined,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
    },
    env,
  )

  return { response }
}

/** Vite dev / preview middleware for /api/chat */
export function createChatMiddleware(env) {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0]

    if (url === '/api/chat/health') {
      applyCors(res)
      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
      }
      sendJson(res, 200, getChatHealth(env))
      return
    }

    if (url !== '/api/chat') {
      next()
      return
    }

    applyCors(res)

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' })
      return
    }

    try {
      const body = await readJsonBody(req)
      const result = await handleChatRequest(body, env)
      sendJson(res, 200, result)
    } catch (error) {
      const status = error.statusCode || 500

      // Log details server-side only — never expose keys or raw API errors to clients
      if (status >= 500) {
        console.error('[api/chat] Claude request failed:', error.message)
      }

      const clientMessage =
        status === 400
          ? error.message
          : status === 503
            ? 'AI service is not configured. Contact support.'
            : 'Unable to generate a response. Please try again.'

      sendJson(res, status, { error: clientMessage })
    }
  }
}

export function chatApiPlugin(env) {
  const middleware = createChatMiddleware(env)
  return {
    name: 'chat-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
