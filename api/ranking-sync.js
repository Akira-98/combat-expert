import { loadServerEnv } from './_lib/env.js'
import { allowMethods, sendJson } from './_lib/http.js'
import { isAuthorizedRankingSyncRequest } from './_lib/rankingAuth.js'
import {
  applyRankingSyncEntries,
  buildEntriesFromSelectedGames,
  normalizeBoolean,
  normalizeGameIds,
  normalizeRankingSyncEventId,
  normalizeSyncEntries,
  summarizeSkippedEntries,
} from './_lib/rankingSync.js'

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

  const eventId = normalizeRankingSyncEventId(req.body?.eventId)
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
    const normalizedResult = normalizeSyncEntries(rawEntries)
    if (normalizedResult.error) {
      return sendJson(res, 400, { error: normalizedResult.error })
    }

    normalizedEntries = normalizedResult.entries
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

  const orchestrationSkippedCount = summarizeSkippedEntries(orchestrationMeta)

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
    const results = await applyRankingSyncEntries({ supabaseUrl, serviceRoleKey, entries: normalizedEntries })
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
