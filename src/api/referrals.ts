import { getJson, postJson } from './http'

export type ReferralShare = {
  id: string
  referrerWallet: string
  selections: unknown[]
  status: string
  createdAt: string
  expiresAt: string | null
}

export type ReferralReward = {
  id: string
  shareId: string | null
  referrerWallet: string
  bettorWallet: string
  txHash: string
  betId: string | null
  betAmount: string | null
  betStatus: string | null
  betResult: string | null
  rewardAmount: string | null
  status: string
  createdAt: string
  verifiedAt: string | null
  paidAt: string | null
}

type CreateReferralShareResponse = {
  ok?: boolean
  share?: ReferralShare
  referralUrl?: string
}

type FetchReferralShareResponse = {
  ok?: boolean
  share?: ReferralShare
}

type RecordReferralRewardResponse = {
  ok?: boolean
  status?: string
  reward?: ReferralReward
}

export async function createReferralShare({ referrerWallet }: { referrerWallet: string }) {
  const payload = await postJson(
    '/api/referrals/shares',
    { referrerWallet },
    'Failed to create referral share.',
  ) as CreateReferralShareResponse

  if (!payload.share?.id || !payload.referralUrl) {
    throw new Error('Failed to create referral share.')
  }

  return {
    share: payload.share,
    referralUrl: payload.referralUrl,
  }
}

export async function fetchReferralShare(referralId: string) {
  const params = new URLSearchParams({ id: referralId })
  const payload = await getJson(`/api/referrals/shares?${params.toString()}`, 'Failed to load referral share.') as FetchReferralShareResponse

  if (!payload.share?.id) {
    throw new Error('Failed to load referral share.')
  }

  return payload.share
}

export async function recordReferralReward({
  referralId,
  bettorWallet,
  txHash,
}: {
  referralId: string
  bettorWallet: string
  txHash: string
}): Promise<RecordReferralRewardResponse> {
  return postJson(
    '/api/referrals/rewards',
    { referralId, bettorWallet, txHash },
    'Failed to record referral reward.',
  ) as Promise<RecordReferralRewardResponse>
}
