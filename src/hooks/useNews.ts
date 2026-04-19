import { useQuery } from '@tanstack/react-query'
import { fetchNews } from '../api/news'

export function useNews() {
  const newsQuery = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 5 * 60_000,
  })

  return {
    items: newsQuery.data?.items ?? [],
    failedSources: newsQuery.data?.failedSources ?? [],
    updatedAt: newsQuery.data?.updatedAt ?? null,
    isLoading: newsQuery.isLoading,
    errorMessage: newsQuery.error instanceof Error ? newsQuery.error.message : undefined,
    refetch: newsQuery.refetch,
  }
}
