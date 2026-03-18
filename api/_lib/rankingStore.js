import { normalizeAddress } from './env.js'
import { supabaseRpc, supabaseSelect } from './supabase.js'

const DEFAULT_RANKING_LIMIT = 100
const MAX_RANKING_LIMIT = 200

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toNonNegativeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return parsed
}

export function normalizeRankingLimit(value) {
  const parsed = toNonNegativeInteger(value, DEFAULT_RANKING_LIMIT)
  if (parsed <= 0) return DEFAULT_RANKING_LIMIT
  return Math.min(parsed, MAX_RANKING_LIMIT)
}

export function mapRankingTotalRow(row, nicknameMap = new Map()) {
  const address = normalizeAddress(row?.wallet_address)
  return {
    address,
    nickname: address ? nicknameMap.get(address) ?? null : null,
    totalScore: toFiniteNumber(row?.total_score),
    winCount: toNonNegativeInteger(row?.win_count),
    loseCount: toNonNegativeInteger(row?.lose_count),
    voidCount: toNonNegativeInteger(row?.void_count),
    underdogHitCount: toNonNegativeInteger(row?.underdog_hit_count),
    eventCount: toNonNegativeInteger(row?.event_count),
    updatedAt: typeof row?.updated_at === 'string' ? row.updated_at : new Date().toISOString(),
  }
}

export function mapRankingSummaryRow(row, nicknameMap = new Map()) {
  const summary = mapRankingTotalRow(row, nicknameMap)
  return {
    ...summary,
    rank: toNonNegativeInteger(row?.rank),
  }
}

export async function fetchRankingTotals({ supabaseUrl, serviceRoleKey, limit }) {
  const normalizedLimit = normalizeRankingLimit(limit)

  return supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path:
      'ranking_totals?' +
      `select=wallet_address,total_score,win_count,lose_count,void_count,underdog_hit_count,event_count,updated_at` +
      `&order=total_score.desc,underdog_hit_count.desc,win_count.desc,updated_at.asc` +
      `&limit=${normalizedLimit}`,
    errorMessage: 'Failed to fetch rankings',
  })
}

export async function fetchRankingSummary({ supabaseUrl, serviceRoleKey, address }) {
  const normalizedAddress = normalizeAddress(address)
  if (!normalizedAddress) return null

  const rows = await supabaseRpc({
    supabaseUrl,
    serviceRoleKey,
    fn: 'get_ranking_summary',
    errorMessage: 'Failed to fetch ranking summary',
    body: {
      p_wallet_address: normalizedAddress,
    },
  })

  const payload = Array.isArray(rows) ? rows[0] : rows
  return payload ?? null
}

export async function applyRankingEvent({
  supabaseUrl,
  serviceRoleKey,
  walletAddress,
  eventId,
  betTokenId,
  gameId,
  marketId,
  selectionId,
  result,
  odds,
  resolvedAt,
}) {
  const rows = await supabaseRpc({
    supabaseUrl,
    serviceRoleKey,
    fn: 'apply_ranking_event',
    errorMessage: 'Failed to apply ranking event',
    body: {
      p_wallet_address: walletAddress,
      p_event_id: eventId,
      p_bet_token_id: betTokenId,
      p_game_id: gameId,
      p_market_id: marketId,
      p_selection_id: selectionId,
      p_result: result,
      p_odds: odds,
      p_resolved_at: resolvedAt,
    },
  })

  const payload = Array.isArray(rows) ? rows[0] : rows

  return {
    inserted: Boolean(payload?.inserted),
    totalScore: toFiniteNumber(payload?.total_score),
    underdogBonus: toFiniteNumber(payload?.underdog_bonus),
  }
}
