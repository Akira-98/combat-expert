import crypto from 'node:crypto'
import * as Ably from 'ably'

const DEFAULT_TTL_MS = 60 * 60 * 1000

function sendJson(res, statusCode, payload) {
  res.status(statusCode)
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.send(JSON.stringify(payload))
}

function normalizeClientId(input) {
  if (!input) return `guest-${crypto.randomUUID()}`
  if (typeof input !== 'string') return `guest-${crypto.randomUUID()}`

  const trimmed = input.trim()
  if (!trimmed || trimmed.length > 128) return `guest-${crypto.randomUUID()}`
  return trimmed
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const ablyApiKey = process.env.ABLY_API_KEY
  if (!ablyApiKey) {
    return sendJson(res, 500, { error: 'ABLY_API_KEY is not set' })
  }

  const channel = process.env.ABLY_CHANNEL || 'chat:ufc:live'
  const capability =
    process.env.ABLY_CAPABILITY_JSON ||
    JSON.stringify({
      [channel]: ['publish', 'subscribe', 'history', 'presence'],
    })
  const ttlMs = Number(process.env.ABLY_TOKEN_TTL_MS || DEFAULT_TTL_MS)
  const incomingClientId = req.method === 'GET' ? req.query?.clientId : req.body?.clientId
  const clientId = normalizeClientId(incomingClientId)

  try {
    const restClient = new Ably.Rest({ key: ablyApiKey })
    const tokenRequest = await restClient.auth.createTokenRequest({
      clientId,
      capability,
      ttl: Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : DEFAULT_TTL_MS,
    })
    return sendJson(res, 200, tokenRequest)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create token request'
    return sendJson(res, 500, { error: message })
  }
}
