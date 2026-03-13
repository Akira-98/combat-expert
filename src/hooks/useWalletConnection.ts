import { useState } from 'react'
import { useConnectOrCreateWallet, usePrivy } from '@privy-io/react-auth'
import { useDisconnect } from 'wagmi'
import { useAccount } from '../azuroSocialAaConnector'

const getWalletConnectErrorMessage = (error: unknown) => {
  const value = String(error ?? '')
  const lower = value.toLowerCase()

  if (lower.includes('cancel') || lower.includes('close') || lower.includes('dismiss')) {
    return '지갑 연결이 취소되었습니다.'
  }
  if (lower.includes('reject') || lower.includes('denied')) {
    return '지갑에서 연결 요청이 거부되었습니다.'
  }

  return '지갑 연결에 실패했습니다. 다시 시도해 주세요.'
}

export function useWalletConnection() {
  const { address, isConnected, isConnecting, chainId, isAAWallet, isReady } = useAccount()
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
