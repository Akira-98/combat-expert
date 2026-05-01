import { normalizeAddress, normalizeTxHash } from './env.js'
import { supabaseInsert, supabaseSelect, supabaseUpdate } from './supabase.js'

const MAX_SHARE_SELECTIONS = 20
const DEFAULT_SYNC_LIMIT = 25
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function firstRow(rows) {
  return Array.isArray(rows) ? rows[0] : undefined
}

function normalizeShareId(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return UUID_PATTERN.test(trimmed) ? trimmed : ''
}

function normalizeSelection(selection) {
  if (!selection || typeof selection !== 'object') return undefined

  const conditionId = String(selection.conditionId ?? '').trim()
  const outcomeId = String(selection.outcomeId ?? '').trim()
  const gameId = String(selection.gameId ?? '').trim()
  const gameTitle = String(selection.gameTitle ?? '').trim()
  const label = String(selection.label ?? '').trim()
  const marketTitle = String(selection.marketTitle ?? '').trim()
  const selectionName = String(selection.selectionName ?? '').trim()
  const odds = Number(selection.odds)

  if (!conditionId || !outcomeId || !gameId) return undefined

  const normalized = {
    conditionId,
    outcomeId,
    gameId,
    isExpressForbidden: Boolean(selection.isExpressForbidden),
  }

  if (gameTitle) normalized.gameTitle = gameTitle
  if (label) normalized.label = label
  if (marketTitle) normalized.marketTitle = marketTitle
  if (selectionName) normalized.selectionName = selectionName
  if (Number.isFinite(odds) && odds > 0) normalized.odds = odds

  return normalized
}

export function normalizeReferralSelections(value) {
  if (!Array.isArray(value)) return []
  if (value.length === 0 || value.length > MAX_SHARE_SELECTIONS) return []

  const selections = value.map(normalizeSelection)
  if (selections.some((selection) => !selection)) return []

  return selections
}

function mapReferralShare(row) {
  if (!row) return undefined

  return {
    id: typeof row.id === 'string' ? row.id : '',
    referrerWallet: normalizeAddress(row.referrer_wallet),
    selections: normalizeReferralSelections(row.selections),
    status: typeof row.status === 'string' ? row.status : '',
    createdAt: typeof row.created_at === 'string' ? row.created_at : '',
    expiresAt: typeof row.expires_at === 'string' ? row.expires_at : null,
  }
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

function selectionKey(selection) {
  return `${selection.conditionId}:${selection.outcomeId}:${selection.gameId}`
}

function doSelectionsMatch(sharedSelections, betSelections) {
  const normalizedSharedSelections = normalizeReferralSelections(sharedSelections)
  const normalizedBetSelections = normalizeReferralSelections(betSelections)

  if (normalizedSharedSelections.length === 0) return false
  if (normalizedSharedSelections.length !== normalizedBetSelections.length) return false

  const betSelectionKeys = new Set(normalizedBetSelections.map(selectionKey))
  return normalizedSharedSelections.every((selection) => betSelectionKeys.has(selectionKey(selection)))
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

export async function createReferralShare({ supabaseUrl, serviceRoleKey, referrerWallet, selections }) {
  const normalizedReferrerWallet = normalizeAddress(referrerWallet)
  const normalizedSelections = normalizeReferralSelections(selections)

  if (!normalizedReferrerWallet) {
    return { ok: false, status: 'invalid_referrer_wallet', error: 'Invalid referrer wallet' }
  }

  if (normalizedSelections.length === 0) {
    return { ok: false, status: 'invalid_selections', error: 'Invalid selections' }
  }

  const rows = await supabaseInsert({
    supabaseUrl,
    serviceRoleKey,
    table: 'referral_shares',
    errorMessage: 'Failed to create referral share',
    body: {
      referrer_wallet: normalizedReferrerWallet,
      selections: normalizedSelections,
    },
  })

  return {
    ok: true,
    share: mapReferralShare(firstRow(rows)),
  }
}

export async function fetchReferralShareById({ supabaseUrl, serviceRoleKey, shareId }) {
  const normalizedShareId = normalizeShareId(shareId)
  if (!normalizedShareId) {
    return { ok: false, status: 'invalid_share_id', error: 'Invalid share id' }
  }

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `referral_shares?id=eq.${encodeURIComponent(normalizedShareId)}&select=id,referrer_wallet,selections,status,created_at,expires_at`,
    errorMessage: 'Failed to fetch referral share',
  })

  const share = mapReferralShare(firstRow(rows))
  if (!share?.id) {
    return { ok: false, status: 'not_found', error: 'Referral share was not found' }
  }

  if (share.status !== 'active') {
    return { ok: false, status: 'inactive', error: 'Referral share is not active', share }
  }

  if (share.expiresAt && Date.parse(share.expiresAt) <= Date.now()) {
    return { ok: false, status: 'expired', error: 'Referral share has expired', share }
  }

  return { ok: true, share }
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

  if (!doSelectionsMatch(share.selections, bet.selections)) {
    return { ok: false, status: 'selection_mismatch', error: 'Bet selections do not match the referral share' }
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
        selections: share.selections,
      },
    },
  })

  return {
    ok: true,
    status: 'recorded',
    reward: mapReferralReward(firstRow(rows)),
  }
}
