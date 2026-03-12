import type {
  MarketManagerConditionsResponse,
  MarketManagerGamesResponse,
} from '../types/marketManager'

type FetchGamesByFiltersParams = {
  apiBaseUrl: string
  environment: string
  fallbackMessage: string
  extraParams?: Record<string, string>
  page?: number
  perPage?: number
}

type FetchConditionsByGameIdsParams = {
  apiBaseUrl: string
  environment: string
  gameIds: string[]
}

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const

export async function fetchMarketManagerGamesByFilters({
  apiBaseUrl,
  environment,
  fallbackMessage,
  extraParams = {},
  page = 1,
  perPage = 30,
}: FetchGamesByFiltersParams) {
  const params = new URLSearchParams({
    environment,
    gameState: 'Prematch',
    conditionState: 'Active',
    orderBy: 'startsAt',
    orderDirection: 'asc',
    page: String(page),
    perPage: String(perPage),
    ...extraParams,
  })

  const response = await fetch(`${apiBaseUrl}/market-manager/games-by-filters?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`${fallbackMessage} (${response.status})`)
  }

  const payload = (await response.json()) as MarketManagerGamesResponse
  return payload.games ?? []
}

export async function fetchMarketManagerConditionsByGameIds({
  apiBaseUrl,
  environment,
  gameIds,
}: FetchConditionsByGameIdsParams) {
  const response = await fetch(`${apiBaseUrl}/market-manager/conditions-by-game-ids`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      environment,
      gameIds,
    }),
  })

  if (!response.ok) {
    throw new Error(`마켓 정보 요청 실패 (${response.status})`)
  }

  const payload = (await response.json()) as MarketManagerConditionsResponse
  return payload.conditions ?? []
}
