import type { GameItem, MarketSection, SelectionItem, SelectionKey } from '../../types/ui'
import { translate } from '../../i18n'
import { selectionKey } from './selection'

type BetslipItemLike = {
  conditionId: string
  outcomeId: string
  gameId?: string
}

export const buildSelectedOutcomes = (items: BetslipItemLike[]): Set<SelectionKey> =>
  new Set(items.map((item) => selectionKey(item.conditionId, item.outcomeId)))

export const buildOutcomeMeta = (
  sections: MarketSection[],
): Map<SelectionKey, { label: string; odds: number; conditionState: string; gameId: string; marketTitle: string; gameTitle?: string }> => {
  const map = new Map<SelectionKey, { label: string; odds: number; conditionState: string; gameId: string; marketTitle: string; gameTitle?: string }>()

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
  outcomeMeta: Map<SelectionKey, { label: string; odds: number; gameId: string; gameTitle?: string }>,
  games: GameItem[],
): SelectionItem[] =>
  items.map((item) => {
    const key = selectionKey(item.conditionId, item.outcomeId)
    const meta = outcomeMeta.get(key)
    const gameId = meta?.gameId ?? item.gameId
    const gameTitle = games.find((game) => game.gameId === gameId)?.title ?? meta?.gameTitle

    return {
      conditionId: item.conditionId,
      outcomeId: item.outcomeId,
      gameTitle: gameTitle ?? translate('games.game'),
      label: meta?.label ?? translate('betslip.selectionItem'),
      odds: meta?.odds ?? 0,
    }
  })
