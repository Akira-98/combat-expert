import { Header } from './Header'
import type { useProfile } from '../hooks/useProfile'
import type { RankingViewer } from '../hooks/useRankings'
import type { useUsdtTransfer } from '../hooks/useUsdtTransfer'
import type { useWalletConnection } from '../hooks/useWalletConnection'

type AppHeaderContainerProps = {
  wallet: ReturnType<typeof useWalletConnection>
  profile: ReturnType<typeof useProfile>
  usdtTransfer: ReturnType<typeof useUsdtTransfer>
  usdtBalance: number
  isUsdtBalanceLoading: boolean
  isUsdtSupportedChain: boolean
  rankingViewer: RankingViewer | null
  isRankingLoading: boolean
  onTitleClick: () => void
  onRankingClick: () => void
  onGuideClick: () => void
}

export function AppHeaderContainer({
  wallet,
  profile,
  usdtTransfer,
  usdtBalance,
  isUsdtBalanceLoading,
  isUsdtSupportedChain,
  rankingViewer,
  isRankingLoading,
  onTitleClick,
  onRankingClick,
  onGuideClick,
}: AppHeaderContainerProps) {
  return (
    <Header
      isAuthenticated={wallet.isAuthenticated}
      isConnected={wallet.isConnected}
      isConnecting={wallet.isConnecting}
      isReconnecting={wallet.isReconnecting}
      isWalletStatusReady={wallet.isWalletStatusReady}
      chainId={wallet.chainId}
      address={wallet.address}
      profileDisplayName={profile.displayName}
      profileNickname={profile.nickname}
      isProfileSaving={profile.isSaving}
      profileErrorMessage={profile.errorMessage}
      onSaveNickname={profile.saveNickname}
      isAAWallet={wallet.isAAWallet}
      usdtTransfer={usdtTransfer}
      usdtBalance={usdtBalance}
      isUsdtBalanceLoading={isUsdtBalanceLoading}
      isUsdtSupportedChain={isUsdtSupportedChain}
      rankingViewer={rankingViewer}
      isRankingLoading={isRankingLoading}
      canOpenAuthModal={wallet.canOpenAuthModal}
      connectErrorMessage={wallet.connectErrorMessage}
      onTitleClick={onTitleClick}
      onRankingClick={onRankingClick}
      onGuideClick={onGuideClick}
      onOpenAuthModal={wallet.openAuthModal}
      onDisconnect={wallet.disconnectWallet}
    />
  )
}
