const BETSLIP_SYNC_LOG_PREFIX = '[CombatExpert][betslip-sync]'

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
  chainId?: number
  environment?: string
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
  chainId,
  environment,
  clearTransactionNotice,
  setErrorNotice,
  syncSelectionMeta,
  submit,
}: UseBetSubmissionParams) {
  return async () => {
    clearTransactionNotice()

    console.warn(`${BETSLIP_SYNC_LOG_PREFIX} submit_attempt`, {
      chainId: chainId ?? null,
      environment: environment ?? null,
      itemCount: items.length,
      items: items.map((item) => {
        const key = `${item.conditionId}-${item.outcomeId}`
        const meta = currentOutcomeStateMap.get(key)
        return {
          conditionId: item.conditionId,
          outcomeId: item.outcomeId,
          gameId: item.gameId,
          localConditionState: meta?.conditionState ?? 'missing',
          localOdds: meta?.odds ?? null,
          marketTitle: meta?.marketTitle ?? null,
        }
      }),
    })

    if (sdkConditionStateMismatch) {
      console.warn(`${BETSLIP_SYNC_LOG_PREFIX} blocked_submit_sdk_state_mismatch`, {
        chainId: chainId ?? null,
        environment: environment ?? null,
        itemCount: items.length,
        items: items.map((item) => {
          const key = `${item.conditionId}-${item.outcomeId}`
          const meta = currentOutcomeStateMap.get(key)
          return {
            conditionId: item.conditionId,
            outcomeId: item.outcomeId,
            gameId: item.gameId,
            localConditionState: meta?.conditionState ?? 'missing',
            localOdds: meta?.odds ?? null,
            marketTitle: meta?.marketTitle ?? null,
          }
        }),
      })
      setErrorNotice({
        title: '상태 재확인 필요',
        message: '선택한 마켓 상태가 방금 변경되었습니다. 목록을 다시 확인한 뒤 다시 시도해 주세요.',
      })
      return
    }

    for (const item of items) {
      const key = `${item.conditionId}-${item.outcomeId}`
      const meta = currentOutcomeStateMap.get(key)

      if (!meta) {
        console.warn(`${BETSLIP_SYNC_LOG_PREFIX} blocked_submit_missing_market`, {
          chainId: chainId ?? null,
          environment: environment ?? null,
          conditionId: item.conditionId,
          outcomeId: item.outcomeId,
          gameId: item.gameId,
        })
        setErrorNotice({
          title: '선택 재확인 필요',
          message: '선택한 마켓의 최신 정보를 확인하지 못했습니다. 목록을 다시 확인한 뒤 다시 시도해 주세요.',
        })
        return
      }

      if (meta.conditionState !== 'Active' || !Number.isFinite(meta.odds) || meta.odds <= 1) {
        console.warn(`${BETSLIP_SYNC_LOG_PREFIX} blocked_submit_inactive_market`, {
          chainId: chainId ?? null,
          environment: environment ?? null,
          conditionId: item.conditionId,
          outcomeId: item.outcomeId,
          gameId: item.gameId,
          conditionState: meta.conditionState,
          odds: meta.odds,
        })
        syncSelectionMeta(items)
        setErrorNotice({
          title: '배당 또는 상태 변경',
          message: '선택한 마켓의 상태 또는 배당이 변경되었습니다. 최신 값으로 갱신했으니 다시 확인해 주세요.',
        })
        return
      }
    }

    if (selectedOutcomePriceChanges.size > 0) {
      console.warn(`${BETSLIP_SYNC_LOG_PREFIX} blocked_submit_price_change`, {
        chainId: chainId ?? null,
        environment: environment ?? null,
        itemCount: items.length,
        priceChanges: Array.from(selectedOutcomePriceChanges.entries()).map(([key, value]) => ({
          selectionKey: key,
          previousOdds: value.previousOdds,
          currentOdds: value.currentOdds,
        })),
      })
      syncSelectionMeta(items)
      setErrorNotice({
        title: '배당 변경',
        message: '선택한 배당이 방금 변경되었습니다. 최신 값으로 갱신했으니 다시 한 번 확인해 주세요.',
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
