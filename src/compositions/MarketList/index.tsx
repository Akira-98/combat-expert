import { GamesPane } from './GamesPane'
import { MarketsPane } from './MarketsPane'
import type { MarketListProps } from './types'

export function MarketList({
  pageMode,
  isGamesLoading,
  isMarketsLoading,
  gamesErrorMessage,
  marketsErrorMessage,
  selectedGameId,
  games,
  marketSections,
  selectedOutcomes,
  selectedOutcomePriceChanges,
  onSelectGame,
  onBackToGames,
  onSelectOutcome,
  onRetryGames,
  onRetryMarkets,
}: MarketListProps) {
  const selectedGame = games.find((game) => game.gameId === selectedGameId)

  if (pageMode === 'games') {
    return (
      <section className="ui-surface rounded-xl border p-4">
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
    <section className="ui-surface grid gap-4 rounded-xl border p-4">
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
    </section>
  )
}
