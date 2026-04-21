import { loadServerEnv, normalizeAddress } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import { fetchUserPoints } from '../_lib/pointStore.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return

  const { supabaseUrl, serviceRoleKey } = loadServerEnv()
  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  const walletAddress = normalizeAddress(req.query?.walletAddress || req.query?.address)
  if (!walletAddress) {
    return sendJson(res, 400, { error: 'Invalid wallet address' })
  }

  try {
    const points = await fetchUserPoints({ supabaseUrl, serviceRoleKey, walletAddress })
    return sendJson(res, 200, points)
  } catch (error) {
    return sendServerError(res, error, 'Failed to load points')
  }
}
