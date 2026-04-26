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
        <>
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="/images/ufc-perth.jpg"
              alt="Combat expert"
              className="h-55 w-full object-cover object-center md:h-85"
              loading="eager"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-5 text-center text-white">
              <p className="m-0 font-['Anton'] text-2xl font-black uppercase leading-tight tracking-normal md:text-4xl">
                DELLA MADDALENA VS PRATES
              </p>
              <p className="m-0 font-['Anton'] text-xl font-black uppercase leading-tight tracking-normal md:text-3xl">
                MAY 2th
              </p>
            </div>
          </div>
          <TopExpertsShowcase
            rankings={rankings.rankings}
            isLoading={rankings.isLoading}
            errorMessage={rankings.errorMessage}
          />
        </>
      ) : null}
      {shouldShowTopExperts ? <p className="ui-text-strong m-0 px-1 text-lg font-bold">Events</p> : null}
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
