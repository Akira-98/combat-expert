import { loadPublicConfigEnv } from './_lib/env.js'
import { allowMethods, sendJson } from './_lib/http.js'

export default function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return

  const config = loadPublicConfigEnv()

  if (!config.rpcUrl || !config.privyAppId || !config.walletConnectProjectId) {
    return sendJson(res, 500, { error: 'Missing required server env configuration' })
  }

  return sendJson(res, 200, config)
}
