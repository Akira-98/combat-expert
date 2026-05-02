import { loadServerEnv } from '../../_lib/env.js'
import { fetchReferralShareById } from '../../_lib/referralStore.js'
import { firstQueryValue, sendShareHtml, SITE_URL } from '../../_lib/shareHtml.js'

const DEFAULT_TITLE = 'Combat Expert Picks'
const DEFAULT_DESCRIPTION = 'Open this shared Combat Expert betslip.'

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
    cacheControl: 's-maxage=120, stale-while-revalidate=600',
  })
}
