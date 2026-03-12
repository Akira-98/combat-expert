import { createContext, useContext } from 'react'
import { useAccount as useAppAccount, useAAWalletClient as useAppAAWalletClient } from './azuroSocialAaConnector'

export type AccountContextValue = ReturnType<typeof useAppAccount> | null
export type AAWalletClientContextValue = ReturnType<typeof useAppAAWalletClient> | null

export const accountContext = createContext<AccountContextValue>(null)
export const aaWalletClientContext = createContext<AAWalletClientContextValue>(null)

export function useAccount() {
  return useContext(accountContext)
}

export function useAAWalletClient() {
  return useContext(aaWalletClientContext)
}
