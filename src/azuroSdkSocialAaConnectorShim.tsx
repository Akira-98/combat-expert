import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { useAccount as useAppAccount, useAAWalletClient as useAppAAWalletClient } from './azuroSocialAaConnector'

type AccountContextValue = ReturnType<typeof useAppAccount> | null
type AAWalletClientContextValue = ReturnType<typeof useAppAAWalletClient> | null

const accountContext = createContext<AccountContextValue>(null)
const aaWalletClientContext = createContext<AAWalletClientContextValue>(null)

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
  const aaWalletClientValue = useMemo(() => aaWalletClient ?? null, [aaWalletClient])

  return (
    <accountContext.Provider value={accountValue}>
      <aaWalletClientContext.Provider value={aaWalletClientValue}>{children}</aaWalletClientContext.Provider>
    </accountContext.Provider>
  )
}
