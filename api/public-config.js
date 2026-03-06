const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const FALLBACK_POLYGON_RPC_URL = 'https://polygon-rpc.com'

function normalizePolygonRpcUrl(rpcUrl) {
  const trimmed = (rpcUrl || '').trim()
  if (!trimmed) return ''

  // The bare Ankr endpoint requires an API key and returns 401 for public traffic.
  if (trimmed === 'https://rpc.ankr.com/polygon') {
    return FALLBACK_POLYGON_RPC_URL
  }

  return trimmed
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode)
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.send(JSON.stringify(payload))
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const config = {
    affiliateAddress: process.env.AFFILIATE || ZERO_ADDRESS,
    rpcUrl: normalizePolygonRpcUrl(process.env.RPC_URL),
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || '',
    privyAppId: process.env.PRIVY_APP_ID || '',
    ablyChannel: process.env.ABLY_CHANNEL || 'chat:ufc:live',
  }

  if (!config.rpcUrl || !config.privyAppId || !config.walletConnectProjectId) {
    return sendJson(res, 500, { error: 'Missing required server env configuration' })
  }

  return sendJson(res, 200, config)
}
