import { loadServerEnv } from './_lib/env.js'
import { fetchFightersByAzuroNames, normalizeFighterNames } from './_lib/fighterStore.js'
import { allowMethods, sendJson, sendServerError } from './_lib/http.js'

function getRequestedNames(req) {
  const queryNames = req.query?.names ?? req.query?.name
  if (queryNames) return normalizeFighterNames(queryNames)

  const requestUrl = new URL(req.url || '/', 'http://localhost')
  return normalizeFighterNames([
    ...requestUrl.searchParams.getAll('names'),
    ...requestUrl.searchParams.getAll('name'),
  ])
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return

  const { supabaseUrl, serviceRoleKey } = loadServerEnv()

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  const names = getRequestedNames(req)
  if (names.length === 0) return sendJson(res, 200, { fighters: [] })

  try {
    const fighters = await fetchFightersByAzuroNames({ supabaseUrl, serviceRoleKey, names })
    return sendJson(res, 200, { fighters })
  } catch (error) {
    return sendServerError(res, error, 'Failed to load fighters')
  }
}
