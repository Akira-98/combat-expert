import { useState } from 'react'
import type { GameStatusFilter } from '../helpers/gameTiming'

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
  const [isLeagueExpanded, setIsLeagueExpanded] = useState(false)
  const mobileLeagueOptions = isLeagueExpanded ? leagueOptions : leagueOptions.slice(0, 8)

  return (
    <>
      <section className="relative z-20 px-2.5 pb-1.5 pt-1 md:static md:mt-4 md:rounded-xl md:border md:bg-white md:p-3 md:backdrop-blur-none">
        <div className="-mx-2.5 sticky top-[calc(env(safe-area-inset-top)+72px)] z-20 border-b border-slate-200/70 ui-bg-solid-soft px-2.5 pb-1.5 pt-0.5 md:hidden">
          <label className="grid gap-1 text-[11px] font-medium text-slate-600">
            <span className="sr-only">게임 검색</span>
            <input
              className="h-8 appearance-none rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500"
              placeholder="팀명, 리그명으로 검색"
              type="search"
              value={gameSearchQuery}
              onChange={(event) => onGameSearchQueryChange(event.target.value)}
            />
          </label>

          <div className="mt-1 grid gap-1.5">
            <div className="grid grid-cols-3 gap-1">
              <button
                className={`h-8 rounded-md border px-2 text-xs font-semibold transition ${
                  gameStatusFilter === 'all' ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'
                }`}
                onClick={() => onGameStatusFilterChange('all')}
                type="button"
              >
                종료 제외
              </button>
              <button
                className={`h-8 rounded-md border px-2 text-xs font-semibold transition ${
                  gameStatusFilter === 'live' ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'
                }`}
                onClick={() => onGameStatusFilterChange('live')}
                type="button"
              >
                라이브
              </button>
              <button
                className={`h-8 rounded-md border px-2 text-xs font-semibold transition ${
                  gameStatusFilter === 'upcoming' ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'
                }`}
                onClick={() => onGameStatusFilterChange('upcoming')}
                type="button"
              >
                시작 전
              </button>
            </div>

            <div className="scrollbar-thin flex items-center gap-1 overflow-x-auto pb-0.5">
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

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-600 md:mt-2">
          <span className="text-[11px] text-slate-500 md:rounded-full md:bg-slate-100 md:px-2.5 md:py-1 md:text-xs">
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
    </>
  )
}
