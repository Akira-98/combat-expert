import { normalizeAddress, normalizeTxHash } from './env.js'

const USDT_DECIMALS = 6
const DEFAULT_COMMISSION_RATE_BPS = 150
const BPS_DENOMINATOR = 10000n

export function formatTokenAmount(rawAmount, decimals = USDT_DECIMALS) {
  const divisor = 10n ** BigInt(decimals)
  const whole = rawAmount / divisor
  const fraction = rawAmount % divisor
  return `${whole}.${fraction.toString().padStart(decimals, '0')}`
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

function normalizeCommissionRateBps(value) {
  const rate = Number(value)
  return Number.isInteger(rate) && rate >= 0 && rate <= 10000 ? rate : DEFAULT_COMMISSION_RATE_BPS
}

function calculateCommissionRaw(volumeRaw, commissionRateBps) {
  return volumeRaw * BigInt(commissionRateBps) / BPS_DENOMINATOR
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

function buildCommissionRateIndex(referrers) {
  const ratesByReferrer = new Map()

  for (const referrer of referrers) {
    if (!referrer?.walletAddress || !referrer?.code) continue
    ratesByReferrer.set(
      `${referrer.walletAddress}:${referrer.code}`,
      normalizeCommissionRateBps(referrer.commissionRateBps),
    )
  }

  return ratesByReferrer
}

function createEmptySummary(attribution) {
  return {
    referrerWallet: attribution.referrerWallet,
    referralCode: attribution.referralCode,
    betCount: 0,
    volumeRaw: 0n,
    referredWallets: new Set(),
    activeReferredWallets: new Set(),
    bets: [],
  }
}

function serializeSummary(summary, includeBets, commissionRateBps) {
  const estimatedCommissionRaw = calculateCommissionRaw(summary.volumeRaw, commissionRateBps)

  return {
    referrerWallet: summary.referrerWallet,
    referralCode: summary.referralCode,
    referredUserCount: summary.referredWallets.size,
    activeReferredUserCount: summary.activeReferredWallets.size,
    betCount: summary.betCount,
    volumeRaw: summary.volumeRaw.toString(),
    volumeUsdt: formatTokenAmount(summary.volumeRaw),
    commissionRateBps,
    estimatedCommissionRaw: estimatedCommissionRaw.toString(),
    estimatedCommissionUsdt: formatTokenAmount(estimatedCommissionRaw),
    ...(includeBets
      ? {
          referredWallets: Array.from(summary.referredWallets).sort(),
          activeReferredWallets: Array.from(summary.activeReferredWallets).sort(),
          bets: summary.bets,
        }
      : {}),
  }
}

function buildPeriodStatRows({ referrers, periodStart, periodEnd, referrerSummaries }) {
  const ratesByReferrer = buildCommissionRateIndex(referrers)

  return Array.from(referrerSummaries.values()).map((summary) => {
    const key = `${summary.referrerWallet}:${summary.referralCode}`
    const commissionRateBps = ratesByReferrer.get(key) ?? DEFAULT_COMMISSION_RATE_BPS
    const estimatedCommissionRaw = calculateCommissionRaw(summary.volumeRaw, commissionRateBps)

    return {
      referrer_wallet: summary.referrerWallet,
      referral_code: summary.referralCode,
      period_start: periodStart,
      period_end: periodEnd,
      referred_user_count: summary.referredWallets.size,
      active_referred_user_count: summary.activeReferredWallets.size,
      bet_count: summary.betCount,
      volume_raw: summary.volumeRaw.toString(),
      volume_usdt: formatTokenAmount(summary.volumeRaw),
      commission_rate_bps: commissionRateBps,
      estimated_commission_raw: estimatedCommissionRaw.toString(),
      estimated_commission_usdt: formatTokenAmount(estimatedCommissionRaw),
      synced_at: new Date().toISOString(),
    }
  })
}

export function summarizeReferralVolume({ bets, attributions, referrers, includeBets, periodStart, periodEnd }) {
  const attributionsByWallet = buildAttributionIndex(attributions)
  const summariesByReferrer = new Map()
  const ratesByReferrer = buildCommissionRateIndex(referrers)
  const countedBetIds = new Set()
  let skippedInvalidAmountCount = 0
  let totalVolumeRaw = 0n

  for (const attribution of attributions) {
    const key = `${attribution.referrerWallet}:${attribution.referralCode}`
    const summary = summariesByReferrer.get(key) || createEmptySummary(attribution)
    summary.referredWallets.add(attribution.referredWallet)
    summariesByReferrer.set(key, summary)
  }

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
    summary.activeReferredWallets.add(attribution.referredWallet)
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

  const referrerSummaries = Array.from(summariesByReferrer.values())
    .map((summary) => {
      const key = `${summary.referrerWallet}:${summary.referralCode}`
      return serializeSummary(summary, includeBets, ratesByReferrer.get(key) ?? DEFAULT_COMMISSION_RATE_BPS)
    })
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
    referrers: referrerSummaries,
    periodStatRows: buildPeriodStatRows({
      referrers,
      periodStart,
      periodEnd,
      referrerSummaries: summariesByReferrer,
    }),
  }
}
