import { createPublicClient, http } from 'viem'
import { polygon } from 'viem/chains'

const PROFILE_MESSAGE_PREFIX = 'Combat Expert nickname update'
const PROFILE_MESSAGE_TTL_MS = 5 * 60 * 1000
const FALLBACK_POLYGON_RPC_URL = 'https://polygon-rpc.com'

function sendJson(res, statusCode, payload) {
  res.status(statusCode)
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.send(JSON.stringify(payload))
}

function normalizePolygonRpcUrl(rpcUrl) {
  const trimmed = (rpcUrl || '').trim()
  if (!trimmed) return ''
  if (trimmed === 'https://rpc.ankr.com/polygon') return FALLBACK_POLYGON_RPC_URL
  return trimmed
}

function normalizeAddress(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim().toLowerCase()
  return /^0x[a-f0-9]{40}$/.test(trimmed) ? trimmed : ''
}

function normalizeNickname(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, 24)
}

function buildProfileMessage({ address, nickname, issuedAt }) {
  const nicknameLine = nickname || '(clear)'
  return [
    PROFILE_MESSAGE_PREFIX,
    `Address: ${address}`,
    `Nickname: ${nicknameLine}`,
    `Issued At: ${issuedAt}`,
  ].join('\n')
}

function parseIssuedAt(value) {
  const timestamp = Date.parse(String(value || ''))
  return Number.isFinite(timestamp) ? timestamp : NaN
}

async function fetchProfile({ supabaseUrl, serviceRoleKey, address }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?wallet_address=eq.${encodeURIComponent(address)}&select=wallet_address,nickname`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Failed to fetch profile')
  }

  const rows = await response.json()
  const profile = Array.isArray(rows) ? rows[0] : undefined
  return {
    address,
    nickname: typeof profile?.nickname === 'string' && profile.nickname.trim() ? profile.nickname : null,
  }
}

async function upsertProfile({ supabaseUrl, serviceRoleKey, address, nickname }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({
      wallet_address: address,
      nickname,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Failed to save profile')
  }

  const rows = await response.json()
  const profile = Array.isArray(rows) ? rows[0] : undefined
  return {
    address,
    nickname: typeof profile?.nickname === 'string' && profile.nickname.trim() ? profile.nickname : null,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const supabaseUrl = (process.env.SUPABASE_URL || '').trim()
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const rpcUrl = normalizePolygonRpcUrl(process.env.RPC_URL)

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    if (req.method === 'GET') {
      const address = normalizeAddress(req.query?.address)
      if (!address) return sendJson(res, 400, { error: 'Invalid address' })

      const profile = await fetchProfile({ supabaseUrl, serviceRoleKey, address })
      return sendJson(res, 200, profile)
    }

    const address = normalizeAddress(req.body?.address)
    const nickname = normalizeNickname(req.body?.nickname)
    const message = typeof req.body?.message === 'string' ? req.body.message : ''
    const signature = typeof req.body?.signature === 'string' ? req.body.signature : ''
    const issuedAt = typeof req.body?.issuedAt === 'string' ? req.body.issuedAt : ''

    if (!address || !message || !signature || !issuedAt) {
      return sendJson(res, 400, { error: 'Missing required fields' })
    }

    const issuedAtMs = parseIssuedAt(issuedAt)
    if (!Number.isFinite(issuedAtMs) || Math.abs(Date.now() - issuedAtMs) > PROFILE_MESSAGE_TTL_MS) {
      return sendJson(res, 400, { error: 'Expired signature request' })
    }

    const expectedMessage = buildProfileMessage({ address, nickname, issuedAt })
    if (message !== expectedMessage) {
      return sendJson(res, 400, { error: 'Invalid signature payload' })
    }

    if (!rpcUrl) {
      return sendJson(res, 500, { error: 'RPC_URL is not set' })
    }

    const publicClient = createPublicClient({
      chain: polygon,
      transport: http(rpcUrl),
    })

    const isValid = await publicClient.verifyMessage({
      address,
      message,
      signature,
    })

    if (!isValid) {
      return sendJson(res, 401, { error: 'Signature verification failed' })
    }

    const profile = await upsertProfile({ supabaseUrl, serviceRoleKey, address, nickname })
    return sendJson(res, 200, profile)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return sendJson(res, 500, { error: message })
  }
}
