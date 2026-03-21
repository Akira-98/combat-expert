import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getWalletAvatarUrl } from '../helpers/walletUi'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import type { RankingViewer } from '../hooks/useRankings'
import { AccountPanel } from './header/AccountPanel'

type HeaderProps = {
  isAuthenticated: boolean
  isConnected: boolean
  isConnecting: boolean
  isReconnecting?: boolean
  isWalletStatusReady: boolean
  address?: `0x${string}`
  profileDisplayName: string
  profileNickname?: string | null
  isProfileSaving: boolean
  profileErrorMessage?: string
  onSaveNickname: (nickname: string) => Promise<unknown>
  isAAWallet?: boolean
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
  address,
  profileDisplayName,
  profileNickname,
  isProfileSaving,
  profileErrorMessage,
  onSaveNickname,
  isAAWallet,
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
  const connectErrorClass = 'ui-state-danger m-0 rounded-md border px-2 py-1 text-right text-xs font-medium'
  const accountTriggerClass =
    'flex items-center gap-2 rounded-full border border-transparent bg-transparent p-0.5 transition hover:border-[color:var(--app-border)]'
  const desktopAccountPopoverClass = 'absolute right-0 top-[calc(100%+12px)] z-50 hidden w-[min(24rem,calc(100vw-2rem))] md:block'
  const mobileAccountSheetClass =
    'ui-surface-soft relative z-10 max-h-[min(86dvh,42rem)] w-full overflow-y-auto rounded-t-3xl border p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-2xl'
  void isAAWallet
  const [copyLabel, setCopyLabel] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const avatarUrl = getWalletAvatarUrl(address)
  const usdtBalanceLabel = !isUsdtSupportedChain
    ? '지원되지 않는 네트워크'
    : isUsdtBalanceLoading
      ? '불러오는 중...'
      : `${(usdtBalance ?? 0).toFixed(4)} USDT`

  useBodyScrollLock(isAccountModalOpen)

  useEffect(() => {
    if (!isConnected || !isAccountModalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAccountModalOpen, isConnected])

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
    setIsAccountModalOpen(false)
    onGuideClick()
  }

  const handleRankingNavigation = () => {
    setIsAccountModalOpen(false)
    onRankingClick()
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
      <header className="section-shell flex min-h-[68px] items-start justify-between gap-2.5 bg-transparent px-2.5 py-1.5 shadow-none md:min-h-0 md:items-center md:gap-4 md:p-4 desktop-surface-fill desktop-surface-variant">
        <div className="min-w-0 py-0.5">
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
              <HeaderLinkButtons onGuideClick={handleGuideNavigation} onRankingClick={handleRankingNavigation} />
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
    </>
  )
}

function HeaderActions({
  secondaryButtonClass,
  isConnecting,
  isAuthenticated,
  canOpenAuthModal,
  onOpenAuthModal,
  onDisconnect,
  onGuideClick,
  onRankingClick,
}: {
  secondaryButtonClass: string
  isConnecting: boolean
  isAuthenticated: boolean
  canOpenAuthModal: boolean
  onOpenAuthModal: () => void
  onDisconnect: () => void
  onGuideClick: () => void
  onRankingClick: () => void
}) {
  const primaryButtonClass =
    'ui-btn-primary btn-shell inline-flex h-8 items-center justify-center px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 md:h-auto md:btn-shell-lg md:px-4 md:py-2 md:text-sm'

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <HeaderLinkButtons onGuideClick={onGuideClick} onRankingClick={onRankingClick} />
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

function HeaderLinkButtons({
  onGuideClick,
  onRankingClick,
}: {
  onGuideClick: () => void
  onRankingClick: () => void
}) {
  const navButtonClass =
    'ui-text-body hidden h-9 w-9 items-center justify-center rounded-full bg-transparent text-sm transition hover:bg-black/5 md:inline-flex dark:hover:bg-white/5'
  return (
    <>
      <button aria-label="랭킹" className={navButtonClass} onClick={onRankingClick} title="랭킹" type="button">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M8 21h8" strokeLinecap="round" />
          <path d="M12 16v5" strokeLinecap="round" />
          <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 6H5a2 2 0 0 0 2 2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6h2a2 2 0 0 1-2 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button aria-label="가이드" className={navButtonClass} onClick={onGuideClick} title="가이드" type="button">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M6 5.75A2.75 2.75 0 0 1 8.75 3H19v16H8.75A2.75 2.75 0 0 0 6 21Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 5.75v15.5" strokeLinecap="round" />
          <path d="M9.5 7.5h6M9.5 11h6M9.5 14.5h4" strokeLinecap="round" />
        </svg>
      </button>
    </>
  )
}
