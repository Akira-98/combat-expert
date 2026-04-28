import type { useBetting } from '../../hooks/useBetting'
import type { MarketPageMode } from '../../hooks/useAppNavigation'
import type { useGameFilters } from '../../hooks/useGameFilters'
import type { useMarketData } from '../../hooks/useMarketData'
import type { useWalletConnection } from '../../hooks/useWalletConnection'
import { MarketList } from '../MarketList'
import { TopEventsShowcase } from './TopEventsShowcase'

type ExploreContentProps = {
  shouldShowExploreContent: boolean
  marketPageMode: MarketPageMode
  activeGameId: ReturnType<typeof useMarketData>['selectedGameId']
  wallet: ReturnType<typeof useWalletConnection>
  filters: ReturnType<typeof useGameFilters>
  market: ReturnType<typeof useMarketData>
  betting: ReturnType<typeof useBetting>
  onOpenGameMarkets: (gameId: string) => void
}

export function ExploreContent({
  shouldShowExploreContent,
  marketPageMode,
  activeGameId,
  wallet,
  filters,
  market,
  betting,
  onOpenGameMarkets,
}: ExploreContentProps) {
  const shouldShowTopExperts = marketPageMode === 'games'

  return (
    <div className={shouldShowExploreContent ? 'grid gap-3 md:gap-4' : 'hidden xl:grid xl:gap-4'}>
      {shouldShowTopExperts ? (
        <TopEventsShowcase
          games={market.games}
          selectedOutcomes={betting.selectedOutcomes}
          onOpenGameMarkets={onOpenGameMarkets}
          onSelectOutcome={betting.selectOutcome}
        />
      ) : null}
      {shouldShowTopExperts ? (
        <div className="flex items-center gap-2 px-1">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 text-black" aria-hidden="true">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2h9A1.5 1.5 0 0 1 16 3.5v13a.75.75 0 0 1-1.08.67L10 14.74l-4.92 2.43A.75.75 0 0 1 4 16.5v-13Zm3 2.75A.75.75 0 0 0 7 7.75h6a.75.75 0 0 0 0-1.5H7Zm0 3A.75.75 0 0 0 7 10.75h4a.75.75 0 0 0 0-1.5H7Z" />
            </svg>
          </span>
          <p className="ui-text-strong m-0 text-lg font-bold">Events</p>
        </div>
      ) : null}
      <MarketList
        pageMode={marketPageMode}
        isGamesLoading={market.isGamesLoading}
        isMarketsLoading={activeGameId ? market.isMarketsLoading : false}
        gamesErrorMessage={market.gamesErrorMessage}
        marketsErrorMessage={activeGameId ? market.marketsErrorMessage : undefined}
        selectedGameId={activeGameId}
        address={wallet.address}
        isConnected={wallet.isConnected}
        isAAWallet={wallet.isAAWallet}
        games={filters.filteredGames}
        marketSections={activeGameId ? market.marketSections : []}
        selectedOutcomes={betting.selectedOutcomes}
        selectedOutcomePriceChanges={betting.selectedOutcomePriceChanges}
        gameSearchQuery={filters.gameSearchQuery}
        leagueFilter={filters.leagueFilter}
        leagueOptions={filters.leagueOptions}
        totalGamesCount={market.games.length}
        onSelectGame={onOpenGameMarkets}
        onConnectWallet={wallet.openAuthModal}
        onGameSearchQueryChange={filters.setGameSearchQuery}
        onLeagueFilterChange={filters.setLeagueFilter}
        onSelectOutcome={betting.selectOutcome}
        onRetryGames={market.retryGames}
        onRetryMarkets={market.retryMarkets}
      />
    </div>
  )
}
