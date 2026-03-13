const TX_EXPLORER_BY_CHAIN_ID: Record<number, string> = {
  137: 'https://polygonscan.com/tx/',
  80002: 'https://amoy.polygonscan.com/tx/',
}

const CHAIN_NAME_BY_ID: Record<number, string> = {
  137: 'Polygon Mainnet',
  80002: 'Polygon Amoy',
}

export const getTxExplorerUrl = (chainId: number | undefined, txHash: string) => {
  if (!chainId) return undefined
  const prefix = TX_EXPLORER_BY_CHAIN_ID[chainId]
  if (!prefix) return undefined
  return `${prefix}${txHash}`
}

export const getChainName = (chainId: number | undefined) => {
  if (!chainId) return '알 수 없는 네트워크'
  return CHAIN_NAME_BY_ID[chainId] ?? `Chain ${chainId}`
}

export const getWalletAvatarUrl = (address?: string) => {
  const seed = address?.toLowerCase() ?? 'combat-expert-guest'
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`
}

export const shortenAddress = (address?: string, head = 6, tail = 4) => {
  if (!address) return '-'
  if (address.length <= head + tail) return address
  return `${address.slice(0, head)}...${address.slice(-tail)}`
}
