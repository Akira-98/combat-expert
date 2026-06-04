import { fetchSettledV3BetsByAffiliate } from '../_lib/azuro.js'
import { loadServerEnv, normalizeAddress, normalizeTxHash } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import { fetchReferralAttributions } from '../_lib/referralAttribution.js'
import { isAuthorizedRankingSyncRequest } from '../_lib/rankingAuth.js'

const USDT_DECIMALS = 6

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

function parseUsdtAmountToRaw(value, decimals = USDT_DECIMALS) {
  const stringValue = String(value ?? '').trim()
  const match = stringValue.match(/^(\d+)(?:\.(\d+))?$/)
  if (!match) return undefined

  const [, wholePart, fractionPart = ''] = match
  if (fractionPart.length > decimals) return undefined

  return BigInt(wholePart) * 10n ** BigInt(decimals)
    + BigInt(fractionPart.padEnd(decimals, '0'))
}

function formatTokenAmount(rawAmount, decimals = USDT_DECIMALS) {
  const divisor = 10n ** BigInt(decimals)
  const whole = rawAmount / divisor
  const fraction = rawAmount % divisor
  return `${whole}.${fraction.toString().padStart(decimals, '0')}`
}

function getBetWallets(bet) {
  return [
    normalizeAddress(bet?.bettor),
    normalizeAddress(bet?.actor),
    normalizeAddress(bet?.owner),
  ].filter(Boolean)
}

function buildAttributionIndex(attributions) {
  const byReferredWallet = new Map()

  for (const attribution of attributions) {
    if (!attribution.referredWallet || !attribution.referrerWallet) continue
    byReferredWallet.set(attribution.referredWallet, attribution)
  }

  return byReferredWallet
}

function createEmptySummary(attribution) {
  return {
    referrerWallet: attribution.referrerWallet,
    referralCode: attribution.referralCode,
    referredUserCount: 0,
    betCount: 0,
    volumeRaw: 0n,
    referredWallets: new Set(),
    bets: [],
  }
}

function serializeSummary(summary, includeBets) {
  return {
    referrerWallet: summary.referrerWallet,
    referralCode: summary.referralCode,
    referredUserCount: summary.referredWallets.size || summary.referredUserCount,
    betCount: summary.betCount,
    volumeRaw: summary.volumeRaw.toString(),
    volumeUsdt: formatTokenAmount(summary.volumeRaw),
    ...(includeBets
      ? {
          referredWallets: Array.from(summary.referredWallets).sort(),
          bets: summary.bets,
        }
      : {}),
  }
}

function summarizeReferralVolume({ bets, attributions, includeBets }) {
  const attributionsByWallet = buildAttributionIndex(attributions)
  const summariesByReferrer = new Map()
  const countedBetIds = new Set()
  let skippedInvalidAmountCount = 0
  let totalVolumeRaw = 0n

  for (const bet of bets) {
    if (bet?.status !== 'Resolved') continue
    if (typeof bet?.betId !== 'string' || !bet.betId) continue
    if (countedBetIds.has(bet.betId)) continue

    const attribution = getBetWallets(bet)
      .map((walletAddress) => attributionsByWallet.get(walletAddress))
      .find(Boolean)
    if (!attribution) continue

    const amount = parseUsdtAmountToRaw(bet.amount)
    if (amount === undefined || amount <= 0n) {
      skippedInvalidAmountCount += 1
      continue
    }

    countedBetIds.add(bet.betId)
    const key = `${attribution.referrerWallet}:${attribution.referralCode}`
    const summary = summariesByReferrer.get(key) || createEmptySummary(attribution)

    summary.betCount += 1
    summary.volumeRaw += amount
    summary.referredWallets.add(attribution.referredWallet)
    if (includeBets) {
      summary.bets.push({
        betId: bet.betId,
        txHash: normalizeTxHash(bet.createdTxHash) || null,
        referredWallet: attribution.referredWallet,
        amountRaw: amount.toString(),
        amountUsdt: formatTokenAmount(amount),
        resolvedBlockTimestamp: String(bet.resolvedBlockTimestamp || ''),
      })
    }

    summariesByReferrer.set(key, summary)
    totalVolumeRaw += amount
  }

  const referrers = Array.from(summariesByReferrer.values())
    .map((summary) => serializeSummary(summary, includeBets))
    .sort((a, b) => {
      const left = BigInt(a.volumeRaw)
      const right = BigInt(b.volumeRaw)
      if (right > left) return 1
      if (right < left) return -1
      return a.referralCode.localeCompare(b.referralCode)
    })

  return {
    matchedBetCount: countedBetIds.size,
    skippedInvalidAmountCount,
    totalVolumeRaw: totalVolumeRaw.toString(),
    totalVolumeUsdt: formatTokenAmount(totalVolumeRaw),
    referrers,
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
    const attributions = await fetchReferralAttributions({ supabaseUrl, serviceRoleKey })
    if (attributions.length === 0) {
      return sendJson(res, 200, {
        ok: true,
        from: from.iso,
        to: to.iso,
        affiliateAddress,
        attributionCount: 0,
        fetchedBetCount: 0,
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

    const summary = summarizeReferralVolume({ bets, attributions, includeBets })

    return sendJson(res, 200, {
      ok: true,
      from: from.iso,
      to: to.iso,
      affiliateAddress,
      attributionCount: attributions.length,
      fetchedBetCount: bets.length,
      ...summary,
    })
  } catch (error) {
    return sendServerError(res, error, 'Failed to sync referral volume')
  }
}
