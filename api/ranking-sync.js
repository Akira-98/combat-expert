import { loadServerEnv, normalizeAddress } from './_lib/env.js'
import { allowMethods, sendJson } from './_lib/http.js'
import { isAuthorizedRankingSyncRequest } from './_lib/rankingAuth.js'
import { applyRankingEvent } from './_lib/rankingStore.js'
import { fetchGamesByIds, fetchSettledV3BetsByGameId } from './_lib/azuro.js'

function normalizeEntityId(value, maxLength = 160) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.slice(0, maxLength)
}

function normalizeResult(value) {
  if (typeof value !== 'string') return ''
  const normalized = value.trim().toLowerCase()
  return normalized === 'win' || normalized === 'lose' || normalized === 'void' ? normalized : ''
}

function normalizeOdds(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN
}

function normalizeResolvedAt(value) {
  const isoString = typeof value === 'string' ? value.trim() : ''
  if (!isoString) return ''
  const timestamp = Date.parse(isoString)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : ''
}

function normalizeGameIds(value) {
  if (!Array.isArray(value)) return []

  return [...new Set(value.map((item) => normalizeEntityId(item, 120)).filter(Boolean))]
}

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 1
}

function normalizeSyncEntry(input, index) {
  const walletAddress = normalizeAddress(input?.walletAddress)
  const eventId = normalizeEntityId(input?.eventId, 120)
  const betTokenId = normalizeEntityId(input?.betTokenId, 120)
  const gameId = normalizeEntityId(input?.gameId, 120) || null
  const marketId = normalizeEntityId(input?.marketId, 120) || null
  const selectionId = normalizeEntityId(input?.selectionId, 120) || null
  const result = normalizeResult(input?.result)
  const odds = normalizeOdds(input?.odds)
  const resolvedAt = normalizeResolvedAt(input?.resolvedAt)

  if (!walletAddress) return { error: `entries[${index}].walletAddress is invalid` }
  if (!eventId) return { error: `entries[${index}].eventId is required` }
  if (!betTokenId) return { error: `entries[${index}].betTokenId is required` }
  if (!result) return { error: `entries[${index}].result is invalid` }
  if (!Number.isFinite(odds)) return { error: `entries[${index}].odds must be greater than 0` }
  if (!resolvedAt) return { error: `entries[${index}].resolvedAt is invalid` }

  return {
    walletAddress,
    eventId,
    betTokenId,
    gameId,
    marketId,
    selectionId,
    result,
    odds,
    resolvedAt,
  }
}

function mapRawBetResult(rawBet) {
  const result = typeof rawBet?.result === 'string' ? rawBet.result.toLowerCase() : ''
  const status = typeof rawBet?.status === 'string' ? rawBet.status.toLowerCase() : ''

  if (result === 'won') return 'win'
  if (result === 'lost') return 'lose'
  if (status === 'canceled') return 'void'
  return ''
}

function normalizeRawBetOdds(rawBet) {
  const settledOdds = Number(rawBet?.settledOdds)
  if (Number.isFinite(settledOdds) && settledOdds > 0) return settledOdds

  const betOdds = Number(rawBet?.odds)
  if (Number.isFinite(betOdds) && betOdds > 0) return betOdds

  const selectionOdds = Number(rawBet?.selections?.[0]?.odds)
  return Number.isFinite(selectionOdds) && selectionOdds > 0 ? selectionOdds : NaN
}

function normalizeRawBetResolvedAt(rawBet) {
  const rawValue = rawBet?.resolvedBlockTimestamp
  if (rawValue === null || rawValue === undefined) return ''

  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed <= 0) return ''

  const timestampMs = parsed > 1_000_000_000_000 ? parsed : parsed * 1000
  return new Date(timestampMs).toISOString()
}

function buildSyncEntriesFromRawBets({ eventId, rawBets, includeMultiples = false }) {
  const entriesByBetTokenId = new Map()
  const skipped = {
    nonSingleCount: 0,
    invalidCount: 0,
    duplicateCount: 0,
  }

  for (const rawBet of rawBets) {
    const tokenId = normalizeEntityId(rawBet?.betId, 120)
    if (!tokenId) {
      skipped.invalidCount += 1
      continue
    }

    if (entriesByBetTokenId.has(tokenId)) {
      skipped.duplicateCount += 1
      continue
    }

    const selections = Array.isArray(rawBet?.selections) ? rawBet.selections : []
    if (!includeMultiples && selections.length !== 1) {
      skipped.nonSingleCount += 1
      continue
    }

    const primarySelection = selections[0]
    const walletAddress = normalizeAddress(rawBet?.actor)
    const result = mapRawBetResult(rawBet)
    const odds = normalizeRawBetOdds(rawBet)
    const resolvedAt = normalizeRawBetResolvedAt(rawBet)
    const gameId = normalizeEntityId(primarySelection?.outcome?.condition?.gameId, 120)
    const marketId = normalizeEntityId(primarySelection?.outcome?.condition?.conditionId, 120)
    const selectionId = normalizeEntityId(primarySelection?.outcome?.outcomeId, 120)

    if (!walletAddress || !result || !Number.isFinite(odds) || !resolvedAt || !gameId || !marketId || !selectionId) {
      skipped.invalidCount += 1
      continue
    }

    entriesByBetTokenId.set(tokenId, {
      walletAddress,
      eventId,
      betTokenId: tokenId,
      gameId,
      marketId,
      selectionId,
      result,
      odds,
      resolvedAt,
    })
  }

  return {
    entries: [...entriesByBetTokenId.values()],
    skipped,
  }
}

async function buildEntriesFromSelectedGames({ eventId, gameIds, includeMultiples }) {
  const games = await fetchGamesByIds(gameIds)
  const rawBetPages = await Promise.all(gameIds.map((gameId) => fetchSettledV3BetsByGameId(gameId)))
  const discoveredRawBets = rawBetPages.flat()

  const { entries, skipped } = buildSyncEntriesFromRawBets({
    eventId,
    rawBets: discoveredRawBets,
    includeMultiples,
  })

  return {
    entries,
    skipped,
    games: games.map((game) => ({
      gameId: normalizeEntityId(game?.gameId, 120),
      slug: normalizeEntityId(game?.slug, 160) || null,
      title: normalizeEntityId(game?.title, 200) || null,
      startsAt: typeof game?.startsAt === 'string' ? game.startsAt : null,
      state: typeof game?.state === 'string' ? game.state : null,
      leagueName: typeof game?.league?.name === 'string' ? game.league.name : null,
    })),
    fetchedGameCount: gameIds.length,
    rawBetCount: discoveredRawBets.length,
  }
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const { supabaseUrl, serviceRoleKey, rankingSyncSecret } = loadServerEnv()

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  if (!rankingSyncSecret) {
    return sendJson(res, 500, { error: 'Ranking sync env is missing' })
  }

  if (!isAuthorizedRankingSyncRequest(req, rankingSyncSecret)) {
    return sendJson(res, 401, { error: 'Unauthorized' })
  }

  const eventId = normalizeEntityId(req.body?.eventId, 120)
  const dryRun = normalizeBoolean(req.query?.dryRun) || normalizeBoolean(req.body?.dryRun)
  const includeMultiples = normalizeBoolean(req.body?.includeMultiples)
  const rawEntries = Array.isArray(req.body?.entries) ? req.body.entries : []
  const gameIds = normalizeGameIds(req.body?.gameIds)

  if (!rawEntries.length && (!eventId || gameIds.length === 0)) {
    return sendJson(res, 400, { error: 'entries or eventId with gameIds is required' })
  }

  let normalizedEntries = []
  let orchestrationMeta = null

  if (rawEntries.length > 0) {
    for (const [index, rawEntry] of rawEntries.entries()) {
      const normalized = normalizeSyncEntry(rawEntry, index)
      if ('error' in normalized) {
        return sendJson(res, 400, { error: normalized.error })
      }
      normalizedEntries.push(normalized)
    }
  } else {
    try {
      orchestrationMeta = await buildEntriesFromSelectedGames({
        eventId,
        gameIds,
        includeMultiples,
      })
      normalizedEntries = orchestrationMeta.entries
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return sendJson(res, 500, { error: message })
    }
  }

  const orchestrationSkippedCount = orchestrationMeta
    ? orchestrationMeta.skipped.nonSingleCount + orchestrationMeta.skipped.invalidCount + orchestrationMeta.skipped.duplicateCount
    : 0

  if (normalizedEntries.length === 0) {
    return sendJson(res, 200, {
      dryRun,
      processedCount: 0,
      insertedCount: 0,
      skippedCount: orchestrationSkippedCount,
      results: [],
      orchestration: orchestrationMeta,
    })
  }

  if (dryRun) {
    return sendJson(res, 200, {
      dryRun: true,
      processedCount: normalizedEntries.length,
      insertedCount: 0,
      skippedCount: orchestrationSkippedCount,
      results: normalizedEntries,
      orchestration: orchestrationMeta,
    })
  }

  try {
    const results = []

    for (const entry of normalizedEntries) {
      const applied = await applyRankingEvent({
        supabaseUrl,
        serviceRoleKey,
        walletAddress: entry.walletAddress,
        eventId: entry.eventId,
        betTokenId: entry.betTokenId,
        gameId: entry.gameId,
        marketId: entry.marketId,
        selectionId: entry.selectionId,
        result: entry.result,
        odds: entry.odds,
        resolvedAt: entry.resolvedAt,
      })

      results.push({
        walletAddress: entry.walletAddress,
        eventId: entry.eventId,
        betTokenId: entry.betTokenId,
        inserted: applied.inserted,
        totalScore: applied.totalScore,
        underdogBonus: applied.underdogBonus,
      })
    }

    const insertedCount = results.filter((result) => result.inserted).length

    return sendJson(res, 200, {
      dryRun: false,
      processedCount: results.length,
      insertedCount,
      skippedCount: results.length - insertedCount,
      results,
      orchestration: orchestrationMeta,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return sendJson(res, 500, { error: message })
  }
}
