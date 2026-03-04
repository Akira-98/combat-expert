import type { OutcomeItem } from '../../types/ui'
import { normalizeOutcomeLabel } from './helpers'
import type { OutcomePriceChange } from './types'

type OutcomeButtonProps = {
  outcome: OutcomeItem
  selectedGameParticipants: string[]
  isSelected: boolean
  priceChange?: OutcomePriceChange
  onSelectOutcome: (outcome: OutcomeItem) => void
}

export function OutcomeButton({
  outcome,
  selectedGameParticipants,
  isSelected,
  priceChange,
  onSelectOutcome,
}: OutcomeButtonProps) {
  const isConditionInactive = outcome.conditionState !== 'Active'
  const isOddsUnavailable = !Number.isFinite(outcome.odds) || outcome.odds <= 1
  const isDisabled = isConditionInactive || isOddsUnavailable
  const outcomeLabel = normalizeOutcomeLabel(outcome.selectionName, selectedGameParticipants)

  return (
    <button
      aria-disabled={isDisabled}
      className={`grid gap-1.5 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
        isDisabled
          ? 'ui-surface-soft ui-text-muted cursor-not-allowed opacity-70'
          : isSelected
            ? 'border-orange-400/70 bg-linear-to-b from-orange-950/30 to-[#151d27] shadow-[0_12px_24px_-14px_rgba(255,107,0,0.65)] ring-1 ring-orange-400/35'
            : 'ui-surface hover:border-orange-400/35 hover:bg-[#18212d]'
      }`}
      onClick={() => {
        if (isDisabled) return
        onSelectOutcome(outcome)
      }}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`min-w-0 truncate pr-2 font-medium ${isSelected ? 'text-orange-100' : 'ui-text-strong'}`}>{outcomeLabel}</span>
        <strong className={`shrink-0 text-sm ${isDisabled ? 'ui-text-muted' : isSelected ? 'text-orange-100' : 'ui-text-strong'}`}>
          {Number.isFinite(outcome.odds) ? outcome.odds.toFixed(2) : '-'}
        </strong>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {isSelected && (
          <span className="ui-state-success rounded-full border px-2 py-0.5 text-[10px] font-semibold">
            선택
          </span>
        )}
        {isDisabled && (
          <span className="ui-pill rounded-full border px-2 py-0.5 text-[10px] font-semibold">
            {isConditionInactive ? '마켓 비활성' : '배당 없음'}
          </span>
        )}
        {isSelected && priceChange && !isDisabled && (
          <span className="ui-state-warning rounded-full border px-2 py-0.5 text-[10px] font-semibold">
            변경 {priceChange.previousOdds.toFixed(2)}→{priceChange.currentOdds.toFixed(2)}
          </span>
        )}
        {outcome.isExpressForbidden && (
          <span className="ui-pill rounded-full border px-2 py-0.5 text-[10px] font-medium">
            싱글 전용
          </span>
        )}
      </div>
    </button>
  )
}
