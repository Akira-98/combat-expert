export type MarketManagerGame = {
  gameId: string
  title: string
  startsAt: string
  state?: string
  turnover?: string
  sport?: {
    sportId?: string
    slug?: string
    name?: string
    sporthub?: {
      slug?: 'sports' | 'esports' | string
    }
  }
  league: {
    name: string
    slug?: string
  }
  country?: {
    name?: string
    slug?: string
  }
  participants: Array<{
    image?: string | null
    name: string
  }>
}

export type MarketManagerGamesResponse = {
  games?: MarketManagerGame[]
  page?: number
  totalPages?: number
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
