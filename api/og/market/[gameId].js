import { fetchGamesByIds } from '../../_lib/azuro.js'
import { fetchExistingFighterImage, getParticipantNames, MarketOgImage } from '../../_lib/marketOgImage.js'
import { fetchMarketPreviewByGameId } from '../../_lib/marketManager.js'
import { firstQueryValue, getRequestOrigin, h, sendPngImage } from '../../_lib/ogImage.js'

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
    const origin = getRequestOrigin(req)
    const [game] = await fetchGamesByIds([gameId])
    const participants = getParticipantNames(game)
    const [leftImage, rightImage, marketPreview] = await Promise.all([
      fetchExistingFighterImage(origin, participants[0]),
      fetchExistingFighterImage(origin, participants[1]),
      fetchMarketPreviewByGameId(gameId, participants),
    ])

    await sendMarketImage(res, {
      game,
      marketPreview,
      fighterImages: [leftImage, rightImage],
    })
  } catch (error) {
    console.error(error)
    await sendMarketImage(res, {})
  }
}
