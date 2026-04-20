import { fetchGamesByIds } from '../../_lib/azuro.js'

const SITE_URL = 'https://combatexpert.xyz'
const DEFAULT_TITLE = 'Combat Expert'
const DEFAULT_DESCRIPTION = 'Explore MMA fights, markets, and betting trends in real time.'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

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

  return [leagueName, formattedStart, 'Market is live on Combat Expert.'].filter(Boolean).join(' · ')
}

function sendShareHtml(res, { title, description, shareUrl, appUrl }) {
  const imageUrl = shareUrl.replace('/share/market/', '/og/market/')

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Combat Expert" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(appUrl)}" />
    <script>location.replace(${JSON.stringify(appUrl)})</script>
  </head>
  <body>
    <a href="${escapeHtml(appUrl)}">Open Combat Expert</a>
  </body>
</html>`)
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
  })
}
