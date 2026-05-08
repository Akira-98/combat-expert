import { fetchGamesByIds } from '../../_lib/azuro.js'
import { getParticipantImageUrls, getParticipantNames, MarketOgImage } from '../../_lib/marketOgImage.js'
import { fetchMarketPreviewByGameId } from '../../_lib/marketManager.js'
import { firstQueryValue, h, sendPngImage } from '../../_lib/ogImage.js'

const FALLBACK_MARKET_PREVIEW = { marketTitle: 'Market', outcomes: [] }

async function sendMarketImage(res, { game, marketPreview = FALLBACK_MARKET_PREVIEW, participantImages = [] }) {
  await sendPngImage(
    res,
    h(MarketOgImage, {
      game,
      marketPreview,
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

  const gameId = firstQueryValue(req.query.gameId)
  if (!gameId) {
    res.status(400).send('Missing gameId')
    return
  }

  try {
    const [game] = await fetchGamesByIds([gameId])
    const participants = getParticipantNames(game)
    const participantImages = getParticipantImageUrls(game).slice(0, 2)
    const marketPreview = await fetchMarketPreviewByGameId(gameId, participants)

    await sendMarketImage(res, {
      game,
      marketPreview,
      participantImages,
    })
  } catch (error) {
    console.error(error)
    await sendMarketImage(res, {})
  }
}
