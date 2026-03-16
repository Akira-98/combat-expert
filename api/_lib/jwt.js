import { createHmac, timingSafeEqual } from 'node:crypto'

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(value) {
  const normalized = String(value || '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8')
}

function signValue(value, secret) {
  return createHmac('sha256', secret).update(value).digest()
}

export function signJwt(payload, secret) {
  if (!secret) throw new Error('COMMENT_AUTH_JWT_SECRET is not set')

  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = base64UrlEncode(signValue(signingInput, secret))
  return `${signingInput}.${signature}`
}

export function verifyJwt(token, secret) {
  if (!secret) throw new Error('COMMENT_AUTH_JWT_SECRET is not set')
  if (typeof token !== 'string') throw new Error('Invalid token')

  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !encodedSignature) throw new Error('Invalid token')

  const signingInput = `${encodedHeader}.${encodedPayload}`
  const expectedSignature = signValue(signingInput, secret)
  const actualSignature = Buffer.from(
    encodedSignature.replace(/-/g, '+').replace(/_/g, '/') +
      (encodedSignature.length % 4 === 0 ? '' : '='.repeat(4 - (encodedSignature.length % 4))),
    'base64',
  )

  if (expectedSignature.length !== actualSignature.length || !timingSafeEqual(expectedSignature, actualSignature)) {
    throw new Error('Invalid token signature')
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload))
  const now = Math.floor(Date.now() / 1000)

  if (typeof payload?.exp === 'number' && payload.exp < now) {
    throw new Error('Token expired')
  }

  return payload
}
