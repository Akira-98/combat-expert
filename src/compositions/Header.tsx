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
  void isAAWallet
  const [copyLabel, setCopyLabel] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const secondaryButtonClass =
    'ui-btn-secondary inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-xs font-semibold transition md:h-auto md:rounded-lg md:px-4 md:py-2 md:text-sm disabled:cursor-not-allowed disabled:opacity-60'
  const primaryButtonClass =
    'ui-btn-primary inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-xs font-semibold transition md:h-auto md:rounded-lg md:px-4 md:py-2 md:text-sm disabled:cursor-not-allowed disabled:opacity-60'
  const iconButtonClass =
    'ui-btn-secondary inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold transition md:rounded-lg disabled:cursor-not-allowed disabled:opacity-60'
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
      <header className="flex min-h-[68px] items-start justify-between gap-2.5 rounded-none border-0 bg-transparent px-2.5 py-1.5 shadow-none md:min-h-0 md:items-center md:gap-4 md:rounded-xl md:border md:p-4 md:[background-color:var(--app-surface)] md:[border-color:var(--app-border)] md:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--app-border)_32%,transparent)]">
        <div className="min-w-0 py-0.5">
          <h1 className="m-0">
            {onTitleClick ? (
              <button
                aria-label="탐색으로 이동"
                className="ui-text-strong ui-mma-logo m-0 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 pt-0.5 text-left text-[22px] leading-[1.18] md:pt-0 md:text-[27px] md:leading-[1.15]"
                onClick={onTitleClick}
                type="button"
              >
                세기의 격잘알
              </button>
            ) : (
              <span className="ui-text-strong ui-mma-logo whitespace-nowrap pt-0.5 text-[22px] leading-[1.18] md:pt-0 md:text-[27px] md:leading-[1.15]">세기의 격잘알</span>
            )}
          </h1>
          <p className="ui-text-muted mt-0 whitespace-nowrap text-[11px] leading-[1.2] md:mt-1 md:text-sm">세계 최초 MMA 예측시장</p>
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
              {connectErrorMessage && <p className="ui-state-danger m-0 rounded-md border px-2 py-1 text-right text-xs font-medium">{connectErrorMessage}</p>}
            </div>
          ) : (
            <div className="relative flex items-center justify-end gap-2">
              <HeaderLinkButtons onGuideClick={handleGuideNavigation} onRankingClick={handleRankingNavigation} />
              <button
                aria-expanded={isAccountModalOpen}
                aria-haspopup="dialog"
                aria-label="계정 메뉴 열기"
                className="flex items-center gap-2 rounded-full border border-transparent bg-transparent p-0.5 transition hover:border-[color:var(--app-border)]"
                onClick={() => setIsAccountModalOpen((current) => !current)}
                type="button"
              >
                <img alt="" className="h-10 w-10 rounded-full border object-cover" src={avatarUrl} />
                <span className="ui-text-strong hidden text-sm font-semibold md:inline">{profileDisplayName}</span>
              </button>

              {isConnected && isAccountModalOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-50 hidden w-[min(24rem,calc(100vw-2rem))] md:block">
                  <section className="ui-surface-soft rounded-2xl border p-4 shadow-2xl">{accountPanel}</section>
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
                <section className="ui-surface-soft relative z-10 max-h-[min(86dvh,42rem)] w-full overflow-y-auto rounded-t-3xl border p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-2xl">
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
    'ui-btn-primary inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-xs font-semibold transition md:h-auto md:rounded-lg md:px-4 md:py-2 md:text-sm disabled:cursor-not-allowed disabled:opacity-60'

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
  return (
    <>
      <button className="ui-btn-secondary hidden rounded-lg border px-3 py-2 text-sm font-semibold md:inline-flex" onClick={onRankingClick} type="button">
        랭킹
      </button>
      <button className="ui-btn-secondary hidden rounded-lg border px-3 py-2 text-sm font-semibold md:inline-flex" onClick={onGuideClick} type="button">
        가이드
      </button>
    </>
  )
}
