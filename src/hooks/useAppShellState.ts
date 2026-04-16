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

  return {
    ...navigation,
    isMobileBetslipOpen,
    isMobileMenuOpen,
    isMyBetsViewActive,
    shouldShowFilters: !navigation.isGuideRoute && !navigation.isRankingRoute,
    shouldShowGuideContent: navigation.isGuideRoute,
    shouldShowRankingContent: navigation.isRankingRoute,
    shouldShowExploreContent:
      !navigation.isGuideRoute && !navigation.isRankingRoute && navigation.mobileView === 'explore',
    shouldShowMobileBetsPanel:
      !navigation.isGuideRoute && !navigation.isRankingRoute && navigation.mobileView === 'bets',
    shouldShowMobileChatPanel:
      !navigation.isGuideRoute && !navigation.isRankingRoute && navigation.mobileView === 'chat',
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
  }
}
