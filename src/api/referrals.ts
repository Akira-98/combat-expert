import { getJson, postJson } from './http'

export type ReferralAttribution = {
  id: string
  referrerWallet: string
  referredWallet: string
  referralCode: string
  attributedAt: string
}

type AttributeReferralResponse = {
  ok?: boolean
  status?: string
  attribution?: ReferralAttribution
}

export type MyReferral = {
  walletAddress: string
  code: string
  referralUrl: string
}

export type AffiliateDashboard = {
  walletAddress: string
  displayName: string | null
  code: string
  commissionRateBps: number
  summary: {
    referredUserCount: number
    activeReferredUserCount: number
    betCount: number
    volumeUsdt: number
    estimatedCommissionUsdt: number
    syncedAt: string
  }
}

export type FetchMyReferralResponse = {
  ok?: boolean
  status?: string
  referral?: MyReferral
}

export type FetchAffiliateDashboardResponse = {
  ok?: boolean
  status?: string
  affiliate?: AffiliateDashboard
}

export async function fetchMyReferral(walletAddress: string) {
  const params = new URLSearchParams({ wallet: walletAddress })

  return getJson(
    `/api/referrals/me?${params.toString()}`,
    'Failed to load referral.',
  ) as Promise<FetchMyReferralResponse>
}

export async function fetchAffiliateDashboard(walletAddress: string) {
  const params = new URLSearchParams({ wallet: walletAddress })

  return getJson(
    `/api/referrals/affiliate-dashboard?${params.toString()}`,
    'Failed to load affiliate dashboard.',
  ) as Promise<FetchAffiliateDashboardResponse>
}

export async function attributeReferral({
  code,
  referredWallet,
}: {
  code: string
  referredWallet: string
}) {
  return postJson(
    '/api/referrals/attribute',
    { code, referredWallet },
    'Failed to attribute referral.',
  ) as Promise<AttributeReferralResponse>
}
