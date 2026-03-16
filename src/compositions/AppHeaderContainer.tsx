import { Header } from './Header'
import type { useProfile } from '../hooks/useProfile'
import type { useWalletConnection } from '../hooks/useWalletConnection'

type AppHeaderContainerProps = {
  wallet: ReturnType<typeof useWalletConnection>
  profile: ReturnType<typeof useProfile>
  usdtBalance: number
  isUsdtBalanceLoading: boolean
  isUsdtSupportedChain: boolean
  onTitleClick: () => void
  onGuideClick: () => void
}

export function AppHeaderContainer({ wallet, profile, usdtBalance, isUsdtBalanceLoading, isUsdtSupportedChain, onTitleClick, onGuideClick }: AppHeaderContainerProps) {
  return (
    <Header
      isAuthenticated={wallet.isAuthenticated}
      isConnected={wallet.isConnected}
      isConnecting={wallet.isConnecting}
      isReconnecting={wallet.isReconnecting}
      isWalletStatusReady={wallet.isWalletStatusReady}
      address={wallet.address}
      profileDisplayName={profile.displayName}
      profileNickname={profile.nickname}
      isProfileSaving={profile.isSaving}
      profileErrorMessage={profile.errorMessage}
      onSaveNickname={profile.saveNickname}
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
