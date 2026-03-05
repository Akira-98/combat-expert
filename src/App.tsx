import { useEffect, useState } from 'react'
import { Header } from './compositions/Header'
import { BetslipPanel, type BetslipPanelProps } from './compositions/BetslipPanel'
import { MarketList } from './compositions/MarketList'
import { MyBets } from './compositions/MyBets'
import { MobileBetslipSheet } from './compositions/MobileBetslipSheet'
import { LiveChatPanel } from './compositions/LiveChatPanel'
import { GameFiltersPanel } from './compositions/GameFiltersPanel'
import { useBodyScrollLock } from './hooks/useBodyScrollLock'
import { useGameFilters } from './hooks/useGameFilters'
import { useWalletConnection } from './hooks/useWalletConnection'
import { useMarketData } from './hooks/useMarketData'
import { useBetting } from './hooks/useBetting'
import { polygon } from 'viem/chains'

type MobileView = 'explore' | 'bets' | 'chat'
type DesktopSidePanelTab = 'myBets' | 'betslip'
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

function buildBetslipPanelProps({
  wallet,
  betting,
}: {
  wallet: ReturnType<typeof useWalletConnection>
  betting: ReturnType<typeof useBetting>
}): BetslipPanelProps {
  return {
    wallet: {
      isConnected: wallet.isConnected,
      canConnectWallet: wallet.canOpenAuthModal,
      isConnectingWallet: wallet.isConnecting,
      chainId: wallet.chainId,
    },
    bet: {
      selections: betting.selectionItems,
      betAmount: betting.betAmount,
      slippage: betting.slippage,
      totalOdds: betting.totalOdds,
      possibleWin: betting.possibleWin,
      canBet: betting.canBet,
      isApproveRequired: betting.isApproveRequired,
      approvePending: betting.approvePending,
      betPending: betting.betPending,
      disableReason: betting.disableReason,
      uiBlockHint: betting.uiBlockHint,
      submitLabel: betting.submitLabel,
      minBet: betting.minBet,
      maxBet: betting.maxBet,
      tokenBalance: betting.tokenBalance,
      isBalanceLoading: betting.isBalanceLoading,
      isLimitsLoading: betting.isLimitsLoading,
      amountValidationMessage: betting.amountValidationMessage,
      transactionSteps: betting.transactionSteps,
      transactionNotice: betting.transactionNotice,
    },
    actions: {
      onConnectWallet: wallet.openAuthModal,
      onBetAmountChange: betting.setBetAmount,
      onSlippageChange: betting.setSlippage,
      onSubmit: betting.submitBet,
      onClear: betting.clearBetslip,
      onDismissTransactionNotice: betting.clearTransactionNotice,
      onRemoveSelection: betting.removeSelection,
    },
  }
}

function App() {
  const [isMobileBetslipOpen, setIsMobileBetslipOpen] = useState(false)
  const [mobileView, setMobileView] = useState<MobileView>('explore')
  const [desktopSidePanelTab, setDesktopSidePanelTab] = useState<DesktopSidePanelTab>('betslip')
  const [routedGameId, setRoutedGameId] = useState<string | undefined>(() => readRoutedGameId())
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
  const {
    gameSearchQuery,
    gameStatusFilter,
    leagueFilter,
    leagueOptions,
    filteredGames,
    setGameSearchQuery,
    setGameStatusFilter,
    setLeagueFilter,
    resetFilters,
  } = useGameFilters(games)

  useBodyScrollLock(isMobileBetslipOpen)

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
  const pageMode = routedGameId ? 'markets' : 'games'
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

  const betslipPanelProps = buildBetslipPanelProps({ wallet, betting })
  const hasActiveFilters = Boolean(gameSearchQuery || gameStatusFilter !== 'all' || leagueFilter !== 'all')

  return (
    <div className="app-theme mx-auto w-full max-w-[1440px] px-0 pb-36 pt-0 md:px-4 md:pt-4 lg:pb-10">
      <div
        className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-100/95 px-3 pb-0 md:static md:border-0 md:bg-transparent md:px-0 md:pb-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 4px)' }}
      >
        <Header
          isAuthenticated={wallet.isAuthenticated}
          isConnected={wallet.isConnected}
          isConnecting={wallet.isConnecting}
          address={wallet.address}
          chainId={wallet.chainId}
          expectedChainId={polygon.id}
          isAAWallet={wallet.isAAWallet}
          canOpenAuthModal={wallet.canOpenAuthModal}
          connectErrorMessage={wallet.connectErrorMessage}
          onOpenAuthModal={wallet.openAuthModal}
          onDisconnect={wallet.disconnectWallet}
        />
      </div>

      <GameFiltersPanel
        gameSearchQuery={gameSearchQuery}
        gameStatusFilter={gameStatusFilter}
        leagueFilter={leagueFilter}
        leagueOptions={leagueOptions}
        filteredGamesCount={filteredGames.length}
        totalGamesCount={games.length}
        hasActiveFilters={hasActiveFilters}
        onGameSearchQueryChange={setGameSearchQuery}
        onGameStatusFilterChange={setGameStatusFilter}
        onLeagueFilterChange={setLeagueFilter}
        onResetFilters={resetFilters}
      />

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
              games={filteredGames}
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
            <MyBets address={wallet.address} bets={betting.bets} />
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
              <MyBets address={wallet.address} bets={betting.bets} />
            ) : (
              <BetslipPanel {...betslipPanelProps} />
            )}
          </div>
        </aside>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 bg-[color:color-mix(in_oklab,var(--app-surface)_88%,transparent)] px-2.5 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-1 backdrop-blur xl:hidden">
        <div className="mx-auto grid w-full max-w-[560px] grid-cols-4 gap-1.5">
          <button
            className={`relative px-2 py-2 text-xs font-semibold transition ${
              mobileView === 'explore' ? 'text-orange-200' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setMobileView('explore')}
            type="button"
          >
            <span
              aria-hidden
              className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-400 transition ${
                mobileView === 'explore' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            탐색
          </button>
          <button
            className={`relative px-2 py-2 text-xs font-semibold transition ${
              isMobileBetslipOpen ? 'text-orange-200' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setIsMobileBetslipOpen(true)}
            type="button"
          >
            <span
              aria-hidden
              className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-400 transition ${
                isMobileBetslipOpen ? 'opacity-100' : 'opacity-0'
              }`}
            />
            베팅슬립
            <span className="ml-1 rounded-full bg-orange-500/20 px-1.5 py-0.5 text-[10px] text-orange-200">
              {betting.selectionItems.length}
            </span>
          </button>
          <button
            className={`relative px-2 py-2 text-xs font-semibold transition ${
              mobileView === 'chat' ? 'text-orange-200' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setMobileView('chat')}
            type="button"
          >
            <span
              aria-hidden
              className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-400 transition ${
                mobileView === 'chat' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            채팅
          </button>
          <button
            className={`relative px-2 py-2 text-xs font-semibold transition ${
              mobileView === 'bets' ? 'text-orange-200' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setMobileView('bets')}
            type="button"
          >
            <span
              aria-hidden
              className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-400 transition ${
                mobileView === 'bets' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            내 베팅
          </button>
        </div>
      </nav>

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
