import { fetchV3BetsByCreatedTxHash } from '../../_lib/azuro.js'
import { loadServerEnv } from '../../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../../_lib/http.js'
import { isAuthorizedRankingSyncRequest } from '../../_lib/rankingAuth.js'
import {
  calculateReferralSettlement,
  fetchPendingReferralRewards,
  updateReferralRewardSettlement,
} from '../../_lib/referralStore.js'

const SETTLED_BET_STATUSES = new Set(['Resolved', 'Canceled'])
const CRON_SYNC_LIMIT = 50

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return false
  return value === 'true' || value === '1'
}

function readBearerToken(req) {
  const header = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

function isAuthorizedCronRequest(req, cronSecret) {
  if (!cronSecret) return false
  const userAgent = typeof req.headers?.['user-agent'] === 'string' ? req.headers['user-agent'] : ''
  return userAgent.includes('vercel-cron/1.0') && readBearerToken(req) === cronSecret
}

function findRewardBet(bets, reward) {
  if (!Array.isArray(bets)) return undefined

  if (reward.betId) {
    const bet = bets.find((candidate) => candidate?.betId === reward.betId)
    if (bet) return bet
  }

  return bets.find((candidate) => candidate?.createdTxHash === reward.txHash)
}

async function syncReferralReward({ supabaseUrl, serviceRoleKey, reward, dryRun }) {
  const bets = await fetchV3BetsByCreatedTxHash(reward.txHash)
  const bet = findRewardBet(bets, reward)

  if (!bet) {
    return {
      rewardId: reward.id,
      txHash: reward.txHash,
      status: 'pending_indexing',
    }
  }

  if (!SETTLED_BET_STATUSES.has(bet.status)) {
    return {
      rewardId: reward.id,
      txHash: reward.txHash,
      betId: bet.betId,
      betStatus: bet.status,
      status: 'pending_settlement',
    }
  }

  const settlementResult = calculateReferralSettlement({ bet, reward })
  if (!settlementResult.ok) {
    return {
      rewardId: reward.id,
      txHash: reward.txHash,
      betId: bet.betId,
      status: settlementResult.status,
      error: settlementResult.error,
    }
  }

  if (dryRun) {
    return {
      rewardId: reward.id,
      txHash: reward.txHash,
      betId: bet.betId,
      status: 'dry_run_verified',
      settlement: settlementResult.settlement,
    }
  }

  const updateResult = await updateReferralRewardSettlement({
    supabaseUrl,
    serviceRoleKey,
    rewardId: reward.id,
    settlement: settlementResult.settlement,
  })

  return {
    rewardId: reward.id,
    txHash: reward.txHash,
    betId: bet.betId,
    status: updateResult.status,
    reward: updateResult.reward,
  }
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return

  const { supabaseUrl, serviceRoleKey, rankingSyncSecret, cronSecret } = loadServerEnv()
  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  if (!rankingSyncSecret && !cronSecret) {
    return sendJson(res, 500, { error: 'Referral sync auth env is missing' })
  }

  const isCronRequest = req.method === 'GET'
  const isAuthorized = isCronRequest
    ? isAuthorizedCronRequest(req, cronSecret)
    : isAuthorizedRankingSyncRequest(req, rankingSyncSecret)

  if (!isAuthorized) {
    return sendJson(res, 401, { error: 'Unauthorized' })
  }

  const dryRun = normalizeBoolean(req.query?.dryRun) || normalizeBoolean(req.body?.dryRun)

  try {
    const rewards = await fetchPendingReferralRewards({
      supabaseUrl,
      serviceRoleKey,
      limit: isCronRequest ? CRON_SYNC_LIMIT : req.body?.limit || req.query?.limit,
    })

    const results = []
    for (const reward of rewards) {
      results.push(await syncReferralReward({ supabaseUrl, serviceRoleKey, reward, dryRun }))
    }

    const verifiedCount = results.filter((result) => result.status === 'verified' || result.status === 'dry_run_verified').length

    return sendJson(res, 200, {
      dryRun,
      processedCount: results.length,
      verifiedCount,
      pendingCount: results.length - verifiedCount,
      results,
    })
  } catch (error) {
    return sendServerError(res, error, 'Failed to sync referral rewards')
  }
}
