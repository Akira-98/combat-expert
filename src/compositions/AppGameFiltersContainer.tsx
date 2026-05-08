import { GameFiltersPanel } from './GameFiltersPanel'
import type { useGameFilters } from '../hooks/useGameFilters'
import type { GameItem } from '../types/ui'

type AppGameFiltersContainerProps = {
  filters: ReturnType<typeof useGameFilters>
  games: GameItem[]
}

export function AppGameFiltersContainer({ filters, games }: AppGameFiltersContainerProps) {
  const hasActiveFilters = Boolean(
    filters.gameSearchQuery ||
      filters.gameStatusFilter !== 'all' ||
      filters.sportFilter !== 'all' ||
      filters.leagueFilter !== 'all',
  )

  return (
    <GameFiltersPanel
      gameSearchQuery={filters.gameSearchQuery}
      gameStatusFilter={filters.gameStatusFilter}
      filteredGamesCount={filters.filteredGames.length}
      totalGamesCount={games.length}
      hasActiveFilters={hasActiveFilters}
      onGameSearchQueryChange={filters.setGameSearchQuery}
      onGameStatusFilterChange={filters.setGameStatusFilter}
      onResetFilters={filters.resetFilters}
    />
  )
}
