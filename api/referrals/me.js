import { loadServerEnv, normalizeAddress } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import { fetchActiveReferrerByWallet } from '../_lib/referralAttribution.js'

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function getRequestOrigin(req) {
  const forwardedProto = firstQueryValue(req.headers['x-forwarded-proto'])
  const proto = forwardedProto || 'https'
  const host = firstQueryValue(req.headers['x-forwarded-host']) || req.headers.host

  return host ? `${proto}://${host}` : ''
}

function buildReferralUrl(req, code) {
  const origin = getRequestOrigin(req)
  const encodedCode = encodeURIComponent(code)
  return origin ? `${origin}/?ref=${encodedCode}` : `/?ref=${encodedCode}`
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return

  const { supabaseUrl, serviceRoleKey } = loadServerEnv()
  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    const walletAddress = normalizeAddress(firstQueryValue(req.query?.wallet))
    if (!walletAddress) {
      return sendJson(res, 400, { ok: false, status: 'invalid_wallet_address', error: 'Invalid wallet address' })
    }

    const referrer = await fetchActiveReferrerByWallet({
      supabaseUrl,
      serviceRoleKey,
      walletAddress,
    })

    if (!referrer?.code) {
      return sendJson(res, 200, { ok: false, status: 'not_referrer' })
    }

    return sendJson(res, 200, {
      ok: true,
      referral: {
        walletAddress: referrer.walletAddress,
        code: referrer.code,
        referralUrl: buildReferralUrl(req, referrer.code),
      },
    })
  } catch (error) {
    return sendServerError(res, error, 'Failed to fetch referral')
  }
}
