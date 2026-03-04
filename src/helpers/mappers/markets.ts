import type { MarketSection, OutcomeItem } from '../../types/ui'

type MarketOutcomeLike = {
  conditionId: string
  outcomeId: string
  gameId: string
  isExpressForbidden: boolean
  selectionName: string
  odds: number
}

type MarketLike = {
  marketKey: string
  name: string
  conditions: Array<{ state: string; outcomes: MarketOutcomeLike[] }>
}

const outcomeOrderPriority = (selectionName: string) => {
  const raw = selectionName.trim().toLowerCase()
  if (raw === '1') return 0
  if (raw === 'x' || raw === 'draw') return 1
  if (raw === '2') return 2
  return 10
}

const marketGroupPriority = (market: Pick<MarketLike, 'marketKey' | 'name'>) => {
  const key = `${market.marketKey} ${market.name}`.toLowerCase()

  if (/1x2|winner|match result|full time result|결과/.test(key)) return 0
  if (/double chance|더블 찬스/.test(key)) return 1
  if (/total|over\/under|totals|언더오버|오버\/언더/.test(key)) return 2
  if (/both teams to score|btts/.test(key)) return 3
  if (/handicap|spread|핸디캡/.test(key)) return 4
  return 10
}

export const mapMarketsToSections = (markets: MarketLike[]): MarketSection[] =>
  [...markets]
    .sort((a, b) => {
      const priorityDiff = marketGroupPriority(a) - marketGroupPriority(b)
      if (priorityDiff !== 0) return priorityDiff
      return (a.name || a.marketKey).localeCompare(b.name || b.marketKey, 'ko')
    })
    .map((market, index) => ({
      id: `${market.marketKey}-${index}`,
      title: market.name || `Market #${index + 1}`,
      outcomes: market.conditions
        .flatMap((condition) =>
          condition.outcomes.map<OutcomeItem>((outcome) => ({
            conditionId: outcome.conditionId,
            outcomeId: outcome.outcomeId,
            gameId: outcome.gameId,
            conditionState: condition.state,
            isExpressForbidden: outcome.isExpressForbidden,
            selectionName: outcome.selectionName,
            odds: outcome.odds,
          })),
        )
        .sort((a, b) => {
          const priorityDiff = outcomeOrderPriority(a.selectionName) - outcomeOrderPriority(b.selectionName)
          if (priorityDiff !== 0) return priorityDiff
          return a.selectionName.localeCompare(b.selectionName, 'ko')
        }),
    }))
