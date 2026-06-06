import { loadServerEnv, normalizeAddress } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import {
  fetchActiveReferrerByWallet,
  fetchReferralAffiliatePeriodStatsByReferrer,
} from '../_lib/referralAttribution.js'

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function parseAmount(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

function summarizeStats(stats) {
  return stats.reduce((summary, stat) => ({
    referredUserCount: Math.max(summary.referredUserCount, stat.referredUserCount),
    activeReferredUserCount: Math.max(summary.activeReferredUserCount, stat.activeReferredUserCount),
    betCount: summary.betCount + stat.betCount,
    volumeUsdt: summary.volumeUsdt + parseAmount(stat.volumeUsdt),
    estimatedCommissionUsdt: summary.estimatedCommissionUsdt + parseAmount(stat.estimatedCommissionUsdt),
    syncedAt: summary.syncedAt > stat.syncedAt ? summary.syncedAt : stat.syncedAt,
  }), {
    referredUserCount: 0,
    activeReferredUserCount: 0,
    betCount: 0,
    volumeUsdt: 0,
    estimatedCommissionUsdt: 0,
    syncedAt: '',
  })
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return

  const { supabaseUrl, serviceRoleKey } = loadServerEnv()
  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    const walletAddress = normalizeAddress(firstQueryValue(req.query?.wallet))
    if (!walletAddress) {
      return sendJson(res, 400, { ok: false, status: 'invalid_wallet_address', error: 'Invalid wallet address' })
    }

    const referrer = await fetchActiveReferrerByWallet({
      supabaseUrl,
      serviceRoleKey,
      walletAddress,
    })

    if (!referrer?.code) {
      return sendJson(res, 200, { ok: false, status: 'not_referrer' })
    }

    const periods = await fetchReferralAffiliatePeriodStatsByReferrer({
      supabaseUrl,
      serviceRoleKey,
      referrerWallet: referrer.walletAddress,
      referralCode: referrer.code,
    })
    const summary = summarizeStats(periods)

    return sendJson(res, 200, {
      ok: true,
      affiliate: {
        walletAddress: referrer.walletAddress,
        displayName: referrer.displayName,
        code: referrer.code,
        commissionRateBps: referrer.commissionRateBps,
        summary,
      },
    })
  } catch (error) {
    return sendServerError(res, error, 'Failed to fetch referral affiliate dashboard')
  }
}
