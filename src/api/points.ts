import { translate } from '../i18n'
import { getJson, postJson } from './http'

export type UserPoints = {
  walletAddress: string
  totalPoints: number
}

export type PointClaimResult = {
  eligible: boolean
  status: string
  points?: {
    awarded: boolean
    totalPoints: number
  }
}

export async function fetchUserPoints(address: string): Promise<UserPoints> {
  const params = new URLSearchParams()
  params.set('walletAddress', address.toLowerCase())

  const payload = await getJson(`/api/points?${params.toString()}`, translate('points.loadingFailed'))
  const data = payload && typeof payload === 'object' ? payload as Partial<UserPoints> : {}

  return {
    walletAddress: typeof data.walletAddress === 'string' ? data.walletAddress : address.toLowerCase(),
    totalPoints: Number.isFinite(Number(data.totalPoints)) ? Number(data.totalPoints) : 0,
  }
}

export async function claimBetParticipationPoints({ txHash, walletAddress }: { txHash: string; walletAddress: string }): Promise<PointClaimResult> {
  const payload = await postJson('/api/points/claim', { txHash, walletAddress }, translate('points.claimFailed'))
  const data = payload && typeof payload === 'object' ? payload as Partial<PointClaimResult> : {}

  return {
    eligible: Boolean(data.eligible),
    status: typeof data.status === 'string' ? data.status : 'unknown',
    points: data.points,
  }
}
