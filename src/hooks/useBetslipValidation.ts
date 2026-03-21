import { useEffect, useMemo } from 'react'
import type { MarketSection } from '../types/ui'

const BETSLIP_SYNC_LOG_PREFIX = '[CombatExpert][betslip-sync]'
const SDK_CONDITION_STATE_MISMATCH_WARN_DELAY_MS = 400

type BetslipItemLike = {
  conditionId: string
  outcomeId: string
  gameId: string
  isExpressForbidden?: boolean
}

type OutcomeMeta = {
  conditionState: string
  odds: number
  marketTitle: string
}

type UseBetslipValidationParams = {
  items: BetslipItemLike[]
  marketSections: MarketSection[]
  mergedOutcomeMeta: Map<string, OutcomeMeta>
  disableReason?: string
  totalOdds: number
  isMarketsLoading?: boolean
}

export function useBetslipValidation({
  items,
  marketSections,
  mergedOutcomeMeta,
  disableReason,
  totalOdds,
  isMarketsLoading = false,
}: UseBetslipValidationParams) {
  const currentOutcomeStateMap = useMemo(() => {
    const map = new Map<string, OutcomeMeta>()

    mergedOutcomeMeta.forEach((meta, key) => {
      map.set(key, {
        conditionState: meta.conditionState,
        odds: meta.odds,
        marketTitle: meta.marketTitle,
      })
    })

    marketSections.forEach((section) => {
      section.outcomes.forEach((outcome) => {
        map.set(`${outcome.conditionId}-${outcome.outcomeId}`, {
          conditionState: outcome.conditionState,
          odds: outcome.odds,
          marketTitle: section.title,
        })
      })
    })

    return map
  }, [marketSections, mergedOutcomeMeta])

  const localDisableReason = useMemo(() => {
    if (items.length > 1) {
      const uniqueGameIds = new Set(items.map((item) => item.gameId))
      if (uniqueGameIds.size !== items.length) return 'ComboWithSameGame'
      if (items.some((item) => item.isExpressForbidden)) return 'ComboWithForbiddenItem'
    }

    for (const item of items) {
      const meta = currentOutcomeStateMap.get(`${item.conditionId}-${item.outcomeId}`)
      if (!meta) continue
      if (meta.conditionState !== 'Active') return 'ConditionState'
      if (!Number.isFinite(meta.odds) || meta.odds <= 1) return 'ConditionState'
    }

    return undefined
  }, [currentOutcomeStateMap, items])

  const localTotalOdds = useMemo(() => {
    if (items.length === 0) return 0

    let product = 1
    for (const item of items) {
      const meta = currentOutcomeStateMap.get(`${item.conditionId}-${item.outcomeId}`)
      if (!meta || !Number.isFinite(meta.odds) || meta.odds <= 1) {
        return 0
      }
      product *= meta.odds
    }

    return product
  }, [currentOutcomeStateMap, items])

  const sdkDisableReason = disableReason && disableReason !== 'ConditionState' ? disableReason : undefined
  const shouldIgnoreStaleTotalOddsTooLow =
    sdkDisableReason === 'TotalOddsTooLow' &&
    ((Number.isFinite(totalOdds) && totalOdds > 1) || (Number.isFinite(localTotalOdds) && localTotalOdds > 1))
  const displayDisableReason = localDisableReason
    ?? (shouldIgnoreStaleTotalOddsTooLow ? undefined : sdkDisableReason)
  const uiSelectionAllowed = !displayDisableReason
  const sdkConditionStateMismatch = disableReason === 'ConditionState' && !localDisableReason
  const mismatchDiagnostics = useMemo(() => (
    items.map((item) => {
      const selectionKey = `${item.conditionId}-${item.outcomeId}`
      const localMeta = currentOutcomeStateMap.get(selectionKey)
      return {
        conditionId: item.conditionId,
        outcomeId: item.outcomeId,
        gameId: item.gameId,
        localConditionState: localMeta?.conditionState ?? 'missing',
        localOdds: localMeta?.odds ?? null,
        marketTitle: localMeta?.marketTitle ?? null,
      }
    })
  ), [currentOutcomeStateMap, items])

  useEffect(() => {
    if (!sdkConditionStateMismatch || isMarketsLoading || items.length === 0) return

    const timeoutId = window.setTimeout(() => {
      console.warn(`${BETSLIP_SYNC_LOG_PREFIX} sdk_condition_state_mismatch`, {
        itemCount: items.length,
        sdkDisableReason: disableReason,
        localDisableReason,
        totalOdds,
        localTotalOdds,
        items: mismatchDiagnostics,
      })
    }, SDK_CONDITION_STATE_MISMATCH_WARN_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [disableReason, isMarketsLoading, items.length, localDisableReason, localTotalOdds, mismatchDiagnostics, sdkConditionStateMismatch, totalOdds])

  return {
    currentOutcomeStateMap,
    displayDisableReason,
    sdkConditionStateMismatch,
    uiSelectionAllowed,
  }
}
