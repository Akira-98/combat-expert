import { createPortal } from 'react-dom'
import { useHeaderController } from '../hooks/useHeaderController'
import type { RankingViewer } from '../hooks/useRankings'
import type { useUsdtTransfer } from '../hooks/useUsdtTransfer'
import { useI18n } from '../i18n'
import { AccountPanel } from './header/AccountPanel'
import { HeaderNavButtons } from './header/HeaderNavButtons'
import { TransferModal } from './header/TransferModal'

type HeaderProps = {
  isAuthenticated: boolean
  isConnected: boolean
  isConnecting: boolean
  isReconnecting?: boolean
  isWalletStatusReady: boolean
  chainId?: number
  address?: `0x${string}`
  profileDisplayName: string
  profileNickname?: string | null
  isProfileSaving: boolean
  profileErrorMessage?: string
  onSaveNickname: (nickname: string) => Promise<unknown>
  isAAWallet?: boolean
  usdtTransfer: ReturnType<typeof useUsdtTransfer>
  usdtBalance?: number
  isUsdtBalanceLoading?: boolean
  isUsdtSupportedChain?: boolean
  rankingViewer: RankingViewer | null
  isRankingLoading: boolean
  canOpenAuthModal: boolean
  connectErrorMessage?: string
  onTitleClick?: () => void
  onNewsClick: () => void
  onPlayerRankingsClick: () => void
  onForumClick: () => void
  onRankingClick: () => void
  onGuideClick: () => void
  onOpenAuthModal: () => void
  onDisconnect: () => void
}

export function Header({
  isAuthenticated,
  isConnected,
  isConnecting,
  isReconnecting,
  isWalletStatusReady,
  chainId,
  address,
  profileDisplayName,
  profileNickname,
  isProfileSaving,
  profileErrorMessage,
  onSaveNickname,
  isAAWallet,
  usdtTransfer,
  usdtBalance,
  isUsdtBalanceLoading,
  isUsdtSupportedChain,
  rankingViewer,
  isRankingLoading,
  canOpenAuthModal,
  connectErrorMessage,
  onTitleClick,
  onNewsClick,
  onPlayerRankingsClick,
  onForumClick,
  onRankingClick,
  onGuideClick,
  onOpenAuthModal,
  onDisconnect,
}: HeaderProps) {
  const { t } = useI18n()
  const buttonBaseClass =
    'inline-flex items-center justify-center text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 md:h-auto md:px-4 md:py-2 md:text-sm'
  const actionButtonClass = `btn-shell h-8 px-2.5 md:btn-shell-lg ${buttonBaseClass}`
  const secondaryButtonClass = `ui-btn-secondary ${actionButtonClass}`
  const primaryButtonClass = `ui-btn-primary ${actionButtonClass}`
  const iconButtonClass =
    'ui-btn-secondary btn-shell inline-flex h-8 w-8 items-center justify-center text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 md:btn-shell-lg'
  const titleClass =
    'ui-text-strong ui-mma-logo whitespace-nowrap pt-0.5 text-[22px] leading-[1.18] md:pt-0 md:text-[27px] md:leading-[1.15]'
  const titleWrapperClass = 'min-w-0 self-center py-0 md:py-0.5'
  const connectErrorClass = 'ui-state-danger m-0 rounded-md border px-2 py-1 text-right text-xs font-medium'
  const accountTriggerClass =
    'flex items-center gap-2 rounded-full border border-transparent bg-transparent p-0.5 transition hover:border-[color:var(--app-border)]'
  const desktopAccountPopoverClass = 'absolute right-0 top-[calc(100%+12px)] z-50 hidden w-[min(24rem,calc(100vw-2rem))] md:block'
  const mobileAccountSheetClass =
    'ui-surface-soft relative z-10 max-h-[min(86dvh,42rem)] w-full overflow-y-auto rounded-t-3xl border p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-2xl'
  void isAAWallet
  const controller = useHeaderController({
    address,
    isConnected,
    onGuideClick,
    onRankingClick,
    onOpenAuthModal,
    onDisconnect,
    usdtTransfer,
    usdtBalance,
    isUsdtBalanceLoading,
    isUsdtSupportedChain,
  })

  const accountPanel = (
    <AccountPanel
      address={address}
      avatarUrl={controller.avatarUrl}
      profileDisplayName={profileDisplayName}
      profileNickname={profileNickname}
      isProfileSaving={isProfileSaving}
      profileErrorMessage={profileErrorMessage}
      onSaveNickname={onSaveNickname}
      rankingViewer={rankingViewer}
      isRankingLoading={isRankingLoading}
      usdtBalanceLabel={controller.usdtBalanceLabel}
      iconButtonClass={iconButtonClass}
      primaryButtonClass={primaryButtonClass}
      copyLabel={controller.copyLabel}
      onCopyAddress={controller.handleCopyAddress}
      onDisconnect={controller.handleDisconnect}
      onClose={controller.closeAccountModal}
      onOpenRanking={controller.handleRankingNavigation}
    />
  )

  return (
    <>
      <header className="section-shell grid min-h-[68px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 bg-transparent px-2.5 py-1.5 shadow-none md:min-h-0 md:grid-cols-[240px_minmax(0,1fr)_316px] md:gap-4 md:p-4 desktop-surface-fill desktop-surface-variant">
        <div className="flex min-w-0 items-center">
          <div className={titleWrapperClass}>
            <h1 className="m-0">
              {onTitleClick ? (
                <button
                  aria-label={t('header.goToExplore')}
                  className={`${titleClass} m-0 cursor-pointer border-0 bg-transparent p-0 text-left`}
                  onClick={onTitleClick}
                  type="button"
                >
                  {t('app.title')}
                </button>
              ) : (
                <span className={titleClass}>{t('app.title')}</span>
              )}
            </h1>
          </div>
        </div>
        <PreviewFeatureNav
          onNewsClick={onNewsClick}
          onPlayerRankingsClick={onPlayerRankingsClick}
          onForumClick={onForumClick}
          onGuideClick={controller.handleGuideNavigation}
          onLeaderboardClick={controller.handleRankingNavigation}
        />
        <div className="flex shrink-0 items-center justify-end">
          {!isConnected ? (
            <div className="flex flex-col items-end gap-2">
              <HeaderActions
                secondaryButtonClass={secondaryButtonClass}
                isConnecting={isConnecting}
                isAuthenticated={isAuthenticated}
                canOpenAuthModal={canOpenAuthModal}
                onWalletClick={controller.handleWalletAction}
                onOpenAuthModal={onOpenAuthModal}
                onDisconnect={onDisconnect}
                onGuideClick={controller.handleGuideNavigation}
                onRankingClick={controller.handleRankingNavigation}
                onToggleLocale={controller.handleToggleLocale}
              />
              {isAuthenticated && isWalletStatusReady && !isConnecting && !isReconnecting && (
                <p className="ui-text-muted m-0 text-right text-xs">
                  {t('header.authNeedsWallet')}
                </p>
              )}
              {connectErrorMessage && <p className={connectErrorClass}>{connectErrorMessage}</p>}
            </div>
          ) : (
            <div className="relative flex items-center justify-end gap-2">
              <HeaderNavButtons
                onGuideClick={controller.handleGuideNavigation}
                onRankingClick={controller.handleRankingNavigation}
                onWalletClick={controller.handleWalletAction}
                onToggleLocale={controller.handleToggleLocale}
                showGuideButton={false}
                showRankingButton={false}
                showRankingOnMobile
                showWalletOnMobile
              />
              <button
                aria-expanded={controller.isAccountModalOpen}
                aria-haspopup="dialog"
                aria-label={t('header.accountMenuOpen')}
                className={accountTriggerClass}
                onClick={controller.handleToggleAccountModal}
                type="button"
              >
                <img alt="" className="h-10 w-10 rounded-full border object-cover" src={controller.avatarUrl} />
                <span className="ui-text-strong hidden text-sm font-semibold md:inline">{profileDisplayName}</span>
              </button>

              {isConnected && controller.isAccountModalOpen && (
                <div className={desktopAccountPopoverClass}>
                  <section className="card-surface-soft card-shell-xl p-4 shadow-2xl">{accountPanel}</section>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {isConnected && controller.isAccountModalOpen && (
        <>
          <button
            aria-label={t('header.accountMenuClose')}
            className="fixed inset-0 z-40 hidden bg-transparent md:block"
            onClick={controller.closeAccountModal}
            type="button"
          />
          {typeof document !== 'undefined' &&
            createPortal(
              <div aria-modal="true" className="fixed inset-0 z-[70] flex items-end md:hidden" role="dialog">
                <button
                  aria-label={t('header.accountSheetClose')}
                  className="ui-overlay-scrim absolute inset-0 backdrop-blur-sm"
                  onClick={controller.closeAccountModal}
                  type="button"
                />
                <section className={mobileAccountSheetClass}>
                  <div className="ui-sheet-handle mx-auto mb-4 h-1.5 w-14 rounded-full" />
                  {accountPanel}
                </section>
              </div>,
              document.body,
            )}
        </>
      )}
      <TransferModal
        isOpen={controller.isTransferModalOpen}
        isConnected={isConnected}
        chainId={chainId}
        usdtTransfer={usdtTransfer}
        onClose={controller.closeTransferModal}
      />
    </>
  )
}

function HeaderActions({
  secondaryButtonClass,
  isConnecting,
  isAuthenticated,
  canOpenAuthModal,
  onWalletClick,
  onOpenAuthModal,
  onDisconnect,
  onGuideClick,
  onRankingClick,
  onToggleLocale,
}: {
  secondaryButtonClass: string
  isConnecting: boolean
  isAuthenticated: boolean
  canOpenAuthModal: boolean
  onWalletClick: () => void
  onOpenAuthModal: () => void
  onDisconnect: () => void
  onGuideClick: () => void
  onRankingClick: () => void
  onToggleLocale: () => void
}) {
  const { t } = useI18n()
  const primaryButtonClass =
    'ui-btn-primary btn-shell inline-flex h-8 items-center justify-center px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 md:h-auto md:btn-shell-lg md:px-4 md:py-2 md:text-sm'

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <HeaderNavButtons
        onGuideClick={onGuideClick}
        onRankingClick={onRankingClick}
        onWalletClick={onWalletClick}
        onToggleLocale={onToggleLocale}
        showGuideButton={false}
        showRankingButton={false}
        showRankingOnMobile
        showWalletOnMobile
      />
      <button className={primaryButtonClass} disabled={!canOpenAuthModal || isConnecting} onClick={onOpenAuthModal}>
        {isConnecting ? t('header.connecting') : isAuthenticated ? t('header.connectWallet') : t('header.login')}
      </button>
      {isAuthenticated && (
        <button className={secondaryButtonClass} onClick={onDisconnect}>
          {t('header.logout')}
        </button>
      )}
    </div>
  )
}

function PreviewFeatureNav({
  onNewsClick,
  onPlayerRankingsClick,
  onForumClick,
  onGuideClick,
  onLeaderboardClick,
}: {
  onNewsClick: () => void
  onPlayerRankingsClick: () => void
  onForumClick: () => void
  onGuideClick: () => void
  onLeaderboardClick: () => void
}) {
  const { t } = useI18n()
  const previewNavButtonClass =
    'ui-text-strong hidden border-0 bg-transparent px-0 py-1 text-[15px] font-black uppercase tracking-[0.08em] transition hover:text-[color:var(--app-accent)] md:inline-flex'

  return (
    <nav aria-label={t('nav.previewFeatures')} className="hidden min-w-0 items-center justify-between md:flex">
      <button className={previewNavButtonClass} onClick={onNewsClick} type="button">
        {t('nav.news')}
      </button>
      <button className={previewNavButtonClass} onClick={onPlayerRankingsClick} type="button">
        {t('nav.playerRankings')}
      </button>
      <button className={previewNavButtonClass} onClick={onForumClick} type="button">
        {t('nav.forum')}
      </button>
      <button className={previewNavButtonClass} onClick={onLeaderboardClick} type="button">
        {t('nav.leaderboard')}
      </button>
      <button className={previewNavButtonClass} onClick={onGuideClick} type="button">
        {t('nav.guide')}
      </button>
    </nav>
  )
}
