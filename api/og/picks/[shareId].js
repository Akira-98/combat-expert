import { fetchGamesByIds } from '../../_lib/azuro.js'
import { loadServerEnv } from '../../_lib/env.js'
import { getParticipantImageUrls, getParticipantNames } from '../../_lib/marketOgImage.js'
import { firstQueryValue, h, sendPngImage } from '../../_lib/ogImage.js'
import { PicksOgImage } from '../../_lib/picksOgImage.js'
import { fetchReferralShareById } from '../../_lib/referralStore.js'

const FALLBACK_SHARE = {
  referrerWallet: '',
  selections: [],
}

function getGameId(game) {
  return game?.gameId || game?.id || ''
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))]
}

async function sendPicksImage(res, { share = FALLBACK_SHARE, games = [], participantImages = [] }) {
  await sendPngImage(
    res,
    h(PicksOgImage, {
      share,
      games,
      participantImages,
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
    const visibleSelections = Array.isArray(share.selections) ? share.selections.slice(0, 4) : []
    const gameIds = uniqueValues(visibleSelections.map((selection) => selection?.gameId))
    const games = await fetchGamesByIds(gameIds)
    const visibleGameIds = new Set(gameIds)
    const participantImages = games
      .filter((game) => visibleGameIds.has(getGameId(game)))
      .flatMap((game) => {
        const names = getParticipantNames(game)
        const imageUrls = getParticipantImageUrls(game)
        return names.slice(0, 2).map((name, index) => ({
          name,
          imageUrl: imageUrls[index],
        }))
      })

    await sendPicksImage(res, {
      share,
      games,
      participantImages,
    })
  } catch (error) {
    console.error(error)
    await sendPicksImage(res, {})
  }
}
