import { useMemo } from 'react'
import type { GameItem, MarketSection } from '../types/ui'
import { buildSelectedOutcomes, mapBetslipToSelectionItems } from '../helpers/mappers'
import { useBetslipSelectionMeta } from './useBetslipSelectionMeta'
import { useBetslipValidation } from './useBetslipValidation'

type BetslipItemLike = {
  conditionId: string
  outcomeId: string
  gameId: string
}

type UseBettingSelectionStateParams = {
  items: BetslipItemLike[]
  games: GameItem[]
  marketSections: MarketSection[]
  disableReason?: string
  totalOdds: number
}

export function useBettingSelectionState({
  items,
  games,
  marketSections,
  disableReason,
  totalOdds,
}: UseBettingSelectionStateParams) {
  const selectedOutcomes = useMemo(() => buildSelectedOutcomes(items), [items])
  const selectionMeta = useBetslipSelectionMeta({
    marketSections,
    selectedOutcomes,
  })
  const selectionItems = useMemo(
    () => mapBetslipToSelectionItems(items, selectionMeta.mergedOutcomeMeta, games),
    [games, items, selectionMeta.mergedOutcomeMeta],
  )
  const validation = useBetslipValidation({
    items,
    marketSections,
    mergedOutcomeMeta: selectionMeta.mergedOutcomeMeta,
    disableReason,
    totalOdds,
  })

  return {
    selectedOutcomes,
    selectionItems,
    ...selectionMeta,
    ...validation,
  }
}
