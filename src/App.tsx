import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BetslipPanel } from './compositions/BetslipPanel'
import { MarketList } from './compositions/MarketList'
import { BetsAndTransferPanel } from './compositions/BetsAndTransferPanel'
import { AppBottomNav } from './compositions/AppBottomNav'
import { AppHeaderContainer } from './compositions/AppHeaderContainer'
import { AppGameFiltersContainer } from './compositions/AppGameFiltersContainer'
import { GuidePage } from './compositions/GuidePage'
import { MobileBetslipSheet } from './compositions/MobileBetslipSheet'
import { LiveChatPanel } from './compositions/LiveChatPanel'
import { buildBetslipPanelProps } from './helpers/buildBetslipPanelProps'
import { useAppNavigation } from './hooks/useAppNavigation'
import { useAppLayout } from './hooks/useAppLayout'
import { useGameFilters } from './hooks/useGameFilters'
import { useWalletConnection } from './hooks/useWalletConnection'
import { useMarketData } from './hooks/useMarketData'
import { useBetting } from './hooks/useBetting'
import { useProfile } from './hooks/useProfile'
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
    gamesErrorMessage,
    marketsErrorMessage,
    retryGames,
    retryMarkets,
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
    marketPageMode,
    activeGameId,
    handleOpenGameMarkets,
    handleBackToGames,
    handleNavigateToExplore,
    handleNavigateToMobileView,
    handleNavigateToGuide,
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

  const betslipPanelProps = buildBetslipPanelProps({ wallet, betting })
  const shouldShowFilters = !isGuideRoute
  const shouldShowDesktopChat = !isGuideRoute
  const shouldShowDesktopSidebar = !isGuideRoute
  const shouldShowGuideContent = isGuideRoute
  const shouldShowExploreContent = !isGuideRoute && mobileView === 'explore'
  const shouldShowMobileBetsPanel = !isGuideRoute && mobileView === 'bets'
  const shouldShowMobileChatPanel = !isGuideRoute && mobileView === 'chat'
  const handleOpenMobileMenu = () => {
    setIsMobileBetslipOpen(false)
    setIsMobileMenuOpen(true)
  }
  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false)
  const handleOpenGuideFromMenu = () => {
    setIsMobileMenuOpen(false)
    handleNavigateToGuide()
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
          onTitleClick={handleNavigateToExplore}
          onGuideClick={handleNavigateToGuide}
        />
      </div>

      {shouldShowFilters && <AppGameFiltersContainer filters={filters} games={games} mobileStickyTop={mobileHeaderHeight} />}

      <main className={`mt-0 grid items-start gap-2 md:mt-4 md:gap-4 ${isGuideRoute ? '' : 'xl:grid-cols-[240px_minmax(0,1fr)_316px]'}`}>
        {shouldShowDesktopChat && (
          <aside className="hidden xl:sticky xl:top-4 xl:block">
            <LiveChatPanel address={wallet.address} profile={profile} />
          </aside>
        )}

        <section className="min-w-0">
          {shouldShowGuideContent ? (
            <GuidePage onBack={handleNavigateToExplore} />
          ) : (
            <div className={`${shouldShowExploreContent ? 'grid gap-3 md:gap-4' : 'hidden xl:grid xl:gap-4'}`}>
              <MarketList
                pageMode={marketPageMode}
                isGamesLoading={isGamesLoading}
                isMarketsLoading={activeGameId ? isMarketsLoading : false}
                gamesErrorMessage={gamesErrorMessage}
                marketsErrorMessage={activeGameId ? marketsErrorMessage : undefined}
                selectedGameId={activeGameId}
                address={wallet.address}
                isConnected={wallet.isConnected}
                isAAWallet={wallet.isAAWallet}
                games={filters.filteredGames}
                marketSections={activeGameId ? marketSections : []}
                selectedOutcomes={betting.selectedOutcomes}
                selectedOutcomePriceChanges={betting.selectedOutcomePriceChanges}
                onSelectGame={handleOpenGameMarkets}
                onBackToGames={handleBackToGames}
                onConnectWallet={wallet.openAuthModal}
                onSelectOutcome={betting.selectOutcome}
                onRetryGames={retryGames}
                onRetryMarkets={retryMarkets}
              />
            </div>
          )}

          <div className={`${shouldShowMobileBetsPanel ? 'xl:hidden' : 'hidden'}`}>
            <BetsAndTransferPanel wallet={wallet} betting={betting} usdtTransfer={usdtTransfer} />
          </div>

          <div className={`${shouldShowMobileChatPanel ? 'xl:hidden' : 'hidden'}`}>
            <LiveChatPanel address={wallet.address} profile={profile} className="h-[calc(100dvh-13rem)]" />
          </div>
        </section>

        {shouldShowDesktopSidebar && (
          <aside className="hidden xl:sticky xl:top-4 xl:block xl:max-h-[calc(100dvh-2rem)] xl:overflow-y-auto">
            <div className="grid gap-3">
              <div className="ui-surface rounded-xl border p-2">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      desktopSidePanelTab === 'myBets'
                        ? 'ui-btn-primary'
                        : 'ui-btn-ghost ui-text-body'
                    }`}
                    onClick={() => setDesktopSidePanelTab('myBets')}
                    type="button"
                  >
                    내 베팅
                  </button>
                  <button
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      desktopSidePanelTab === 'betslip'
                        ? 'ui-btn-primary'
                        : 'ui-btn-ghost ui-text-body'
                    }`}
                    onClick={() => setDesktopSidePanelTab('betslip')}
                    type="button"
                  >
                    베팅슬립 {betting.selectionItems.length > 0 ? `(${betting.selectionItems.length})` : ''}
                  </button>
                </div>
              </div>

              {desktopSidePanelTab === 'myBets' ? (
                <BetsAndTransferPanel wallet={wallet} betting={betting} usdtTransfer={usdtTransfer} />
              ) : (
                <BetslipPanel {...betslipPanelProps} />
              )}
            </div>
          </aside>
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

      {isMobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div aria-modal="true" className="fixed inset-0 z-[72] xl:hidden" role="dialog">
            <button
              aria-label="메뉴 닫기"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={handleCloseMobileMenu}
              type="button"
            />
            <aside className="ui-surface-soft absolute inset-y-0 right-0 flex w-[min(82vw,320px)] flex-col border-l p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="ui-text-strong m-0 text-base font-semibold">메뉴</p>
                </div>
                <button className="ui-btn-secondary inline-flex h-8 w-8 items-center justify-center rounded-md border" onClick={handleCloseMobileMenu} type="button">
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
              </div>
              <div className="mt-5 grid gap-2">
                <button className="ui-btn-secondary rounded-xl border px-3 py-3 text-left text-sm font-semibold" onClick={handleOpenGuideFromMenu} type="button">
                  가이드
                </button>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default App
