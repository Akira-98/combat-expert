import { useEffect, useState, type FormEvent } from 'react'
import type { GameStatusFilter } from '../helpers/gameTiming'

type GameFiltersPanelProps = {
  gameSearchQuery: string
  gameStatusFilter: GameStatusFilter
  leagueFilter: string
  leagueOptions: string[]
  filteredGamesCount: number
  totalGamesCount: number
  hasActiveFilters: boolean
  mobileStickyTop?: number
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
  mobileStickyTop = 72,
  onGameSearchQueryChange,
  onGameStatusFilterChange,
  onLeagueFilterChange,
  onResetFilters,
}: GameFiltersPanelProps) {
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

  return (
    <>
      <section
        className="sticky z-20 ui-bg-solid-soft px-2.5 py-1.5 md:static md:mt-4 md:rounded-xl md:border md:[background-color:var(--app-surface)] md:[border-color:var(--app-border)] md:p-3 md:backdrop-blur-none"
        style={{ top: `${mobileStickyTop}px` }}
      >
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <button
              aria-label="검색 열기"
              className="ui-btn-secondary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border"
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
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  leagueFilter === 'all' ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'
                }`}
                onClick={() => onLeagueFilterChange('all')}
                type="button"
              >
                전체
              </button>
              {mobileLeagueOptions.map((leagueName) => (
                <button
                  key={leagueName}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                    leagueFilter === leagueName ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'
                  }`}
                  onClick={() => onLeagueFilterChange(leagueName)}
                  type="button"
                >
                  {leagueName}
                </button>
              ))}
              {leagueOptions.length > 8 && (
                <button
                  className="shrink-0 rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-slate-200 hover:text-slate-200"
                  onClick={() => setIsLeagueExpanded((value) => !value)}
                  type="button"
                >
                  {isLeagueExpanded ? '접기' : '더보기'}
                </button>
              )}
            </div>

            <span className="shrink-0 text-[11px] text-slate-500">
              {filteredGamesCount}/{totalGamesCount}
            </span>
          </div>
        </div>

        <div className="hidden gap-3 md:grid lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            게임 검색
            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500"
              placeholder="팀명, 리그명으로 검색"
              type="search"
              value={gameSearchQuery}
              onChange={(event) => onGameSearchQueryChange(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            상태
            <select
              className="h-10 min-w-32 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              value={gameStatusFilter}
              onChange={(event) => onGameStatusFilterChange(event.target.value as GameStatusFilter)}
            >
              <option value="all">종료 제외</option>
              <option value="live">라이브 추정</option>
              <option value="upcoming">시작 전</option>
            </select>
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            리그
            <select
              className="h-10 min-w-40 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              value={leagueFilter}
              onChange={(event) => onLeagueFilterChange(event.target.value)}
            >
              <option value="all">전체 리그</option>
              {leagueOptions.map((leagueName) => (
                <option key={leagueName} value={leagueName}>
                  {leagueName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="hidden md:mt-2 md:flex md:flex-wrap md:items-center md:gap-1.5 md:text-xs md:text-slate-600">
          <span className="ui-text-muted text-[11px] md:text-xs">
            표시 중 게임 {filteredGamesCount} / 전체 {totalGamesCount}
          </span>
          {hasActiveFilters && (
            <button
              className="text-[11px] font-semibold text-slate-300 underline-offset-2 hover:underline md:rounded-full md:border md:border-slate-300 md:bg-white md:px-2.5 md:py-1 md:text-xs md:text-slate-700 md:hover:bg-slate-50 md:hover:no-underline"
              onClick={onResetFilters}
              type="button"
            >
              필터 초기화
            </button>
          )}
        </div>
      </section>

      {isSearchModalOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsSearchModalOpen(false)}
          role="dialog"
        >
          <div
            className="mx-auto mt-[calc(env(safe-area-inset-top)+16px)] w-[calc(100%-20px)] max-w-xl rounded-xl border border-slate-300 ui-surface p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="flex items-center gap-2" onSubmit={handleMobileSearchSubmit}>
              <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16L21 21" />
              </svg>
              <input
                autoFocus
                className="ui-input h-10 min-w-0 flex-1 rounded-lg border px-3 text-sm outline-none placeholder:text-slate-400"
                placeholder="팀명, 리그명으로 검색"
                type="search"
                value={gameSearchQuery}
                onChange={(event) => onGameSearchQueryChange(event.target.value)}
              />
              <button className="ui-btn-primary shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold" type="submit">
                검색
              </button>
              <button
                className="ui-btn-secondary shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold"
                onClick={() => setIsSearchModalOpen(false)}
                type="button"
              >
                닫기
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
