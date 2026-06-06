import { normalizeAddress } from './env.js'
import { supabaseInsert, supabaseSelect } from './supabase.js'

const REFERRAL_CODE_PATTERN = /^[A-Z2-9]{6,12}$/
const DEFAULT_COMMISSION_RATE_BPS = 150

function firstRow(rows) {
  return Array.isArray(rows) ? rows[0] : undefined
}

export function normalizeReferralCode(value) {
  if (typeof value !== 'string') return ''
  const normalized = value.trim().toUpperCase()
  return REFERRAL_CODE_PATTERN.test(normalized) ? normalized : ''
}

function mapReferrer(row) {
  if (!row) return undefined
  const commissionRateBps = Number(row.commission_rate_bps)

  return {
    id: typeof row.id === 'string' ? row.id : '',
    walletAddress: normalizeAddress(row.wallet_address),
    code: normalizeReferralCode(row.code),
    status: typeof row.status === 'string' ? row.status : '',
    displayName: typeof row.display_name === 'string' ? row.display_name : null,
    commissionRateBps: Number.isInteger(commissionRateBps) ? commissionRateBps : DEFAULT_COMMISSION_RATE_BPS,
    createdAt: typeof row.created_at === 'string' ? row.created_at : '',
  }
}

function mapAttribution(row) {
  if (!row) return undefined

  return {
    id: typeof row.id === 'string' ? row.id : '',
    referrerWallet: normalizeAddress(row.referrer_wallet),
    referredWallet: normalizeAddress(row.referred_wallet),
    referralCode: normalizeReferralCode(row.referral_code),
    attributedAt: typeof row.attributed_at === 'string' ? row.attributed_at : '',
  }
}

function mapAffiliatePeriodStat(row) {
  if (!row) return undefined

  return {
    id: typeof row.id === 'string' ? row.id : '',
    referrerWallet: normalizeAddress(row.referrer_wallet),
    referralCode: normalizeReferralCode(row.referral_code),
    periodStart: typeof row.period_start === 'string' ? row.period_start : '',
    periodEnd: typeof row.period_end === 'string' ? row.period_end : '',
    referredUserCount: Number(row.referred_user_count) || 0,
    activeReferredUserCount: Number(row.active_referred_user_count) || 0,
    betCount: Number(row.bet_count) || 0,
    volumeRaw: String(row.volume_raw ?? '0'),
    volumeUsdt: String(row.volume_usdt ?? '0'),
    commissionRateBps: Number(row.commission_rate_bps) || DEFAULT_COMMISSION_RATE_BPS,
    estimatedCommissionRaw: String(row.estimated_commission_raw ?? '0'),
    estimatedCommissionUsdt: String(row.estimated_commission_usdt ?? '0'),
    syncedAt: typeof row.synced_at === 'string' ? row.synced_at : '',
  }
}

export async function fetchActiveReferrerByCode({ supabaseUrl, serviceRoleKey, code }) {
  const normalizedCode = normalizeReferralCode(code)
  if (!normalizedCode) return undefined

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `referrers?code=eq.${encodeURIComponent(normalizedCode)}&status=eq.active&select=id,wallet_address,code,status,display_name,commission_rate_bps,created_at`,
    errorMessage: 'Failed to fetch referral referrer',
  })

  return mapReferrer(firstRow(rows))
}

export async function fetchActiveReferrerByWallet({ supabaseUrl, serviceRoleKey, walletAddress }) {
  const normalizedWallet = normalizeAddress(walletAddress)
  if (!normalizedWallet) return undefined

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `referrers?wallet_address=eq.${encodeURIComponent(normalizedWallet)}&status=eq.active&select=id,wallet_address,code,status,display_name,commission_rate_bps,created_at`,
    errorMessage: 'Failed to fetch referral referrer',
  })

  return mapReferrer(firstRow(rows))
}

export async function fetchReferrers({ supabaseUrl, serviceRoleKey }) {
  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: 'referrers?select=id,wallet_address,code,status,display_name,commission_rate_bps,created_at',
    errorMessage: 'Failed to fetch referral referrers',
  })

  return Array.isArray(rows) ? rows.map(mapReferrer).filter((referrer) => referrer?.walletAddress && referrer?.code) : []
}

export async function fetchReferralAttributionByWallet({ supabaseUrl, serviceRoleKey, walletAddress }) {
  const normalizedWallet = normalizeAddress(walletAddress)
  if (!normalizedWallet) return undefined

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `referral_attributions?referred_wallet=eq.${encodeURIComponent(normalizedWallet)}&select=id,referrer_wallet,referred_wallet,referral_code,attributed_at`,
    errorMessage: 'Failed to fetch referral attribution',
  })

  return mapAttribution(firstRow(rows))
}

export async function fetchReferralAttributions({ supabaseUrl, serviceRoleKey }) {
  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: 'referral_attributions?select=id,referrer_wallet,referred_wallet,referral_code,attributed_at&order=attributed_at.asc',
    errorMessage: 'Failed to fetch referral attributions',
  })

  return Array.isArray(rows) ? rows.map(mapAttribution).filter((attribution) => attribution?.id) : []
}

export async function upsertReferralAffiliatePeriodStats({ supabaseUrl, serviceRoleKey, stats }) {
  if (!Array.isArray(stats) || stats.length === 0) return []

  return supabaseInsert({
    supabaseUrl,
    serviceRoleKey,
    table: 'referral_affiliate_period_stats?on_conflict=referrer_wallet,referral_code,period_start,period_end',
    prefer: 'resolution=merge-duplicates,return=representation',
    errorMessage: 'Failed to save referral affiliate period stats',
    body: stats,
  })
}

export async function fetchReferralAffiliatePeriodStatsByReferrer({
  supabaseUrl,
  serviceRoleKey,
  referrerWallet,
  referralCode,
}) {
  const normalizedWallet = normalizeAddress(referrerWallet)
  const normalizedCode = normalizeReferralCode(referralCode)
  if (!normalizedWallet || !normalizedCode) return []

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `referral_affiliate_period_stats?referrer_wallet=eq.${encodeURIComponent(normalizedWallet)}&referral_code=eq.${encodeURIComponent(normalizedCode)}&select=id,referrer_wallet,referral_code,period_start,period_end,referred_user_count,active_referred_user_count,bet_count,volume_raw,volume_usdt,commission_rate_bps,estimated_commission_raw,estimated_commission_usdt,synced_at&order=period_start.desc`,
    errorMessage: 'Failed to fetch referral affiliate period stats',
  })

  return Array.isArray(rows) ? rows.map(mapAffiliatePeriodStat).filter((stat) => stat?.id) : []
}

export async function createReferralAttribution({
  supabaseUrl,
  serviceRoleKey,
  code,
  referredWallet,
}) {
  const normalizedCode = normalizeReferralCode(code)
  const normalizedReferredWallet = normalizeAddress(referredWallet)

  if (!normalizedCode) {
    return { ok: false, status: 'invalid_code', error: 'Invalid referral code' }
  }

  if (!normalizedReferredWallet) {
    return { ok: false, status: 'invalid_referred_wallet', error: 'Invalid referred wallet' }
  }

  const existingAttribution = await fetchReferralAttributionByWallet({
    supabaseUrl,
    serviceRoleKey,
    walletAddress: normalizedReferredWallet,
  })
  if (existingAttribution?.id) {
    return {
      ok: true,
      status: 'already_attributed',
      attribution: existingAttribution,
    }
  }

  const referrer = await fetchActiveReferrerByCode({
    supabaseUrl,
    serviceRoleKey,
    code: normalizedCode,
  })
  if (!referrer?.walletAddress) {
    return { ok: false, status: 'invalid_code', error: 'Referral code is not active' }
  }

  if (referrer.walletAddress === normalizedReferredWallet) {
    return { ok: false, status: 'self_referral', error: 'Self referral is not allowed' }
  }

  const rows = await supabaseInsert({
    supabaseUrl,
    serviceRoleKey,
    table: 'referral_attributions',
    errorMessage: 'Failed to create referral attribution',
    body: {
      referrer_wallet: referrer.walletAddress,
      referred_wallet: normalizedReferredWallet,
      referral_code: referrer.code,
    },
  })

  return {
    ok: true,
    status: 'attributed',
    attribution: mapAttribution(firstRow(rows)),
  }
}
