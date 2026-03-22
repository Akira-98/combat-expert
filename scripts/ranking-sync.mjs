import { ensureRequiredInput, parseCliArgs, shouldResolveGamesFromSource } from './lib/ranking-sync-cli.mjs'
import { buildSourcePreview } from './lib/ranking-sync-preview.mjs'
import { resolveSourceMeta } from './lib/ranking-sync-sources.mjs'

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 1
}

async function postRankingSync({ baseUrl, secret, shouldApply, payload }) {
  const url = new URL('/api/ranking-sync', baseUrl)
  if (!shouldApply) {
    url.searchParams.set('dryRun', '1')
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

async function main() {
  const cli = parseCliArgs(process.argv.slice(2))
  let { gameIds } = cli

  if (shouldResolveGamesFromSource(cli)) {
    const sourceMeta = await resolveSourceMeta(cli)
    const games = sourceMeta.games

    gameIds = games.map((game) => String(game?.gameId || '')).filter(Boolean)

    console.log(JSON.stringify(buildSourcePreview({ ...cli, gameIds, games, sourceMeta }), null, 2))
  }

  ensureRequiredInput({ eventId: cli.eventId, gameIds, secret: cli.secret })

  await postRankingSync({
    baseUrl: cli.baseUrl,
    secret: cli.secret,
    shouldApply: cli.shouldApply,
    payload: {
      eventId: cli.eventId,
      gameIds,
      includeMultiples: cli.includeMultiples,
    },
  })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
