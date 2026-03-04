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
  const response = await fetch('/api/public-config', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to load runtime config: ${response.status}`)
  }

  const payload = await response.json()
  return validateConfig(payload)
}
