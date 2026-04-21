import { loadServerEnv } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import { verifyFrontendBetClaim } from '../_lib/pointEligibility.js'
import { awardBetParticipationPoints } from '../_lib/pointStore.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const { affiliateAddress, supabaseUrl, serviceRoleKey } = loadServerEnv()

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    const result = await verifyFrontendBetClaim({
      txHash: req.body?.txHash,
      walletAddress: req.body?.walletAddress,
      affiliateAddress,
    })

    const statusCode = result.status === 'invalid_tx_hash' || result.status === 'invalid_wallet_address' ? 400 : 200
    if (!result.eligible) {
      return sendJson(res, statusCode, result)
    }

    const pointAward = await awardBetParticipationPoints({
      supabaseUrl,
      serviceRoleKey,
      walletAddress: result.walletAddress,
      bet: result.bet,
      txHash: result.txHash,
    })

    return sendJson(res, 200, {
      ...result,
      points: {
        awarded: pointAward.inserted,
        totalPoints: pointAward.totalPoints,
      },
    })
  } catch (error) {
    return sendServerError(res, error, 'Failed to claim bet participation points')
  }
}
