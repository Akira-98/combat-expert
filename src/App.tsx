import { useEffect, useState } from 'react'
import { Header } from './compositions/Header'
import { BetslipPanel, type BetslipPanelProps } from './compositions/BetslipPanel'
import { MarketList } from './compositions/MarketList'
import { MyBets } from './compositions/MyBets'
import { MobileBetslipSheet } from './compositions/MobileBetslipSheet'
import { LiveChatPanel } from './compositions/LiveChatPanel'
import type { GameStatusFilter } from './helpers/gameTiming'
import { useBodyScrollLock } from './hooks/useBodyScrollLock'
import { useGameFilters } from './hooks/useGameFilters'
import { useWalletConnection } from './hooks/useWalletConnection'
import { useMarketData } from './hooks/useMarketData'
import { useBetting } from './hooks/useBetting'
import { polygon } from 'viem/chains'

type MobileView = 'explore' | 'bets'
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

  return (
    <div className="app-theme mx-auto max-w-[1440px] px-4 pb-32 pt-4 lg:pb-10">
      <div className="sticky top-0 z-30 -mx-4 border-b border-slate-200/80 bg-slate-100/95 px-4 pb-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pb-0">
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

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            게임 검색
            <input
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500"
              placeholder="팀명, 리그명으로 검색"
              type="search"
              value={gameSearchQuery}
              onChange={(event) => setGameSearchQuery(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            상태
            <select
              className="h-10 min-w-32 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              value={gameStatusFilter}
              onChange={(event) => setGameStatusFilter(event.target.value as GameStatusFilter)}
            >
              <option value="all">종료 제외</option>
              <option value="live">라이브 추정</option>
              <option value="upcoming">시작 전</option>
            </select>
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            리그
            <select
              className="h-10 min-w-40 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              value={leagueFilter}
              onChange={(event) => setLeagueFilter(event.target.value)}
            >
              <option value="all">전체 리그</option>
              {leagueOptions.map((leagueName) => (
                <option key={leagueName} value={leagueName}>
                  {leagueName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-1">
            표시 중 게임 {filteredGames.length} / 전체 {games.length}
          </span>
              {(gameSearchQuery || gameStatusFilter !== 'all' || leagueFilter !== 'all') && (
                <button
                  className="rounded-full border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={resetFilters}
                  type="button"
                >
              필터 초기화
            </button>
          )}
        </div>
      </section>

      <div className="mt-4 grid gap-2 xl:hidden">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="ui-surface inline-flex rounded-xl border p-1">
            <button
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                mobileView === 'explore' ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'
              }`}
              onClick={() => setMobileView('explore')}
              type="button"
            >
              탐색
            </button>
            <button
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                mobileView === 'bets' ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'
              }`}
              onClick={() => setMobileView('bets')}
              type="button"
            >
              내 베팅
            </button>
          </div>
          <button
            className="ui-btn-secondary rounded-xl border px-3 py-2 text-sm font-semibold"
            onClick={() => setIsMobileBetslipOpen(true)}
            type="button"
          >
            베팅슬립 {betting.selectionItems.length}
          </button>
        </div>
        <p className="m-0 text-xs text-slate-500">모바일에서는 탐색과 내 베팅을 전환하고, 베팅슬립은 별도 시트로 열립니다.</p>
      </div>

      <main className="mt-4 grid items-start gap-4 xl:grid-cols-[240px_minmax(0,1fr)_316px]">
        <aside className="hidden xl:sticky xl:top-4 xl:block">
          <LiveChatPanel address={wallet.address} />
        </aside>

        <section className="min-w-0">
          <div className={`${mobileView === 'explore' ? 'grid gap-4' : 'hidden xl:grid xl:gap-4'}`}>
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

      <MobileBetslipSheet
        isOpen={isMobileBetslipOpen}
        selectionCount={betting.selectionItems.length}
        onOpen={() => setIsMobileBetslipOpen(true)}
        onClose={() => setIsMobileBetslipOpen(false)}
        panelProps={betslipPanelProps}
      />
    </div>
  )
}

export default App
