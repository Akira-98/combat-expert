import { loadServerEnv } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import { createPickShare, fetchPickShareById } from '../_lib/pickShareStore.js'

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function getRequestOrigin(req) {
  const forwardedProto = firstQueryValue(req.headers['x-forwarded-proto'])
  const proto = forwardedProto || 'https'
  const host = firstQueryValue(req.headers['x-forwarded-host']) || req.headers.host

  return host ? `${proto}://${host}` : ''
}

function buildShareUrl(req, shareId) {
  const origin = getRequestOrigin(req)
  return origin ? `${origin}/share/picks/${encodeURIComponent(shareId)}` : `/share/picks/${encodeURIComponent(shareId)}`
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return

  const { supabaseUrl, serviceRoleKey } = loadServerEnv()
  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  try {
    if (req.method === 'GET') {
      const result = await fetchPickShareById({
        supabaseUrl,
        serviceRoleKey,
        shareId: firstQueryValue(req.query?.id),
      })

      if (!result.ok) {
        const statusCode = result.status === 'invalid_share_id' ? 400 : result.status === 'not_found' ? 404 : 409
        return sendJson(res, statusCode, result)
      }

      return sendJson(res, 200, result)
    }

    const result = await createPickShare({
      supabaseUrl,
      serviceRoleKey,
      sharerWallet: req.body?.sharerWallet,
      referrerWallet: req.body?.referrerWallet,
      selections: req.body?.selections,
    })

    if (!result.ok) {
      return sendJson(res, 400, result)
    }

    return sendJson(res, 201, {
      ...result,
      shareUrl: buildShareUrl(req, result.share.id),
    })
  } catch (error) {
    return sendServerError(res, error, 'Failed to handle pick share')
  }
}
