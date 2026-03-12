import type { MarketSection, SelectionItem, SelectionKey } from '../../types/ui'
import { selectionKey } from './selection'

type BetslipItemLike = {
  conditionId: string
  outcomeId: string
}

export const buildSelectedOutcomes = (items: BetslipItemLike[]): Set<SelectionKey> =>
  new Set(items.map((item) => selectionKey(item.conditionId, item.outcomeId)))

export const buildOutcomeMeta = (
  sections: MarketSection[],
): Map<SelectionKey, { label: string; odds: number; conditionState: string; gameId: string; marketTitle: string }> => {
  const map = new Map<SelectionKey, { label: string; odds: number; conditionState: string; gameId: string; marketTitle: string }>()

  sections.forEach((section) => {
    section.outcomes.forEach((outcome) => {
      map.set(selectionKey(outcome.conditionId, outcome.outcomeId), {
        label: `${section.title} · ${outcome.selectionName}`,
        odds: outcome.odds,
        conditionState: outcome.conditionState,
        gameId: outcome.gameId,
        marketTitle: section.title,
      })
    })
  })

  return map
}

export const mapBetslipToSelectionItems = (
  items: BetslipItemLike[],
  outcomeMeta: Map<SelectionKey, { label: string; odds: number }>,
): SelectionItem[] =>
  items.map((item) => {
    const key = selectionKey(item.conditionId, item.outcomeId)
    const meta = outcomeMeta.get(key)
    return {
      conditionId: item.conditionId,
      outcomeId: item.outcomeId,
      label: meta?.label ?? '선택 항목',
      odds: meta?.odds ?? 0,
    }
  })
