function encodeCookieValue(value) {
  return encodeURIComponent(value)
}

export function parseCookies(header) {
  const source = typeof header === 'string' ? header : ''
  if (!source) return {}

  return source.split(';').reduce((acc, entry) => {
    const [rawName, ...rawValue] = entry.trim().split('=')
    if (!rawName) return acc
    acc[rawName] = decodeURIComponent(rawValue.join('=') || '')
    return acc
  }, {})
}

export function serializeCookie(
  name,
  value,
  {
    path = '/',
    httpOnly = true,
    sameSite = 'Lax',
    secure = process.env.NODE_ENV === 'production',
    maxAge,
  } = {},
) {
  const parts = [`${name}=${encodeCookieValue(value)}`, `Path=${path}`]

  if (Number.isFinite(maxAge)) parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge))}`)
  if (httpOnly) parts.push('HttpOnly')
  if (secure) parts.push('Secure')
  if (sameSite) parts.push(`SameSite=${sameSite}`)

  return parts.join('; ')
}

export function setCookies(res, cookies) {
  res.setHeader('Set-Cookie', cookies)
}
