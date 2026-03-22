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

function readArgValue(args, flag) {
  const index = args.indexOf(flag)
  if (index === -1) return ''
  return args[index + 1] || ''
}

function hasFlag(args, flag) {
  return args.includes(flag)
}

function parseGameIds(args) {
  const values = []

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== '--game-id' && args[index] !== '--game-ids') continue
    const rawValue = args[index + 1] || ''
    rawValue
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value) => values.push(value))
  }

  return [...new Set(values)]
}

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 1
}

function buildDefaultEventId(now = new Date()) {
  return `sync-${now.toISOString().slice(0, 10)}`
}

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

function printUsage() {
  console.log(`Usage:
  npm run ranking:sync -- --event-id <eventId> --game-id <gameId> [--game-id <gameId> ...] [--apply]
  npm run ranking:sync -- --source combat-feed [--limit 30] [--apply]
  npm run ranking:sync -- --source settled-mma [--limit 30] [--apply]
  npm run ranking:sync -- --source settled-bets-mma [--days 3] [--limit 30] [--apply]

Options:
  --event-id <value>        Ranking batch identifier. Defaults to sync-YYYY-MM-DD.
  --game-id <value>         Single gameId. Repeatable.
  --game-ids <a,b,c>        Comma-separated gameIds.
  --source combat-feed      Resolve gameIds from the current combat feed selection.
  --source settled-mma      Resolve gameIds from recently finished UFC/MMA games.
  --source settled-bets-mma Resolve gameIds from recently settled UFC/MMA bets.
  --days <value>            Lookback days for --source settled-bets-mma. Defaults to 3.
  --limit <value>           Game limit for --source combat-feed. Defaults to 30.
  --apply                   Execute sync. Default is dry-run preview.
  --include-multiples       Include parlays/multi-selection bets.
  --base-url <url>          API base URL. Defaults to RANKING_SYNC_BASE_URL or http://127.0.0.1:3000
  --secret <value>          Sync secret. Defaults to RANKING_SYNC_SECRET
  --market-api-url <url>    Market manager base URL. Defaults to ONCHAINFEED_API_URL or public API.
  --environment <value>     Market manager environment. Defaults to ONCHAINFEED_ENVIRONMENT or PolygonUSDT.
`)
}

async function main() {
  const args = process.argv.slice(2)
  const source = readArgValue(args, '--source').trim().toLowerCase()
  const eventId = (readArgValue(args, '--event-id') || buildDefaultEventId()).trim()
  let gameIds = parseGameIds(args)
  const days = Math.max(1, Number.parseInt(readArgValue(args, '--days') || '3', 10) || 3)
  const limit = Math.max(1, Number.parseInt(readArgValue(args, '--limit') || '30', 10) || 30)
  const shouldApply = hasFlag(args, '--apply')
  const includeMultiples = hasFlag(args, '--include-multiples')
  const baseUrl = (readArgValue(args, '--base-url') || process.env.RANKING_SYNC_BASE_URL || 'http://127.0.0.1:3000').trim()
  const secret = (readArgValue(args, '--secret') || process.env.RANKING_SYNC_SECRET || '').trim()
  const marketApiUrl = (readArgValue(args, '--market-api-url') || process.env.ONCHAINFEED_API_URL || 'https://api.onchainfeed.org/api/v1/public').trim()
  const environment = (readArgValue(args, '--environment') || process.env.ONCHAINFEED_ENVIRONMENT || 'PolygonUSDT').trim()

  if (gameIds.length === 0 && (source === 'combat-feed' || source === 'settled-mma' || source === 'settled-bets-mma')) {
    const sourceMeta =
      source === 'settled-bets-mma'
        ? await fetchRecentSettledMmaGames({ days, limit })
        : {
            games:
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
                  }),
          }
    const games = sourceMeta.games

    gameIds = games.map((game) => String(game?.gameId || '')).filter(Boolean)

    console.log(
      JSON.stringify(
        {
          source,
          eventId,
          environment,
          ...(source === 'settled-bets-mma'
            ? {
                days,
                recentSettledBetCount: sourceMeta.recentSettledBetCount,
                candidateGameCount: sourceMeta.candidateGameCount,
              }
            : {}),
          selectedGameCount: gameIds.length,
          selectedGames: games.map((game) => ({
            gameId: String(game?.gameId || ''),
            title: typeof game?.title === 'string' ? game.title : null,
            startsAt: typeof game?.startsAt === 'string' ? game.startsAt : null,
            leagueName: typeof game?.league?.name === 'string' ? game.league.name : null,
          })),
        },
        null,
        2,
      ),
    )
  }

  if (!eventId || gameIds.length === 0) {
    printUsage()
    process.exit(1)
  }

  if (!secret) {
    console.error('Missing ranking sync secret. Set RANKING_SYNC_SECRET or pass --secret.')
    process.exit(1)
  }

  const url = new URL('/api/ranking-sync', baseUrl)
  if (!shouldApply) {
    url.searchParams.set('dryRun', '1')
  }

  const payload = {
    eventId,
    gameIds,
    includeMultiples,
  }

  if (normalizeBoolean(process.env.RANKING_SYNC_VERBOSE)) {
    console.log(JSON.stringify({ requestUrl: url.toString(), payload }, null, 2))
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    console.error(`Ranking sync failed (${response.status}).`)
    console.error(JSON.stringify(result, null, 2))
    process.exit(1)
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
