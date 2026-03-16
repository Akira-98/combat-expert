import { allowMethods, sendJson } from '../_lib/http.js'
import { loadServerEnv, normalizeAddress } from '../_lib/env.js'
import { verifySignedMessage } from '../_lib/signature.js'
import {
  buildCommentAuthCookieSet,
  issueCommentSessionToken,
  readCommentNonce,
  replaceCommentAuthCookies,
} from '../_lib/commentAuth.js'
import { buildCommentAuthMessage } from '../../shared/signingPayloads.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const { commentAuthSecret, rpcUrl } = loadServerEnv()
  if (!commentAuthSecret) {
    return sendJson(res, 500, { error: 'Comment auth env is missing' })
  }

  const address = normalizeAddress(req.body?.address)
  const message = typeof req.body?.message === 'string' ? req.body.message : ''
  const signature = typeof req.body?.signature === 'string' ? req.body.signature : ''
  const issuedAt = typeof req.body?.issuedAt === 'string' ? req.body.issuedAt : ''

  if (!address || !message || !signature || !issuedAt) {
    return sendJson(res, 400, { error: 'Missing required fields' })
  }

  let noncePayload
  try {
    noncePayload = readCommentNonce(req, commentAuthSecret)
  } catch {
    return sendJson(res, 400, { error: 'Comment login request expired' })
  }

  if (
    !noncePayload ||
    noncePayload.type !== 'comment-auth-nonce' ||
    normalizeAddress(noncePayload.sub) !== address ||
    noncePayload.issuedAt !== issuedAt ||
    typeof noncePayload.nonce !== 'string'
  ) {
    return sendJson(res, 400, { error: 'Invalid comment login request' })
  }

  const expectedMessage = buildCommentAuthMessage({
    address,
    nonce: noncePayload.nonce,
    issuedAt,
  })

  if (message !== expectedMessage) {
    return sendJson(res, 400, { error: 'Invalid signature payload' })
  }

  const isValid = await verifySignedMessage({
    rpcUrl,
    address,
    message,
    signature,
  })

  if (!isValid) {
    return sendJson(res, 401, { error: 'Signature verification failed' })
  }

  const sessionToken = issueCommentSessionToken({ secret: commentAuthSecret, address })
  replaceCommentAuthCookies(
    res,
    buildCommentAuthCookieSet({
      nonceToken: null,
      sessionToken,
    }),
  )

  return sendJson(res, 200, { authenticated: true, address })
}
