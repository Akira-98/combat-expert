import { useQuery } from '@tanstack/react-query'
import { fetchRankings } from '../api/rankings'

export type { RankingEntry, RankingViewer } from '../api/rankings'

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
