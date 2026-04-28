import { createPortal } from 'react-dom'
import { useState } from 'react'
import type { useUsdtTransfer } from '../../hooks/useUsdtTransfer'
import { useI18n } from '../../i18n'
import { shortenAddress } from '../../helpers/walletUi'
import { WalletTransferPanel } from '../WalletTransferPanel'

type TransferModalProps = {
  isOpen: boolean
  isConnected: boolean
  chainId?: number
  address?: `0x${string}`
  usdtTransfer: ReturnType<typeof useUsdtTransfer>
  onClose: () => void
}

type TransferMode = 'deposit' | 'withdraw'

export function TransferModal({ isOpen, isConnected, chainId, address, usdtTransfer, onClose }: TransferModalProps) {
  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <TransferModalContent
      address={address}
      chainId={chainId}
      isConnected={isConnected}
      usdtTransfer={usdtTransfer}
      onClose={onClose}
    />,
    document.body,
  )
}

function TransferModalContent({ isConnected, chainId, address, usdtTransfer, onClose }: Omit<TransferModalProps, 'isOpen'>) {
  const { t } = useI18n()
  const [activeMode, setActiveMode] = useState<TransferMode>('deposit')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const handleCopyDepositAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    window.setTimeout(() => setCopyState('idle'), 1600)
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-[80] flex items-center justify-center px-2 md:px-4" role="dialog">
      <button aria-label={t('walletTransfer.modalClose')} className="ui-overlay-scrim absolute inset-0 backdrop-blur-sm" onClick={onClose} type="button" />
      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-2 flex justify-end">
          <button className="ui-btn-secondary rounded-md border px-3 py-1.5 text-sm font-semibold" onClick={onClose} type="button">
            {t('common.close')}
          </button>
        </div>
        <section className="panel section-shell desktop-surface-variant p-2.5 md:p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              aria-pressed={activeMode === 'deposit'}
              className={`${activeMode === 'deposit' ? 'ui-btn-primary' : 'ui-btn-secondary'} rounded-md border px-3 py-2 text-sm font-semibold transition`}
              onClick={() => setActiveMode('deposit')}
              type="button"
            >
              {t('walletTransfer.deposit')}
            </button>
            <button
              aria-pressed={activeMode === 'withdraw'}
              className={`${activeMode === 'withdraw' ? 'ui-btn-primary' : 'ui-btn-secondary'} rounded-md border px-3 py-2 text-sm font-semibold transition`}
              onClick={() => setActiveMode('withdraw')}
              type="button"
            >
              {t('walletTransfer.withdraw')}
            </button>
          </div>

          {activeMode === 'deposit' ? (
            <DepositPanel
              address={address}
              balance={usdtTransfer.balance}
              copyState={copyState}
              isConnected={isConnected}
              onCopyAddress={handleCopyDepositAddress}
            />
          ) : (
            <WalletTransferPanel
              isConnected={isConnected}
              chainId={chainId}
              balance={usdtTransfer.balance}
              recipient={usdtTransfer.recipient}
              amountInput={usdtTransfer.amountInput}
              isSending={usdtTransfer.isSending}
              validationMessage={usdtTransfer.validationMessage}
              transactionNotice={usdtTransfer.transactionNotice}
              isEmbedded
              onRecipientChange={usdtTransfer.setRecipient}
              onAmountChange={usdtTransfer.setAmountInput}
              onSetMaxAmount={usdtTransfer.setMaxAmount}
              onSend={usdtTransfer.sendUsdt}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function DepositPanel({
  address,
  balance,
  copyState,
  isConnected,
  onCopyAddress,
}: {
  address?: `0x${string}`
  balance: number
  copyState: 'idle' | 'copied' | 'failed'
  isConnected: boolean
  onCopyAddress: () => void
}) {
  const { t } = useI18n()
  const copyLabel = copyState === 'copied' ? t('walletTransfer.depositCopied') : copyState === 'failed' ? t('walletTransfer.depositCopyFailed') : t('walletTransfer.copyAddress')

  return (
    <div className="mt-5 grid gap-4">
      <div className="text-center">
        <h2 className="ui-text-strong m-0 text-[28px] font-bold leading-tight">{t('walletTransfer.depositTitle')}</h2>
        <p className="ui-text-muted m-0 mt-2 text-base">
          {t('walletTransfer.balanceLine', { balance: balance.toFixed(6) })}
        </p>
      </div>

      <TokenNetworkPicker />

      <div className="ui-surface-soft flex items-center justify-center gap-2 rounded-md border p-3">
        <span className="ui-text-strong text-center text-sm font-semibold">
          {t('walletTransfer.waitingDeposit')}
        </span>
      </div>

      <div className="grid gap-2 text-center">
        <p className="ui-text-body m-0 text-sm font-semibold">{t('walletTransfer.depositAddress')}</p>
        <div className="ui-surface mx-auto flex w-full max-w-sm items-center justify-between gap-2 rounded-md border p-2">
          <span className="ui-text-strong min-w-0 truncate px-2 font-mono text-sm font-semibold">
            {address ? shortenAddress(address, 6, 6) : t('walletTransfer.depositConnectWallet')}
          </span>
          <button
            className="ui-btn-primary shrink-0 rounded-md border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isConnected || !address}
            onClick={onCopyAddress}
            type="button"
          >
            {copyLabel}
          </button>
        </div>
        {address && <p className="ui-text-muted m-0 break-all text-[11px]">{address}</p>}
      </div>

      <p className="ui-state-warning-surface ui-text-body m-0 rounded-md border p-3 text-sm">
        {t('walletTransfer.depositNotice')}
      </p>
    </div>
  )
}

function TokenNetworkPicker() {
  const { t } = useI18n()

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <AssetSelect label={t('walletTransfer.coin')} logoSrc="/tether-logo.svg" value="USDT" />
      <AssetSelect label={t('walletTransfer.chain')} logoSrc="/polygon-logo.svg" value="Polygon" />
    </div>
  )
}

function AssetSelect({ label, logoSrc, value }: { label: string; logoSrc: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <span className="ui-text-muted text-sm font-semibold">{label}</span>
      <div className="ui-surface flex h-14 items-center gap-3 rounded-md border px-3">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5">
            <img alt="" className="h-6 w-6" src={logoSrc} />
          </span>
          <span className="ui-text-strong truncate text-lg font-semibold">{value}</span>
        </span>
      </div>
    </div>
  )
}
