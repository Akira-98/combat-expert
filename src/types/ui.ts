export type OutcomeItem = {
  conditionId: string
  outcomeId: string
  gameId: string
  conditionState: string
  isExpressForbidden: boolean
  selectionName: string
  odds: number
}

export type GameItem = {
  gameId: string
  title: string
  startsAt: string
  state?: string
  leagueName: string
  participants: string[]
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
