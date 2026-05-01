import { getJson, postJson } from './http'

export type ReferralSelection = {
  conditionId: string
  outcomeId: string
  gameId: string
  isExpressForbidden?: boolean
  gameTitle?: string
  label?: string
  odds?: number
  marketTitle?: string
  selectionName?: string
}

export type ReferralShare = {
  id: string
  referrerWallet: string
  selections: ReferralSelection[]
  status: string
  createdAt: string
  expiresAt: string | null
}

type CreateReferralShareResponse = {
  ok?: boolean
  share?: ReferralShare
  shareUrl?: string
}

type FetchReferralShareResponse = {
  ok?: boolean
  share?: ReferralShare
}

type RecordReferralRewardResponse = {
  ok?: boolean
  status?: string
}

export async function createReferralShare({
  referrerWallet,
  selections,
}: {
  referrerWallet: string
  selections: ReferralSelection[]
}) {
  const payload = await postJson(
    '/api/referrals/shares',
    { referrerWallet, selections },
    'Failed to create referral share.',
  ) as CreateReferralShareResponse

  if (!payload.share?.id || !payload.shareUrl) {
    throw new Error('Failed to create referral share.')
  }

  return {
    share: payload.share,
    shareUrl: payload.shareUrl,
  }
}

export async function fetchReferralShare(shareId: string) {
  const params = new URLSearchParams({ id: shareId })
  const payload = await getJson(`/api/referrals/shares?${params.toString()}`, 'Failed to load referral share.') as FetchReferralShareResponse

  if (!payload.share?.id) {
    throw new Error('Failed to load referral share.')
  }

  return payload.share
}

export async function recordReferralReward({
  shareId,
  bettorWallet,
  txHash,
}: {
  shareId: string
  bettorWallet: string
  txHash: string
}): Promise<RecordReferralRewardResponse> {
  return postJson(
    '/api/referrals/rewards',
    { shareId, bettorWallet, txHash },
    'Failed to record referral reward.',
  ) as Promise<RecordReferralRewardResponse>
}
