import { polygon } from 'viem/chains'

export type TokenSymbol = 'USDT'

export type Erc20TokenConfig = {
  symbol: TokenSymbol
  chainId: number
  name: string
  address: `0x${string}`
  decimals: number
}

const ERC20_TOKENS_BY_CHAIN: Record<number, Partial<Record<TokenSymbol, Erc20TokenConfig>>> = {
  [polygon.id]: {
    USDT: {
      symbol: 'USDT',
      chainId: polygon.id,
      name: 'Tether USD',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
    },
  },
}

export const getErc20TokenConfig = (chainId: number | undefined, symbol: TokenSymbol) => {
  if (!chainId) return undefined
  return ERC20_TOKENS_BY_CHAIN[chainId]?.[symbol]
}

export const DEFAULT_USDT_CONFIG = ERC20_TOKENS_BY_CHAIN[polygon.id]?.USDT as Erc20TokenConfig
