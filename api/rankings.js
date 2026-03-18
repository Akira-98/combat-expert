import { loadServerEnv, normalizeAddress } from './_lib/env.js'
import { allowMethods, sendJson } from './_lib/http.js'
import { fetchNicknameMapByAddresses } from './_lib/profileStore.js'
import { fetchRankingSummary, fetchRankingTotals, mapRankingSummaryRow, mapRankingTotalRow, normalizeRankingLimit } from './_lib/rankingStore.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return

  const { supabaseUrl, serviceRoleKey } = loadServerEnv()

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    const limit = normalizeRankingLimit(req.query?.limit)
    const addressQuery = typeof req.query?.address === 'string' ? req.query.address : ''
    const viewerAddress = addressQuery ? normalizeAddress(addressQuery) : ''
    if (addressQuery && !viewerAddress) {
      return sendJson(res, 400, { error: 'address is invalid' })
    }

    const rows = await fetchRankingTotals({ supabaseUrl, serviceRoleKey, limit })
    const viewerRow = viewerAddress
      ? await fetchRankingSummary({ supabaseUrl, serviceRoleKey, address: viewerAddress })
      : null
    const addresses = [
      ...(Array.isArray(rows) ? rows.map((row) => normalizeAddress(row?.wallet_address)).filter(Boolean) : []),
      normalizeAddress(viewerRow?.wallet_address),
    ].filter(Boolean)
    const uniqueAddresses = [...new Set(addresses)]
    const nicknameMap = await fetchNicknameMapByAddresses({ supabaseUrl, serviceRoleKey, addresses: uniqueAddresses })
    const rankings = Array.isArray(rows) ? rows.map((row) => mapRankingTotalRow(row, nicknameMap)) : []
    const viewer = viewerRow ? mapRankingSummaryRow(viewerRow, nicknameMap) : null

    return sendJson(res, 200, {
      rankings,
      limit,
      updatedAt: rankings[0]?.updatedAt || null,
      viewer,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return sendJson(res, 500, { error: message })
  }
}
