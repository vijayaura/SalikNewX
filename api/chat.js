import {
  applyCors,
  getChatHealth,
  handleChatRequest,
  readJsonBody,
} from '../server/chat-handler.mjs'

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

/** Vercel serverless route: POST /api/chat */
export default async function handler(req, res) {
  applyCors(res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method === 'GET') {
    sendJson(res, 200, getChatHealth())
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const body = await readJsonBody(req)
    const result = await handleChatRequest(body)
    sendJson(res, 200, result)
  } catch (error) {
    const status = error.statusCode || 500

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
