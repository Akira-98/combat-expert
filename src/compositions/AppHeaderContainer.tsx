import { Header } from './Header'
import type { useWalletConnection } from '../hooks/useWalletConnection'

type AppHeaderContainerProps = {
  wallet: ReturnType<typeof useWalletConnection>
  onTitleClick: () => void
  onGuideClick: () => void
}

export function AppHeaderContainer({ wallet, onTitleClick, onGuideClick }: AppHeaderContainerProps) {
  return (
    <Header
      isAuthenticated={wallet.isAuthenticated}
      isConnected={wallet.isConnected}
      isConnecting={wallet.isConnecting}
      isReconnecting={wallet.isReconnecting}
      isWalletStatusReady={wallet.isWalletStatusReady}
      address={wallet.address}
      chainId={wallet.chainId}
      isAAWallet={wallet.isAAWallet}
      canOpenAuthModal={wallet.canOpenAuthModal}
      connectErrorMessage={wallet.connectErrorMessage}
      onTitleClick={onTitleClick}
      onGuideClick={onGuideClick}
      onOpenAuthModal={wallet.openAuthModal}
      onDisconnect={wallet.disconnectWallet}
    />
  )
}
