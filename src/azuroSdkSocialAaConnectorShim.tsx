import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { useAccount as useAppAccount, useAAWalletClient as useAppAAWalletClient } from './azuroSocialAaConnector'

type AccountContextValue = ReturnType<typeof useAppAccount> | null
type AAWalletClientContextValue = ReturnType<typeof useAppAAWalletClient> | null

const accountContext = createContext<AccountContextValue>(null)
const aaWalletClientContext = createContext<AAWalletClientContextValue>(null)

const normalizeBigInts = (value: unknown): unknown => {
  if (typeof value === 'bigint') return value.toString()
  if (Array.isArray(value)) return value.map((item) => normalizeBigInts(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeBigInts(item)]))
  }
  return value
}

// SDK-only shim:
// Keep hook shape stable (`useContext`) because SDK swaps fallback -> imported hooks at runtime.
// Actual hook values are provided by AzuroSdkSocialAaConnectorProvider from app-level hooks.
export function useAccount() {
  return useContext(accountContext)
}

export function useAAWalletClient() {
  return useContext(aaWalletClientContext)
}

export function AzuroSdkSocialAaConnectorProvider({ children }: { children: ReactNode }) {
  const account = useAppAccount()
  const aaWalletClient = useAppAAWalletClient()

  const accountValue = useMemo(() => account, [account])
  const aaWalletClientValue = useMemo(() => {
    if (!aaWalletClient) return null

    return {
      ...aaWalletClient,
      sendTransaction: async (...args: unknown[]) => {
        const [txInput, options] = args
        return (aaWalletClient as any).sendTransaction(normalizeBigInts(txInput), options)
      },
      signTypedData: async (...args: unknown[]) => {
        const [typedDataInput, options] = args
        const input = (typedDataInput ?? {}) as Record<string, unknown>
        const { account: _account, ...rest } = input
        return (aaWalletClient as any).signTypedData(normalizeBigInts(rest), options)
      },
    } as AAWalletClientContextValue
  }, [aaWalletClient])

  return (
    <accountContext.Provider value={accountValue}>
      <aaWalletClientContext.Provider value={aaWalletClientValue}>{children}</aaWalletClientContext.Provider>
    </accountContext.Provider>
  )
}
