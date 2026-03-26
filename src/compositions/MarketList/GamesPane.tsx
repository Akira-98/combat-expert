import { useEffect, useState, type FormEvent } from 'react'
import { getGameTimingMeta } from '../../helpers/gameTiming'
import { useI18n } from '../../i18n'
import { GameOddsPreview } from './GameOddsPreview'
import { EmptyState, ErrorState, GamesSkeletonList } from './PaneStates'
import type { GamesPaneProps } from './types'

export function GamesPane({
  isGamesLoading,
  gamesErrorMessage,
  selectedGameId,
  games,
  selectedOutcomes,
  gameSearchQuery,
  leagueFilter,
  leagueOptions,
  totalGamesCount,
  onSelectGame,
  onGameSearchQueryChange,
  onLeagueFilterChange,
  onSelectOutcome,
  onRetryGames,
}: GamesPaneProps) {
  const { t } = useI18n()
  const mobileFilterButtonClass = 'btn-pill shrink-0 px-2.5 py-1 text-[11px] font-semibold transition'
  const searchTriggerButtonClass = 'ui-btn-secondary btn-shell inline-flex h-8 w-8 shrink-0 items-center justify-center'
  const modalActionButtonClass = 'shrink-0 px-3 py-2 text-sm font-semibold'
  const gameCardBaseClass = 'group grid gap-1.5 rounded-md border border-transparent px-2 py-2 text-left transition md:px-2.5 md:py-2.5 md:rounded-lg'
  const gameCardIdleClass =
    'border-white/6 bg-transparent shadow-none hover:text-inherit hover:border-white/10 hover:bg-white/[0.01]'
  const searchDialogClass =
    'mx-auto mt-[max(24px,calc(env(safe-area-inset-top)+16px))] w-[calc(100%-20px)] max-w-xl rounded-xl border border-slate-300 ui-surface p-3 shadow-2xl'
  const [isLeagueExpanded, setIsLeagueExpanded] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const mobileLeagueOptions = isLeagueExpanded ? leagueOptions : leagueOptions.slice(0, 8)

  useEffect(() => {
    if (!isSearchModalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSearchModalOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchModalOpen])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSearchModalOpen(false)
  }

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
            {mobileLeagueOptions.map((leagueName) => (
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
                className={`${mobileFilterButtonClass} md:hidden ${isLeagueExpanded ? 'ui-btn-secondary' : 'ui-btn-ghost ui-text-body'}`}
                onClick={() => setIsLeagueExpanded((value) => !value)}
                type="button"
              >
                {isLeagueExpanded ? t('common.collapse') : t('common.more')}
              </button>
            )}
          </div>

          <span className="ui-text-muted shrink-0 text-xs font-medium">
            {games.length}/{totalGamesCount}
          </span>
        </div>

        <button
          aria-label={t('games.openSearch')}
          className={searchTriggerButtonClass}
          onClick={() => setIsSearchModalOpen(true)}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16L21 21" />
          </svg>
        </button>
      </div>
      {isGamesLoading && <GamesSkeletonList />}
      {!isGamesLoading && gamesErrorMessage && (
        <ErrorState title={t('games.listError')} message={gamesErrorMessage} onRetry={onRetryGames} />
      )}
      {!isGamesLoading && !gamesErrorMessage && games.length === 0 && (
        <EmptyState title={t('games.emptyTitle')} description={t('games.emptyDesc')} />
      )}
      <div>
        {games.map((game) => {
        const isActive = game.gameId === selectedGameId
        const timing = getGameTimingMeta(game.startsAt, game.state)
        const badgeClass =
          timing.tone === 'rose'
            ? 'ui-state-danger'
            : timing.tone === 'amber'
              ? 'ui-state-warning'
              : 'ui-pill'

        return (
          <div key={game.gameId} className="py-1 first:pt-0 last:pb-0">
            <div
              aria-pressed={isActive}
              className={`${gameCardBaseClass} ${gameCardIdleClass}`}
              onClick={() => onSelectGame(game.gameId)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                onSelectGame(game.gameId)
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="ui-text-strong block font-semibold">{game.title}</span>
                </div>
              </div>

              <div className="grid gap-1.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
                  <span className="ui-pill chip-shell px-2 py-1 font-medium">
                    {game.leagueName}
                  </span>
                  <span className={`chip-shell px-2 py-1 font-semibold ${badgeClass}`}>{timing.label}</span>
                  <span className="ui-text-muted">{timing.detail}</span>
                </div>
                <GameOddsPreview
                  gameId={game.gameId}
                  participants={game.participants}
                  priority={isActive}
                  selectedOutcomes={selectedOutcomes}
                  onSelectOutcome={onSelectOutcome}
                  className="min-w-0 text-left md:max-w-[18rem] md:justify-end md:text-right"
                />
              </div>
            </div>
          </div>
        )
      })}
      </div>

      {isSearchModalOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
          onClick={() => setIsSearchModalOpen(false)}
          role="dialog"
        >
          <div className={searchDialogClass} onClick={(event) => event.stopPropagation()}>
            <form className="flex items-center gap-2" onSubmit={handleSearchSubmit}>
              <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16L21 21" />
              </svg>
              <input
                autoFocus
                className="ui-input h-10 min-w-0 flex-1 rounded-lg border px-3 text-sm outline-none placeholder:text-slate-400"
                placeholder={t('games.searchPlaceholder')}
                type="search"
                value={gameSearchQuery}
                onChange={(event) => onGameSearchQueryChange(event.target.value)}
              />
              <button className={`ui-btn-primary btn-shell-lg ${modalActionButtonClass}`} type="submit">
                {t('common.search')}
              </button>
              <button
                className={`ui-btn-secondary btn-shell-lg ${modalActionButtonClass}`}
                onClick={() => setIsSearchModalOpen(false)}
                type="button"
              >
                {t('common.close')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
