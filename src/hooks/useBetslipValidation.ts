import { useMemo } from 'react'
import type { MarketSection } from '../types/ui'
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
}

export function useBetslipValidation({
  items,
  marketSections,
  mergedOutcomeMeta,
  disableReason,
  totalOdds,
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

  return {
    currentOutcomeStateMap,
    displayDisableReason,
    sdkConditionStateMismatch,
    uiSelectionAllowed,
  }
}
