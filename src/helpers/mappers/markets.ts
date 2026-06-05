import { getMarketKey, getMarketName, getSelectionName } from '@azuro-org/dictionaries'
import type { MarketSection, OutcomeItem } from '../../types/ui'
import type { MarketManagerCondition } from '../../types/marketManager'

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
  const name = market.name.trim().toLowerCase()
  const key = `${market.marketKey} ${market.name}`.toLowerCase()
  const isPeriodSpecific = /\b(1st|2nd|first|second)\s+half\b|\bhalf\s*time\b/.test(name)

  if (!isPeriodSpecific && /^(full[\s-]*time result|full[\s-]*time 1x2)$/.test(name)) return 0
  if (!isPeriodSpecific && /^(1x2|match result|3[\s-]*way result)$/.test(name)) return 1
  if (!isPeriodSpecific && /^(winner|match winner)$/.test(name)) return 2
  if (/double chance/.test(key)) return 3
  if (/total|over\/under|totals/.test(key)) return 4
  if (/both teams to score|btts/.test(key)) return 5
  if (/handicap|spread/.test(key)) return 6
  return 10
}

export const mapMarketsToSections = (markets: MarketLike[]): MarketSection[] =>
  [...markets]
    .sort((a, b) => {
      const priorityDiff = marketGroupPriority(a) - marketGroupPriority(b)
      if (priorityDiff !== 0) return priorityDiff
      return (a.name || a.marketKey).localeCompare(b.name || b.marketKey, 'en')
    })
    .map((market, index) => {
      const outcomes = market.conditions
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
          return a.selectionName.localeCompare(b.selectionName, 'en')
        })

      return {
        id: `${market.marketKey}-${index}`,
        title: market.name || `Market #${index + 1}`,
        outcomes,
      }
    })
    .filter((section) => section.outcomes.length > 0)

const safeDictionaryLookup = <T>(lookup: () => T, fallback: T) => {
  try {
    return lookup()
  } catch {
    return fallback
  }
}

const getApiTitle = (title?: string | null) => {
  const value = title?.trim()
  return value || undefined
}

const isExtendedCondition = (conditionId: string) => conditionId[0] === '5'
const isActiveCondition = (condition: MarketManagerCondition) => condition.state === 'Active'

const getMarketIdentity = (condition: MarketManagerCondition, representativeOutcomeId: string) => {
  const apiMarketName = getApiTitle(condition.title)
  const shouldPreferApiTitle = isExtendedCondition(condition.conditionId)
  const dictionaryMarketKey = safeDictionaryLookup(() => getMarketKey(representativeOutcomeId), undefined)
  const marketKey = shouldPreferApiTitle && apiMarketName
    ? `extended-${apiMarketName.toLowerCase()}`
    : dictionaryMarketKey ?? `condition-${condition.conditionId}`
  const dictionaryMarketName = dictionaryMarketKey
    ? safeDictionaryLookup(() => getMarketName({ outcomeId: representativeOutcomeId }) || undefined, undefined)
    : undefined
  const marketName = shouldPreferApiTitle
    ? apiMarketName ?? dictionaryMarketName ?? `Market ${marketKey}`
    : dictionaryMarketName ?? apiMarketName ?? `Market ${marketKey}`

  return { marketKey, marketName }
}

const getSelectionTitle = (conditionId: string, outcome: MarketManagerCondition['outcomes'][number]) => {
  const apiOutcomeTitle = getApiTitle(outcome.title)
  if (isExtendedCondition(conditionId) && apiOutcomeTitle) return apiOutcomeTitle

  return safeDictionaryLookup(
    () => getSelectionName({ outcomeId: outcome.outcomeId, withPoint: true }),
    apiOutcomeTitle || `Outcome ${outcome.outcomeId}`,
  )
}

export const mapMarketManagerConditionsToMarkets = (conditions: MarketManagerCondition[]): MarketLike[] => {
  const groupedMarkets = new Map<string, MarketLike>()

  conditions.forEach((condition) => {
    if (!isActiveCondition(condition)) return

    const representativeOutcomeId = condition.outcomes[0]?.outcomeId
    if (!representativeOutcomeId) return

    const { marketKey, marketName } = getMarketIdentity(condition, representativeOutcomeId)

    const market = groupedMarkets.get(marketKey) ?? {
      marketKey,
      name: marketName,
      conditions: [],
    }

    market.conditions.push({
      state: condition.state,
      outcomes: condition.outcomes.map((outcome) => ({
        conditionId: condition.conditionId,
        outcomeId: outcome.outcomeId,
        gameId: condition.game.gameId,
        isExpressForbidden: condition.isExpressForbidden,
        selectionName: getSelectionTitle(condition.conditionId, outcome),
        odds: typeof outcome.odds === 'number' ? outcome.odds : Number(outcome.odds),
      })),
    })

    groupedMarkets.set(marketKey, market)
  })

  return [...groupedMarkets.values()]
}
