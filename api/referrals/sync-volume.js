import { fetchSettledV3BetsByAffiliate } from '../_lib/azuro.js'
import { loadServerEnv } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import {
  fetchReferralAttributions,
  fetchReferrers,
  upsertReferralAffiliatePeriodStats,
} from '../_lib/referralAttribution.js'
import { formatTokenAmount, summarizeReferralVolume } from '../_lib/referralVolumeStats.js'
import { isAuthorizedRankingSyncRequest } from '../_lib/rankingAuth.js'

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return false
  return value === 'true' || value === '1'
}

function parseDateBoundary(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: `${label} is required` }
  }

  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) {
    return { error: `${label} must be a valid date` }
  }

  return {
    iso: new Date(timestamp).toISOString(),
    unix: Math.floor(timestamp / 1000),
  }
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const { supabaseUrl, serviceRoleKey, affiliateAddress, rankingSyncSecret } = loadServerEnv()
  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  if (!affiliateAddress) {
    return sendJson(res, 500, { error: 'Affiliate env is missing' })
  }

  if (!rankingSyncSecret) {
    return sendJson(res, 500, { error: 'Referral volume sync auth env is missing' })
  }

  if (!isAuthorizedRankingSyncRequest(req, rankingSyncSecret)) {
    return sendJson(res, 401, { error: 'Unauthorized' })
  }

  const from = parseDateBoundary(req.body?.from || req.query?.from, 'from')
  if (from.error) return sendJson(res, 400, { error: from.error })

  const to = parseDateBoundary(req.body?.to || req.query?.to, 'to')
  if (to.error) return sendJson(res, 400, { error: to.error })

  if (to.unix <= from.unix) {
    return sendJson(res, 400, { error: 'to must be after from' })
  }

  const includeBets = normalizeBoolean(req.body?.includeBets) || normalizeBoolean(req.query?.includeBets)

  try {
    const [attributions, referrers] = await Promise.all([
      fetchReferralAttributions({ supabaseUrl, serviceRoleKey }),
      fetchReferrers({ supabaseUrl, serviceRoleKey }),
    ])
    if (attributions.length === 0) {
      return sendJson(res, 200, {
        ok: true,
        from: from.iso,
        to: to.iso,
        affiliateAddress,
        attributionCount: 0,
        fetchedBetCount: 0,
        savedPeriodStatCount: 0,
        matchedBetCount: 0,
        skippedInvalidAmountCount: 0,
        totalVolumeRaw: '0',
        totalVolumeUsdt: formatTokenAmount(0n),
        referrers: [],
      })
    }

    const bets = await fetchSettledV3BetsByAffiliate({
      affiliateAddress,
      resolvedTimestampGte: String(from.unix),
      resolvedTimestampLt: String(to.unix),
      statuses: ['Resolved'],
    })

    const summary = summarizeReferralVolume({
      bets,
      attributions,
      referrers,
      includeBets,
      periodStart: from.iso,
      periodEnd: to.iso,
    })
    const { periodStatRows, ...responseSummary } = summary
    const savedStats = await upsertReferralAffiliatePeriodStats({
      supabaseUrl,
      serviceRoleKey,
      stats: periodStatRows,
    })

    return sendJson(res, 200, {
      ok: true,
      from: from.iso,
      to: to.iso,
      affiliateAddress,
      attributionCount: attributions.length,
      fetchedBetCount: bets.length,
      savedPeriodStatCount: Array.isArray(savedStats) ? savedStats.length : periodStatRows.length,
      ...responseSummary,
    })
  } catch (error) {
    return sendServerError(res, error, 'Failed to sync referral volume')
  }
}
