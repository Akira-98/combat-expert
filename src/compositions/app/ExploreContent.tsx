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
  const hasGameSearchQuery = filters.gameSearchQuery.trim().length > 0
  const shouldShowExploreBanner = marketPageMode === 'games' && filters.sportFilter === 'all'
  const shouldShowTopEvents = shouldShowExploreBanner && !hasGameSearchQuery

  return (
    <div className={shouldShowExploreContent ? 'grid gap-3 md:gap-4' : 'hidden xl:grid xl:gap-4'}>
      {shouldShowExploreBanner ? <ExploreBanner /> : null}
      {shouldShowTopEvents ? (
        <TopEventsShowcase
          games={market.topEventGames}
          selectedOutcomes={betting.selectedOutcomes}
          onOpenGameMarkets={onOpenGameMarkets}
          onSelectOutcome={betting.selectOutcome}
        />
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
        totalGamesCount={market.games.length}
        onSelectGame={onOpenGameMarkets}
        onConnectWallet={wallet.openAuthModal}
        onSelectOutcome={betting.selectOutcome}
        onRetryGames={market.retryGames}
        onRetryMarkets={market.retryMarkets}
      />
    </div>
  )
}

function ExploreBanner() {
  return (
    <section className="px-0 md:px-0">
      <div className="card-surface-soft overflow-hidden rounded-lg border border-white/10 bg-black/25">
        <img
          alt=""
          aria-hidden="true"
          className="block h-[152px] w-full object-cover object-center sm:h-[180px] md:h-[180px] xl:h-[210px]"
          src="/images/baner.jpg"
        />
      </div>
    </section>
  )
}
