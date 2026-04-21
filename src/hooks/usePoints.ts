import { useQuery } from '@tanstack/react-query'
import { fetchUserPoints } from '../api/points'

export function usePoints(address?: string) {
  const normalizedAddress = typeof address === 'string' && address ? address.toLowerCase() : undefined

  const pointsQuery = useQuery({
    queryKey: ['points', normalizedAddress],
    queryFn: () => fetchUserPoints(normalizedAddress || ''),
    enabled: Boolean(normalizedAddress),
    staleTime: 30_000,
  })

  return {
    totalPoints: pointsQuery.data?.totalPoints ?? 0,
    isLoading: pointsQuery.isLoading,
    errorMessage: pointsQuery.error instanceof Error ? pointsQuery.error.message : undefined,
    refetch: pointsQuery.refetch,
  }
}
