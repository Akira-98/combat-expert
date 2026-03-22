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

function buildDefaultEventId(now = new Date()) {
  return `sync-${now.toISOString().slice(0, 10)}`
}

export function printUsage() {
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

export function parseCliArgs(args) {
  return {
    source: readArgValue(args, '--source').trim().toLowerCase(),
    eventId: (readArgValue(args, '--event-id') || buildDefaultEventId()).trim(),
    gameIds: parseGameIds(args),
    days: Math.max(1, Number.parseInt(readArgValue(args, '--days') || '3', 10) || 3),
    limit: Math.max(1, Number.parseInt(readArgValue(args, '--limit') || '30', 10) || 30),
    shouldApply: hasFlag(args, '--apply'),
    includeMultiples: hasFlag(args, '--include-multiples'),
    baseUrl: (readArgValue(args, '--base-url') || process.env.RANKING_SYNC_BASE_URL || 'http://127.0.0.1:3000').trim(),
    secret: (readArgValue(args, '--secret') || process.env.RANKING_SYNC_SECRET || '').trim(),
    marketApiUrl: (readArgValue(args, '--market-api-url') || process.env.ONCHAINFEED_API_URL || 'https://api.onchainfeed.org/api/v1/public').trim(),
    environment: (readArgValue(args, '--environment') || process.env.ONCHAINFEED_ENVIRONMENT || 'PolygonUSDT').trim(),
  }
}

export function shouldResolveGamesFromSource({ source, gameIds }) {
  return gameIds.length === 0 && (source === 'combat-feed' || source === 'settled-mma' || source === 'settled-bets-mma')
}

export function ensureRequiredInput({ eventId, gameIds, secret }) {
  if (!eventId || gameIds.length === 0) {
    printUsage()
    process.exit(1)
  }

  if (!secret) {
    console.error('Missing ranking sync secret. Set RANKING_SYNC_SECRET or pass --secret.')
    process.exit(1)
  }
}
