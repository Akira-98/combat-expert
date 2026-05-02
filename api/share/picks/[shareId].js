import { loadServerEnv } from '../../_lib/env.js'
import { fetchReferralShareById } from '../../_lib/referralStore.js'

const SITE_URL = 'https://combatexpert.xyz'
const DEFAULT_TITLE = 'Combat Expert Picks'
const DEFAULT_DESCRIPTION = 'Open this shared Combat Expert betslip.'

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

function shortenWallet(wallet) {
  const value = String(wallet || '').trim()
  return value.length >= 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : ''
}

function buildDescription(share) {
  const count = Array.isArray(share?.selections) ? share.selections.length : 0
  const wallet = shortenWallet(share?.referrerWallet)
  const prefix = count > 0 ? `${count}-pick Combat Expert betslip` : DEFAULT_DESCRIPTION
  return wallet ? `${prefix} shared by ${wallet}.` : prefix
}

function sendShareHtml(res, { title, description, shareUrl, appUrl, imageUrl }) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600')

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

  const shareId = firstQueryValue(req.query.shareId)
  if (!shareId) {
    res.status(400).send('Missing shareId')
    return
  }

  const encodedShareId = encodeURIComponent(shareId)
  const shareUrl = `${SITE_URL}/share/picks/${encodedShareId}`
  const appUrl = `${SITE_URL}/?shareId=${encodedShareId}`
  const imageUrl = `${SITE_URL}/og/picks/${encodedShareId}`
  let description = DEFAULT_DESCRIPTION

  try {
    const { supabaseUrl, serviceRoleKey } = loadServerEnv()
    const result = await fetchReferralShareById({ supabaseUrl, serviceRoleKey, shareId })
    if (result.ok) description = buildDescription(result.share)
  } catch (error) {
    console.error(error)
  }

  sendShareHtml(res, {
    title: DEFAULT_TITLE,
    description,
    shareUrl,
    appUrl,
    imageUrl,
  })
}
