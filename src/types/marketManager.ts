export type MarketManagerGame = {
  gameId: string
  title: string
  startsAt: string
  state?: string
  league: {
    name: string
  }
  participants: Array<{
    name: string
  }>
}

export type MarketManagerGamesResponse = {
  games?: MarketManagerGame[]
}

export type MarketManagerCondition = {
  id: string
  conditionId: string
  state: string
  title?: string | null
  isExpressForbidden: boolean
  isPrematchEnabled: boolean
  isLiveEnabled: boolean
  margin: number
  outcomes: Array<{
    title?: string | null
    outcomeId: string
    odds: string
  }>
  game: {
    gameId: string
    sport: {
      sportId: string
    }
  }
  wonOutcomeIds: string[]
}

export type MarketManagerConditionsResponse = {
  conditions: MarketManagerCondition[]
}
