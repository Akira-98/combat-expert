import { useState } from 'react'
import { getChainName, shortenAddress } from '../helpers/walletUi'

type HeaderProps = {
  isAuthenticated: boolean
  isConnected: boolean
  isConnecting: boolean
  address?: `0x${string}`
  chainId?: number
  expectedChainId: number
  isAAWallet?: boolean
  canOpenAuthModal: boolean
  connectErrorMessage?: string
  onOpenAuthModal: () => void
  onDisconnect: () => void
}

export function Header({
  isAuthenticated,
  isConnected,
  isConnecting,
  address,
  chainId,
  expectedChainId,
  isAAWallet,
  canOpenAuthModal,
  connectErrorMessage,
  onOpenAuthModal,
  onDisconnect,
}: HeaderProps) {
  const [copyLabel, setCopyLabel] = useState<'idle' | 'copied' | 'failed'>('idle')
  const secondaryButtonClass =
    'ui-btn-secondary rounded-md border px-2.5 py-1.5 text-xs font-semibold transition md:rounded-lg md:px-4 md:py-2 md:text-sm disabled:cursor-not-allowed disabled:opacity-60'
  const primaryButtonClass =
    'ui-btn-primary rounded-md border px-2.5 py-1.5 text-xs font-semibold transition md:rounded-lg md:px-4 md:py-2 md:text-sm disabled:cursor-not-allowed disabled:opacity-60'
  const isNetworkMatched = Boolean(chainId && chainId === expectedChainId)

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
    <header className="ui-surface flex items-center justify-between gap-2.5 rounded-none border-x-0 px-2.5 py-2 md:gap-4 md:rounded-xl md:border md:p-4">
      <div>
        <h1 className="ui-text-strong ui-mma-logo m-0 text-[22px] md:text-[27px]">세기의 격잘알</h1>
        <p className="ui-text-muted mt-0.5 text-xs md:mt-1 md:text-sm">세계 최초 MMA 예측시장</p>
      </div>
      <div>
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
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  isAAWallet
                    ? 'border-orange-300/40 bg-orange-950/40 text-orange-200'
                    : 'ui-pill'
                }`}
              >
                {isAAWallet ? 'Smart Wallet' : 'EOA Wallet'}
              </span>
              <span className="ui-pill rounded-full border px-2.5 py-1 text-xs font-medium">
                {shortenAddress(address)}
              </span>
              <button className={secondaryButtonClass} onClick={handleCopyAddress} type="button">
                {copyLabel === 'idle' ? '주소 복사' : copyLabel === 'copied' ? '복사됨' : '복사 실패'}
              </button>
              <button className={secondaryButtonClass} onClick={onDisconnect}>
                연결 해제
              </button>
            </div>
            <p className={`m-0 rounded-md border px-2 py-1 text-right text-xs font-medium ${isNetworkMatched ? 'ui-state-success' : 'ui-state-danger'}`}>
              네트워크: {getChainName(chainId)} {isNetworkMatched ? '(정상)' : '(지원 네트워크로 전환 필요)'}
            </p>
          </div>
        )}
      </div>
    </header>
  )
}
