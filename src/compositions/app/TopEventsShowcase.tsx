import { useMemo, useState } from 'react'
import type { GameItem, OutcomeItem, SelectionKey } from '../../types/ui'
import { GameCard } from '../MarketList/GameCard'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const gameCardBaseClass = 'group grid gap-1.5 rounded-md border border-transparent px-2 py-2 text-left transition md:px-2.5 md:py-2.5 md:rounded-lg'
  const gameCardIdleClass = 'bg-transparent shadow-none hover:text-inherit'

  if (topGames.length === 0) return null

  const visibleGames = isExpanded ? topGames : topGames.slice(0, DEFAULT_VISIBLE_TOP_EVENTS)
  const hiddenGameCount = Math.max(topGames.length - DEFAULT_VISIBLE_TOP_EVENTS, 0)
  const canToggle = topGames.length > DEFAULT_VISIBLE_TOP_EVENTS

  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex w-7 shrink-0 items-center justify-center text-xl leading-none" aria-hidden="true">
            🏆
          </span>
          <h3 className="ui-text-strong m-0 truncate text-lg font-bold">Top Events</h3>
        </div>
        <span className="ui-text-muted shrink-0 text-xs font-semibold">{topGames.length}</span>
      </div>

      <div className="panel ui-section-sheen section-shell grid gap-1.5 p-2 md:rounded-2xl md:border md:px-4 md:py-4">
        <div className="divide-y divide-[color:var(--app-border)]">
          {visibleGames.map((game) => (
            <GameCard
              key={game.gameId}
              game={game}
              isActive={false}
              selectedOutcomes={selectedOutcomes}
              onSelectGame={onOpenGameMarkets}
              onSelectOutcome={onSelectOutcome}
              gameCardBaseClass={gameCardBaseClass}
              gameCardIdleClass={gameCardIdleClass}
            />
          ))}
        </div>

        {canToggle ? (
          <div className="border-t border-white/5 px-2 pt-2">
            <button
              className="chip-shell ui-text-muted inline-flex min-h-9 w-full items-center justify-center rounded-md px-3 text-sm font-semibold transition hover:border-white/25 hover:text-white"
              onClick={() => setIsExpanded((current) => !current)}
              type="button"
            >
              {isExpanded ? 'Show less' : `Show ${hiddenGameCount} more`}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
