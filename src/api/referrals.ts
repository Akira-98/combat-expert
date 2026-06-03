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

export type FetchMyReferralResponse = {
  ok?: boolean
  status?: string
  referral?: MyReferral
}

export async function fetchMyReferral(walletAddress: string) {
  const params = new URLSearchParams({ wallet: walletAddress })

  return getJson(
    `/api/referrals/me?${params.toString()}`,
    'Failed to load referral.',
  ) as Promise<FetchMyReferralResponse>
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
