import { useDeferredValue, useMemo, useState } from 'react'
import { matchesGameStatusFilter, type GameStatusFilter } from '../helpers/gameTiming'
import type { GameItem } from '../types/ui'

function matchesGameSearch(game: GameItem, query: string) {
  if (!query.trim()) return true

  const normalized = query.trim().toLowerCase()
  return [game.title, game.leagueName, ...game.participants].some((value) => value.toLowerCase().includes(normalized))
}

export function useGameFilters(games: GameItem[]) {
  const [gameSearchQuery, setGameSearchQuery] = useState('')
  const [gameStatusFilter, setGameStatusFilter] = useState<GameStatusFilter>('all')
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const deferredGameSearchQuery = useDeferredValue(gameSearchQuery)

  const leagueOptions = useMemo(
    () => Array.from(new Set(games.map((game) => game.leagueName))).sort((a, b) => a.localeCompare(b, 'ko')),
    [games],
  )

  const effectiveLeagueFilter = leagueFilter !== 'all' && !leagueOptions.includes(leagueFilter) ? 'all' : leagueFilter

  const filteredGames = useMemo(
    () =>
      games.filter((game) => {
        if (effectiveLeagueFilter !== 'all' && game.leagueName !== effectiveLeagueFilter) return false
        if (!matchesGameStatusFilter(game.startsAt, gameStatusFilter, game.state)) return false
        return matchesGameSearch(game, deferredGameSearchQuery)
      }),
    [deferredGameSearchQuery, effectiveLeagueFilter, gameStatusFilter, games],
  )

  const resetFilters = () => {
    setGameSearchQuery('')
    setGameStatusFilter('all')
    setLeagueFilter('all')
  }

  return {
    gameSearchQuery,
    gameStatusFilter,
    leagueFilter: effectiveLeagueFilter,
    leagueOptions,
    filteredGames,
    setGameSearchQuery,
    setGameStatusFilter,
    setLeagueFilter,
    resetFilters,
  }
}
