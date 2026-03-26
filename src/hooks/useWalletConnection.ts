import { useState } from 'react'
import { useConnectOrCreateWallet, usePrivy } from '@privy-io/react-auth'
import { useDisconnect } from 'wagmi'
import { useAccount } from '../azuroSocialAaConnector'
import { translate } from '../i18n'

const getWalletConnectErrorMessage = (error: unknown) => {
  const value = String(error ?? '')
  const lower = value.toLowerCase()

  if (lower.includes('cancel') || lower.includes('close') || lower.includes('dismiss')) {
    return translate('walletConnection.cancelled')
  }
  if (lower.includes('reject') || lower.includes('denied')) {
    return translate('walletConnection.denied')
  }

  return translate('walletConnection.failed')
}

export function useWalletConnection() {
  const { address, isConnected, isConnecting, isReconnecting, chainId, isAAWallet, isReady } = useAccount()
  const { ready, authenticated, logout } = usePrivy()
  const { disconnect } = useDisconnect()
  const [connectErrorMessage, setConnectErrorMessage] = useState<string>()
  const { connectOrCreateWallet } = useConnectOrCreateWallet({
    onSuccess: () => {
      setConnectErrorMessage(undefined)
    },
    onError: (error) => {
      setConnectErrorMessage(getWalletConnectErrorMessage(error))
    },
  })

  const canOpenAuthModal = ready && !isConnecting
  const isWalletStatusReady = ready && isReady

  const visibleConnectErrorMessage = isConnected || !authenticated ? undefined : connectErrorMessage

  const openAuthModal = () => {
    if (!ready) return
    setConnectErrorMessage(undefined)
    connectOrCreateWallet()
  }

  return {
    address,
    chainId,
    isAAWallet,
    isAuthenticated: authenticated,
    isConnected,
    isConnecting,
    isReconnecting,
    isWalletStatusReady,
    canOpenAuthModal,
    connectErrorMessage: visibleConnectErrorMessage,
    openAuthModal,
    disconnectWallet: () => {
      setConnectErrorMessage(undefined)
      disconnect()
      void logout()
    },
  }
}
