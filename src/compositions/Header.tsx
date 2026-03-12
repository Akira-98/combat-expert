import { useState } from 'react'
import { shortenAddress } from '../helpers/walletUi'

type HeaderProps = {
  isAuthenticated: boolean
  isConnected: boolean
  isConnecting: boolean
  address?: `0x${string}`
  isAAWallet?: boolean
  canOpenAuthModal: boolean
  connectErrorMessage?: string
  onTitleClick?: () => void
  onOpenAuthModal: () => void
  onDisconnect: () => void
}

export function Header({
  isAuthenticated,
  isConnected,
  isConnecting,
  address,
  isAAWallet,
  canOpenAuthModal,
  connectErrorMessage,
  onTitleClick,
  onOpenAuthModal,
  onDisconnect,
}: HeaderProps) {
  void isAAWallet
  const [copyLabel, setCopyLabel] = useState<'idle' | 'copied' | 'failed'>('idle')
  const secondaryButtonClass =
    'ui-btn-secondary inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-xs font-semibold transition md:h-auto md:rounded-lg md:px-4 md:py-2 md:text-sm disabled:cursor-not-allowed disabled:opacity-60'
  const primaryButtonClass =
    'ui-btn-primary inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-xs font-semibold transition md:h-auto md:rounded-lg md:px-4 md:py-2 md:text-sm disabled:cursor-not-allowed disabled:opacity-60'
  const iconButtonClass =
    'ui-btn-secondary inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold transition md:rounded-lg disabled:cursor-not-allowed disabled:opacity-60'

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

  return (
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
              <button className={primaryButtonClass} disabled={!canOpenAuthModal || isConnecting} onClick={onOpenAuthModal}>
                {isConnecting ? '연결 중...' : isAuthenticated ? '지갑 연결' : '로그인'}
              </button>
              {isAuthenticated && (
                <button className={secondaryButtonClass} onClick={onDisconnect}>
                  로그아웃
                </button>
              )}
            </div>
            {isAuthenticated && (
              <p className="ui-text-muted m-0 text-right text-xs">
                로그인은 완료됐지만 지갑이 아직 연결되지 않았습니다. 지갑 연결을 진행해 주세요.
              </p>
            )}
            {connectErrorMessage && <p className="ui-state-danger m-0 rounded-md border px-2 py-1 text-right text-xs font-medium">{connectErrorMessage}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex flex-nowrap items-center justify-end gap-1.5 md:gap-2">
              <span className="ui-pill rounded-full border px-2.5 py-1 text-xs font-medium">
                {shortenAddress(address)}
              </span>
              <button
                aria-label={copyLabel === 'idle' ? '주소 복사' : copyLabel === 'copied' ? '주소 복사됨' : '주소 복사 실패'}
                className={iconButtonClass}
                onClick={handleCopyAddress}
                title={copyLabel === 'idle' ? '주소 복사' : copyLabel === 'copied' ? '주소 복사됨' : '주소 복사 실패'}
                type="button"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M8 8.75A2.75 2.75 0 0 1 10.75 6h7.5A2.75 2.75 0 0 1 21 8.75v7.5A2.75 2.75 0 0 1 18.25 19h-7.5A2.75 2.75 0 0 1 8 16.25z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M16 6V5.75A2.75 2.75 0 0 0 13.25 3h-7.5A2.75 2.75 0 0 0 3 5.75v7.5A2.75 2.75 0 0 0 5.75 16H6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </button>
              <button aria-label="지갑 연결 해제" className={iconButtonClass} onClick={onDisconnect} title="지갑 연결 해제" type="button">
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path d="M14.5 5.75h2.75A1.75 1.75 0 0 1 19 7.5v9a1.75 1.75 0 0 1-1.75 1.75H14.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M10.5 8.25 14 12l-3.5 3.75" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M14 12H4.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
            </div>
            <span className="ui-pill rounded-full border px-2.5 py-1 text-[11px] font-medium md:text-xs">Polygon</span>
          </div>
        )}
      </div>
    </header>
  )
}
