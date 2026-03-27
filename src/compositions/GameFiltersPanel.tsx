import { useEffect, useState, type FormEvent } from 'react'
import type { GameStatusFilter } from '../helpers/gameTiming'
import { useI18n } from '../i18n'

type GameFiltersPanelProps = {
  gameSearchQuery: string
  gameStatusFilter: GameStatusFilter
  leagueFilter: string
  leagueOptions: string[]
  filteredGamesCount: number
  totalGamesCount: number
  hasActiveFilters: boolean
  onGameSearchQueryChange: (value: string) => void
  onGameStatusFilterChange: (value: GameStatusFilter) => void
  onLeagueFilterChange: (value: string) => void
  onResetFilters: () => void
}

export function GameFiltersPanel({
  gameSearchQuery,
  gameStatusFilter,
  leagueFilter,
  leagueOptions,
  filteredGamesCount,
  totalGamesCount,
  hasActiveFilters,
  onGameSearchQueryChange,
  onGameStatusFilterChange,
  onLeagueFilterChange,
  onResetFilters,
}: GameFiltersPanelProps) {
  const { t } = useI18n()
  const mobileFilterButtonClass = 'btn-pill shrink-0 px-2.5 py-1 text-[11px] font-semibold transition'
  const filterPanelClass = 'ui-bg-solid-soft ui-border section-shell border-b px-2.5 py-1.5 md:hidden'
  const searchTriggerButtonClass = 'ui-btn-secondary btn-shell inline-flex h-8 w-8 shrink-0 items-center justify-center'
  const mobileSearchDialogClass = 'ui-surface card-shell-xl mx-auto mt-[calc(env(safe-area-inset-top)+16px)] w-[calc(100%-20px)] max-w-xl p-3'
  const modalActionButtonClass = 'shrink-0 px-3 py-2 text-sm font-semibold'
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

  const handleMobileSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSearchModalOpen(false)
  }

  void gameStatusFilter
  void hasActiveFilters
  void onGameStatusFilterChange
  void onResetFilters

  return (
    <>
      <section className={filterPanelClass}>
        <div className="flex items-center gap-2">
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

          <div className="scrollbar-thin flex min-w-0 items-center gap-1 overflow-x-auto pb-0.5">
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
                className={`${mobileFilterButtonClass} ui-btn-secondary`}
                onClick={() => setIsLeagueExpanded((value) => !value)}
                type="button"
              >
                {isLeagueExpanded ? t('common.collapse') : t('common.more')}
              </button>
            )}
          </div>

          <span className="ui-text-muted shrink-0 text-[11px]">
            {filteredGamesCount}/{totalGamesCount}
          </span>
        </div>
      </section>

      {isSearchModalOpen && (
        <div
          aria-modal="true"
          className="ui-overlay-scrim fixed inset-0 z-50 backdrop-blur-sm md:hidden"
          onClick={() => setIsSearchModalOpen(false)}
          role="dialog"
        >
          <div className={mobileSearchDialogClass} onClick={(event) => event.stopPropagation()}>
            <form className="flex items-center gap-2" onSubmit={handleMobileSearchSubmit}>
              <svg aria-hidden="true" className="ui-text-muted h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16L21 21" />
              </svg>
              <input
                autoFocus
                className="ui-input h-10 min-w-0 flex-1 rounded-lg border px-3 text-sm outline-none"
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
    </>
  )
}
