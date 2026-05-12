import { loadServerEnv } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import { verifyFrontendBetClaim } from '../_lib/pointEligibility.js'
import { awardPickShareBetPoints } from '../_lib/pointStore.js'
import { fetchPickShareById, validatePickShareBet } from '../_lib/pickShareStore.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const { affiliateAddress, supabaseUrl, serviceRoleKey } = loadServerEnv()
  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    const shareResult = await fetchPickShareById({
      supabaseUrl,
      serviceRoleKey,
      shareId: req.body?.shareId,
    })

    if (!shareResult.ok) {
      const statusCode = shareResult.status === 'invalid_share_id' ? 400 : shareResult.status === 'not_found' ? 404 : 409
      return sendJson(res, statusCode, shareResult)
    }

    const betResult = await verifyFrontendBetClaim({
      txHash: req.body?.txHash,
      walletAddress: req.body?.bettorWallet,
      affiliateAddress,
    })

    const betStatusCode = betResult.status === 'invalid_tx_hash' || betResult.status === 'invalid_wallet_address' ? 400 : 200
    if (!betResult.eligible) {
      return sendJson(res, betStatusCode, betResult)
    }

    const validation = validatePickShareBet({
      share: shareResult.share,
      bettorWallet: betResult.walletAddress,
      txHash: betResult.txHash,
      bet: betResult.bet,
    })

    if (!validation.ok) {
      const statusCode = validation.status === 'self_share' ? 409 : 400
      return sendJson(res, statusCode, validation)
    }

    const pointAward = await awardPickShareBetPoints({
      supabaseUrl,
      serviceRoleKey,
      referrerWallet: validation.sharerWallet,
      bettorWallet: validation.bettorWallet,
      share: shareResult.share,
      bet: betResult.bet,
      txHash: validation.txHash,
    })

    return sendJson(res, 200, {
      ok: true,
      status: pointAward.inserted ? 'awarded' : 'already_awarded',
      points: {
        awarded: pointAward.inserted,
        totalPoints: pointAward.totalPoints,
      },
    })
  } catch (error) {
    return sendServerError(res, error, 'Failed to award pick share points')
  }
}
