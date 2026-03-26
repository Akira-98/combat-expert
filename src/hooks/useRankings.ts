import { useQuery } from '@tanstack/react-query'
import { translate } from '../i18n'

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

async function fetchRankings(address?: string): Promise<RankingsPayload> {
  const params = new URLSearchParams()
  params.set('limit', '100')
  if (address) {
    params.set('address', address.toLowerCase())
  }

  const response = await fetch(`/api/rankings?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : translate('ranking.loadingFailed'))
  }

  const rankings = Array.isArray(payload?.rankings) ? payload.rankings : []
  const viewer = payload?.viewer && typeof payload.viewer === 'object' ? payload.viewer : null

  return {
    rankings,
    limit: Number.isFinite(Number(payload?.limit)) ? Number(payload.limit) : 100,
    updatedAt: typeof payload?.updatedAt === 'string' ? payload.updatedAt : null,
    viewer,
  }
}

export function useRankings(address?: string) {
  const normalizedAddress = typeof address === 'string' && address ? address.toLowerCase() : undefined

  const rankingsQuery = useQuery({
    queryKey: ['rankings', normalizedAddress],
    queryFn: () => fetchRankings(normalizedAddress),
    staleTime: 60_000,
  })

  return {
    rankings: rankingsQuery.data?.rankings ?? [],
    limit: rankingsQuery.data?.limit ?? 100,
    updatedAt: rankingsQuery.data?.updatedAt ?? null,
    viewer: rankingsQuery.data?.viewer ?? null,
    isLoading: rankingsQuery.isLoading,
    errorMessage: rankingsQuery.error instanceof Error ? rankingsQuery.error.message : undefined,
    refetch: rankingsQuery.refetch,
  }
}
