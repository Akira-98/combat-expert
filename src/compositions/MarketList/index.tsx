import { GamesPane } from './GamesPane'
import { MarketCommentsPanel } from './MarketCommentsPanel'
import { MatchupHero, MarketsPane } from './MarketsPane'
import type { MarketListProps } from './types'

export function MarketList({
  pageMode,
  isGamesLoading,
  isMarketsLoading,
  gamesErrorMessage,
  marketsErrorMessage,
  selectedGameId,
  address,
  isConnected,
  isAAWallet,
  games,
  marketSections,
  selectedOutcomes,
  selectedOutcomePriceChanges,
  gameSearchQuery,
  leagueFilter,
  leagueOptions,
  totalGamesCount,
  onSelectGame,
  onConnectWallet,
  onGameSearchQueryChange,
  onLeagueFilterChange,
  onSelectOutcome,
  onRetryGames,
  onRetryMarkets,
}: MarketListProps) {
  const selectedGame = games.find((game) => game.gameId === selectedGameId)

  if (pageMode === 'games') {
    return (
      <section className="panel section-shell bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.012)_100%)] p-2 md:rounded-2xl md:border md:px-4 md:py-4">
          <GamesPane
            isGamesLoading={isGamesLoading}
            gamesErrorMessage={gamesErrorMessage}
            selectedGameId={selectedGameId}
            games={games}
            selectedOutcomes={selectedOutcomes}
            gameSearchQuery={gameSearchQuery}
            leagueFilter={leagueFilter}
            leagueOptions={leagueOptions}
            totalGamesCount={totalGamesCount}
            onSelectGame={onSelectGame}
            onGameSearchQueryChange={onGameSearchQueryChange}
            onLeagueFilterChange={onLeagueFilterChange}
            onSelectOutcome={onSelectOutcome}
            onRetryGames={onRetryGames}
          />
      </section>
    )
  }

  return (
    <section className="grid gap-3 px-2 pb-2 pt-3 md:gap-4 md:px-0 md:pb-0 md:pt-2">
      {selectedGame ? <MatchupHero selectedGame={selectedGame} /> : null}

      <MarketsPane
        isMarketsLoading={isMarketsLoading}
        marketsErrorMessage={marketsErrorMessage}
        selectedGame={selectedGame}
        marketSections={marketSections}
        selectedOutcomes={selectedOutcomes}
        selectedOutcomePriceChanges={selectedOutcomePriceChanges}
        onSelectOutcome={onSelectOutcome}
        onRetryMarkets={onRetryMarkets}
      />

      <MarketCommentsPanel
        selectedGame={selectedGame}
        address={address}
        isConnected={isConnected}
        isAAWallet={isAAWallet}
        onConnectWallet={onConnectWallet}
      />
    </section>
  )
}
