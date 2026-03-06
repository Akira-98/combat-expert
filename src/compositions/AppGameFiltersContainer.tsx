import { GameFiltersPanel } from './GameFiltersPanel'
import type { useGameFilters } from '../hooks/useGameFilters'
import type { GameItem } from '../types/ui'

type AppGameFiltersContainerProps = {
  filters: ReturnType<typeof useGameFilters>
  games: GameItem[]
  mobileStickyTop: number
}

export function AppGameFiltersContainer({ filters, games, mobileStickyTop }: AppGameFiltersContainerProps) {
  const hasActiveFilters = Boolean(
    filters.gameSearchQuery || filters.gameStatusFilter !== 'all' || filters.leagueFilter !== 'all',
  )

  return (
    <GameFiltersPanel
      gameSearchQuery={filters.gameSearchQuery}
      gameStatusFilter={filters.gameStatusFilter}
      leagueFilter={filters.leagueFilter}
      leagueOptions={filters.leagueOptions}
      filteredGamesCount={filters.filteredGames.length}
      totalGamesCount={games.length}
      hasActiveFilters={hasActiveFilters}
      mobileStickyTop={mobileStickyTop}
      onGameSearchQueryChange={filters.setGameSearchQuery}
      onGameStatusFilterChange={filters.setGameStatusFilter}
      onLeagueFilterChange={filters.setLeagueFilter}
      onResetFilters={filters.resetFilters}
    />
  )
}
