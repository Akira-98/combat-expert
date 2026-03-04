import { useMemo } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useAccount as useWagmiAccount } from 'wagmi'

type WagmiAccount = ReturnType<typeof useWagmiAccount>

export type ExtendedAccountContextValue = WagmiAccount & {
  isAAWallet: boolean
  isReady: boolean
}

const EMBEDDED_WALLET_CLIENT_TYPES = new Set(['privy', 'privy-v2'])

export function useAccount(): ExtendedAccountContextValue {
  const account = useWagmiAccount()
  const { ready, user } = usePrivy()

  return useMemo(() => {
    const walletClientType = user?.wallet?.walletClientType
    const hasEmbeddedWallet = walletClientType ? EMBEDDED_WALLET_CLIENT_TYPES.has(walletClientType) : false
    const smartWalletAddress = user?.smartWallet?.address as WagmiAccount['address']
    const isAAWallet = hasEmbeddedWallet

    if (isAAWallet && smartWalletAddress) {
      return {
        ...account,
        address: smartWalletAddress,
        addresses: [smartWalletAddress],
        isAAWallet: true,
        isReady: ready,
      } as ExtendedAccountContextValue
    }

    if (isAAWallet && !smartWalletAddress) {
      return {
        ...account,
        address: undefined,
        addresses: [],
        status: 'connecting',
        isConnected: false,
        isConnecting: true,
        isDisconnected: false,
        isReconnecting: false,
        isAAWallet: true,
        isReady: false,
      } as ExtendedAccountContextValue
    }

    return {
      ...account,
      isAAWallet: false,
      isReady: Boolean(account.address) || ready,
    } as ExtendedAccountContextValue
  }, [account, ready, user?.smartWallet?.address, user?.wallet?.walletClientType])
}

export type AAWalletClientProviderContextValue = ReturnType<typeof useSmartWallets>['client']

export function useAAWalletClient(): AAWalletClientProviderContextValue {
  const { client } = useSmartWallets()
  return client
}
