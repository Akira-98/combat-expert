import { fetchMarketManagerGamesByFilters } from './marketManager'
import type { MarketManagerGame } from '../types/marketManager'

export const COMBAT_GAMES_PAGE_SIZE = 50

type FetchPreferredCombatGamesParams = {
  apiBaseUrl: string
  environment: string
  pageSize?: number
}

const mergeUniqueGames = (primaryGames: MarketManagerGame[], secondaryGames: MarketManagerGame[]) => {
  const seen = new Set<string>()
  return [...primaryGames, ...secondaryGames].filter((game) => {
    if (seen.has(game.gameId)) return false
    seen.add(game.gameId)
    return true
  })
}

export async function fetchPreferredCombatGames({
  apiBaseUrl,
  environment,
  pageSize = COMBAT_GAMES_PAGE_SIZE,
}: FetchPreferredCombatGamesParams) {
  const ufcGames = await fetchMarketManagerGamesByFilters({
    apiBaseUrl,
    environment,
    extraParams: { leagueSlug: 'ufc' },
    fallbackMessage: 'UFC 경기 목록 요청 실패',
    perPage: pageSize,
  })

  const mmaGames = await fetchMarketManagerGamesByFilters({
    apiBaseUrl,
    environment,
    extraParams: { sportSlug: 'mma' },
    fallbackMessage: 'MMA 경기 목록 요청 실패',
    perPage: pageSize,
  })

  return mergeUniqueGames(ufcGames, mmaGames)
}
