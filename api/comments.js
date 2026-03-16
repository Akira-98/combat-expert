import { fetchCommentsByMarketId, insertCommentRow, mapCommentRow } from './_lib/commentStore.js'
import { loadServerEnv, normalizeAddress, parseIssuedAt } from './_lib/env.js'
import { allowMethods, sendJson } from './_lib/http.js'
import { fetchNicknameMapByAddresses } from './_lib/profileStore.js'
import { assertFreshIssuedAt, verifySignedMessage } from './_lib/signature.js'
import {
  buildCommentMessage,
  COMMENT_MESSAGE_TTL_MS,
  normalizeCommentContent as normalizeSharedCommentContent,
} from '../shared/signingPayloads.js'

function normalizeMarketId(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.slice(0, 120)
}

function normalizeCommentContent(value) {
  return normalizeSharedCommentContent(value)
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return

  const { supabaseUrl, serviceRoleKey, rpcUrl } = loadServerEnv()

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    if (req.method === 'GET') {
      const marketId = normalizeMarketId(req.query?.marketId)
      if (!marketId) return sendJson(res, 400, { error: 'Invalid marketId' })

      const rows = await fetchCommentsByMarketId({ supabaseUrl, serviceRoleKey, marketId })
      const addresses = Array.isArray(rows)
        ? [...new Set(rows.map((row) => normalizeAddress(row?.wallet_address)).filter(Boolean))]
        : []
      const profileMap = await fetchNicknameMapByAddresses({ supabaseUrl, serviceRoleKey, addresses })
      const comments = Array.isArray(rows) ? rows.map((row) => mapCommentRow(row, profileMap)) : []
      return sendJson(res, 200, { comments })
    }

    const marketId = normalizeMarketId(req.body?.marketId)
    const address = normalizeAddress(req.body?.address)
    const content = normalizeCommentContent(req.body?.content)
    const message = typeof req.body?.message === 'string' ? req.body.message : ''
    const signature = typeof req.body?.signature === 'string' ? req.body.signature : ''
    const issuedAt = typeof req.body?.issuedAt === 'string' ? req.body.issuedAt : ''

    if (!marketId || !address || !content || !message || !signature || !issuedAt) {
      return sendJson(res, 400, { error: 'Missing required fields' })
    }

    const issuedAtMs = parseIssuedAt(issuedAt)
    if (!assertFreshIssuedAt(issuedAtMs, COMMENT_MESSAGE_TTL_MS)) {
      return sendJson(res, 400, { error: 'Expired signature request' })
    }

    const expectedMessage = buildCommentMessage({ marketId, address, content, issuedAt })
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

    const row = await insertCommentRow({ supabaseUrl, serviceRoleKey, marketId, address, content })
    const profileMap = await fetchNicknameMapByAddresses({ supabaseUrl, serviceRoleKey, addresses: [address] })
    return sendJson(res, 200, { comment: mapCommentRow(row, profileMap) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return sendJson(res, 500, { error: message })
  }
}
