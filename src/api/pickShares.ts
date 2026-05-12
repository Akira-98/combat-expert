import { getJson, postJson } from './http'

export type PickShareSelection = {
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

export type PickShare = {
  id: string
  sharerWallet?: string
  referrerWallet: string
  selections: PickShareSelection[]
  status: string
  createdAt: string
  expiresAt: string | null
}

type CreatePickShareResponse = {
  ok?: boolean
  share?: PickShare
  shareUrl?: string
}

type FetchPickShareResponse = {
  ok?: boolean
  share?: PickShare
}

type AwardPickSharePointsResponse = {
  ok?: boolean
  status?: string
  points?: {
    awarded: boolean
    totalPoints: number
  }
}

export async function createPickShare({
  sharerWallet,
  referrerWallet,
  selections,
}: {
  sharerWallet?: string
  referrerWallet?: string
  selections: PickShareSelection[]
}) {
  const payload = await postJson(
    '/api/pick-shares/shares',
    { sharerWallet, referrerWallet, selections },
    'Failed to create pick share.',
  ) as CreatePickShareResponse

  if (!payload.share?.id || !payload.shareUrl) {
    throw new Error('Failed to create pick share.')
  }

  return {
    share: payload.share,
    shareUrl: payload.shareUrl,
  }
}

export async function fetchPickShare(shareId: string) {
  const params = new URLSearchParams({ id: shareId })
  const payload = await getJson(`/api/pick-shares/shares?${params.toString()}`, 'Failed to load pick share.') as FetchPickShareResponse

  if (!payload.share?.id) {
    throw new Error('Failed to load pick share.')
  }

  return payload.share
}

export async function awardPickSharePoints({
  shareId,
  bettorWallet,
  txHash,
}: {
  shareId: string
  bettorWallet: string
  txHash: string
}): Promise<AwardPickSharePointsResponse> {
  return postJson(
    '/api/pick-shares/points',
    { shareId, bettorWallet, txHash },
    'Failed to award pick share points.',
  ) as Promise<AwardPickSharePointsResponse>
}
