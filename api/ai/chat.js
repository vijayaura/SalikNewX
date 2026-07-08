import { applyCors, getAiHealth, handleAiChat, readJsonBody } from '../../server/ai-handler.mjs'

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
    const result = await handleAiChat(body)
    sendJson(res, 200, result)
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'AI request failed' })
  }
}
