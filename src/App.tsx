import { useMemo } from 'react'
import { BetsAndTransferPanel } from './compositions/BetsAndTransferPanel'
import { AppBottomNav } from './compositions/AppBottomNav'
import { AppHeaderContainer } from './compositions/AppHeaderContainer'
import { ComingSoonPage } from './compositions/ComingSoonPage'
import { GuidePage } from './compositions/GuidePage'
import { RankingPage } from './compositions/RankingPage'
import { MobileBetslipSheet } from './compositions/MobileBetslipSheet'
import { DesktopMenuRail } from './compositions/app/DesktopMenuRail'
import { DesktopSidebar } from './compositions/app/DesktopSidebar'
import { ExploreContent } from './compositions/app/ExploreContent'
import { MobileMenuSheet } from './compositions/app/MobileMenuSheet'
import { buildBetslipPanelProps } from './helpers/buildBetslipPanelProps'
import { getGamePhase } from './helpers/gameTiming'
import { useAppShellState } from './hooks/useAppShellState'
import { useGameFilters } from './hooks/useGameFilters'
import { useWalletConnection } from './hooks/useWalletConnection'
import { useMarketData } from './hooks/useMarketData'
import { useBetting } from './hooks/useBetting'
import { useProfile } from './hooks/useProfile'
import { usePoints } from './hooks/usePoints'
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
  const sportsNavigationItems = useMemo(
    () =>
      Array.from(
        games.reduce((counts, game) => {
          const current = counts.get(game.sportName)
          counts.set(game.sportName, {
            name: game.sportName,
            count: (current?.count ?? 0) + 1,
            hub: game.sportHub,
          })
          return counts
        }, new Map<string, { name: string; count: number; hub: 'sports' | 'esports' }>()),
      )
        .map(([, item]) => item)
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en')),
    [games],
  )
  const liveSportsNavigationItems = useMemo(
    () =>
      Array.from(
        games
          .filter((game) => getGamePhase(game.startsAt, game.state) === 'live')
          .reduce((counts, game) => {
            const current = counts.get(game.sportName)
            counts.set(game.sportName, {
              name: game.sportName,
              count: (current?.count ?? 0) + 1,
              hub: game.sportHub,
            })
            return counts
          }, new Map<string, { name: string; count: number; hub: 'sports' | 'esports' }>()),
      )
        .map(([, item]) => item)
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en')),
    [games],
  )
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
    onPickShareGameSelected: setSelectedGameId,
    onBetPointsClaimed: () => void points.refetch(),
  })
  const usdtTransfer = useUsdtTransfer({
    address: wallet.address,
    chainId: wallet.chainId,
    isConnected: wallet.isConnected,
    isAAWallet: wallet.isAAWallet,
  })

  const betslipPanelProps = buildBetslipPanelProps({ wallet, betting })
  const handleSportNavigation = (sportName: string) => {
    shell.handleNavigateToExplore()
    filters.setSportFilter(sportName)
  }
  const handleGameStatusNavigation = (status: 'all' | 'live' | 'upcoming') => {
    shell.handleNavigateToExplore()
    filters.setGameStatusFilter(status)
  }
  const handleLiveSportNavigation = (sportName: string) => {
    shell.handleNavigateToExplore()
    filters.setGameStatusFilter('live')
    filters.setSportFilter(sportName)
  }

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
            rankingViewer={null}
            isRankingLoading={false}
            totalPoints={points.totalPoints}
            isPointsLoading={points.isLoading}
            onTitleClick={shell.handleNavigateToExplore}
            gameSearchQuery={filters.gameSearchQuery}
            onGameSearchQueryChange={filters.setGameSearchQuery}
            onRankingClick={shell.handleNavigateToRanking}
            onGuideClick={shell.handleNavigateToGuide}
          />
        </div>
      </div>
      <div className="hidden px-3 md:block md:px-4 xl:px-0">
        <div className="ui-divider-subtle h-px" />
      </div>

      <main
        className="mt-0 grid items-start gap-2 px-0 md:grid-cols-[240px_minmax(0,1fr)_316px] md:gap-4 md:px-0"
      >
        <DesktopMenuRail
          gameStatusFilter={filters.gameStatusFilter}
          sportFilter={filters.sportFilter}
          sports={sportsNavigationItems}
          liveSports={liveSportsNavigationItems}
          isRankingActive={shell.shouldShowRankingContent}
          onSelectGameStatus={handleGameStatusNavigation}
          onSelectSport={handleSportNavigation}
          onSelectLiveSport={handleLiveSportNavigation}
          onOpenLeaderboard={shell.handleNavigateToRanking}
        />

        <section className="min-w-0">
          {shell.shouldShowGuideContent ? (
            <GuidePage />
          ) : shell.shouldShowRankingContent ? (
            <RankingPage />
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
        isExploreActive={shell.shouldShowExploreContent}
        isRankingActive={shell.shouldShowRankingContent}
        isMobileBetslipOpen={shell.isMobileBetslipOpen}
        isMobileMenuOpen={shell.isMobileMenuOpen}
        selectionCount={betting.selectionItems.length}
        onOpenExplore={shell.handleNavigateToExplore}
        onOpenBetslip={shell.openMobileBetslip}
        onOpenRankings={shell.handleNavigateToRanking}
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
        gameStatusFilter={filters.gameStatusFilter}
        sportFilter={filters.sportFilter}
        sports={sportsNavigationItems}
        liveSports={liveSportsNavigationItems}
        onClose={shell.closeMobileMenu}
        onSelectGameStatus={handleGameStatusNavigation}
        onSelectSport={handleSportNavigation}
        onSelectLiveSport={handleLiveSportNavigation}
      />
    </div>
  )
}

export default App
