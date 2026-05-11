import { fetchGamesByIds } from '../../_lib/azuro.js'
import { firstQueryValue, sendShareHtml, SITE_URL } from '../../_lib/shareHtml.js'

const DEFAULT_TITLE = 'BETAKER'
const DEFAULT_DESCRIPTION = 'Decentralized betting, share your picks, take your bets.'

function getParticipantNames(game) {
  if (!Array.isArray(game?.participants)) return []

  return game.participants
    .map((participant) => participant?.name)
    .filter((name) => typeof name === 'string' && name.trim())
}

function buildDescription(game) {
  if (!game) return DEFAULT_DESCRIPTION

  const leagueName = typeof game.league?.name === 'string' ? game.league.name : 'MMA'
  const startsAt = game.startsAt ? new Date(game.startsAt) : undefined
  const formattedStart = startsAt && Number.isFinite(startsAt.getTime())
    ? new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(startsAt)
    : ''

  return [leagueName, formattedStart, 'Market is live on BETAKER.'].filter(Boolean).join(' · ')
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

  const encodedGameId = encodeURIComponent(gameId)
  const shareUrl = `${SITE_URL}/share/market/${encodedGameId}`
  const appUrl = `${SITE_URL}/?game=${encodedGameId}`
  const imageUrl = `${SITE_URL}/og/market/${encodedGameId}`
  let title = DEFAULT_TITLE
  let description = DEFAULT_DESCRIPTION

  try {
    const [game] = await fetchGamesByIds([gameId])
    const participantTitle = getParticipantNames(game).join(' vs ')

    title = game?.title || participantTitle || DEFAULT_TITLE
    description = buildDescription(game)
  } catch (error) {
    console.error(error)
  }

  sendShareHtml(res, {
    title,
    description,
    shareUrl,
    appUrl,
    imageUrl,
  })
}
