import { normalizeAddress } from './env.js'
import { supabaseInsert, supabaseSelect } from './supabase.js'

const COMMENT_LIMIT = 80

export function mapCommentRow(row, nicknameMap = new Map()) {
  const address = normalizeAddress(row?.wallet_address)
  return {
    id: typeof row?.id === 'string' ? row.id : '',
    marketId: typeof row?.market_id === 'string' ? row.market_id : '',
    address,
    content: typeof row?.content === 'string' ? row.content : '',
    createdAt: typeof row?.created_at === 'string' ? row.created_at : new Date().toISOString(),
    nickname: address ? nicknameMap.get(address) ?? null : null,
  }
}

export async function fetchCommentsByMarketId({ supabaseUrl, serviceRoleKey, marketId }) {
  return supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `comments?market_id=eq.${encodeURIComponent(marketId)}&select=id,market_id,wallet_address,content,created_at&order=created_at.desc&limit=${COMMENT_LIMIT}`,
    errorMessage: 'Failed to fetch comments',
  })
}

export async function insertCommentRow({ supabaseUrl, serviceRoleKey, marketId, address, content }) {
  const rows = await supabaseInsert({
    supabaseUrl,
    serviceRoleKey,
    table: 'comments',
    errorMessage: 'Failed to save comment',
    body: {
      market_id: marketId,
      wallet_address: address,
      content,
    },
  })

  return Array.isArray(rows) ? rows[0] : undefined
}
