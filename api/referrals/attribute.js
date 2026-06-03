import { loadServerEnv } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import { createReferralAttribution } from '../_lib/referralAttribution.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const { supabaseUrl, serviceRoleKey } = loadServerEnv()
  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    const result = await createReferralAttribution({
      supabaseUrl,
      serviceRoleKey,
      code: req.body?.code,
      referredWallet: req.body?.referredWallet,
    })

    if (!result.ok) {
      const statusCode = result.status === 'self_referral' ? 409 : 400
      return sendJson(res, statusCode, result)
    }

    return sendJson(res, 200, result)
  } catch (error) {
    return sendServerError(res, error, 'Failed to attribute referral')
  }
}
