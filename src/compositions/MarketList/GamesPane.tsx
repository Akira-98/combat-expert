import { useI18n } from '../../i18n'
import { useGamesPaneState } from '../../hooks/useGamesPaneState'
import { EmptyState, ErrorState, GamesSkeletonList } from './PaneStates'
import { GameCard } from './GameCard'
import type { GamesPaneProps } from './types'

export function GamesPane({
  isGamesLoading,
  gamesErrorMessage,
  selectedGameId,
  games,
  selectedOutcomes,
  leagueFilter,
  leagueOptions,
  totalGamesCount,
  onSelectGame,
  onLeagueFilterChange,
  onSelectOutcome,
  onRetryGames,
}: GamesPaneProps) {
  const { t } = useI18n()
  const mobileFilterButtonClass = 'btn-pill shrink-0 px-2.5 py-1 text-[11px] font-semibold transition'
  const gameCardBaseClass = 'group grid gap-1.5 rounded-md border border-transparent px-2 py-2 text-left transition md:px-2.5 md:py-2.5 md:rounded-lg'
  const gameCardIdleClass = 'bg-transparent shadow-none hover:text-inherit'
  const paneState = useGamesPaneState({ leagueOptions })

  return (
    <div className="grid content-start gap-2 pr-0 md:gap-2.5 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto xl:pr-1">
      <div className="hidden items-center gap-2 md:flex">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="scrollbar-thin flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-0.5">
            <button
              className={`${mobileFilterButtonClass} ${leagueFilter === 'all' ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'}`}
              onClick={() => onLeagueFilterChange('all')}
              type="button"
            >
              {t('games.all')}
            </button>
            {paneState.mobileLeagueOptions.map((leagueName) => (
              <button
                key={leagueName}
                className={`${mobileFilterButtonClass} ${leagueFilter === leagueName ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'}`}
                onClick={() => onLeagueFilterChange(leagueName)}
                type="button"
              >
                {leagueName}
              </button>
            ))}
            {leagueOptions.length > 8 && (
              <button
                className={`${mobileFilterButtonClass} md:hidden ${paneState.isLeagueExpanded ? 'ui-btn-secondary' : 'ui-btn-ghost ui-text-body'}`}
                onClick={paneState.toggleLeagueExpanded}
                type="button"
              >
                {paneState.isLeagueExpanded ? t('common.collapse') : t('common.more')}
              </button>
            )}
          </div>

          <span className="ui-text-muted shrink-0 text-xs font-medium">
            {games.length}/{totalGamesCount}
          </span>
        </div>
      </div>
      {isGamesLoading && <GamesSkeletonList />}
      {!isGamesLoading && gamesErrorMessage && (
        <ErrorState title={t('games.listError')} message={gamesErrorMessage} onRetry={onRetryGames} />
      )}
      {!isGamesLoading && !gamesErrorMessage && games.length === 0 && (
        <EmptyState title={t('games.emptyTitle')} description={t('games.emptyDesc')} />
      )}
      <div>
        {games.map((game) => (
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
    </div>
  )
}
