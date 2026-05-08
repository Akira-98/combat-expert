export type OutcomeItem = {
  conditionId: string
  outcomeId: string
  gameId: string
  conditionState: string
  isExpressForbidden: boolean
  selectionName: string
  odds: number
}

export type GameParticipantItem = {
  name: string
  image?: string | null
}

export type GameItem = {
  gameId: string
  title: string
  startsAt: string
  state?: string
  turnover?: string
  sportName: string
  sportSlug: string
  sportHub: 'sports' | 'esports'
  leagueName: string
  leagueSlug?: string
  countryName?: string
  countrySlug?: string
  participants: GameParticipantItem[]
}

export type MarketSection = {
  id: string
  title: string
  outcomes: OutcomeItem[]
}

export type SelectionItem = {
  conditionId: string
  outcomeId: string
  gameTitle: string
  label: string
  odds: number
}

export type SelectionKey = `${string}-${string}`

export type SportFilterItem = {
  name: string
  count: number
  hub: 'sports' | 'esports'
}
