import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getWalletAvatarUrl } from '../helpers/walletUi'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import type { RankingViewer } from '../hooks/useRankings'
import type { useUsdtTransfer } from '../hooks/useUsdtTransfer'
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
  onRankingClick,
  onGuideClick,
  onOpenAuthModal,
  onDisconnect,
}: HeaderProps) {
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
  const [copyLabel, setCopyLabel] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const avatarUrl = getWalletAvatarUrl(address)
  const usdtBalanceLabel = !isUsdtSupportedChain
    ? '지원되지 않는 네트워크'
    : isUsdtBalanceLoading
      ? '불러오는 중...'
      : `${(usdtBalance ?? 0).toFixed(4)} USDT`

  useBodyScrollLock(isAccountModalOpen || isTransferModalOpen)

  useEffect(() => {
    if (!isAccountModalOpen && !isTransferModalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTransferModalOpen(false)
        setIsAccountModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAccountModalOpen, isTransferModalOpen])

  const handleCopyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopyLabel('copied')
    } catch {
      setCopyLabel('failed')
    }
    window.setTimeout(() => setCopyLabel('idle'), 1600)
  }

  const handleDisconnect = () => {
    setIsAccountModalOpen(false)
    onDisconnect()
  }

  const handleGuideNavigation = () => {
    setIsTransferModalOpen(false)
    setIsAccountModalOpen(false)
    onGuideClick()
  }

  const handleRankingNavigation = () => {
    setIsTransferModalOpen(false)
    setIsAccountModalOpen(false)
    onRankingClick()
  }

  const handleWalletAction = () => {
    setIsAccountModalOpen(false)

    if (!isConnected) {
      onOpenAuthModal()
      return
    }

    setIsTransferModalOpen(true)
  }

  const accountPanel = (
    <AccountPanel
      address={address}
      avatarUrl={avatarUrl}
      profileDisplayName={profileDisplayName}
      profileNickname={profileNickname}
      isProfileSaving={isProfileSaving}
      profileErrorMessage={profileErrorMessage}
      onSaveNickname={onSaveNickname}
      rankingViewer={rankingViewer}
      isRankingLoading={isRankingLoading}
      usdtBalanceLabel={usdtBalanceLabel}
      iconButtonClass={iconButtonClass}
      primaryButtonClass={primaryButtonClass}
      copyLabel={copyLabel}
      onCopyAddress={handleCopyAddress}
      onDisconnect={handleDisconnect}
      onClose={() => setIsAccountModalOpen(false)}
      onOpenRanking={handleRankingNavigation}
    />
  )

  return (
    <>
      <header className="section-shell flex min-h-[68px] items-center justify-between gap-2.5 bg-transparent px-2.5 py-1.5 shadow-none md:min-h-0 md:gap-4 md:p-4 desktop-surface-fill desktop-surface-variant">
        <div className={titleWrapperClass}>
          <h1 className="m-0">
            {onTitleClick ? (
              <button
                aria-label="탐색으로 이동"
                className={`${titleClass} m-0 cursor-pointer border-0 bg-transparent p-0 text-left`}
                onClick={onTitleClick}
                type="button"
              >
                세기의 격잘알
              </button>
            ) : (
              <span className={titleClass}>세기의 격잘알</span>
            )}
          </h1>
        </div>
        <div className="shrink-0">
          {!isConnected ? (
            <div className="flex flex-col items-end gap-2">
              <HeaderActions
                secondaryButtonClass={secondaryButtonClass}
                isConnecting={isConnecting}
                isAuthenticated={isAuthenticated}
                canOpenAuthModal={canOpenAuthModal}
                onWalletClick={handleWalletAction}
                onOpenAuthModal={onOpenAuthModal}
                onDisconnect={onDisconnect}
                onGuideClick={handleGuideNavigation}
                onRankingClick={handleRankingNavigation}
              />
              {isAuthenticated && isWalletStatusReady && !isConnecting && !isReconnecting && (
                <p className="ui-text-muted m-0 text-right text-xs">
                  로그인은 완료됐지만 지갑이 아직 연결되지 않았습니다. 지갑 연결을 진행해 주세요.
                </p>
              )}
              {connectErrorMessage && <p className={connectErrorClass}>{connectErrorMessage}</p>}
            </div>
          ) : (
            <div className="relative flex items-center justify-end gap-2">
              <HeaderNavButtons onGuideClick={handleGuideNavigation} onRankingClick={handleRankingNavigation} onWalletClick={handleWalletAction} />
              <button
                aria-expanded={isAccountModalOpen}
                aria-haspopup="dialog"
                aria-label="계정 메뉴 열기"
                className={accountTriggerClass}
                onClick={() => setIsAccountModalOpen((current) => !current)}
                type="button"
              >
                <img alt="" className="h-10 w-10 rounded-full border object-cover" src={avatarUrl} />
                <span className="ui-text-strong hidden text-sm font-semibold md:inline">{profileDisplayName}</span>
              </button>

              {isConnected && isAccountModalOpen && (
                <div className={desktopAccountPopoverClass}>
                  <section className="card-surface-soft card-shell-xl p-4 shadow-2xl">{accountPanel}</section>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {isConnected && isAccountModalOpen && (
        <>
          <button
            aria-label="계정 메뉴 닫기"
            className="fixed inset-0 z-40 hidden bg-transparent md:block"
            onClick={() => setIsAccountModalOpen(false)}
            type="button"
          />
          {typeof document !== 'undefined' &&
            createPortal(
              <div aria-modal="true" className="fixed inset-0 z-[70] flex items-end md:hidden" role="dialog">
                <button
                  aria-label="계정 시트 닫기"
                  className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
                  onClick={() => setIsAccountModalOpen(false)}
                  type="button"
                />
                <section className={mobileAccountSheetClass}>
                  <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/15" />
                  {accountPanel}
                </section>
              </div>,
              document.body,
            )}
        </>
      )}
      <TransferModal isOpen={isTransferModalOpen} isConnected={isConnected} chainId={chainId} usdtTransfer={usdtTransfer} onClose={() => setIsTransferModalOpen(false)} />
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
}) {
  const primaryButtonClass =
    'ui-btn-primary btn-shell inline-flex h-8 items-center justify-center px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 md:h-auto md:btn-shell-lg md:px-4 md:py-2 md:text-sm'

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <HeaderNavButtons onGuideClick={onGuideClick} onRankingClick={onRankingClick} onWalletClick={onWalletClick} />
      <button className={primaryButtonClass} disabled={!canOpenAuthModal || isConnecting} onClick={onOpenAuthModal}>
        {isConnecting ? '연결 중...' : isAuthenticated ? '지갑 연결' : '로그인'}
      </button>
      {isAuthenticated && (
        <button className={secondaryButtonClass} onClick={onDisconnect}>
          로그아웃
        </button>
      )}
    </div>
  )
}
