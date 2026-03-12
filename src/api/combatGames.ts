import { fetchMarketManagerGamesByFilters } from './marketManager'
import type { MarketManagerGame } from '../types/marketManager'

export const COMBAT_GAMES_LIMIT = 30

type FetchPreferredCombatGamesParams = {
  apiBaseUrl: string
  environment: string
  limit?: number
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
  limit = COMBAT_GAMES_LIMIT,
}: FetchPreferredCombatGamesParams) {
  const ufcGames = await fetchMarketManagerGamesByFilters({
    apiBaseUrl,
    environment,
    extraParams: { leagueSlug: 'ufc' },
    fallbackMessage: 'UFC 경기 목록 요청 실패',
    perPage: limit,
  })

  if (ufcGames.length >= limit) {
    return ufcGames
  }

  const mmaGames = await fetchMarketManagerGamesByFilters({
    apiBaseUrl,
    environment,
    extraParams: { sportSlug: 'mma' },
    fallbackMessage: 'MMA 경기 목록 요청 실패',
    perPage: limit,
  })

  return mergeUniqueGames(ufcGames, mmaGames)
}
