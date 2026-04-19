import { translate } from '../i18n'
import { getJson } from './http'

export type RankingEntry = {
  address: string
  nickname: string | null
  totalScore: number
  winCount: number
  loseCount: number
  voidCount: number
  underdogHitCount: number
  eventCount: number
  updatedAt: string | null
}

export type RankingViewer = RankingEntry & {
  rank: number
}

type RankingsPayload = {
  rankings: RankingEntry[]
  limit: number
  updatedAt: string | null
  viewer: RankingViewer | null
}

export async function fetchRankings(address?: string): Promise<RankingsPayload> {
  const params = new URLSearchParams()
  params.set('limit', '100')
  if (address) {
    params.set('address', address.toLowerCase())
  }

  const payload = await getJson(`/api/rankings?${params.toString()}`, translate('ranking.loadingFailed'))
  const rankingsPayload = payload && typeof payload === 'object' ? payload as Partial<RankingsPayload> : {}
  const viewer = rankingsPayload.viewer && typeof rankingsPayload.viewer === 'object' ? rankingsPayload.viewer : null

  return {
    rankings: Array.isArray(rankingsPayload.rankings) ? rankingsPayload.rankings : [],
    limit: Number.isFinite(Number(rankingsPayload.limit)) ? Number(rankingsPayload.limit) : 100,
    updatedAt: typeof rankingsPayload.updatedAt === 'string' ? rankingsPayload.updatedAt : null,
    viewer,
  }
}
