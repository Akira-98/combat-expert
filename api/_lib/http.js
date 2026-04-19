export function sendJson(res, statusCode, payload, cacheControl = 'no-store') {
  res.status(statusCode)
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', cacheControl)
  res.send(JSON.stringify(payload))
}

export function sendServerError(res, error, fallbackMessage = 'Internal server error') {
  console.error(error)
  return sendJson(res, 500, { error: fallbackMessage })
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true
  res.setHeader('Allow', methods.join(', '))
  sendJson(res, 405, { error: 'Method not allowed' })
  return false
}
