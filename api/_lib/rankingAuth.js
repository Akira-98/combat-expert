function readBearerToken(req) {
  const header = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

export function isAuthorizedRankingSyncRequest(req, secret) {
  if (!secret) return false
  const bearerToken = readBearerToken(req)
  const headerToken = typeof req.headers?.['x-ranking-sync-secret'] === 'string' ? req.headers['x-ranking-sync-secret'].trim() : ''
  return bearerToken === secret || headerToken === secret
}
