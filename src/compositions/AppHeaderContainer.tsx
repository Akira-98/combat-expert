import { Header } from './Header'
import type { useWalletConnection } from '../hooks/useWalletConnection'

type AppHeaderContainerProps = {
  wallet: ReturnType<typeof useWalletConnection>
  usdtBalance: number
  isUsdtBalanceLoading: boolean
  isUsdtSupportedChain: boolean
  onTitleClick: () => void
  onGuideClick: () => void
}

export function AppHeaderContainer({ wallet, usdtBalance, isUsdtBalanceLoading, isUsdtSupportedChain, onTitleClick, onGuideClick }: AppHeaderContainerProps) {
  return (
    <Header
      isAuthenticated={wallet.isAuthenticated}
      isConnected={wallet.isConnected}
      isConnecting={wallet.isConnecting}
      isReconnecting={wallet.isReconnecting}
      isWalletStatusReady={wallet.isWalletStatusReady}
      address={wallet.address}
      isAAWallet={wallet.isAAWallet}
      usdtBalance={usdtBalance}
      isUsdtBalanceLoading={isUsdtBalanceLoading}
      isUsdtSupportedChain={isUsdtSupportedChain}
      canOpenAuthModal={wallet.canOpenAuthModal}
      connectErrorMessage={wallet.connectErrorMessage}
      onTitleClick={onTitleClick}
      onGuideClick={onGuideClick}
      onOpenAuthModal={wallet.openAuthModal}
      onDisconnect={wallet.disconnectWallet}
    />
  )
}
