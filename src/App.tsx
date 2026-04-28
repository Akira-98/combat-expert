import { BetsAndTransferPanel } from './compositions/BetsAndTransferPanel'
import { AppBottomNav } from './compositions/AppBottomNav'
import { AppGameFiltersContainer } from './compositions/AppGameFiltersContainer'
import { AppHeaderContainer } from './compositions/AppHeaderContainer'
import { ComingSoonPage } from './compositions/ComingSoonPage'
import { GuidePage } from './compositions/GuidePage'
import { NewsPage } from './compositions/NewsPage'
import { RankingPage } from './compositions/RankingPage'
import { MobileBetslipSheet } from './compositions/MobileBetslipSheet'
import { LiveChatPanel } from './compositions/LiveChatPanel'
import { DesktopChatRail } from './compositions/app/DesktopChatRail'
import { DesktopSidebar } from './compositions/app/DesktopSidebar'
import { ExploreContent } from './compositions/app/ExploreContent'
import { MobileMenuSheet } from './compositions/app/MobileMenuSheet'
import { buildBetslipPanelProps } from './helpers/buildBetslipPanelProps'
import { useAppShellState } from './hooks/useAppShellState'
import { useGameFilters } from './hooks/useGameFilters'
import { useWalletConnection } from './hooks/useWalletConnection'
import { useMarketData } from './hooks/useMarketData'
import { useBetting } from './hooks/useBetting'
import { useProfile } from './hooks/useProfile'
import { usePoints } from './hooks/usePoints'
import { useRankings } from './hooks/useRankings'
import { useUsdtTransfer } from './hooks/useUsdtTransfer'

function App() {
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
    games,
    marketSections,
  } = market
  const filters = useGameFilters(games)
  const shell = useAppShellState({
    filteredGames: filters.filteredGames,
    selectedGameId,
    setSelectedGameId,
    isGamesLoading,
    onResetFilters: filters.resetFilters,
  })
  const points = usePoints(wallet.address)
  const betting = useBetting({
    address: wallet.address,
    isConnected: wallet.isConnected,
    games,
    marketSections,
    isBetHistoryPollingEnabled: shell.isMyBetsViewActive,
    refreshMarkets: market.retryMarkets,
    onBetPointsClaimed: () => void points.refetch(),
  })
  const usdtTransfer = useUsdtTransfer({
    address: wallet.address,
    chainId: wallet.chainId,
    isConnected: wallet.isConnected,
    isAAWallet: wallet.isAAWallet,
  })
  const rankings = useRankings(wallet.address)

  const betslipPanelProps = buildBetslipPanelProps({ wallet, betting })

  return (
    <div className="w-full max-w-[1440px] px-0 pb-36 pt-0 lg:pb-10 xl:max-w-none">
      <div className="sticky top-0 z-30">
        <div
          className="ui-panel-glass ui-border border-b px-3 pb-0 backdrop-blur md:px-4 md:pb-0 xl:px-0"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 4px)' }}
        >
          <AppHeaderContainer
            wallet={wallet}
            profile={profile}
            usdtTransfer={usdtTransfer}
            usdtBalance={usdtTransfer.balance}
            isUsdtBalanceLoading={usdtTransfer.isBalanceLoading}
            isUsdtSupportedChain={usdtTransfer.isSupportedChain}
            rankingViewer={rankings.viewer}
            isRankingLoading={rankings.isLoading}
            totalPoints={points.totalPoints}
            isPointsLoading={points.isLoading}
            onTitleClick={shell.handleNavigateToExplore}
            onNewsClick={() => shell.handleNavigateToPreviewPage('news')}
            onPlayerRankingsClick={() => shell.handleNavigateToPreviewPage('player-rankings')}
            onForumClick={() => shell.handleNavigateToPreviewPage('forum')}
            onRankingClick={shell.handleNavigateToRanking}
            onGuideClick={shell.handleNavigateToGuide}
          />
        </div>

        {shell.shouldShowFilters && (
          <div className="md:hidden">
            <AppGameFiltersContainer filters={filters} games={games} />
          </div>
        )}
      </div>
      <div className="hidden px-3 md:block md:px-4 xl:px-0">
        <div className="ui-divider-subtle h-px" />
      </div>

      <main
        className="mt-0 grid items-start gap-2 px-0 md:grid-cols-[240px_minmax(0,1fr)_316px] md:gap-4 md:px-0"
      >
        <DesktopChatRail address={wallet.address} profile={profile} />

        <section className="min-w-0">
          {shell.shouldShowGuideContent ? (
            <GuidePage />
          ) : shell.shouldShowRankingContent ? (
            <RankingPage
              rankings={rankings.rankings}
              viewer={rankings.viewer}
              isLoading={rankings.isLoading}
              errorMessage={rankings.errorMessage}
              onRetry={() => void rankings.refetch()}
              isConnected={wallet.isConnected}
            />
          ) : shell.previewPage === 'news' ? (
            <NewsPage />
          ) : shell.shouldShowPreviewContent ? (
            <ComingSoonPage />
          ) : (
            <ExploreContent
              shouldShowExploreContent={shell.shouldShowExploreContent}
              marketPageMode={shell.marketPageMode}
              activeGameId={shell.activeGameId}
              wallet={wallet}
              filters={filters}
              market={market}
              betting={betting}
              onOpenGameMarkets={shell.handleOpenGameMarkets}
            />
          )}

          <div className={`${shell.shouldShowMobileBetsPanel ? 'md:hidden' : 'hidden'}`}>
            <BetsAndTransferPanel wallet={wallet} betting={betting} />
          </div>

          <div className={`${shell.shouldShowMobileChatPanel ? 'md:hidden' : 'hidden'}`}>
            <LiveChatPanel address={wallet.address} profile={profile} className="h-[calc(100dvh-13rem)]" />
          </div>
        </section>

        <DesktopSidebar
          desktopSidePanelTab={shell.desktopSidePanelTab}
          selectionCount={betting.selectionItems.length}
          wallet={wallet}
          betting={betting}
          betslipPanelProps={betslipPanelProps}
          onChangeTab={shell.setDesktopSidePanelTab}
        />
      </main>

      <footer className="flex items-center justify-center px-4 py-8 text-sm font-semibold text-[color:var(--app-text-muted)]">
        <a
          aria-label="Powered by Azuro"
          className="inline-flex items-center gap-3 text-inherit no-underline transition hover:text-[color:var(--app-text-body)]"
          href="https://azuro.org"
          rel="noreferrer"
          target="_blank"
        >
          <span>Powered by Azuro</span>
          <img
            src="/Desktop/Azuro_token_full.png"
            alt=""
            aria-hidden="true"
            className="h-8 w-8 shrink-0"
          />
        </a>
      </footer>

      <AppBottomNav
        mobileView={shell.mobileView}
        isMobileBetslipOpen={shell.isMobileBetslipOpen}
        isMobileMenuOpen={shell.isMobileMenuOpen}
        selectionCount={betting.selectionItems.length}
        onOpenExplore={shell.handleNavigateToExplore}
        onOpenBetslip={shell.openMobileBetslip}
        onOpenChat={() => shell.handleNavigateToMobileView('chat')}
        onOpenBets={() => shell.handleNavigateToMobileView('bets')}
        onOpenMenu={shell.openMobileMenu}
      />

      <MobileBetslipSheet
        isOpen={shell.isMobileBetslipOpen}
        selectionCount={betting.selectionItems.length}
        onOpen={shell.openMobileBetslip}
        onClose={shell.closeMobileBetslip}
        panelProps={betslipPanelProps}
        showLauncher={false}
      />

      <MobileMenuSheet
        isOpen={shell.isMobileMenuOpen}
        onClose={shell.closeMobileMenu}
        onOpenNews={shell.openNewsFromMobileMenu}
        onOpenPlayerRankings={shell.openPlayerRankingsFromMobileMenu}
        onOpenForum={shell.openForumFromMobileMenu}
        onOpenGuide={shell.openGuideFromMobileMenu}
        onOpenLeaderboard={shell.openLeaderboardFromMobileMenu}
      />
    </div>
  )
}

export default App
