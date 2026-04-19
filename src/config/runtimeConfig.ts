import { getJson } from '../api/http'

export type RuntimeConfig = {
  affiliateAddress: string
  rpcUrl: string
  walletConnectProjectId: string
  privyAppId: string
  ablyChannel: string
}

function validateConfig(data: unknown): RuntimeConfig {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid runtime config payload')
  }

  const config = data as Partial<RuntimeConfig>
  if (!config.affiliateAddress || !config.rpcUrl || !config.walletConnectProjectId || !config.privyAppId) {
    throw new Error('Missing required runtime config fields')
  }

  return {
    affiliateAddress: config.affiliateAddress,
    rpcUrl: config.rpcUrl,
    walletConnectProjectId: config.walletConnectProjectId,
    privyAppId: config.privyAppId,
    ablyChannel: config.ablyChannel || 'chat:ufc:live',
  }
}

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const payload = await getJson('/api/public-config', 'Failed to load runtime config')
  return validateConfig(payload)
}
