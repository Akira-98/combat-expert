import { useMemo } from 'react'
import { erc20Abi, formatUnits } from 'viem'
import { useReadContract } from 'wagmi'
import { DEFAULT_USDT_CONFIG, getErc20TokenConfig } from '../config/tokens'

type UseUsdtBalanceParams = {
  address?: `0x${string}`
  chainId?: number
  isConnected: boolean
}

export function useUsdtBalance({ address, chainId, isConnected }: UseUsdtBalanceParams) {
  const usdtConfig = getErc20TokenConfig(chainId, 'USDT')
  const tokenAddress = usdtConfig?.address
  const tokenDecimals = usdtConfig?.decimals ?? DEFAULT_USDT_CONFIG.decimals
  const isSupportedChain = Boolean(usdtConfig)

  const { data: balanceRaw, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(isConnected && address && isSupportedChain),
    },
  })

  const balance = useMemo(() => {
    if (balanceRaw === undefined || balanceRaw === null) return 0
    return Number(formatUnits(balanceRaw, tokenDecimals))
  }, [balanceRaw, tokenDecimals])

  return {
    tokenAddress,
    balance,
    isLoading,
    isSupportedChain,
    refetch,
  }
}
