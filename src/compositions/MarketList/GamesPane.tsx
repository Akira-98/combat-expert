import { useMemo, useState } from 'react'
import { getSportIcon } from '../../helpers/sports'
import { useI18n } from '../../i18n'
import { EmptyState, ErrorState, GamesSkeletonList } from './PaneStates'
import { GameCard } from './GameCard'
import type { GamesPaneProps } from './types'

const DEFAULT_VISIBLE_GAMES_PER_SPORT = 5

function groupGamesBySport(games: GamesPaneProps['games']) {
  const groups: Array<{ sportName: string; games: GamesPaneProps['games'] }> = []
  const groupBySportName = new Map<string, GamesPaneProps['games']>()

  for (const game of games) {
    const sportName = game.sportName || 'Sports'
    const existingGroup = groupBySportName.get(sportName)
    if (existingGroup) {
      existingGroup.push(game)
      continue
    }

    const nextGroup = [game]
    groupBySportName.set(sportName, nextGroup)
    groups.push({ sportName, games: nextGroup })
  }

  return groups
}

export function GamesPane({
  isGamesLoading,
  gamesErrorMessage,
  selectedGameId,
  games,
  selectedOutcomes,
  onSelectGame,
  onSelectOutcome,
  onRetryGames,
}: GamesPaneProps) {
  const { t } = useI18n()
  const gameCardBaseClass = 'group grid gap-1.5 rounded-md border border-transparent px-2 py-2 text-left transition md:px-2.5 md:py-2.5 md:rounded-lg'
  const gameCardIdleClass = 'bg-transparent shadow-none hover:text-inherit'
  const sportGroups = useMemo(() => groupGamesBySport(games), [games])
  const [expandedSports, setExpandedSports] = useState<Set<string>>(() => new Set())

  const toggleSportExpansion = (sportName: string) => {
    setExpandedSports((current) => {
      const next = new Set(current)
      if (next.has(sportName)) {
        next.delete(sportName)
      } else {
        next.add(sportName)
      }
      return next
    })
  }

  return (
    <div className="grid content-start gap-3 pr-0 md:gap-4">
      {isGamesLoading && (
        <section className="panel ui-section-sheen section-shell p-2 md:rounded-2xl md:border md:px-4 md:py-4">
          <GamesSkeletonList />
        </section>
      )}
      {!isGamesLoading && gamesErrorMessage && (
        <section className="panel ui-section-sheen section-shell p-2 md:rounded-2xl md:border md:px-4 md:py-4">
          <ErrorState title={t('games.listError')} message={gamesErrorMessage} onRetry={onRetryGames} />
        </section>
      )}
      {!isGamesLoading && !gamesErrorMessage && games.length === 0 && (
        <section className="panel ui-section-sheen section-shell p-2 md:rounded-2xl md:border md:px-4 md:py-4">
          <EmptyState title={t('games.emptyTitle')} description={t('games.emptyDesc')} />
        </section>
      )}
      {sportGroups.map((group) => (
        <SportGamesSection
          key={group.sportName}
          group={group}
          isExpanded={expandedSports.has(group.sportName)}
          selectedGameId={selectedGameId}
          selectedOutcomes={selectedOutcomes}
          onSelectGame={onSelectGame}
          onSelectOutcome={onSelectOutcome}
          onToggleExpansion={toggleSportExpansion}
          gameCardBaseClass={gameCardBaseClass}
          gameCardIdleClass={gameCardIdleClass}
        />
      ))}
    </div>
  )
}

function SportGamesSection({
  group,
  isExpanded,
  selectedGameId,
  selectedOutcomes,
  onSelectGame,
  onSelectOutcome,
  onToggleExpansion,
  gameCardBaseClass,
  gameCardIdleClass,
}: {
  group: { sportName: string; games: GamesPaneProps['games'] }
  isExpanded: boolean
  selectedGameId?: string
  selectedOutcomes: GamesPaneProps['selectedOutcomes']
  onSelectGame: GamesPaneProps['onSelectGame']
  onSelectOutcome: GamesPaneProps['onSelectOutcome']
  onToggleExpansion: (sportName: string) => void
  gameCardBaseClass: string
  gameCardIdleClass: string
}) {
  const visibleGames = isExpanded ? group.games : group.games.slice(0, DEFAULT_VISIBLE_GAMES_PER_SPORT)
  const hiddenGameCount = Math.max(group.games.length - DEFAULT_VISIBLE_GAMES_PER_SPORT, 0)
  const canToggle = group.games.length > DEFAULT_VISIBLE_GAMES_PER_SPORT

  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex w-7 shrink-0 items-center justify-center text-xl leading-none" aria-hidden="true">
            {getSportIcon(group.sportName)}
          </span>
          <h3 className="ui-text-strong m-0 truncate text-lg font-bold">{group.sportName}</h3>
        </div>
        <span className="ui-text-muted shrink-0 text-xs font-semibold">{group.games.length}</span>
      </div>

      <div className="panel ui-section-sheen section-shell grid gap-1.5 p-2 md:rounded-2xl md:border md:px-4 md:py-4">
        <div>
          {visibleGames.map((game) => (
            <GameCard
              key={game.gameId}
              game={game}
              isActive={game.gameId === selectedGameId}
              selectedOutcomes={selectedOutcomes}
              onSelectGame={onSelectGame}
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
              onClick={() => onToggleExpansion(group.sportName)}
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
