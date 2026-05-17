import { normalizeAddress } from './env.js'
import { supabaseRpc, supabaseSelect } from './supabase.js'

const DEFAULT_BET_PARTICIPATION_POINTS = 0
const DEFAULT_PICK_SHARE_BET_POINTS = 500
const BET_PLACED_SOURCE_TYPE = 'bet_placed'
const PICK_SHARE_BET_SOURCE_TYPE = 'pick_share_bet'

function toNonNegativeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return parsed
}

async function fetchPointRulePoints({ supabaseUrl, serviceRoleKey, sourceType, fallback }) {
  try {
    const rows = await supabaseSelect({
      supabaseUrl,
      serviceRoleKey,
      path: `point_rules?source_type=eq.${encodeURIComponent(sourceType)}&enabled=eq.true&select=points&limit=1`,
      errorMessage: 'Failed to fetch point rule',
    })
    return toNonNegativeInteger(Array.isArray(rows) ? rows[0]?.points : undefined, fallback)
  } catch {
    return fallback
  }
}

export async function awardBetParticipationPoints({
  supabaseUrl,
  serviceRoleKey,
  walletAddress,
  bet,
  txHash,
  points,
}) {
  const normalizedWalletAddress = normalizeAddress(walletAddress)
  if (!normalizedWalletAddress) {
    return { inserted: false, totalPoints: 0 }
  }

  const pointValue = points ?? await fetchPointRulePoints({
    supabaseUrl,
    serviceRoleKey,
    sourceType: BET_PLACED_SOURCE_TYPE,
    fallback: DEFAULT_BET_PARTICIPATION_POINTS,
  })
  if (pointValue <= 0) {
    const currentPoints = await fetchUserPoints({ supabaseUrl, serviceRoleKey, walletAddress: normalizedWalletAddress })
    return { inserted: false, totalPoints: currentPoints.totalPoints }
  }

  const rows = await supabaseRpc({
    supabaseUrl,
    serviceRoleKey,
    fn: 'award_point_event',
    errorMessage: 'Failed to award point event',
    body: {
      p_wallet_address: normalizedWalletAddress,
      p_source_type: BET_PLACED_SOURCE_TYPE,
      p_source_id: bet.betId,
      p_points: pointValue,
      p_bet_token_id: bet.betId,
      p_tx_hash: txHash,
      p_metadata: {
        affiliate: bet.affiliate,
        amount: bet.amount,
        odds: bet.odds,
        status: bet.status,
        createdBlockTimestamp: bet.createdBlockTimestamp,
      },
    },
  })

  const payload = Array.isArray(rows) ? rows[0] : rows

  return {
    inserted: Boolean(payload?.inserted),
    totalPoints: toNonNegativeInteger(payload?.total_points),
  }
}

export async function awardPickShareBetPoints({
  supabaseUrl,
  serviceRoleKey,
  referrerWallet,
  bettorWallet,
  share,
  bet,
  txHash,
  points,
}) {
  const normalizedReferrerWallet = normalizeAddress(referrerWallet)
  const normalizedBettorWallet = normalizeAddress(bettorWallet)
  if (!normalizedReferrerWallet) {
    return { inserted: false, totalPoints: 0 }
  }

  const sourceId = `${share.id}:${bet.betId || txHash}`
  const pointValue = points ?? await fetchPointRulePoints({
    supabaseUrl,
    serviceRoleKey,
    sourceType: PICK_SHARE_BET_SOURCE_TYPE,
    fallback: DEFAULT_PICK_SHARE_BET_POINTS,
  })
  const rows = await supabaseRpc({
    supabaseUrl,
    serviceRoleKey,
    fn: 'award_point_event',
    errorMessage: 'Failed to award pick share point event',
    body: {
      p_wallet_address: normalizedReferrerWallet,
      p_source_type: PICK_SHARE_BET_SOURCE_TYPE,
      p_source_id: sourceId,
      p_points: pointValue,
      p_bet_token_id: bet.betId || null,
      p_tx_hash: txHash,
      p_metadata: {
        shareId: share.id,
        bettorWallet: normalizedBettorWallet,
        affiliate: bet.affiliate,
        amount: bet.amount,
        odds: bet.odds,
        status: bet.status,
        createdBlockTimestamp: bet.createdBlockTimestamp,
        selections: share.selections,
      },
    },
  })

  const payload = Array.isArray(rows) ? rows[0] : rows

  return {
    inserted: Boolean(payload?.inserted),
    totalPoints: toNonNegativeInteger(payload?.total_points),
  }
}

export async function fetchUserPoints({ supabaseUrl, serviceRoleKey, walletAddress }) {
  const normalizedWalletAddress = normalizeAddress(walletAddress)
  if (!normalizedWalletAddress) {
    return { walletAddress: '', totalPoints: 0 }
  }

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `user_points?wallet_address=eq.${encodeURIComponent(normalizedWalletAddress)}&select=wallet_address,total_points`,
    errorMessage: 'Failed to fetch user points',
  })

  const row = Array.isArray(rows) ? rows[0] : undefined

  return {
    walletAddress: normalizedWalletAddress,
    totalPoints: toNonNegativeInteger(row?.total_points),
  }
}
