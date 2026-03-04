import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { polygon } from 'viem/chains'

export function createWagmiConfig(rpcUrl: string) {
  return createConfig({
    chains: [polygon],
    transports: {
      [polygon.id]: http(rpcUrl || polygon.rpcUrls.default.http[0]),
    },
  })
}
