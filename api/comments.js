import { fetchCommentsByMarketId, insertCommentRow, mapCommentRow } from './_lib/commentStore.js'
import { loadServerEnv, normalizeAddress } from './_lib/env.js'
import { allowMethods, sendJson, sendServerError } from './_lib/http.js'
import { fetchNicknameMapByAddresses } from './_lib/profileStore.js'
import { readCommentSession } from './_lib/commentAuth.js'
import { normalizeCommentContent as normalizeSharedCommentContent } from '../shared/signingPayloads.js'

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

  const { supabaseUrl, serviceRoleKey, commentAuthSecret } = loadServerEnv()

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
    const content = normalizeCommentContent(req.body?.content)

    if (!marketId || !content) {
      return sendJson(res, 400, { error: 'Missing required fields' })
    }

    if (!commentAuthSecret) {
      return sendJson(res, 500, { error: 'Comment auth env is missing' })
    }

    let session
    try {
      session = readCommentSession(req, commentAuthSecret)
    } catch {
      return sendJson(res, 401, { error: 'Comment session expired' })
    }

    const address = normalizeAddress(session?.sub)
    if (!address || session?.scope !== 'comments' || session?.type !== 'comment-session') {
      return sendJson(res, 401, { error: 'Comment session required' })
    }

    const row = await insertCommentRow({ supabaseUrl, serviceRoleKey, marketId, address, content })
    const profileMap = await fetchNicknameMapByAddresses({ supabaseUrl, serviceRoleKey, addresses: [address] })
    return sendJson(res, 200, { comment: mapCommentRow(row, profileMap) })
  } catch (error) {
    return sendServerError(res, error, 'Failed to process comments request')
  }
}
