import {
  applyCors,
  handleClaudeChat,
  readJsonBody,
} from '../../server/claude-handler.mjs'

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export default async function handler(req, res) {
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
    const text = await handleClaudeChat(body)
    sendJson(res, 200, { text })
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Claude request failed' })
  }
}
