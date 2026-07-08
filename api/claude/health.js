import { applyCors, getClaudeConfig } from '../../server/claude-handler.mjs'

export default async function handler(req, res) {
  applyCors(res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const config = getClaudeConfig()
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(
    JSON.stringify({
      ok: config.configured,
      provider: config.provider,
      model: config.model,
    }),
  )
}
