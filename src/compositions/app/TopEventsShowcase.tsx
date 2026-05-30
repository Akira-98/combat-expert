import { useMemo } from 'react'
import type { GameItem, OutcomeItem, SelectionKey } from '../../types/ui'
import { GameSection } from '../MarketList/GameSection'

const DEFAULT_VISIBLE_TOP_EVENTS = 5

type TopEventsShowcaseProps = {
  games: GameItem[]
  selectedOutcomes: Set<SelectionKey>
  onOpenGameMarkets: (gameId: string) => void
  onSelectOutcome: (outcome: OutcomeItem) => void
}

export function TopEventsShowcase({
  games,
  selectedOutcomes,
  onOpenGameMarkets,
  onSelectOutcome,
}: TopEventsShowcaseProps) {
  const topGames = useMemo(() => games.slice(0, 10), [games])

  if (topGames.length === 0) return null

  return (
    <GameSection
      defaultVisibleCount={DEFAULT_VISIBLE_TOP_EVENTS}
      games={topGames}
      icon="🏆"
      selectedOutcomes={selectedOutcomes}
      title="Top Events"
      onSelectGame={onOpenGameMarkets}
      onSelectOutcome={onSelectOutcome}
    />
  )
}
