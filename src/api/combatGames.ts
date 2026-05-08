import { fetchMarketManagerGamesByFilters } from './marketManager'
import type { MarketManagerGame } from '../types/marketManager'

export const SPORTSBOOK_GAMES_PAGE_SIZE = 100
const SPORTSBOOK_GAMES_MAX_PAGES = 25
const SPORTSBOOK_GAME_STATES = ['Live', 'Prematch'] as const

type FetchSportsbookGamesParams = {
  apiBaseUrl: string
  environment: string
  pageSize?: number
}

type FetchSportsbookGamesByStateParams = FetchSportsbookGamesParams & {
  gameState: typeof SPORTSBOOK_GAME_STATES[number]
  orderBy?: 'startsAt' | 'turnover'
  orderDirection?: 'asc' | 'desc'
  maxPages?: number
}

const mergeUniqueGames = (...gameGroups: MarketManagerGame[][]) => {
  const seen = new Set<string>()
  return gameGroups.flat().filter((game) => {
    if (seen.has(game.gameId)) return false
    seen.add(game.gameId)
    return true
  })
}

const getTurnoverValue = (game: MarketManagerGame) => {
  const value = Number(game.turnover)
  return Number.isFinite(value) ? value : 0
}

async function fetchSportsbookGamesByState({
  apiBaseUrl,
  environment,
  gameState,
  orderBy = 'startsAt',
  orderDirection = 'asc',
  maxPages = SPORTSBOOK_GAMES_MAX_PAGES,
  pageSize = SPORTSBOOK_GAMES_PAGE_SIZE,
}: FetchSportsbookGamesByStateParams) {
  const requestPage = (page: number) => fetchMarketManagerGamesByFilters({
    apiBaseUrl,
    environment,
    gameState,
    orderBy,
    orderDirection,
    fallbackMessage: `Failed to load ${gameState.toLowerCase()} games`,
    page,
    perPage: pageSize,
  })

  const firstPage = await requestPage(1)
  const firstPageGames = firstPage.games ?? []
  const reportedTotalPages = Number(firstPage.totalPages)
  const totalPages = Number.isFinite(reportedTotalPages) && reportedTotalPages > 0
    ? Math.min(Math.floor(reportedTotalPages), maxPages)
    : firstPageGames.length < pageSize
      ? 1
      : maxPages

  if (totalPages <= 1) {
    return mergeUniqueGames(firstPageGames)
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => requestPage(index + 2)),
  )

  return mergeUniqueGames(firstPageGames, ...remainingPages.map((payload) => payload.games ?? []))
}

export async function fetchSportsbookGames(params: FetchSportsbookGamesParams) {
  const gameGroups = await Promise.all(
    SPORTSBOOK_GAME_STATES.map((gameState) => fetchSportsbookGamesByState({ ...params, gameState })),
  )

  return mergeUniqueGames(...gameGroups)
}

export async function fetchTopSportsbookGames(params: FetchSportsbookGamesParams) {
  const gameGroups = await Promise.all(
    SPORTSBOOK_GAME_STATES.map((gameState) => (
      fetchSportsbookGamesByState({
        ...params,
        gameState,
        orderBy: 'turnover',
        orderDirection: 'desc',
        maxPages: 1,
      })
    )),
  )

  return mergeUniqueGames(...gameGroups)
    .sort((a, b) => getTurnoverValue(b) - getTurnoverValue(a))
    .slice(0, params.pageSize ?? SPORTSBOOK_GAMES_PAGE_SIZE)
}
