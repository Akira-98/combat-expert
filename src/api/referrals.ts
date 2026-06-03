import { postJson } from './http'

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
