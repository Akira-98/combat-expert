import { createPublicClient, http } from 'viem'
import { polygon } from 'viem/chains'

export function assertFreshIssuedAt(issuedAtMs, ttlMs) {
  return Number.isFinite(issuedAtMs) && Math.abs(Date.now() - issuedAtMs) <= ttlMs
}

export async function verifySignedMessage({ rpcUrl, address, message, signature }) {
  if (!rpcUrl) {
    throw new Error('RPC_URL is not set')
  }

  const publicClient = createPublicClient({
    chain: polygon,
    transport: http(rpcUrl),
  })

  return publicClient.verifyMessage({
    address,
    message,
    signature,
  })
}
