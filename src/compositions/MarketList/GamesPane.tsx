import { getGameTimingMeta } from '../../helpers/gameTiming'
import { GameOddsPreview } from './GameOddsPreview'
import { EmptyState, ErrorState, GamesSkeletonList } from './PaneStates'
import type { GamesPaneProps } from './types'

export function GamesPane({
  isGamesLoading,
  gamesErrorMessage,
  selectedGameId,
  games,
  selectedOutcomes,
  onSelectGame,
  onSelectOutcome,
  onRetryGames,
}: GamesPaneProps) {
  return (
    <div className="grid content-start gap-2 pr-1 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto">
      <h2 className="ui-text-strong m-0 text-lg font-semibold">경기</h2>
      {isGamesLoading && <GamesSkeletonList />}
      {!isGamesLoading && gamesErrorMessage && (
        <ErrorState title="게임 목록을 불러오지 못했습니다" message={gamesErrorMessage} onRetry={onRetryGames} />
      )}
      {!isGamesLoading && !gamesErrorMessage && games.length === 0 && (
        <EmptyState title="조회 가능한 게임이 없습니다" description="필터/네트워크 상태를 확인한 뒤 다시 시도해 주세요." />
      )}
      {games.map((game) => {
        const isActive = game.gameId === selectedGameId
        const timing = getGameTimingMeta(game.startsAt, game.state)
        const badgeClass =
          timing.tone === 'rose'
            ? 'ui-state-danger'
            : timing.tone === 'amber'
              ? 'ui-state-warning'
              : 'ui-pill'

        return (
          <div
            key={game.gameId}
            aria-pressed={isActive}
            className={`group grid gap-2 rounded-xl border px-3 py-3 text-left transition ${
              isActive
                ? 'border-orange-400/70 bg-linear-to-b from-orange-950/35 to-[#151d27] shadow-[0_14px_32px_-18px_rgba(255,107,0,0.7)] ring-1 ring-orange-400/30'
                : 'ui-surface border hover:border-orange-400/35 hover:bg-[#18212d]'
            }`}
            onClick={() => onSelectGame(game.gameId)}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              onSelectGame(game.gameId)
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className={`block font-semibold ${isActive ? 'text-orange-100' : 'ui-text-strong'}`}>{game.title}</span>
              </div>
              {isActive && (
                <span className="shrink-0 rounded-full border border-orange-300/50 bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                  선택됨
                </span>
              )}
            </div>

            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
                <span className="ui-pill rounded-md border px-2 py-1 font-medium">
                  {game.leagueName}
                </span>
                <span className={`rounded-md border px-2 py-1 font-semibold ${badgeClass}`}>{timing.label}</span>
                <span className="ui-text-muted">{timing.detail}</span>
              </div>
              <GameOddsPreview
                gameId={game.gameId}
                participants={game.participants}
                priority={isActive}
                selectedOutcomes={selectedOutcomes}
                onSelectOutcome={onSelectOutcome}
                className="min-w-0 text-left md:max-w-[18rem] md:justify-end md:text-right"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
