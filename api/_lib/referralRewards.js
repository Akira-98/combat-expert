import { normalizeAddress, normalizeTxHash } from './env.js'
import { supabaseInsert, supabaseSelect, supabaseUpdate } from './supabase.js'

const DEFAULT_SYNC_LIMIT = 25

function firstRow(rows) {
  return Array.isArray(rows) ? rows[0] : undefined
}

function mapReferralReward(row) {
  if (!row) return undefined

  return {
    id: typeof row.id === 'string' ? row.id : '',
    shareId: typeof row.share_id === 'string' ? row.share_id : null,
    referrerWallet: normalizeAddress(row.referrer_wallet),
    bettorWallet: normalizeAddress(row.bettor_wallet),
    txHash: normalizeTxHash(row.tx_hash),
    betId: typeof row.bet_id === 'string' ? row.bet_id : null,
    betAmount: row.bet_amount === null || row.bet_amount === undefined ? null : String(row.bet_amount),
    betStatus: typeof row.bet_status === 'string' ? row.bet_status : null,
    betResult: typeof row.bet_result === 'string' ? row.bet_result : null,
    payoutAmount: row.payout_amount === null || row.payout_amount === undefined ? null : String(row.payout_amount),
    poolRevenue: row.pool_revenue === null || row.pool_revenue === undefined ? null : String(row.pool_revenue),
    rewardAmount: row.reward_amount === null || row.reward_amount === undefined ? null : String(row.reward_amount),
    grossAffiliateFee: row.gross_affiliate_fee === null || row.gross_affiliate_fee === undefined ? null : String(row.gross_affiliate_fee),
    platformFeeBps: Number.isFinite(Number(row.platform_fee_bps)) ? Number(row.platform_fee_bps) : 6000,
    referrerRewardBps: Number.isFinite(Number(row.referrer_reward_bps)) ? Number(row.referrer_reward_bps) : 5000,
    status: typeof row.status === 'string' ? row.status : '',
    createdAt: typeof row.created_at === 'string' ? row.created_at : '',
    settledAt: typeof row.settled_at === 'string' ? row.settled_at : null,
    verifiedAt: typeof row.verified_at === 'string' ? row.verified_at : null,
    paidAt: typeof row.paid_at === 'string' ? row.paid_at : null,
    payoutTxHash: normalizeTxHash(row.payout_tx_hash) || null,
  }
}

function clampSyncLimit(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed)) return DEFAULT_SYNC_LIMIT
  return Math.min(100, Math.max(1, parsed))
}

function parseIntegerAmount(value) {
  const stringValue = String(value ?? '').trim()
  if (!/^-?\d+$/.test(stringValue)) return undefined
  return BigInt(stringValue)
}

function formatBigIntAmount(value) {
  return value.toString()
}

function calculateRegularPoolRevenue({ amount, payout }) {
  const amountInt = parseIntegerAmount(amount)
  const payoutInt = parseIntegerAmount(payout)

  if (amountInt === undefined || payoutInt === undefined) {
    const amountNum = Number(amount)
    const payoutNum = Number(payout)
    if (!Number.isFinite(amountNum) || !Number.isFinite(payoutNum)) return undefined
    return String(amountNum - payoutNum)
  }

  return formatBigIntAmount(amountInt - payoutInt)
}

function calculateFreebetPoolRevenue({ amount, odds }) {
  const amountNum = Number(amount)
  const oddsNum = Number(odds)
  if (!Number.isFinite(amountNum) || !Number.isFinite(oddsNum)) return undefined
  return String(amountNum - amountNum * (oddsNum - 1))
}

function calculateRewardAmount({ poolRevenue, platformFeeBps, referrerRewardBps }) {
  const poolRevenueInt = parseIntegerAmount(poolRevenue)

  if (poolRevenueInt !== undefined) {
    if (poolRevenueInt <= 0n) return '0'
    return formatBigIntAmount((poolRevenueInt * BigInt(platformFeeBps) * BigInt(referrerRewardBps)) / 10000n / 10000n)
  }

  const poolRevenueNum = Number(poolRevenue)
  if (!Number.isFinite(poolRevenueNum) || poolRevenueNum <= 0) return '0'
  return String((poolRevenueNum * platformFeeBps * referrerRewardBps) / 10000 / 10000)
}

export function calculateReferralSettlement({ bet, reward }) {
  const platformFeeBps = Number.isFinite(reward?.platformFeeBps) ? reward.platformFeeBps : 6000
  const referrerRewardBps = Number.isFinite(reward?.referrerRewardBps) ? reward.referrerRewardBps : 5000
  const poolRevenue = bet.isFreebet
    ? calculateFreebetPoolRevenue({ amount: bet.amount, odds: bet.odds })
    : calculateRegularPoolRevenue({ amount: bet.amount, payout: bet.payout })

  if (poolRevenue === undefined) {
    return { ok: false, status: 'invalid_amounts', error: 'Bet amounts are invalid' }
  }

  const grossAffiliateFee = Number(poolRevenue) > 0 ? poolRevenue : '0'
  const rewardAmount = calculateRewardAmount({ poolRevenue, platformFeeBps, referrerRewardBps })

  return {
    ok: true,
    settlement: {
      betAmount: bet.amount || null,
      betStatus: bet.status || null,
      betResult: bet.result || null,
      payoutAmount: bet.payout || null,
      poolRevenue,
      grossAffiliateFee,
      rewardAmount,
      settledAt: bet.resolvedBlockTimestamp ? new Date(Number(bet.resolvedBlockTimestamp) * 1000).toISOString() : null,
    },
  }
}

export async function fetchPendingReferralRewards({ supabaseUrl, serviceRoleKey, limit }) {
  const safeLimit = clampSyncLimit(limit)
  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `referral_rewards?status=eq.pending&select=*&order=created_at.asc&limit=${safeLimit}`,
    errorMessage: 'Failed to fetch pending referral rewards',
  })

  return Array.isArray(rows) ? rows.map(mapReferralReward).filter((reward) => reward?.id) : []
}

export async function updateReferralRewardSettlement({
  supabaseUrl,
  serviceRoleKey,
  rewardId,
  settlement,
}) {
  if (typeof rewardId !== 'string' || !rewardId) {
    return { ok: false, status: 'invalid_reward_id', error: 'Invalid reward id' }
  }

  const rows = await supabaseUpdate({
    supabaseUrl,
    serviceRoleKey,
    path: `referral_rewards?id=eq.${encodeURIComponent(rewardId)}`,
    errorMessage: 'Failed to update referral reward settlement',
    body: {
      bet_amount: settlement.betAmount,
      bet_status: settlement.betStatus,
      bet_result: settlement.betResult,
      payout_amount: settlement.payoutAmount,
      pool_revenue: settlement.poolRevenue,
      gross_affiliate_fee: settlement.grossAffiliateFee,
      reward_amount: settlement.rewardAmount,
      settled_at: settlement.settledAt,
      verified_at: new Date().toISOString(),
      status: 'verified',
    },
  })

  return {
    ok: true,
    status: 'verified',
    reward: mapReferralReward(firstRow(rows)),
  }
}

export async function fetchReferralRewardByTxHash({ supabaseUrl, serviceRoleKey, txHash }) {
  const normalizedTxHash = normalizeTxHash(txHash)
  if (!normalizedTxHash) return undefined

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `referral_rewards?tx_hash=eq.${encodeURIComponent(normalizedTxHash)}&select=*`,
    errorMessage: 'Failed to fetch referral reward',
  })

  return mapReferralReward(firstRow(rows))
}

export async function createPendingReferralReward({
  supabaseUrl,
  serviceRoleKey,
  share,
  bettorWallet,
  txHash,
  bet,
}) {
  const normalizedBettorWallet = normalizeAddress(bettorWallet)
  const normalizedTxHash = normalizeTxHash(txHash)

  if (!share?.id || !share.referrerWallet) {
    return { ok: false, status: 'invalid_share', error: 'Invalid referral share' }
  }

  if (!normalizedBettorWallet) {
    return { ok: false, status: 'invalid_bettor_wallet', error: 'Invalid bettor wallet' }
  }

  if (!normalizedTxHash) {
    return { ok: false, status: 'invalid_tx_hash', error: 'Invalid transaction hash' }
  }

  if (share.referrerWallet === normalizedBettorWallet) {
    return { ok: false, status: 'self_referral', error: 'Self referral is not allowed' }
  }

  const existingReward = await fetchReferralRewardByTxHash({ supabaseUrl, serviceRoleKey, txHash: normalizedTxHash })
  if (existingReward?.id) {
    return { ok: true, status: 'already_recorded', reward: existingReward }
  }

  const rows = await supabaseInsert({
    supabaseUrl,
    serviceRoleKey,
    table: 'referral_rewards',
    errorMessage: 'Failed to create referral reward',
    body: {
      share_id: share.id,
      referrer_wallet: share.referrerWallet,
      bettor_wallet: normalizedBettorWallet,
      tx_hash: normalizedTxHash,
      bet_id: bet.betId || null,
      bet_amount: bet.amount || null,
      bet_status: bet.status || null,
      bet_result: bet.result || null,
      status: 'pending',
      metadata: {
        affiliate: bet.affiliate,
        odds: bet.odds,
        createdBlockTimestamp: bet.createdBlockTimestamp,
        selections: Array.isArray(bet.selections) ? bet.selections : [],
      },
    },
  })

  return {
    ok: true,
    status: 'recorded',
    reward: mapReferralReward(firstRow(rows)),
  }
}
