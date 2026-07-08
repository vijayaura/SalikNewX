const ANTHROPIC_VERSION = '2023-06-01'

function isDirectAnthropicKey(apiKey) {
  return typeof apiKey === 'string' && apiKey.startsWith('sk-ant-')
}

function readEnv(env = process.env) {
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

export function getClaudeConfig(env = process.env) {
  const { apiKey, baseUrl, model, provider, configured } = readEnv(env)
  return {
    configured,
    provider,
    model,
    needsBaseUrl: Boolean(apiKey) && provider === 'azure-foundry' && !baseUrl,
  }
}

export async function handleClaudeChat(body, env = process.env) {
  const { apiKey, baseUrl, model, provider, configured } = readEnv(env)

  if (!configured) {
    if (apiKey && provider === 'azure-foundry' && !baseUrl) {
      throw new Error('Set ANTHROPIC_FOUNDRY_BASE_URL in .env (from Azure Foundry portal)')
    }
    throw new Error('Claude API key is not configured on the server')
  }

  const { messages = [], systemPrompt = '' } = body ?? {}

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
    throw new Error(`Claude API error ${response.status}: ${detail.slice(0, 240)}`)
  }

  const data = await response.json()
  const text = data.content
    ?.filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()

  if (!text) {
    throw new Error('Claude returned an empty response')
  }

  return text
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
