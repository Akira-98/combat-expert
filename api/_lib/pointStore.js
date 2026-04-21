import { normalizeAddress } from './env.js'
import { supabaseRpc, supabaseSelect } from './supabase.js'

const DEFAULT_BET_PARTICIPATION_POINTS = 100

function toNonNegativeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return parsed
}

export async function awardBetParticipationPoints({
  supabaseUrl,
  serviceRoleKey,
  walletAddress,
  bet,
  txHash,
  points = DEFAULT_BET_PARTICIPATION_POINTS,
}) {
  const normalizedWalletAddress = normalizeAddress(walletAddress)
  if (!normalizedWalletAddress) {
    return { inserted: false, totalPoints: 0 }
  }

  const rows = await supabaseRpc({
    supabaseUrl,
    serviceRoleKey,
    fn: 'award_point_event',
    errorMessage: 'Failed to award point event',
    body: {
      p_wallet_address: normalizedWalletAddress,
      p_source_type: 'bet_placed',
      p_source_id: bet.betId,
      p_points: points,
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
