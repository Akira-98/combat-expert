import { useMemo, useState } from 'react'
import { useChain } from '@azuro-org/sdk'
import { useQuery } from '@tanstack/react-query'
import { COMBAT_GAMES_LIMIT, fetchPreferredCombatGames } from '../api/combatGames'
import { mapGamesToItems, mapMarketsToSections } from '../helpers/mappers'
import { useMarketManagerConditions } from './useMarketManagerConditions'

const GAMES_QUERY_POLICY = {
  staleTime: 30_000,
  gcTime: 10 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: false,
  refetchInterval: false,
} as const

const ACTIVE_MARKETS_QUERY_POLICY = {
  staleTime: 5_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: true,
  refetchInterval: 10_000,
  refetchIntervalInBackground: false,
} as const

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function useMarketData() {
  const [userSelectedGameId, setUserSelectedGameId] = useState<string>()
  const { api, environment } = useChain()

  const gamesQuery = useQuery({
    queryKey: ['combat-expert-games', api, environment, COMBAT_GAMES_LIMIT],
    queryFn: async () => {
      return fetchPreferredCombatGames({
        apiBaseUrl: api,
        environment,
        limit: COMBAT_GAMES_LIMIT,
      })
    },
    ...GAMES_QUERY_POLICY,
  })
  const { data: games = [] } = gamesQuery
  const isGamesLoading = gamesQuery.isLoading

  const selectedGameId = useMemo(() => {
    if (games.length === 0) return undefined
    if (userSelectedGameId && games.some((game) => game.gameId === userSelectedGameId)) {
      return userSelectedGameId
    }
    return games[0].gameId
  }, [games, userSelectedGameId])

  const marketsQuery = useMarketManagerConditions({
    gameIds: selectedGameId ? [selectedGameId] : [],
    enabled: Boolean(selectedGameId),
    ...ACTIVE_MARKETS_QUERY_POLICY,
  })
  const { data: markets = [], isLoading: isMarketsLoading } = marketsQuery

  const gameItems = useMemo(() => mapGamesToItems(games), [games])
  const marketSections = useMemo(() => mapMarketsToSections(markets), [markets])

  const gamesErrorMessage = useMemo(() => {
    if (games.length > 0) return undefined
    if (gamesQuery.isError) return getErrorMessage(gamesQuery.error, '게임 목록을 불러오지 못했습니다.')
    return undefined
  }, [games.length, gamesQuery.error, gamesQuery.isError])

  return {
    selectedGameId,
    setSelectedGameId: setUserSelectedGameId,
    isGamesLoading,
    isMarketsLoading,
    gamesErrorMessage,
    marketsErrorMessage:
      marketsQuery.isError ? getErrorMessage(marketsQuery.error, '마켓 정보를 불러오지 못했습니다.') : undefined,
    retryGames: () => void gamesQuery.refetch(),
    retryMarkets: () => void marketsQuery.refetch(),
    games: gameItems,
    marketSections,
  }
}
