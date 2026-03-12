import { useMemo } from 'react'
import { useChain } from '@azuro-org/sdk'
import { useQuery } from '@tanstack/react-query'
import { fetchMarketManagerConditionsByGameIds } from '../api/marketManager'
import { mapMarketManagerConditionsToMarkets } from '../helpers/mappers/markets'

type UseMarketManagerConditionsParams = {
  gameIds: string[]
  enabled?: boolean
  staleTime?: number
  gcTime?: number
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  refetchInterval?: number | false
}

export function useMarketManagerConditions({
  gameIds,
  enabled = true,
  staleTime = 5_000,
  gcTime = 5 * 60_000,
  refetchOnMount = true,
  refetchOnWindowFocus = false,
  refetchOnReconnect = true,
  refetchInterval = 10_000,
}: UseMarketManagerConditionsParams) {
  const { api, environment } = useChain()
  const normalizedGameIds = useMemo(
    () => [...new Set(gameIds.filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [gameIds],
  )

  const query = useQuery({
    queryKey: ['market-manager-conditions', api, environment, normalizedGameIds],
    queryFn: async () => {
      return fetchMarketManagerConditionsByGameIds({
        apiBaseUrl: api,
        environment,
        gameIds: normalizedGameIds,
      })
    },
    enabled: enabled && normalizedGameIds.length > 0,
    staleTime,
    gcTime,
    refetchOnMount,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchInterval,
  })

  const markets = useMemo(() => mapMarketManagerConditionsToMarkets(query.data ?? []), [query.data])

  return {
    ...query,
    data: markets,
  }
}
