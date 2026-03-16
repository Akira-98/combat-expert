import type { GameItem, MarketSection, OutcomeItem, SelectionKey } from '../../types/ui'

export type OutcomePriceChange = { previousOdds: number; currentOdds: number }

export type MarketListProps = {
  pageMode: 'games' | 'markets'
  isGamesLoading: boolean
  isMarketsLoading: boolean
  gamesErrorMessage?: string
  marketsErrorMessage?: string
  selectedGameId?: string
  address?: `0x${string}`
  isConnected: boolean
  isAAWallet?: boolean
  games: GameItem[]
  marketSections: MarketSection[]
  selectedOutcomes: Set<SelectionKey>
  selectedOutcomePriceChanges: Map<SelectionKey, OutcomePriceChange>
  onSelectGame: (gameId: string) => void
  onBackToGames?: () => void
  onConnectWallet: () => void
  onSelectOutcome: (outcome: OutcomeItem) => void
  onRetryGames: () => void
  onRetryMarkets: () => void
}

export type GamesPaneProps = {
  isGamesLoading: boolean
  gamesErrorMessage?: string
  selectedGameId?: string
  games: GameItem[]
  selectedOutcomes: Set<SelectionKey>
  onSelectGame: (gameId: string) => void
  onSelectOutcome: (outcome: OutcomeItem) => void
  onRetryGames: () => void
}

export type MarketsPaneProps = {
  isMarketsLoading: boolean
  marketsErrorMessage?: string
  selectedGame?: GameItem
  marketSections: MarketSection[]
  selectedOutcomes: Set<SelectionKey>
  selectedOutcomePriceChanges: Map<SelectionKey, OutcomePriceChange>
  onSelectOutcome: (outcome: OutcomeItem) => void
  onRetryMarkets: () => void
}
