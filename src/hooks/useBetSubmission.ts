import { translate } from '../i18n'

type BetslipItemLike = {
  conditionId: string
  outcomeId: string
  gameId: string
}

type OutcomeStateMeta = {
  conditionState: string
  odds: number
  marketTitle: string
}

type OutcomePriceChange = {
  previousOdds: number
  currentOdds: number
}

type UseBetSubmissionParams = {
  items: BetslipItemLike[]
  currentOutcomeStateMap: Map<string, OutcomeStateMeta>
  selectedOutcomePriceChanges: Map<string, OutcomePriceChange>
  sdkConditionStateMismatch: boolean
  clearTransactionNotice: () => void
  setErrorNotice: (params: { title: string; message?: string; error?: unknown }) => void
  syncSelectionMeta: (items: BetslipItemLike[]) => void
  submit: () => Promise<unknown>
}

export function useBetSubmission({
  items,
  currentOutcomeStateMap,
  selectedOutcomePriceChanges,
  sdkConditionStateMismatch,
  clearTransactionNotice,
  setErrorNotice,
  syncSelectionMeta,
  submit,
}: UseBetSubmissionParams) {
  return async () => {
    clearTransactionNotice()

    if (sdkConditionStateMismatch) {
      setErrorNotice({
        title: translate('betSubmission.stateReviewTitle'),
        message: translate('betSubmission.stateReviewMessage'),
      })
      return
    }

    for (const item of items) {
      const key = `${item.conditionId}-${item.outcomeId}`
      const meta = currentOutcomeStateMap.get(key)

      if (!meta) {
        setErrorNotice({
          title: translate('betSubmission.selectionReviewTitle'),
          message: translate('betSubmission.selectionReviewMessage'),
        })
        return
      }

      if (meta.conditionState !== 'Active' || !Number.isFinite(meta.odds) || meta.odds <= 1) {
        syncSelectionMeta(items)
        setErrorNotice({
          title: translate('betSubmission.marketChangedTitle'),
          message: translate('betSubmission.marketChangedMessage'),
        })
        return
      }
    }

    if (selectedOutcomePriceChanges.size > 0) {
      syncSelectionMeta(items)
      setErrorNotice({
        title: translate('betSubmission.oddsChangedTitle'),
        message: translate('betSubmission.oddsChangedMessage'),
      })
      return
    }

    try {
      await submit()
    } catch {
      // SDK onError callback sets the user-facing notice.
    }
  }
}
