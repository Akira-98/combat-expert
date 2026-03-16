import { randomBytes } from 'node:crypto'
import { parseCookies, serializeCookie, setCookies } from './cookies.js'
import { verifyJwt, signJwt } from './jwt.js'
import {
  COMMENT_AUTH_NONCE_TTL_MS,
  COMMENT_AUTH_SESSION_TTL_MS,
} from '../../shared/signingPayloads.js'

const COMMENT_AUTH_NONCE_COOKIE = 'combat_expert_comment_nonce'
const COMMENT_AUTH_SESSION_COOKIE = 'combat_expert_comment_session'

function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

export function createCommentAuthNonce() {
  return randomBytes(18).toString('hex')
}

export function issueCommentNonceToken({ secret, address, nonce, issuedAt }) {
  const issuedAtSeconds = Math.floor(Date.parse(issuedAt) / 1000)
  return signJwt(
    {
      sub: address,
      nonce,
      issuedAt,
      iat: issuedAtSeconds,
      exp: issuedAtSeconds + Math.floor(COMMENT_AUTH_NONCE_TTL_MS / 1000),
      type: 'comment-auth-nonce',
    },
    secret,
  )
}

export function readCommentNonce(req, secret) {
  const cookies = parseCookies(req.headers?.cookie)
  const token = cookies[COMMENT_AUTH_NONCE_COOKIE]
  if (!token) return null
  return verifyJwt(token, secret)
}

export function writeCommentNonceCookie(res, token) {
  setCookies(res, [
    serializeCookie(COMMENT_AUTH_NONCE_COOKIE, token, {
      maxAge: Math.floor(COMMENT_AUTH_NONCE_TTL_MS / 1000),
      path: '/',
    }),
  ])
}

export function clearCommentNonceCookie(res) {
  setCookies(res, [serializeCookie(COMMENT_AUTH_NONCE_COOKIE, '', { maxAge: 0, path: '/' })])
}

export function issueCommentSessionToken({ secret, address }) {
  const iat = nowSeconds()
  return signJwt(
    {
      sub: address,
      scope: 'comments',
      iat,
      exp: iat + Math.floor(COMMENT_AUTH_SESSION_TTL_MS / 1000),
      type: 'comment-session',
    },
    secret,
  )
}

export function readCommentSession(req, secret) {
  const cookies = parseCookies(req.headers?.cookie)
  const token = cookies[COMMENT_AUTH_SESSION_COOKIE]
  if (!token) return null
  return verifyJwt(token, secret)
}

export function writeCommentSessionCookie(res, token) {
  setCookies(res, [
    serializeCookie(COMMENT_AUTH_SESSION_COOKIE, token, {
      maxAge: Math.floor(COMMENT_AUTH_SESSION_TTL_MS / 1000),
      path: '/',
    }),
  ])
}

export function clearCommentSessionCookie(res) {
  setCookies(res, [serializeCookie(COMMENT_AUTH_SESSION_COOKIE, '', { maxAge: 0, path: '/' })])
}

export function replaceCommentAuthCookies(res, cookies) {
  setCookies(res, cookies)
}

export function buildCommentAuthCookieSet({ nonceToken, sessionToken }) {
  const nextCookies = []

  if (typeof nonceToken === 'string') {
    nextCookies.push(
      serializeCookie(COMMENT_AUTH_NONCE_COOKIE, nonceToken, {
        maxAge: Math.floor(COMMENT_AUTH_NONCE_TTL_MS / 1000),
        path: '/',
      }),
    )
  } else {
    nextCookies.push(serializeCookie(COMMENT_AUTH_NONCE_COOKIE, '', { maxAge: 0, path: '/' }))
  }

  if (typeof sessionToken === 'string') {
    nextCookies.push(
      serializeCookie(COMMENT_AUTH_SESSION_COOKIE, sessionToken, {
        maxAge: Math.floor(COMMENT_AUTH_SESSION_TTL_MS / 1000),
        path: '/',
      }),
    )
  }

  return nextCookies
}
