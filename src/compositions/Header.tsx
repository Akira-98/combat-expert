import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getChainName, getWalletAvatarUrl, shortenAddress } from '../helpers/walletUi'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'

type HeaderProps = {
  isAuthenticated: boolean
  isConnected: boolean
  isConnecting: boolean
  isReconnecting?: boolean
  isWalletStatusReady: boolean
  address?: `0x${string}`
  chainId?: number
  isAAWallet?: boolean
  usdtBalance?: number
  isUsdtBalanceLoading?: boolean
  isUsdtSupportedChain?: boolean
  canOpenAuthModal: boolean
  connectErrorMessage?: string
  onTitleClick?: () => void
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
  chainId,
  isAAWallet,
  usdtBalance,
  isUsdtBalanceLoading,
  isUsdtSupportedChain,
  canOpenAuthModal,
  connectErrorMessage,
  onTitleClick,
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
  const networkName = getChainName(chainId)
  const avatarUrl = getWalletAvatarUrl(address)
  const usdtBalanceLabel = !isUsdtSupportedChain
    ? '지원되지 않는 네트워크'
    : isUsdtBalanceLoading
      ? '불러오는 중...'
      : `${(usdtBalance ?? 0).toFixed(4)} USDT`

  useBodyScrollLock(isAccountModalOpen)

  useEffect(() => {
    if (!isConnected) {
      setIsAccountModalOpen(false)
    }
  }, [isConnected])

  useEffect(() => {
    if (!isAccountModalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAccountModalOpen])

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

  const accountPanel = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img alt="" className="h-14 w-14 rounded-full border object-cover" src={avatarUrl} />
          <div className="min-w-0">
            <p className="ui-text-strong m-0 text-sm font-semibold">연결된 지갑</p>
            <div className="mt-1 flex items-center gap-1.5">
              <p className="ui-text-muted truncate text-xs">{shortenAddress(address, 6, 4)}</p>
              <button
                aria-label={copyLabel === 'idle' ? '주소 복사' : copyLabel === 'copied' ? '주소 복사됨' : '주소 복사 실패'}
                className={`${iconButtonClass} h-7 w-7 rounded-full border`}
                onClick={handleCopyAddress}
                title={copyLabel === 'idle' ? '주소 복사' : copyLabel === 'copied' ? '주소 복사됨' : '주소 복사 실패'}
                type="button"
              >
                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <rect height="11" rx="2" stroke="currentColor" strokeWidth="1.8" width="11" x="9" y="9" />
                  <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
              <button aria-label="로그아웃" className={`${iconButtonClass} h-7 w-7 rounded-full border`} onClick={handleDisconnect} title="로그아웃" type="button">
                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <path d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M10 12h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                  <path d="m17 8 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </button>
              <span className="ui-text-strong inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-medium">{networkName}</span>
            </div>
          </div>
        </div>
        <button className={`${iconButtonClass} shrink-0 md:hidden`} onClick={() => setIsAccountModalOpen(false)} title="닫기" type="button">
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" />
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>

      <div className="mt-4 rounded-xl border px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="ui-text-muted m-0 text-[11px] font-medium">보유 잔액</p>
          <p className="ui-text-strong m-0 text-xs font-semibold">{usdtBalanceLabel}</p>
        </div>
      </div>
    </>
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
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  className="ui-btn-secondary hidden rounded-lg border px-3 py-2 text-sm font-semibold md:inline-flex"
                  onClick={handleGuideNavigation}
                  type="button"
                >
                  가이드
                </button>
                <button className={primaryButtonClass} disabled={!canOpenAuthModal || isConnecting} onClick={onOpenAuthModal}>
                  {isConnecting ? '연결 중...' : isAuthenticated ? '지갑 연결' : '로그인'}
                </button>
                {isAuthenticated && (
                  <button className={secondaryButtonClass} onClick={onDisconnect}>
                    로그아웃
                  </button>
                )}
              </div>
              {isAuthenticated && isWalletStatusReady && !isConnecting && !isReconnecting && (
                <p className="ui-text-muted m-0 text-right text-xs">
                  로그인은 완료됐지만 지갑이 아직 연결되지 않았습니다. 지갑 연결을 진행해 주세요.
                </p>
              )}
              {connectErrorMessage && <p className="ui-state-danger m-0 rounded-md border px-2 py-1 text-right text-xs font-medium">{connectErrorMessage}</p>}
            </div>
          ) : (
            <div className="relative flex items-center justify-end gap-2">
              <button
                className="ui-btn-secondary hidden rounded-lg border px-3 py-2 text-sm font-semibold md:inline-flex"
                onClick={handleGuideNavigation}
                type="button"
              >
                가이드
              </button>
              <button
                aria-expanded={isAccountModalOpen}
                aria-haspopup="dialog"
                aria-label="계정 메뉴 열기"
                className="flex items-center gap-2 rounded-full border border-transparent bg-transparent p-0.5 transition hover:border-[color:var(--app-border)]"
                onClick={() => setIsAccountModalOpen((current) => !current)}
                type="button"
              >
                <img alt="" className="h-10 w-10 rounded-full border object-cover" src={avatarUrl} />
                <span className="ui-text-strong hidden text-sm font-semibold md:inline">{shortenAddress(address, 4, 4)}</span>
              </button>

              {isAccountModalOpen && (
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
