import { useMemo } from 'react'
import { getSportIcon } from '../../helpers/sports'
import { useI18n } from '../../i18n'
import { EmptyState, ErrorState, GamesSkeletonList } from './PaneStates'
import { GameSection } from './GameSection'
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
  const sportGroups = useMemo(() => groupGamesBySport(games), [games])

  return (
    <div className="grid content-start gap-3 pr-0 md:gap-4">
      {isGamesLoading && (
        <section className="panel ui-section-sheen section-shell rounded-lg p-2 md:rounded-2xl md:border md:px-4 md:py-4">
          <GamesSkeletonList />
        </section>
      )}
      {!isGamesLoading && gamesErrorMessage && (
        <section className="panel ui-section-sheen section-shell rounded-lg p-2 md:rounded-2xl md:border md:px-4 md:py-4">
          <ErrorState title={t('games.listError')} message={gamesErrorMessage} onRetry={onRetryGames} />
        </section>
      )}
      {!isGamesLoading && !gamesErrorMessage && games.length === 0 && (
        <section className="panel ui-section-sheen section-shell rounded-lg p-2 md:rounded-2xl md:border md:px-4 md:py-4">
          <EmptyState title={t('games.emptyTitle')} description={t('games.emptyDesc')} />
        </section>
      )}
      {sportGroups.map((group) => (
        <GameSection
          defaultVisibleCount={DEFAULT_VISIBLE_GAMES_PER_SPORT}
          games={group.games}
          icon={getSportIcon(group.sportName)}
          key={group.sportName}
          selectedGameId={selectedGameId}
          selectedOutcomes={selectedOutcomes}
          title={group.sportName}
          onSelectGame={onSelectGame}
          onSelectOutcome={onSelectOutcome}
        />
      ))}
    </div>
  )
}
