import { formatGameStartTime } from '../../helpers/formatters'
import { selectionKey } from '../../helpers/mappers'
import { EmptyState, ErrorState, MarketsSkeleton } from './PaneStates'
import { OutcomeButton } from './OutcomeButton'
import type { MarketsPaneProps } from './types'

export function MarketsPane({
  isMarketsLoading,
  marketsErrorMessage,
  selectedGame,
  marketSections,
  selectedOutcomes,
  selectedOutcomePriceChanges,
  onSelectOutcome,
  onRetryMarkets,
}: MarketsPaneProps) {
  return (
    <div className="grid min-w-0 content-start gap-3">
      <h2 className="ui-text-strong m-0 text-lg font-semibold">마켓</h2>
      {selectedGame && (
        <div className="ui-surface-soft rounded-lg border px-3 py-2">
          <p className="ui-text-strong m-0 text-sm font-semibold">{selectedGame.title}</p>
          <p className="ui-text-body mt-1 text-xs">
            {selectedGame.leagueName} · {formatGameStartTime(selectedGame.startsAt)}
          </p>
          <p className="ui-text-muted mt-1 text-xs">{selectedGame.participants.join(' vs ')}</p>
        </div>
      )}
      {isMarketsLoading && <MarketsSkeleton />}
      {!isMarketsLoading && marketsErrorMessage && selectedGame && (
        <ErrorState title="마켓을 불러오지 못했습니다" message={marketsErrorMessage} onRetry={onRetryMarkets} />
      )}

      {marketSections.length > 0 ? (
        <div className="grid gap-3">
          {marketSections.map((section) => (
            <article
              key={section.id}
              className="ui-surface rounded-xl border bg-linear-to-b from-[#16202b] to-[#131b25] p-3.5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="ui-text-strong m-0 text-sm font-semibold tracking-tight">{section.title}</h3>
                <span className="ui-pill rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                  {section.outcomes.length}
                </span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(152px,1fr))] gap-2">
                {section.outcomes.map((outcome) => {
                  const key = selectionKey(outcome.conditionId, outcome.outcomeId)
                  return (
                    <OutcomeButton
                      key={key}
                      outcome={outcome}
                      selectedGameParticipants={selectedGame?.participants ?? []}
                      isSelected={selectedOutcomes.has(key)}
                      priceChange={selectedOutcomePriceChanges.get(key)}
                      onSelectOutcome={onSelectOutcome}
                    />
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isMarketsLoading && !marketsErrorMessage && !selectedGame && (
        <EmptyState title="경기를 선택해 주세요" description="왼쪽 목록에서 경기를 선택하면 마켓이 표시됩니다." />
      )}

      {!isMarketsLoading && !marketsErrorMessage && selectedGame && marketSections.length === 0 && (
        <EmptyState title="활성 아웃컴이 없습니다" description="선택한 경기의 마켓이 아직 열리지 않았거나 일시적으로 비어 있습니다." />
      )}
    </div>
  )
}
