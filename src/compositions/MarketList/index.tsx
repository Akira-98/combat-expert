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
  selectedOutcomePriceChanges,
  onSelectGame,
  onBackToGames,
  onConnectWallet,
  onSelectOutcome,
  onRetryGames,
  onRetryMarkets,
}: MarketListProps) {
  const selectedGame = games.find((game) => game.gameId === selectedGameId)

  if (pageMode === 'games') {
    return (
      <section className="panel section-shell desktop-surface-variant p-2 md:p-4">
        <GamesPane
          isGamesLoading={isGamesLoading}
          gamesErrorMessage={gamesErrorMessage}
          selectedGameId={selectedGameId}
          games={games}
          selectedOutcomes={selectedOutcomes}
          onSelectGame={onSelectGame}
          onSelectOutcome={onSelectOutcome}
          onRetryGames={onRetryGames}
        />
      </section>
    )
  }

  return (
    <section className="panel section-shell desktop-surface-variant grid gap-3 p-2 md:gap-4 md:p-4">
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
