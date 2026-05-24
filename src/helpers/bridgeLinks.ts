const DEBRIDGE_APP_URL = 'https://app.debridge.com/deswap'

const POLYGON_CHAIN_ID = '137'
const BNB_CHAIN_ID = '56'
const SOLANA_CHAIN_ID = '7565164'

const POLYGON_USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const BNB_USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'
const SOLANA_USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'

export type BridgeChain = 'bnb' | 'solana'

const BRIDGE_CHAIN_CONFIG: Record<BridgeChain, { chainId: string; tokenAddress: string }> = {
  bnb: {
    chainId: BNB_CHAIN_ID,
    tokenAddress: BNB_USDT_ADDRESS,
  },
  solana: {
    chainId: SOLANA_CHAIN_ID,
    tokenAddress: SOLANA_USDT_MINT,
  },
}

export function buildPolygonUsdtDepositBridgeUrl(source: BridgeChain, recipientAddress: string) {
  const params = new URLSearchParams({
    inputChain: BRIDGE_CHAIN_CONFIG[source].chainId,
    inputCurrency: BRIDGE_CHAIN_CONFIG[source].tokenAddress,
    outputChain: POLYGON_CHAIN_ID,
    outputCurrency: POLYGON_USDT_ADDRESS,
    address: recipientAddress,
  })

  return `${DEBRIDGE_APP_URL}?${params.toString()}`
}

export function buildPolygonUsdtWithdrawBridgeUrl(target: BridgeChain, recipientAddress: string) {
  const params = new URLSearchParams({
    inputChain: POLYGON_CHAIN_ID,
    inputCurrency: POLYGON_USDT_ADDRESS,
    outputChain: BRIDGE_CHAIN_CONFIG[target].chainId,
    outputCurrency: BRIDGE_CHAIN_CONFIG[target].tokenAddress,
    address: recipientAddress,
  })

  return `${DEBRIDGE_APP_URL}?${params.toString()}`
}
