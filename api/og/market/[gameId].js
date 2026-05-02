import { fetchGamesByIds } from '../../_lib/azuro.js'
import { loadServerEnv } from '../../_lib/env.js'
import { fetchFighterImages, getParticipantNames, MarketOgImage } from '../../_lib/marketOgImage.js'
import { fetchMarketPreviewByGameId } from '../../_lib/marketManager.js'
import { firstQueryValue, h, sendPngImage } from '../../_lib/ogImage.js'

const FALLBACK_MARKET_PREVIEW = { marketTitle: 'Market', outcomes: [] }

async function sendMarketImage(res, { game, marketPreview = FALLBACK_MARKET_PREVIEW, fighterImages = [] }) {
  await sendPngImage(
    res,
    h(MarketOgImage, {
      game,
      marketPreview,
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

  const gameId = firstQueryValue(req.query.gameId)
  if (!gameId) {
    res.status(400).send('Missing gameId')
    return
  }

  try {
    const { supabaseUrl, serviceRoleKey } = loadServerEnv()
    const [game] = await fetchGamesByIds([gameId])
    const participants = getParticipantNames(game)
    const [fighterImages, marketPreview] = await Promise.all([
      fetchFighterImages({
        supabaseUrl,
        serviceRoleKey,
        names: participants.slice(0, 2),
      }),
      fetchMarketPreviewByGameId(gameId, participants),
    ])

    await sendMarketImage(res, {
      game,
      marketPreview,
      fighterImages,
    })
  } catch (error) {
    console.error(error)
    await sendMarketImage(res, {})
  }
}
