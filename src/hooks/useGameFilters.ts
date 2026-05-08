import { useDeferredValue, useMemo, useState } from 'react'
import { matchesGameStatusFilter, type GameStatusFilter } from '../helpers/gameTiming'
import { getGameParticipantNames } from '../helpers/participants'
import type { GameItem } from '../types/ui'

function matchesGameSearch(game: GameItem, query: string) {
  if (!query.trim()) return true

  const normalized = query.trim().toLowerCase()
  return [game.title, game.leagueName, ...getGameParticipantNames(game)].some((value) => (
    value.toLowerCase().includes(normalized)
  ))
}

export function useGameFilters(games: GameItem[]) {
  const [gameSearchQuery, setGameSearchQuery] = useState('')
  const [gameStatusFilter, setGameStatusFilter] = useState<GameStatusFilter>('all')
  const [sportFilter, setSportFilter] = useState<string>('all')
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const deferredGameSearchQuery = useDeferredValue(gameSearchQuery)

  const sportOptions = useMemo(
    () => Array.from(new Set(games.map((game) => game.sportName))).sort((a, b) => a.localeCompare(b, 'en')),
    [games],
  )

  const leagueOptions = useMemo(
    () =>
      Array.from(
        new Set(
          games
            .filter((game) => sportFilter === 'all' || game.sportName === sportFilter)
            .map((game) => game.leagueName),
        ),
      ).sort((a, b) => a.localeCompare(b, 'en')),
    [games, sportFilter],
  )

  const effectiveSportFilter = sportFilter !== 'all' && !sportOptions.includes(sportFilter) ? 'all' : sportFilter
  const effectiveLeagueFilter = leagueFilter !== 'all' && !leagueOptions.includes(leagueFilter) ? 'all' : leagueFilter

  const filteredGames = useMemo(
    () =>
      games.filter((game) => {
        if (effectiveSportFilter !== 'all' && game.sportName !== effectiveSportFilter) return false
        if (effectiveLeagueFilter !== 'all' && game.leagueName !== effectiveLeagueFilter) return false
        if (!matchesGameStatusFilter(game.startsAt, gameStatusFilter, game.state)) return false
        return matchesGameSearch(game, deferredGameSearchQuery)
      }),
    [deferredGameSearchQuery, effectiveLeagueFilter, effectiveSportFilter, gameStatusFilter, games],
  )

  const resetFilters = () => {
    setGameSearchQuery('')
    setGameStatusFilter('all')
    setSportFilter('all')
    setLeagueFilter('all')
  }

  const changeSportFilter = (value: string) => {
    setSportFilter(value)
    setLeagueFilter('all')
  }

  return {
    gameSearchQuery,
    gameStatusFilter,
    sportFilter: effectiveSportFilter,
    leagueFilter: effectiveLeagueFilter,
    sportOptions,
    leagueOptions,
    filteredGames,
    setGameSearchQuery,
    setGameStatusFilter,
    setSportFilter: changeSportFilter,
    setLeagueFilter,
    resetFilters,
  }
}
