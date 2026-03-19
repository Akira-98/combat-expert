import { useState } from 'react'
import { BetsAndTransferPanel } from './compositions/BetsAndTransferPanel'
import { AppBottomNav } from './compositions/AppBottomNav'
import { AppHeaderContainer } from './compositions/AppHeaderContainer'
import { AppGameFiltersContainer } from './compositions/AppGameFiltersContainer'
import { GuidePage } from './compositions/GuidePage'
import { RankingPage } from './compositions/RankingPage'
import { MobileBetslipSheet } from './compositions/MobileBetslipSheet'
import { LiveChatPanel } from './compositions/LiveChatPanel'
import { DesktopSidebar } from './compositions/app/DesktopSidebar'
import { ExploreContent } from './compositions/app/ExploreContent'
import { MobileMenuSheet } from './compositions/app/MobileMenuSheet'
import { buildBetslipPanelProps } from './helpers/buildBetslipPanelProps'
import { useAppNavigation } from './hooks/useAppNavigation'
import { useAppLayout } from './hooks/useAppLayout'
import { useGameFilters } from './hooks/useGameFilters'
import { useWalletConnection } from './hooks/useWalletConnection'
import { useMarketData } from './hooks/useMarketData'
import { useBetting } from './hooks/useBetting'
import { useProfile } from './hooks/useProfile'
import { useRankings } from './hooks/useRankings'
import { useUsdtTransfer } from './hooks/useUsdtTransfer'

function App() {
  const [isMobileBetslipOpen, setIsMobileBetslipOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const wallet = useWalletConnection()
  const profile = useProfile({
    address: wallet.address,
    isConnected: wallet.isConnected,
    isAAWallet: wallet.isAAWallet,
  })
  const market = useMarketData()
  const {
    selectedGameId,
    setSelectedGameId,
    isGamesLoading,
    isMarketsLoading,
    games,
    marketSections,
  } = market
  const filters = useGameFilters(games)
  const { mobileHeaderRef, mobileHeaderHeight } = useAppLayout({ isBodyScrollLocked: isMobileBetslipOpen || isMobileMenuOpen })
  const {
    mobileView,
    desktopSidePanelTab,
    setDesktopSidePanelTab,
    isGuideRoute,
    isRankingRoute,
    marketPageMode,
    activeGameId,
    handleOpenGameMarkets,
    handleBackToGames,
    handleNavigateToExplore,
    handleNavigateToMobileView,
    handleNavigateToGuide,
    handleNavigateToRanking,
  } = useAppNavigation({
    filteredGames: filters.filteredGames,
    selectedGameId,
    setSelectedGameId,
    isGamesLoading,
    onResetFilters: filters.resetFilters,
    onCloseMobileBetslip: () => setIsMobileBetslipOpen(false),
  })
  const isMyBetsViewActive = mobileView === 'bets' || desktopSidePanelTab === 'myBets'
  const betting = useBetting({
    address: wallet.address,
    isConnected: wallet.isConnected,
    marketSections,
    isMarketsLoading,
    isBetHistoryPollingEnabled: isMyBetsViewActive,
  })
  const usdtTransfer = useUsdtTransfer({
    address: wallet.address,
    chainId: wallet.chainId,
    isConnected: wallet.isConnected,
    isAAWallet: wallet.isAAWallet,
  })
  const rankings = useRankings(wallet.address)

  const betslipPanelProps = buildBetslipPanelProps({ wallet, betting })
  const shouldShowFilters = !isGuideRoute && !isRankingRoute
  const shouldShowDesktopChat = !isGuideRoute && !isRankingRoute
  const shouldShowDesktopSidebar = !isGuideRoute && !isRankingRoute
  const shouldShowGuideContent = isGuideRoute
  const shouldShowRankingContent = isRankingRoute
  const shouldShowExploreContent = !isGuideRoute && !isRankingRoute && mobileView === 'explore'
  const shouldShowMobileBetsPanel = !isGuideRoute && !isRankingRoute && mobileView === 'bets'
  const shouldShowMobileChatPanel = !isGuideRoute && !isRankingRoute && mobileView === 'chat'
  const handleOpenMobileMenu = () => {
    setIsMobileBetslipOpen(false)
    setIsMobileMenuOpen(true)
  }
  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false)
  const handleOpenGuideFromMenu = () => {
    setIsMobileMenuOpen(false)
    handleNavigateToGuide()
  }
  const handleOpenRankingFromMenu = () => {
    setIsMobileMenuOpen(false)
    handleNavigateToRanking()
  }
  return (
    <div className="app-theme mx-auto w-full max-w-[1440px] px-0 pb-36 pt-0 md:px-4 md:pt-4 lg:pb-10">
      <div
        ref={mobileHeaderRef}
        className="sticky top-0 z-30 border-b border-slate-900/70 bg-[#070b12]/95 px-3 pb-0 backdrop-blur md:static md:border-0 md:bg-transparent md:px-0 md:pb-0 md:backdrop-blur-none"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 4px)' }}
      >
        <AppHeaderContainer
          wallet={wallet}
          profile={profile}
          usdtBalance={usdtTransfer.balance}
          isUsdtBalanceLoading={usdtTransfer.isBalanceLoading}
          isUsdtSupportedChain={usdtTransfer.isSupportedChain}
          rankingViewer={rankings.viewer}
          isRankingLoading={rankings.isLoading}
          onTitleClick={handleNavigateToExplore}
          onRankingClick={handleNavigateToRanking}
          onGuideClick={handleNavigateToGuide}
        />
      </div>

      {shouldShowFilters && <AppGameFiltersContainer filters={filters} games={games} mobileStickyTop={mobileHeaderHeight} />}

      <main className={`mt-0 grid items-start gap-2 md:mt-4 md:gap-4 ${isGuideRoute || isRankingRoute ? '' : 'xl:grid-cols-[240px_minmax(0,1fr)_316px]'}`}>
        {shouldShowDesktopChat && (
          <aside className="hidden xl:sticky xl:top-4 xl:block">
            <LiveChatPanel address={wallet.address} profile={profile} />
          </aside>
        )}

        <section className="min-w-0">
          {shouldShowGuideContent ? (
            <GuidePage onBack={handleNavigateToExplore} />
          ) : shouldShowRankingContent ? (
            <RankingPage
              rankings={rankings.rankings}
              viewer={rankings.viewer}
              updatedAt={rankings.updatedAt}
              isLoading={rankings.isLoading}
              errorMessage={rankings.errorMessage}
              onRetry={() => void rankings.refetch()}
              isConnected={wallet.isConnected}
            />
          ) : (
            <ExploreContent
              shouldShowExploreContent={shouldShowExploreContent}
              marketPageMode={marketPageMode}
              activeGameId={activeGameId}
              wallet={wallet}
              filters={filters}
              market={market}
              betting={betting}
              onOpenGameMarkets={handleOpenGameMarkets}
              onBackToGames={handleBackToGames}
            />
          )}

          <div className={`${shouldShowMobileBetsPanel ? 'xl:hidden' : 'hidden'}`}>
            <BetsAndTransferPanel wallet={wallet} betting={betting} usdtTransfer={usdtTransfer} />
          </div>

          <div className={`${shouldShowMobileChatPanel ? 'xl:hidden' : 'hidden'}`}>
            <LiveChatPanel address={wallet.address} profile={profile} className="h-[calc(100dvh-13rem)]" />
          </div>
        </section>

        {shouldShowDesktopSidebar && (
          <DesktopSidebar
            desktopSidePanelTab={desktopSidePanelTab}
            selectionCount={betting.selectionItems.length}
            wallet={wallet}
            betting={betting}
            usdtTransfer={usdtTransfer}
            betslipPanelProps={betslipPanelProps}
            onChangeTab={setDesktopSidePanelTab}
          />
        )}
      </main>

      <AppBottomNav
        mobileView={mobileView}
        isMobileBetslipOpen={isMobileBetslipOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        selectionCount={betting.selectionItems.length}
        onOpenExplore={handleNavigateToExplore}
        onOpenBetslip={() => setIsMobileBetslipOpen(true)}
        onOpenChat={() => handleNavigateToMobileView('chat')}
        onOpenBets={() => handleNavigateToMobileView('bets')}
        onOpenMenu={handleOpenMobileMenu}
      />

      <MobileBetslipSheet
        isOpen={isMobileBetslipOpen}
        selectionCount={betting.selectionItems.length}
        onOpen={() => setIsMobileBetslipOpen(true)}
        onClose={() => setIsMobileBetslipOpen(false)}
        panelProps={betslipPanelProps}
        showLauncher={false}
      />

      <MobileMenuSheet
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        onOpenRanking={handleOpenRankingFromMenu}
        onOpenGuide={handleOpenGuideFromMenu}
      />
    </div>
  )
}

export default App
