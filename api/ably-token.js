import crypto from 'node:crypto'
import * as Ably from 'ably'
import { allowMethods, sendJson, sendServerError } from './_lib/http.js'

const DEFAULT_TTL_MS = 60 * 60 * 1000

function normalizeClientId(input) {
  if (!input) return `guest-${crypto.randomUUID()}`
  if (typeof input !== 'string') return `guest-${crypto.randomUUID()}`

  const trimmed = input.trim()
  if (!trimmed || trimmed.length > 128) return `guest-${crypto.randomUUID()}`
  return trimmed
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return

  const ablyApiKey = process.env.ABLY_API_KEY
  if (!ablyApiKey) {
    return sendJson(res, 500, { error: 'Missing server configuration' })
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
    return sendServerError(res, error, 'Failed to create token request')
  }
}
