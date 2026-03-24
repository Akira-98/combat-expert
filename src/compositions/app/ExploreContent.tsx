import type { useBetting } from '../../hooks/useBetting'
import type { MarketPageMode } from '../../hooks/useAppNavigation'
import type { useGameFilters } from '../../hooks/useGameFilters'
import type { useMarketData } from '../../hooks/useMarketData'
import type { useRankings } from '../../hooks/useRankings'
import type { useWalletConnection } from '../../hooks/useWalletConnection'
import { MarketList } from '../MarketList'
import { TopExpertsShowcase } from './TopExpertsShowcase'

type ExploreContentProps = {
  shouldShowExploreContent: boolean
  marketPageMode: MarketPageMode
  activeGameId: ReturnType<typeof useMarketData>['selectedGameId']
  wallet: ReturnType<typeof useWalletConnection>
  filters: ReturnType<typeof useGameFilters>
  market: ReturnType<typeof useMarketData>
  betting: ReturnType<typeof useBetting>
  rankings: ReturnType<typeof useRankings>
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
  rankings,
  onOpenGameMarkets,
}: ExploreContentProps) {
  const shouldShowTopExperts = marketPageMode === 'games'

  return (
    <div className={shouldShowExploreContent ? 'grid gap-3 md:gap-4' : 'hidden xl:grid xl:gap-4'}>
      {shouldShowTopExperts ? (
        <TopExpertsShowcase
          rankings={rankings.rankings}
          isLoading={rankings.isLoading}
          errorMessage={rankings.errorMessage}
        />
      ) : null}
      {shouldShowTopExperts ? <p className="ui-text-strong m-0 px-1 text-lg font-semibold">Events</p> : null}
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
