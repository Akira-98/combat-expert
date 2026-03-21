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
      className={`select-card grid gap-1.5 px-2.5 py-2 text-left text-xs transition md:px-3 md:py-2.5 md:text-sm ${
        isDisabled
          ? 'select-card-disabled ui-text-muted cursor-not-allowed'
          : isSelected
            ? 'select-card-active'
            : 'select-card-idle'
      }`}
      onClick={() => {
        if (isDisabled) return
        onSelectOutcome(outcome)
      }}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`min-w-0 truncate pr-2 font-medium ${isSelected ? 'text-orange-100' : 'ui-text-strong'}`}>{outcomeLabel}</span>
        <strong className={`shrink-0 text-xs md:text-sm ${isDisabled ? 'ui-text-muted' : isSelected ? 'text-orange-100' : 'ui-text-strong'}`}>
          {Number.isFinite(outcome.odds) ? outcome.odds.toFixed(2) : '-'}
        </strong>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {isSelected && (
          <span className="ui-state-success chip-pill px-2 py-0.5 text-[10px] font-semibold">
            선택
          </span>
        )}
        {isDisabled && (
          <span className="ui-pill chip-pill px-2 py-0.5 text-[10px] font-semibold">
            {isConditionInactive ? '마켓 비활성' : '배당 없음'}
          </span>
        )}
        {isSelected && priceChange && !isDisabled && (
          <span className="ui-state-warning chip-pill hidden px-2 py-0.5 text-[10px] font-semibold md:inline-flex">
            변경 {priceChange.previousOdds.toFixed(2)}→{priceChange.currentOdds.toFixed(2)}
          </span>
        )}
        {outcome.isExpressForbidden && (
          <span className="ui-pill chip-pill hidden px-2 py-0.5 text-[10px] font-medium md:inline-flex">
            싱글 전용
          </span>
        )}
      </div>
    </button>
  )
}
