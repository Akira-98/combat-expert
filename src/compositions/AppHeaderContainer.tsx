import { Header } from './Header'
import type { useWalletConnection } from '../hooks/useWalletConnection'

type AppHeaderContainerProps = {
  wallet: ReturnType<typeof useWalletConnection>
  expectedChainId: number
  onTitleClick: () => void
}

export function AppHeaderContainer({ wallet, expectedChainId, onTitleClick }: AppHeaderContainerProps) {
  return (
    <Header
      isAuthenticated={wallet.isAuthenticated}
      isConnected={wallet.isConnected}
      isConnecting={wallet.isConnecting}
      address={wallet.address}
      chainId={wallet.chainId}
      expectedChainId={expectedChainId}
      isAAWallet={wallet.isAAWallet}
      canOpenAuthModal={wallet.canOpenAuthModal}
      connectErrorMessage={wallet.connectErrorMessage}
      onTitleClick={onTitleClick}
      onOpenAuthModal={wallet.openAuthModal}
      onDisconnect={wallet.disconnectWallet}
    />
  )
}
