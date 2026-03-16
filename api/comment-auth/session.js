import { allowMethods, sendJson } from '../_lib/http.js'
import { loadServerEnv, normalizeAddress } from '../_lib/env.js'
import { clearCommentSessionCookie, readCommentSession } from '../_lib/commentAuth.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'DELETE'])) return

  const { commentAuthSecret } = loadServerEnv()
  if (!commentAuthSecret) {
    return sendJson(res, 500, { error: 'Comment auth env is missing' })
  }

  if (req.method === 'DELETE') {
    clearCommentSessionCookie(res)
    return sendJson(res, 200, { authenticated: false })
  }

  try {
    const session = readCommentSession(req, commentAuthSecret)
    const address = normalizeAddress(session?.sub)

    if (!address || session?.scope !== 'comments' || session?.type !== 'comment-session') {
      return sendJson(res, 200, { authenticated: false })
    }

    return sendJson(res, 200, { authenticated: true, address })
  } catch {
    clearCommentSessionCookie(res)
    return sendJson(res, 200, { authenticated: false })
  }
}
