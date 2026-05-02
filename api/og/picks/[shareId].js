import { fetchGamesByIds } from '../../_lib/azuro.js'
import { loadServerEnv } from '../../_lib/env.js'
import { fetchExistingFighterImage, getParticipantNames } from '../../_lib/marketOgImage.js'
import { firstQueryValue, getRequestOrigin, h, sendPngImage } from '../../_lib/ogImage.js'
import { PicksOgImage } from '../../_lib/picksOgImage.js'
import { fetchReferralShareById } from '../../_lib/referralStore.js'

const FALLBACK_SHARE = {
  referrerWallet: '',
  selections: [],
}

async function sendPicksImage(res, { share = FALLBACK_SHARE, game, fighterImages = [] }) {
  await sendPngImage(
    res,
    h(PicksOgImage, {
      share,
      game,
      fighterImages,
    }),
  )
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).send('Method not allowed')
    return
  }

  const shareId = firstQueryValue(req.query.shareId)
  if (!shareId) {
    res.status(400).send('Missing shareId')
    return
  }

  try {
    const { supabaseUrl, serviceRoleKey } = loadServerEnv()
    const shareResult = await fetchReferralShareById({ supabaseUrl, serviceRoleKey, shareId })
    if (!shareResult.ok) {
      await sendPicksImage(res, {})
      return
    }

    const share = shareResult.share
    const representativeGameId = share.selections?.[0]?.gameId
    const [game] = representativeGameId ? await fetchGamesByIds([representativeGameId]) : []
    const origin = getRequestOrigin(req)
    const participants = getParticipantNames(game)
    const fighterImages = await Promise.all([
      fetchExistingFighterImage(origin, participants[0]),
      fetchExistingFighterImage(origin, participants[1]),
    ])

    await sendPicksImage(res, {
      share,
      game,
      fighterImages,
    })
  } catch (error) {
    console.error(error)
    await sendPicksImage(res, {})
  }
}
