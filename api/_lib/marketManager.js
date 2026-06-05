import { getMarketKey, getMarketName, getSelectionName } from '@azuro-org/dictionaries'
import { chainsData } from '@azuro-org/toolkit'

const POLYGON_CHAIN_ID = 137
const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

function getMarketManagerConfig() {
  const chainData = chainsData[POLYGON_CHAIN_ID]
  return {
    apiBaseUrl: chainData.api,
    environment: chainData.environment,
  }
}

function safeDictionaryLookup(lookup, fallback) {
  try {
    return lookup()
  } catch {
    return fallback
  }
}

function getApiTitle(title) {
  const value = String(title || '').trim()
  return value || undefined
}

function isExtendedCondition(conditionId) {
  return String(conditionId || '')[0] === '5'
}

function getMarketIdentity(condition, representativeOutcomeId) {
  const apiMarketName = getApiTitle(condition?.title)
  const shouldPreferApiTitle = isExtendedCondition(condition?.conditionId)
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

function getSelectionTitle(conditionId, outcome) {
  const apiOutcomeTitle = getApiTitle(outcome?.title)
  if (isExtendedCondition(conditionId) && apiOutcomeTitle) return apiOutcomeTitle

  return safeDictionaryLookup(
    () => getSelectionName({ outcomeId: outcome.outcomeId, withPoint: true }),
    apiOutcomeTitle || `Outcome ${outcome.outcomeId}`,
  )
}

function outcomeOrderPriority(selectionName) {
  const raw = selectionName.trim().toLowerCase()
  if (raw === '1') return 0
  if (raw === 'x' || raw === 'draw') return 1
  if (raw === '2') return 2
  return 10
}

function marketGroupPriority(market) {
  const key = `${market.marketKey} ${market.name}`.toLowerCase()

  if (/1x2|winner|match result|full time result|결과/.test(key)) return 0
  if (/double chance|더블 찬스/.test(key)) return 1
  if (/total|over\/under|totals|언더오버|오버\/언더/.test(key)) return 2
  if (/both teams to score|btts/.test(key)) return 3
  if (/handicap|spread|핸디캡/.test(key)) return 4
  return 10
}

function normalizeOutcomeLabel(selectionName, participants) {
  const raw = String(selectionName || '').trim()
  const normalized = raw.toLowerCase()

  if (raw === '1') return participants[0] || 'Competitor A'
  if (raw === '2') return participants[1] || 'Competitor B'
  if (normalized === 'x' || normalized === 'draw') return 'Draw'
  return raw || 'Outcome'
}

export async function fetchMarketManagerConditionsByGameIds(gameIds, { extended = true } = {}) {
  if (gameIds.length === 0) return []

  const { apiBaseUrl, environment } = getMarketManagerConfig()
  const response = await fetch(`${apiBaseUrl}/market-manager/conditions-by-game-ids`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      environment,
      gameIds,
      extended,
    }),
  })

  if (!response.ok) {
    throw new Error(`Market Manager request failed (${response.status})`)
  }

  const payload = await response.json()
  return Array.isArray(payload?.conditions) ? payload.conditions : []
}

export function mapConditionsToMarketSections(conditions, participants = []) {
  const groupedMarkets = new Map()

  conditions.forEach((condition) => {
    const representativeOutcomeId = condition?.outcomes?.[0]?.outcomeId
    if (!representativeOutcomeId) return

    const { marketKey, marketName } = getMarketIdentity(condition, representativeOutcomeId)
    const market = groupedMarkets.get(marketKey) ?? {
      marketKey,
      name: marketName,
      conditions: [],
    }

    market.conditions.push({
      state: condition.state,
      outcomes: condition.outcomes.map((outcome) => {
        const selectionName = getSelectionTitle(condition.conditionId, outcome)

        return {
          conditionId: condition.conditionId,
          outcomeId: outcome.outcomeId,
          conditionState: condition.state,
          isExpressForbidden: condition.isExpressForbidden,
          selectionName: normalizeOutcomeLabel(selectionName, participants),
          odds: typeof outcome.odds === 'number' ? outcome.odds : Number(outcome.odds),
        }
      }),
    })

    groupedMarkets.set(marketKey, market)
  })

  return [...groupedMarkets.values()]
    .sort((a, b) => {
      const priorityDiff = marketGroupPriority(a) - marketGroupPriority(b)
      if (priorityDiff !== 0) return priorityDiff
      return (a.name || a.marketKey).localeCompare(b.name || b.marketKey, 'en')
    })
    .map((market, index) => ({
      id: `${market.marketKey}-${index}`,
      title: market.name || `Market #${index + 1}`,
      outcomes: market.conditions
        .flatMap((condition) => condition.outcomes)
        .filter((outcome) => Number.isFinite(outcome.odds) && outcome.odds > 0)
        .sort((a, b) => {
          const priorityDiff = outcomeOrderPriority(a.selectionName) - outcomeOrderPriority(b.selectionName)
          if (priorityDiff !== 0) return priorityDiff
          return a.selectionName.localeCompare(b.selectionName, 'en')
        }),
    }))
}

export async function fetchMarketPreviewByGameId(gameId, participants = []) {
  const conditions = await fetchMarketManagerConditionsByGameIds([gameId])
  const sections = mapConditionsToMarketSections(conditions, participants)
  const primarySection = sections.find((section) => section.outcomes.length > 0)

  return {
    marketTitle: primarySection?.title || 'Market',
    outcomes: primarySection?.outcomes.slice(0, 3) ?? [],
  }
}
