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

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`)
  }
  return response.json()
}

async function fetchCombatFeedGames({ apiBaseUrl, environment, limit }) {
  const buildUrl = (extraParams = {}) => {
    const params = new URLSearchParams({
      environment,
      gameState: 'Prematch',
      conditionState: 'Active',
      orderBy: 'startsAt',
      orderDirection: 'asc',
      page: '1',
      perPage: String(limit),
      ...extraParams,
    })

    return `${apiBaseUrl}/market-manager/games-by-filters?${params.toString()}`
  }

  const ufcPayload = await fetchJson(buildUrl({ leagueSlug: 'ufc' }))
  const ufcGames = Array.isArray(ufcPayload?.games) ? ufcPayload.games : []

  if (ufcGames.length >= limit) {
    return ufcGames
  }

  const mmaPayload = await fetchJson(buildUrl({ sportSlug: 'mma' }))
  const mmaGames = Array.isArray(mmaPayload?.games) ? mmaPayload.games : []
  const seen = new Set()

  return [...ufcGames, ...mmaGames].filter((game) => {
    const gameId = typeof game?.gameId === 'string' ? game.gameId : ''
    if (!gameId || seen.has(gameId)) return false
    seen.add(gameId)
    return true
  })
}

function printUsage() {
  console.log(`Usage:
  npm run ranking:sync -- --event-id <eventId> --game-id <gameId> [--game-id <gameId> ...] [--apply]
  npm run ranking:sync -- --source combat-feed [--limit 30] [--apply]

Options:
  --event-id <value>        Ranking batch identifier. Defaults to sync-YYYY-MM-DD.
  --game-id <value>         Single gameId. Repeatable.
  --game-ids <a,b,c>        Comma-separated gameIds.
  --source combat-feed      Resolve gameIds from the current combat feed selection.
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
  const limit = Math.max(1, Number.parseInt(readArgValue(args, '--limit') || '30', 10) || 30)
  const shouldApply = hasFlag(args, '--apply')
  const includeMultiples = hasFlag(args, '--include-multiples')
  const baseUrl = (readArgValue(args, '--base-url') || process.env.RANKING_SYNC_BASE_URL || 'http://127.0.0.1:3000').trim()
  const secret = (readArgValue(args, '--secret') || process.env.RANKING_SYNC_SECRET || '').trim()
  const marketApiUrl = (readArgValue(args, '--market-api-url') || process.env.ONCHAINFEED_API_URL || 'https://api.onchainfeed.org/api/v1/public').trim()
  const environment = (readArgValue(args, '--environment') || process.env.ONCHAINFEED_ENVIRONMENT || 'PolygonUSDT').trim()

  if (gameIds.length === 0 && source === 'combat-feed') {
    const games = await fetchCombatFeedGames({
      apiBaseUrl: marketApiUrl,
      environment,
      limit,
    })

    gameIds = games.map((game) => String(game?.gameId || '')).filter(Boolean)

    console.log(
      JSON.stringify(
        {
          source: 'combat-feed',
          eventId,
          environment,
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
