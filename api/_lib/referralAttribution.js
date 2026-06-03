import { normalizeAddress } from './env.js'
import { supabaseInsert, supabaseSelect } from './supabase.js'

const REFERRAL_CODE_PATTERN = /^[A-Z2-9]{6,12}$/

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

  return {
    id: typeof row.id === 'string' ? row.id : '',
    walletAddress: normalizeAddress(row.wallet_address),
    code: normalizeReferralCode(row.code),
    status: typeof row.status === 'string' ? row.status : '',
    displayName: typeof row.display_name === 'string' ? row.display_name : null,
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

export async function fetchActiveReferrerByCode({ supabaseUrl, serviceRoleKey, code }) {
  const normalizedCode = normalizeReferralCode(code)
  if (!normalizedCode) return undefined

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `referrers?code=eq.${encodeURIComponent(normalizedCode)}&status=eq.active&select=id,wallet_address,code,status,display_name,created_at`,
    errorMessage: 'Failed to fetch referral referrer',
  })

  return mapReferrer(firstRow(rows))
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
