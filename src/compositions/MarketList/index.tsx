import { GamesPane } from './GamesPane'
import { MarketCommentsPanel } from './MarketCommentsPanel'
import { MarketsPane } from './MarketsPane'
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
  sdkBlockedSelectionKeys,
  selectedOutcomePriceChanges,
  gameSearchQuery,
  leagueFilter,
  leagueOptions,
  totalGamesCount,
  onSelectGame,
  onBackToGames,
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
            sdkBlockedSelectionKeys={sdkBlockedSelectionKeys}
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
    <section className="panel section-shell grid gap-3 p-2 md:gap-4 md:rounded-2xl md:border md:px-4 md:py-4">
      <div className="flex items-center justify-between gap-2">
        <button
          className="ui-btn-secondary rounded-lg border px-3 py-1.5 text-sm font-semibold"
          onClick={onBackToGames}
          type="button"
        >
          경기 목록으로
        </button>
        {selectedGame && <span className="ui-text-muted text-xs">{selectedGame.leagueName}</span>}
      </div>

      <MarketsPane
        isMarketsLoading={isMarketsLoading}
        marketsErrorMessage={marketsErrorMessage}
        selectedGame={selectedGame}
        marketSections={marketSections}
        selectedOutcomes={selectedOutcomes}
        sdkBlockedSelectionKeys={sdkBlockedSelectionKeys}
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
