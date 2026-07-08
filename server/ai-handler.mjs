const ANTHROPIC_VERSION = '2023-06-01'

function isDirectAnthropicKey(apiKey) {
  return typeof apiKey === 'string' && apiKey.startsWith('sk-ant-')
}

function readClaudeEnv(env = process.env) {
  const apiKey =
    env.ANTHROPIC_FOUNDRY_API_KEY ||
    env.ANTHROPIC_API_KEY ||
    env.CLAUDE_API_KEY

  const resource = env.ANTHROPIC_FOUNDRY_RESOURCE?.trim()

  const baseUrl = (
    env.ANTHROPIC_FOUNDRY_BASE_URL ||
    env.ANTHROPIC_BASE_URL ||
    (resource ? `https://${resource}.services.ai.azure.com/anthropic` : '')
  ).replace(/\/$/, '')

  const model =
    env.ANTHROPIC_MODEL ||
    env.ANTHROPIC_FOUNDRY_MODEL ||
    'claude-sonnet-4-20250514'

  const provider = baseUrl
    ? 'azure-foundry'
    : isDirectAnthropicKey(apiKey)
      ? 'anthropic'
      : 'azure-foundry'

  const configured = Boolean(apiKey) && (provider === 'anthropic' || Boolean(baseUrl))

  return { apiKey, baseUrl, model, provider, configured }
}

export function getAiConfig(env = process.env) {
  const groqKey = env.GROQ_API_KEY?.trim()
  if (groqKey) {
    return {
      ok: true,
      provider: 'groq',
      model: env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      label: 'Groq (Llama)',
    }
  }

  const ollamaUrl = (env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '')
  const ollamaModel = env.OLLAMA_MODEL || 'llama3.2'

  const claude = readClaudeEnv(env)
  if (claude.configured) {
    return {
      ok: true,
      provider: claude.provider,
      model: claude.model,
      label: 'Claude',
    }
  }

  return {
    ok: false,
    provider: 'local',
    model: ollamaModel,
    label: 'Built-in answers',
    ollamaUrl,
    needsGroqKey: !groqKey,
    needsClaudeBaseUrl: Boolean(claude.apiKey) && !claude.configured,
  }
}

async function callGroq(messages, systemPrompt, env) {
  const apiKey = env.GROQ_API_KEY?.trim()
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured')

  const model = env.GROQ_MODEL || 'llama-3.3-70b-versatile'

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      temperature: 0.35,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Groq error ${response.status}: ${detail.slice(0, 240)}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('Groq returned an empty response')
  return text
}

async function callOllama(messages, systemPrompt, env) {
  const baseUrl = (env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '')
  const model = env.OLLAMA_MODEL || 'llama3.2'

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      options: { temperature: 0.35, num_predict: 512 },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Ollama error ${response.status}: ${detail.slice(0, 240)}`)
  }

  const data = await response.json()
  const text = data.message?.content?.trim()
  if (!text) throw new Error('Ollama returned an empty response')
  return text
}

async function callClaude(messages, systemPrompt, env) {
  const { apiKey, baseUrl, model, provider, configured } = readClaudeEnv(env)

  if (!configured) {
    throw new Error('Claude is not fully configured')
  }

  const url = provider === 'azure-foundry'
    ? `${baseUrl}/v1/messages`
    : 'https://api.anthropic.com/v1/messages'

  const headers = {
    'content-type': 'application/json',
    'anthropic-version': ANTHROPIC_VERSION,
  }

  if (provider === 'azure-foundry') {
    headers['api-key'] = apiKey
  } else {
    headers['x-api-key'] = apiKey
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map(({ role, content }) => ({
        role: role === 'assistant' ? 'assistant' : 'user',
        content,
      })),
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Claude error ${response.status}: ${detail.slice(0, 240)}`)
  }

  const data = await response.json()
  const text = data.content
    ?.filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()

  if (!text) throw new Error('Claude returned an empty response')
  return text
}

export async function checkOllamaAvailable(env = process.env) {
  const baseUrl = (env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '')

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function getAiHealth(env = process.env) {
  const config = getAiConfig(env)

  if (config.provider === 'groq') {
    return { ok: true, ...config }
  }

  if (config.provider === 'anthropic' || config.provider === 'azure-foundry') {
    return { ok: true, ...config }
  }

  const ollamaUp = await checkOllamaAvailable(env)
  if (ollamaUp) {
    return {
      ok: true,
      provider: 'ollama',
      model: env.OLLAMA_MODEL || 'llama3.2',
      label: 'Ollama (local)',
    }
  }

  return { ok: false, ...config }
}

export async function handleAiChat(body, env = process.env) {
  const { messages = [], systemPrompt = '' } = body ?? {}
  const chatMessages = messages.map(({ role, content }) => ({
    role: role === 'assistant' ? 'assistant' : 'user',
    content,
  }))

  if (env.GROQ_API_KEY?.trim()) {
    const text = await callGroq(chatMessages, systemPrompt, env)
    return { text, provider: 'groq' }
  }

  if (await checkOllamaAvailable(env)) {
    const text = await callOllama(chatMessages, systemPrompt, env)
    return { text, provider: 'ollama' }
  }

  const claude = readClaudeEnv(env)
  if (claude.configured) {
    const text = await callClaude(chatMessages, systemPrompt, env)
    return { text, provider: claude.provider }
  }

  throw new Error(
    'No AI provider configured. Add a free GROQ_API_KEY (console.groq.com) or install Ollama locally.',
  )
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

export function createAiMiddleware(env) {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0]

    if (url === '/api/ai/health') {
      applyCors(res)
      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
      }

      const health = await getAiHealth(env)
      sendJson(res, 200, health)
      return
    }

    if (url === '/api/ai/chat') {
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
        const result = await handleAiChat(body, env)
        sendJson(res, 200, result)
      } catch (error) {
        sendJson(res, 500, { error: error.message || 'AI request failed' })
      }
      return
    }

    next()
  }
}

export function aiApiPlugin(env) {
  const middleware = createAiMiddleware(env)
  return {
    name: 'ai-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
