import { loadServerEnv, normalizeAddress, parseIssuedAt } from './_lib/env.js'
import { allowMethods, sendJson, sendServerError } from './_lib/http.js'
import { fetchProfileByAddress, upsertProfileByAddress } from './_lib/profileStore.js'
import { assertFreshIssuedAt, verifySignedMessage } from './_lib/signature.js'
import { buildProfileMessage, normalizeProfileNickname, PROFILE_MESSAGE_TTL_MS } from '../shared/signingPayloads.js'

function normalizeNickname(value) {
  const normalized = normalizeProfileNickname(value)
  return normalized || null
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return

  const { supabaseUrl, serviceRoleKey, rpcUrl } = loadServerEnv()

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    if (req.method === 'GET') {
      const address = normalizeAddress(req.query?.address)
      if (!address) return sendJson(res, 400, { error: 'Invalid address' })

      const profile = await fetchProfileByAddress({ supabaseUrl, serviceRoleKey, address })
      return sendJson(res, 200, profile)
    }

    const address = normalizeAddress(req.body?.address)
    const nickname = normalizeNickname(req.body?.nickname)
    const message = typeof req.body?.message === 'string' ? req.body.message : ''
    const signature = typeof req.body?.signature === 'string' ? req.body.signature : ''
    const issuedAt = typeof req.body?.issuedAt === 'string' ? req.body.issuedAt : ''

    if (!address || !message || !signature || !issuedAt) {
      return sendJson(res, 400, { error: 'Missing required fields' })
    }

    const issuedAtMs = parseIssuedAt(issuedAt)
    if (!assertFreshIssuedAt(issuedAtMs, PROFILE_MESSAGE_TTL_MS)) {
      return sendJson(res, 400, { error: 'Expired signature request' })
    }

    const expectedMessage = buildProfileMessage({ address, nickname, issuedAt })
    if (message !== expectedMessage) {
      return sendJson(res, 400, { error: 'Invalid signature payload' })
    }

    const isValid = await verifySignedMessage({
      rpcUrl,
      address,
      message,
      signature,
    })

    if (!isValid) {
      return sendJson(res, 401, { error: 'Signature verification failed' })
    }

    const profile = await upsertProfileByAddress({ supabaseUrl, serviceRoleKey, address, nickname })
    return sendJson(res, 200, profile)
  } catch (error) {
    return sendServerError(res, error, 'Failed to process profile request')
  }
}
