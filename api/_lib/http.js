export function sendJson(res, statusCode, payload) {
  res.status(statusCode)
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.send(JSON.stringify(payload))
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true
  res.setHeader('Allow', methods.join(', '))
  sendJson(res, 405, { error: 'Method not allowed' })
  return false
}
