import { createContext, useContext } from 'react'

const noopContext = createContext<null>(null)

// SDK-only shim:
// Do not replace with app-level Privy/Wagmi hooks.
// The SDK swaps fallback -> imported hooks at runtime, so this file must keep
// the same hook type (`useContext`) to avoid ChainProvider hook-order violations.
export function useAccount() {
  return useContext(noopContext)
}

export function useAAWalletClient() {
  return useContext(noopContext)
}
