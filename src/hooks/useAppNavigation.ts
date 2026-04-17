import { useEffect, useState } from 'react'
import type { GameItem } from '../types/ui'

export type MobileView = 'explore' | 'bets' | 'chat'
export type DesktopSidePanelTab = 'myBets' | 'betslip'
export type MarketPageMode = 'games' | 'markets'
export type RoutedPage = 'guide' | 'ranking' | 'news' | 'player-rankings' | 'forum'

const GAME_ROUTE_QUERY_KEY = 'game'
const PAGE_ROUTE_QUERY_KEY = 'page'

function readRoutedGameId() {
  if (typeof window === 'undefined') return undefined

  const value = new URLSearchParams(window.location.search).get(GAME_ROUTE_QUERY_KEY)
  return value || undefined
}

function readRoutedPage() {
  if (typeof window === 'undefined') return undefined

  const value = new URLSearchParams(window.location.search).get(PAGE_ROUTE_QUERY_KEY)
  return value === 'guide' || value === 'ranking' || value === 'news' || value === 'player-rankings' || value === 'forum' ? value : undefined
}

function writeRouteState({ gameId, page }: { gameId?: string; page?: string }, replace = false) {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  if (gameId) {
    url.searchParams.set(GAME_ROUTE_QUERY_KEY, gameId)
  } else {
    url.searchParams.delete(GAME_ROUTE_QUERY_KEY)
  }
  if (page) {
    url.searchParams.set(PAGE_ROUTE_QUERY_KEY, page)
  } else {
    url.searchParams.delete(PAGE_ROUTE_QUERY_KEY)
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
  const [routedPage, setRoutedPage] = useState<RoutedPage | undefined>(() => readRoutedPage())

  useEffect(() => {
    const handlePopState = () => {
      setRoutedGameId(readRoutedGameId())
      setRoutedPage(readRoutedPage())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (routedPage) return
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
  }, [filteredGames, routedGameId, routedPage, selectedGameId, setSelectedGameId])

  useEffect(() => {
    if (routedPage) return
    if (!routedGameId || isGamesLoading) return

    const isVisible = filteredGames.some((game) => game.gameId === routedGameId)
    if (!isVisible) {
      writeRouteState({}, true)
      queueMicrotask(() => setRoutedGameId(undefined))
    }
  }, [filteredGames, isGamesLoading, routedGameId, routedPage])

  const visibleSelectedGameId = filteredGames.some((game) => game.gameId === selectedGameId)
    ? selectedGameId
    : undefined
  const isGuideRoute = routedPage === 'guide'
  const isRankingRoute = routedPage === 'ranking'
  const previewPage = routedPage === 'news' || routedPage === 'player-rankings' || routedPage === 'forum' ? routedPage : undefined
  const marketPageMode: MarketPageMode = routedGameId ? 'markets' : 'games'
  const activeGameId = marketPageMode === 'markets' ? routedGameId : visibleSelectedGameId

  const clearRouteState = () => {
    writeRouteState({})
    setRoutedGameId(undefined)
    setRoutedPage(undefined)
  }

  const handleOpenGameMarkets = (gameId: string) => {
    setSelectedGameId(gameId)
    writeRouteState({ gameId })
    setRoutedGameId(gameId)
    setRoutedPage(undefined)
  }

  const handleBackToGames = () => {
    clearRouteState()
  }

  const handleNavigateToExplore = () => {
    onCloseMobileBetslip()
    setMobileView('explore')
    onResetFilters()
    clearRouteState()
  }

  const handleNavigateToMobileView = (view: MobileView) => {
    onCloseMobileBetslip()
    setMobileView(view)
    clearRouteState()
  }

  const handleNavigateToGuide = () => {
    onCloseMobileBetslip()
    setMobileView('explore')
    writeRouteState({ page: 'guide' })
    setRoutedGameId(undefined)
    setRoutedPage('guide')
  }

  const handleNavigateToRanking = () => {
    onCloseMobileBetslip()
    setMobileView('explore')
    writeRouteState({ page: 'ranking' })
    setRoutedGameId(undefined)
    setRoutedPage('ranking')
  }

  const handleNavigateToPreviewPage = (page: Exclude<RoutedPage, 'guide' | 'ranking'>) => {
    onCloseMobileBetslip()
    setMobileView('explore')
    writeRouteState({ page })
    setRoutedGameId(undefined)
    setRoutedPage(page)
  }

  return {
    mobileView,
    setMobileView,
    desktopSidePanelTab,
    setDesktopSidePanelTab,
    isGuideRoute,
    isRankingRoute,
    previewPage,
    marketPageMode,
    activeGameId,
    handleOpenGameMarkets,
    handleBackToGames,
    handleNavigateToExplore,
    handleNavigateToMobileView,
    handleNavigateToGuide,
    handleNavigateToRanking,
    handleNavigateToPreviewPage,
  }
}
