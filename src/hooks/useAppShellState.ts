import { useState } from 'react'
import { useAppLayout } from './useAppLayout'
import { useAppNavigation } from './useAppNavigation'
import type { GameItem } from '../types/ui'

type UseAppShellStateParams = {
  filteredGames: GameItem[]
  selectedGameId?: string
  setSelectedGameId: (gameId: string) => void
  isGamesLoading: boolean
  onResetFilters: () => void
}

export function useAppShellState({
  filteredGames,
  selectedGameId,
  setSelectedGameId,
  isGamesLoading,
  onResetFilters,
}: UseAppShellStateParams) {
  const [isMobileBetslipOpen, setIsMobileBetslipOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileBetslip = () => setIsMobileBetslipOpen(false)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  useAppLayout({ isBodyScrollLocked: isMobileBetslipOpen || isMobileMenuOpen })

  const navigation = useAppNavigation({
    filteredGames,
    selectedGameId,
    setSelectedGameId,
    isGamesLoading,
    onResetFilters,
    onCloseMobileBetslip: closeMobileBetslip,
  })

  const isMyBetsViewActive =
    navigation.mobileView === 'bets' || navigation.desktopSidePanelTab === 'myBets'
  const isStaticPageRoute = navigation.isGuideRoute || navigation.isRankingRoute || Boolean(navigation.previewPage)

  return {
    ...navigation,
    isMobileBetslipOpen,
    isMobileMenuOpen,
    isMyBetsViewActive,
    shouldShowFilters: !isStaticPageRoute,
    shouldShowGuideContent: navigation.isGuideRoute,
    shouldShowRankingContent: navigation.isRankingRoute,
    shouldShowPreviewContent: Boolean(navigation.previewPage),
    shouldShowExploreContent:
      !isStaticPageRoute && navigation.mobileView === 'explore',
    shouldShowMobileBetsPanel:
      !isStaticPageRoute && navigation.mobileView === 'bets',
    shouldShowMobileChatPanel:
      !isStaticPageRoute && navigation.mobileView === 'chat',
    openMobileBetslip: () => setIsMobileBetslipOpen(true),
    closeMobileBetslip,
    openMobileMenu: () => {
      closeMobileBetslip()
      setIsMobileMenuOpen(true)
    },
    closeMobileMenu,
    openGuideFromMobileMenu: () => {
      closeMobileMenu()
      navigation.handleNavigateToGuide()
    },
    openLeaderboardFromMobileMenu: () => {
      closeMobileMenu()
      navigation.handleNavigateToRanking()
    },
    openNewsFromMobileMenu: () => {
      closeMobileMenu()
      navigation.handleNavigateToPreviewPage('news')
    },
    openPlayerRankingsFromMobileMenu: () => {
      closeMobileMenu()
      navigation.handleNavigateToPreviewPage('player-rankings')
    },
    openForumFromMobileMenu: () => {
      closeMobileMenu()
      navigation.handleNavigateToPreviewPage('forum')
    },
  }
}
