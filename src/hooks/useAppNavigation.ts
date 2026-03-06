import { useEffect, useState } from 'react'
import type { GameItem } from '../types/ui'

export type MobileView = 'explore' | 'bets' | 'chat'
export type DesktopSidePanelTab = 'myBets' | 'betslip'
export type PageMode = 'games' | 'markets'

const GAME_ROUTE_QUERY_KEY = 'game'

function readRoutedGameId() {
  if (typeof window === 'undefined') return undefined

  const value = new URLSearchParams(window.location.search).get(GAME_ROUTE_QUERY_KEY)
  return value || undefined
}

function writeRoutedGameId(gameId?: string, replace = false) {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  if (gameId) {
    url.searchParams.set(GAME_ROUTE_QUERY_KEY, gameId)
  } else {
    url.searchParams.delete(GAME_ROUTE_QUERY_KEY)
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  if (replace) {
    window.history.replaceState({}, '', nextUrl)
    return
  }
  window.history.pushState({}, '', nextUrl)
}

type UseAppNavigationParams = {
  filteredGames: GameItem[]
  selectedGameId?: string
  setSelectedGameId: (gameId: string) => void
  isGamesLoading: boolean
  onResetFilters: () => void
  onCloseMobileBetslip: () => void
}

export function useAppNavigation({
  filteredGames,
  selectedGameId,
  setSelectedGameId,
  isGamesLoading,
  onResetFilters,
  onCloseMobileBetslip,
}: UseAppNavigationParams) {
  const [mobileView, setMobileView] = useState<MobileView>('explore')
  const [desktopSidePanelTab, setDesktopSidePanelTab] = useState<DesktopSidePanelTab>('betslip')
  const [routedGameId, setRoutedGameId] = useState<string | undefined>(() => readRoutedGameId())

  useEffect(() => {
    const handlePopState = () => setRoutedGameId(readRoutedGameId())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (filteredGames.length === 0) return
    if (routedGameId && filteredGames.some((game) => game.gameId === routedGameId)) {
      if (selectedGameId !== routedGameId) {
        setSelectedGameId(routedGameId)
      }
      return
    }

    if (!selectedGameId || !filteredGames.some((game) => game.gameId === selectedGameId)) {
      setSelectedGameId(filteredGames[0].gameId)
    }
  }, [filteredGames, routedGameId, selectedGameId, setSelectedGameId])

  useEffect(() => {
    if (!routedGameId || isGamesLoading) return

    const isVisible = filteredGames.some((game) => game.gameId === routedGameId)
    if (!isVisible) {
      writeRoutedGameId(undefined, true)
      queueMicrotask(() => setRoutedGameId(undefined))
    }
  }, [filteredGames, isGamesLoading, routedGameId])

  const visibleSelectedGameId = filteredGames.some((game) => game.gameId === selectedGameId)
    ? selectedGameId
    : undefined
  const pageMode: PageMode = routedGameId ? 'markets' : 'games'
  const pageSelectedGameId = pageMode === 'markets' ? routedGameId : visibleSelectedGameId

  const handleOpenGameMarkets = (gameId: string) => {
    setSelectedGameId(gameId)
    writeRoutedGameId(gameId)
    setRoutedGameId(gameId)
  }

  const handleBackToGames = () => {
    writeRoutedGameId(undefined)
    setRoutedGameId(undefined)
  }

  const handleNavigateToExplore = () => {
    onCloseMobileBetslip()
    setMobileView('explore')
    onResetFilters()
    handleBackToGames()
  }

  return {
    mobileView,
    setMobileView,
    desktopSidePanelTab,
    setDesktopSidePanelTab,
    pageMode,
    pageSelectedGameId,
    handleOpenGameMarkets,
    handleBackToGames,
    handleNavigateToExplore,
  }
}
