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
    <div className="grid min-w-0 content-start gap-2 md:gap-3">
      {isMarketsLoading && <MarketsSkeleton />}
      {!isMarketsLoading && marketsErrorMessage && selectedGame && (
        <ErrorState title="마켓을 불러오지 못했습니다" message={marketsErrorMessage} onRetry={onRetryMarkets} />
      )}

      {marketSections.length > 0 ? (
        <div className="grid gap-2 md:gap-3">
          {marketSections.map((section) => (
            <article
              key={section.id}
              className="card-shell-lg border border-[color:var(--app-border)] bg-white/[0.03] p-3 shadow-[0_8px_18px_-14px_rgba(0,0,0,0.65)] md:p-3.5"
            >
              <div className="mb-2.5 flex items-center justify-between gap-2 md:mb-3">
                <h3 className="ui-text-strong m-0 text-sm font-semibold tracking-tight">{section.title}</h3>
                <span className="ui-pill rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                  {section.outcomes.length}
                </span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(152px,100%),1fr))] gap-2">
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

export function MatchupHero({ selectedGame }: { selectedGame: NonNullable<MarketsPaneProps['selectedGame']> }) {
  const [leftName = 'Fighter A', rightName = 'Fighter B'] = selectedGame.participants
  const matchupLabel = [leftName, rightName].filter(Boolean).join(' - ')

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 md:gap-5">
      <CompetitorProfile initials={getCompetitorInitials(leftName)} align="left" />

      <div className="min-w-[92px] text-center md:min-w-[128px]">
        <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em] md:text-[11px]">{selectedGame.leagueName}</p>
        <p className="ui-text-strong mt-2 mb-0 text-sm font-semibold md:text-base">{formatGameStartTime(selectedGame.startsAt)}</p>
        <p className="ui-text-strong mt-3 mb-0 max-w-[18ch] text-xs font-semibold leading-tight md:max-w-[24ch] md:text-sm">{matchupLabel}</p>
      </div>

      <CompetitorProfile initials={getCompetitorInitials(rightName)} align="right" />
    </div>
  )
}

function CompetitorProfile({ initials, align }: { initials: string; align: 'left' | 'right' }) {
  const layoutClass = align === 'right' ? 'justify-items-end text-right' : 'justify-items-start text-left'

  return (
    <div className={`grid min-w-0 gap-2 ${layoutClass}`}>
      <div className="relative h-18 w-18 rounded-full border border-white/12 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),rgba(255,255,255,0.03)_58%,rgba(0,0,0,0.25))] p-1.5 shadow-[0_16px_30px_-20px_rgba(0,0,0,0.8)] md:h-24 md:w-24">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-orange-300/18 bg-[linear-gradient(180deg,rgba(255,138,76,0.22),rgba(17,24,39,0.88))]">
          <span className="ui-text-strong text-lg font-black tracking-[0.08em] md:text-2xl">{initials}</span>
        </div>
      </div>
    </div>
  )
}

function getCompetitorInitials(name: string) {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens.length === 0) return '??'

  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('')
}
