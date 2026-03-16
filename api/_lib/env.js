const FALLBACK_POLYGON_RPC_URL = 'https://polygon-rpc.com'

export function normalizePolygonRpcUrl(rpcUrl) {
  const trimmed = (rpcUrl || '').trim()
  if (!trimmed) return ''
  if (trimmed === 'https://rpc.ankr.com/polygon') return FALLBACK_POLYGON_RPC_URL
  return trimmed
}

export function normalizeAddress(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim().toLowerCase()
  return /^0x[a-f0-9]{40}$/.test(trimmed) ? trimmed : ''
}

export function parseIssuedAt(value) {
  const timestamp = Date.parse(String(value || ''))
  return Number.isFinite(timestamp) ? timestamp : NaN
}

export function loadServerEnv() {
  return {
    supabaseUrl: (process.env.SUPABASE_URL || '').trim(),
    serviceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    rpcUrl: normalizePolygonRpcUrl(process.env.RPC_URL),
    commentAuthSecret: (process.env.COMMENT_AUTH_JWT_SECRET || '').trim(),
  }
}
