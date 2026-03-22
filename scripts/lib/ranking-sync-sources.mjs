import { chainsData, getGamesByIds as getToolkitGamesByIds } from '@azuro-org/toolkit'

const POLYGON_CHAIN_ID = 137
const RECENT_SETTLED_BETS_PAGE_SIZE = 200
const RECENT_SETTLED_BETS_QUERY = `
  query RecentSettledBets($first: Int!, $skip: Int!, $where: V3_Bet_filter!) {
    v3Bets(
      first: $first
      skip: $skip
      where: $where
      orderBy: resolvedBlockTimestamp
      orderDirection: desc
      subgraphError: allow
    ) {
      betId
      resolvedBlockTimestamp
      selections {
        outcome {
          condition {
            gameId
          }
        }
      }
    }
  }
`

function getPolygonChainData() {
  return chainsData[POLYGON_CHAIN_ID]
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`)
  }
  return response.json()
}

function mergeUniqueGames(...gameGroups) {
  const seen = new Set()

  return gameGroups.flat().filter((game) => {
    const gameId = typeof game?.gameId === 'string' ? game.gameId : ''
    if (!gameId || seen.has(gameId)) return false
    seen.add(gameId)
    return true
  })
}

async function fetchCombatGames({
  apiBaseUrl,
  environment,
  limit,
  gameState,
  conditionState,
  orderDirection = 'asc',
}) {
  const buildUrl = (extraParams = {}) => {
    const params = new URLSearchParams({
      environment,
      gameState,
      orderBy: 'startsAt',
      orderDirection,
      page: '1',
      perPage: String(limit),
      ...extraParams,
    })

    if (conditionState) {
      params.set('conditionState', conditionState)
    }

    return `${apiBaseUrl}/market-manager/games-by-filters?${params.toString()}`
  }

  const ufcPayload = await fetchJson(buildUrl({ leagueSlug: 'ufc' }))
  const ufcGames = Array.isArray(ufcPayload?.games) ? ufcPayload.games : []

  if (ufcGames.length >= limit) {
    return ufcGames
  }

  const mmaPayload = await fetchJson(buildUrl({ sportSlug: 'mma' }))
  const mmaGames = Array.isArray(mmaPayload?.games) ? mmaPayload.games : []

  return mergeUniqueGames(ufcGames, mmaGames)
}

async function fetchCombatFeedGames({ apiBaseUrl, environment, limit }) {
  return fetchCombatGames({
    apiBaseUrl,
    environment,
    limit,
    gameState: 'Prematch',
    conditionState: 'Active',
    orderDirection: 'asc',
  })
}

async function fetchSettledMmaGames({ apiBaseUrl, environment, limit }) {
  const finishedGames = await fetchCombatGames({
    apiBaseUrl,
    environment,
    limit,
    gameState: 'Finished',
    orderDirection: 'desc',
  })

  if (finishedGames.length >= limit) {
    return finishedGames.slice(0, limit)
  }

  const stoppedGames = await fetchCombatGames({
    apiBaseUrl,
    environment,
    limit,
    gameState: 'Stopped',
    orderDirection: 'desc',
  })

  const mergedWithStopped = mergeUniqueGames(finishedGames, stoppedGames)
  if (mergedWithStopped.length >= limit) {
    return mergedWithStopped.slice(0, limit)
  }

  const canceledGames = await fetchCombatGames({
    apiBaseUrl,
    environment,
    limit,
    gameState: 'Canceled',
    orderDirection: 'desc',
  })

  return mergeUniqueGames(mergedWithStopped, canceledGames).slice(0, limit)
}

function chunkArray(values, chunkSize) {
  const chunks = []

  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize))
  }

  return chunks
}

async function fetchGraphqlJson(url, { query, variables }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed (${response.status}) for ${url}`)
  }

  const payload = await response.json()
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    throw new Error(payload.errors[0]?.message || 'GraphQL response contained errors')
  }

  return payload
}

async function fetchRecentSettledMmaGames({ days, limit }) {
  const chainData = getPolygonChainData()
  const resolvedTimestampGte = Math.max(0, Math.floor(Date.now() / 1000) - days * 24 * 60 * 60)
  const discoveredGameIds = new Set()
  const settledBets = []
  let skip = 0
  let pageCount = 0

  while (pageCount < 10 && discoveredGameIds.size < limit * 8) {
    const payload = await fetchGraphqlJson(chainData.graphql.bets, {
      query: RECENT_SETTLED_BETS_QUERY,
      variables: {
        first: RECENT_SETTLED_BETS_PAGE_SIZE,
        skip,
        where: {
          status_in: ['Resolved', 'Canceled'],
          resolvedBlockTimestamp_gte: resolvedTimestampGte,
        },
      },
    })

    const page = Array.isArray(payload?.data?.v3Bets) ? payload.data.v3Bets : []
    if (page.length === 0) {
      break
    }

    settledBets.push(...page)

    for (const bet of page) {
      const selections = Array.isArray(bet?.selections) ? bet.selections : []
      for (const selection of selections) {
        const gameId = typeof selection?.outcome?.condition?.gameId === 'string' ? selection.outcome.condition.gameId : ''
        if (gameId) {
          discoveredGameIds.add(gameId)
        }
      }
    }

    if (page.length < RECENT_SETTLED_BETS_PAGE_SIZE) {
      break
    }

    skip += RECENT_SETTLED_BETS_PAGE_SIZE
    pageCount += 1
  }

  const allGameIds = [...discoveredGameIds]
  if (allGameIds.length === 0) {
    return {
      games: [],
      recentSettledBetCount: settledBets.length,
      candidateGameCount: 0,
    }
  }

  const gameChunks = chunkArray(allGameIds, 100)
  const gamePages = await Promise.all(
    gameChunks.map((gameIds) =>
      getToolkitGamesByIds({
        chainId: POLYGON_CHAIN_ID,
        gameIds,
      }),
    ),
  )

  const games = gamePages.flat()
  const mmaGames = games.filter((game) => {
    const leagueName = typeof game?.league?.name === 'string' ? game.league.name.toLowerCase() : ''
    const sportSlug = typeof game?.sport?.slug === 'string' ? game.sport.slug.toLowerCase() : ''
    const sportName = typeof game?.sport?.name === 'string' ? game.sport.name.toLowerCase() : ''

    return leagueName.includes('ufc') || sportSlug === 'mma' || sportName === 'mma'
  })

  return {
    games: mergeUniqueGames(mmaGames).slice(0, limit),
    recentSettledBetCount: settledBets.length,
    candidateGameCount: allGameIds.length,
  }
}

export async function resolveSourceMeta({ source, days, limit, marketApiUrl, environment }) {
  if (source === 'settled-bets-mma') {
    return fetchRecentSettledMmaGames({ days, limit })
  }

  const games =
    source === 'settled-mma'
      ? await fetchSettledMmaGames({
          apiBaseUrl: marketApiUrl,
          environment,
          limit,
        })
      : await fetchCombatFeedGames({
          apiBaseUrl: marketApiUrl,
          environment,
          limit,
        })

  return { games }
}
