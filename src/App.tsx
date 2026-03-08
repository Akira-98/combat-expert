import { useState } from 'react'
import { BetslipPanel } from './compositions/BetslipPanel'
import { MarketList } from './compositions/MarketList'
import { BetsAndTransferPanel } from './compositions/BetsAndTransferPanel'
import { AppBottomNav } from './compositions/AppBottomNav'
import { AppHeaderContainer } from './compositions/AppHeaderContainer'
import { AppGameFiltersContainer } from './compositions/AppGameFiltersContainer'
import { MobileBetslipSheet } from './compositions/MobileBetslipSheet'
import { LiveChatPanel } from './compositions/LiveChatPanel'
import { buildBetslipPanelProps } from './helpers/buildBetslipPanelProps'
import { useAppNavigation } from './hooks/useAppNavigation'
import { useAppLayout } from './hooks/useAppLayout'
import { useGameFilters } from './hooks/useGameFilters'
import { useWalletConnection } from './hooks/useWalletConnection'
import { useMarketData } from './hooks/useMarketData'
import { useBetting } from './hooks/useBetting'
import { useUsdtTransfer } from './hooks/useUsdtTransfer'

function App() {
  const [isMobileBetslipOpen, setIsMobileBetslipOpen] = useState(false)
  const wallet = useWalletConnection()
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
  const betting = useBetting({
    address: wallet.address,
    isConnected: wallet.isConnected,
    marketSections,
  })
  const usdtTransfer = useUsdtTransfer({
    address: wallet.address,
    chainId: wallet.chainId,
    isConnected: wallet.isConnected,
    isAAWallet: wallet.isAAWallet,
  })
  const filters = useGameFilters(games)
  const { mobileHeaderRef, mobileHeaderHeight } = useAppLayout({ isMobileBetslipOpen })
  const {
    mobileView,
    setMobileView,
    desktopSidePanelTab,
    setDesktopSidePanelTab,
    pageMode,
    pageSelectedGameId,
    handleOpenGameMarkets,
    handleBackToGames,
    handleNavigateToExplore,
  } = useAppNavigation({
    filteredGames: filters.filteredGames,
    selectedGameId,
    setSelectedGameId,
    isGamesLoading,
    onResetFilters: filters.resetFilters,
    onCloseMobileBetslip: () => setIsMobileBetslipOpen(false),
  })

  const betslipPanelProps = buildBetslipPanelProps({ wallet, betting })
  return (
    <div className="app-theme mx-auto w-full max-w-[1440px] px-0 pb-36 pt-0 md:px-4 md:pt-4 lg:pb-10">
      <div
        ref={mobileHeaderRef}
        className="sticky top-0 z-30 border-b border-slate-900/70 bg-[#070b12]/95 px-3 pb-0 backdrop-blur md:static md:border-0 md:bg-transparent md:px-0 md:pb-0 md:backdrop-blur-none"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 4px)' }}
      >
        <AppHeaderContainer wallet={wallet} onTitleClick={handleNavigateToExplore} />
      </div>

      <AppGameFiltersContainer filters={filters} games={games} mobileStickyTop={mobileHeaderHeight} />

      <main className="mt-0 grid items-start gap-2 md:mt-4 md:gap-4 xl:grid-cols-[240px_minmax(0,1fr)_316px]">
        <aside className="hidden xl:sticky xl:top-4 xl:block">
          <LiveChatPanel address={wallet.address} />
        </aside>

        <section className="min-w-0">
          <div className={`${mobileView === 'explore' ? 'grid gap-3 md:gap-4' : 'hidden xl:grid xl:gap-4'}`}>
            <MarketList
              pageMode={pageMode}
              isGamesLoading={isGamesLoading}
              isMarketsLoading={pageSelectedGameId ? isMarketsLoading : false}
              gamesErrorMessage={gamesErrorMessage}
              marketsErrorMessage={pageSelectedGameId ? marketsErrorMessage : undefined}
              selectedGameId={pageSelectedGameId}
              games={filters.filteredGames}
              marketSections={pageSelectedGameId ? marketSections : []}
              selectedOutcomes={betting.selectedOutcomes}
              selectedOutcomePriceChanges={betting.selectedOutcomePriceChanges}
              onSelectGame={handleOpenGameMarkets}
              onBackToGames={handleBackToGames}
              onSelectOutcome={betting.selectOutcome}
              onRetryGames={retryGames}
              onRetryMarkets={retryMarkets}
            />
          </div>

          <div className={`${mobileView === 'bets' ? 'xl:hidden' : 'hidden'}`}>
            <BetsAndTransferPanel wallet={wallet} betting={betting} usdtTransfer={usdtTransfer} />
          </div>

          <div className={`${mobileView === 'chat' ? 'xl:hidden' : 'hidden'}`}>
            <LiveChatPanel address={wallet.address} className="h-[calc(100dvh-13rem)]" />
          </div>
        </section>

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
      </main>

      <AppBottomNav
        mobileView={mobileView}
        isMobileBetslipOpen={isMobileBetslipOpen}
        selectionCount={betting.selectionItems.length}
        onOpenExplore={() => setMobileView('explore')}
        onOpenBetslip={() => setIsMobileBetslipOpen(true)}
        onOpenChat={() => setMobileView('chat')}
        onOpenBets={() => setMobileView('bets')}
      />

      <MobileBetslipSheet
        isOpen={isMobileBetslipOpen}
        selectionCount={betting.selectionItems.length}
        onOpen={() => setIsMobileBetslipOpen(true)}
        onClose={() => setIsMobileBetslipOpen(false)}
        panelProps={betslipPanelProps}
        showLauncher={false}
      />
    </div>
  )
}

export default App
