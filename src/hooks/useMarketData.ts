import { useEffect, useMemo, useRef, useState } from 'react'
import { useActiveMarkets, useGames } from '@azuro-org/sdk'
import { mapGamesToItems, mapMarketsToSections } from '../helpers/mappers'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

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

const GAMES_LIMIT = 15

export function useMarketData() {
  const [userSelectedGameId, setUserSelectedGameId] = useState<string>()
  const lastLoggedMarketSnapshotRef = useRef<string>('')

  const ufcGamesQuery = useGames({
    filter: { limit: GAMES_LIMIT, sportSlug: 'mma', leagueSlug: 'ufc' },
    query: GAMES_QUERY_POLICY,
  })
  const { data: ufcGames = [] } = ufcGamesQuery

  const needsMmaFallback = ufcGames.length < GAMES_LIMIT
  const mmaGamesQuery = useGames({
    filter: { limit: GAMES_LIMIT, sportSlug: 'mma' },
    query: {
      ...GAMES_QUERY_POLICY,
      enabled: needsMmaFallback,
    },
  })
  const { data: mmaGames = [] } = mmaGamesQuery

  const games = useMemo(() => {
    const seen = new Set<string>()
    const merged = [...ufcGames, ...mmaGames].filter((game) => {
      if (seen.has(game.gameId)) return false
      seen.add(game.gameId)
      return true
    })

    return merged.slice(0, GAMES_LIMIT)
  }, [ufcGames, mmaGames])

  const isGamesLoading = ufcGamesQuery.isLoading || mmaGamesQuery.isLoading

  const selectedGameId = useMemo(() => {
    if (games.length === 0) return undefined
    if (userSelectedGameId && games.some((game) => game.gameId === userSelectedGameId)) {
      return userSelectedGameId
    }
    return games[0].gameId
  }, [games, userSelectedGameId])

  const marketsQuery = useActiveMarkets({
    gameId: selectedGameId ?? '',
    query: {
      ...ACTIVE_MARKETS_QUERY_POLICY,
      enabled: Boolean(selectedGameId),
    },
  })
  const { data: markets = [], isLoading: isMarketsLoading } = marketsQuery

  useEffect(() => {
    if (!import.meta.env.DEV || !selectedGameId) return

    const rows = markets.map((market) => ({
      marketKey: market.marketKey,
      name: market.name,
      conditions: market.conditions.length,
      outcomes: market.conditions.reduce((sum, condition) => sum + condition.outcomes.length, 0),
    }))

    const snapshot = JSON.stringify(rows)
    if (snapshot === lastLoggedMarketSnapshotRef.current) return
    lastLoggedMarketSnapshotRef.current = snapshot

    console.groupCollapsed(`[Combat Expert] markets for game ${selectedGameId} (${rows.length})`)
    console.table(rows)
    console.groupEnd()
  }, [markets, selectedGameId])

  const gameItems = useMemo(() => mapGamesToItems(games), [games])
  const marketSections = useMemo(() => mapMarketsToSections(markets), [markets])

  const gamesErrorMessage = useMemo(() => {
    if (games.length > 0) return undefined
    if (ufcGamesQuery.isError) return getErrorMessage(ufcGamesQuery.error, '게임 목록을 불러오지 못했습니다.')
    if (mmaGamesQuery.isError) return getErrorMessage(mmaGamesQuery.error, '게임 목록을 불러오지 못했습니다.')
    return undefined
  }, [games.length, mmaGamesQuery.error, mmaGamesQuery.isError, ufcGamesQuery.error, ufcGamesQuery.isError])

  return {
    selectedGameId,
    setSelectedGameId: setUserSelectedGameId,
    isGamesLoading,
    isMarketsLoading,
    gamesErrorMessage,
    marketsErrorMessage:
      marketsQuery.isError ? getErrorMessage(marketsQuery.error, '마켓 정보를 불러오지 못했습니다.') : undefined,
    retryGames: () => void Promise.all([ufcGamesQuery.refetch(), mmaGamesQuery.refetch()]),
    retryMarkets: () => void marketsQuery.refetch(),
    games: gameItems,
    marketSections,
  }
}
