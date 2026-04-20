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

  if (raw === '1') return participants[0] || 'Fighter A'
  if (raw === '2') return participants[1] || 'Fighter B'
  if (normalized === 'x' || normalized === 'draw') return 'Draw'
  return raw || 'Outcome'
}

export async function fetchMarketManagerConditionsByGameIds(gameIds) {
  if (gameIds.length === 0) return []

  const { apiBaseUrl, environment } = getMarketManagerConfig()
  const response = await fetch(`${apiBaseUrl}/market-manager/conditions-by-game-ids`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      environment,
      gameIds,
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

    const marketKey = safeDictionaryLookup(() => getMarketKey(representativeOutcomeId), `condition-${condition.conditionId}`)
    const marketName = safeDictionaryLookup(
      () => getMarketName({ outcomeId: representativeOutcomeId }) || `Market ${marketKey}`,
      `Market ${marketKey}`,
    )
    const market = groupedMarkets.get(marketKey) ?? {
      marketKey,
      name: marketName,
      conditions: [],
    }

    market.conditions.push({
      state: condition.state,
      outcomes: condition.outcomes.map((outcome) => {
        const selectionName = safeDictionaryLookup(
          () => getSelectionName({ outcomeId: outcome.outcomeId, withPoint: true }),
          outcome.title || `Outcome ${outcome.outcomeId}`,
        )

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
