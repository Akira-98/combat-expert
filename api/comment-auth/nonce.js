import { allowMethods, sendJson } from '../_lib/http.js'
import { loadServerEnv, normalizeAddress } from '../_lib/env.js'
import { createCommentAuthNonce, issueCommentNonceToken, writeCommentNonceCookie } from '../_lib/commentAuth.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const { commentAuthSecret } = loadServerEnv()
  if (!commentAuthSecret) {
    return sendJson(res, 500, { error: 'Comment auth env is missing' })
  }

  const address = normalizeAddress(req.body?.address)
  if (!address) {
    return sendJson(res, 400, { error: 'Invalid address' })
  }

  const nonce = createCommentAuthNonce()
  const issuedAt = new Date().toISOString()
  const token = issueCommentNonceToken({
    secret: commentAuthSecret,
    address,
    nonce,
    issuedAt,
  })

  writeCommentNonceCookie(res, token)
  return sendJson(res, 200, { nonce, issuedAt })
}
