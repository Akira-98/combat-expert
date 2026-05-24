import { useState } from 'react'
import { buildPolygonUsdtWithdrawBridgeUrl, type BridgeChain } from '../helpers/bridgeLinks'
import { getTxExplorerUrl } from '../helpers/walletUi'
import type { TransactionNotice } from '../helpers/betslipUi'
import { useI18n } from '../i18n'

type TransferChain = 'polygon' | BridgeChain

type WalletTransferPanelProps = {
  isConnected: boolean
  chainId?: number
  balance: number
  recipient: string
  amountInput: string
  isSending: boolean
  validationMessage?: string
  transactionNotice?: TransactionNotice
  isEmbedded?: boolean
  onRecipientChange: (value: string) => void
  onAmountChange: (value: string) => void
  onSetMaxAmount: () => void
  onSend: () => void
}

export function WalletTransferPanel({
  isConnected,
  chainId,
  balance,
  recipient,
  amountInput,
  isSending,
  validationMessage,
  transactionNotice,
  isEmbedded = false,
  onRecipientChange,
  onAmountChange,
  onSetMaxAmount,
  onSend,
}: WalletTransferPanelProps) {
  const { t } = useI18n()
  const [withdrawChain, setWithdrawChain] = useState<TransferChain>('polygon')
  const [isWithdrawChainPickerOpen, setIsWithdrawChainPickerOpen] = useState(false)
  const txUrl = transactionNotice?.txHash ? getTxExplorerUrl(chainId, transactionNotice.txHash) : undefined
  const panelClass = isEmbedded ? 'mt-4' : 'panel section-shell desktop-surface-variant p-2.5 md:p-4'
  const isPolygonWithdraw = withdrawChain === 'polygon'
  const bridgeTarget = withdrawChain === 'polygon' ? undefined : withdrawChain
  const canOpenBridge = isConnected && Boolean(recipient.trim()) && !isSending
  const bridgeUrl = bridgeTarget && recipient.trim()
    ? buildPolygonUsdtWithdrawBridgeUrl(bridgeTarget, recipient.trim())
    : undefined

  return (
    <section className={panelClass}>
      <div className="text-center">
        <h2 className="ui-text-strong m-0 text-[28px] font-bold leading-tight">{t('walletTransfer.withdrawTitle')}</h2>
        <p className="ui-text-muted m-0 mt-2 text-base">
          {t('walletTransfer.balanceLine', { balance: balance.toFixed(6) })}
        </p>
      </div>

      <TokenNetworkPicker
        chain={withdrawChain}
        isChainPickerOpen={isWithdrawChainPickerOpen}
        onChainChange={(nextChain) => {
          setWithdrawChain(nextChain)
          setIsWithdrawChainPickerOpen(false)
        }}
        onChainPickerToggle={() => setIsWithdrawChainPickerOpen((isOpen) => !isOpen)}
      />

      <div className="mt-4 space-y-3">
        <label className="grid gap-1">
          <span className="ui-text-body text-center text-sm font-semibold">
            {isPolygonWithdraw ? t('walletTransfer.withdrawAddressLabel') : t('walletTransfer.bridgeWithdrawAddressLabel')}
          </span>
          <input
            className="ui-surface ui-text-body h-14 rounded-md border px-3 text-sm outline-none"
            disabled={!isConnected || isSending}
            onChange={(event) => onRecipientChange(event.target.value)}
            placeholder={isPolygonWithdraw ? t('walletTransfer.recipientPlaceholder') : t('walletTransfer.bridgeWithdrawRecipientPlaceholder')}
            value={recipient}
          />
        </label>

        {isPolygonWithdraw && (
          <label className="grid gap-1">
            <span className="ui-text-body text-center text-sm font-semibold">{t('walletTransfer.withdrawAmountLabel')}</span>
            <div className="flex items-center gap-2">
              <input
                className="ui-surface ui-text-body h-14 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none"
                disabled={!isConnected || isSending}
                inputMode="decimal"
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder={t('walletTransfer.amountPlaceholder')}
                value={amountInput}
              />
              <button
                className="ui-btn-secondary h-12 rounded-md border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!isConnected || isSending}
                onClick={onSetMaxAmount}
                type="button"
              >
                {t('common.max')}
              </button>
            </div>
          </label>
        )}
      </div>

      <p className="ui-text-muted mt-3 text-center text-sm">{t('walletTransfer.availableToWithdraw', { balance: balance.toFixed(6) })}</p>

      {!isPolygonWithdraw && (
        <p className="ui-state-warning-surface ui-text-body mt-2 rounded-md border p-2 text-xs">
          {t('walletTransfer.bridgeWithdrawHelper')}
        </p>
      )}

      {isPolygonWithdraw && validationMessage && (
        <p className="ui-state-warning-surface ui-text-body mt-2 rounded-md border p-2 text-xs">
          {validationMessage}
        </p>
      )}

      {transactionNotice && (
        <p className={`${transactionNotice.type === 'success' ? 'ui-state-success' : 'ui-state-danger'} mt-2 rounded-md border p-2 text-xs font-medium`}>
          {transactionNotice.title}: {transactionNotice.message}
        </p>
      )}

      {transactionNotice?.txHash && txUrl && (
        <a className="ui-text-body mt-2 inline-block text-xs underline" href={txUrl} rel="noreferrer" target="_blank">
          {t('walletTransfer.viewTx')}
        </a>
      )}

      {isPolygonWithdraw ? (
        <button
          className="mt-5 w-full rounded-md border border-transparent bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-accent)_78%,white)_0%,var(--app-accent)_55%,color-mix(in_oklab,var(--app-accent)_74%,black)_100%)] px-3 py-3 text-sm font-black uppercase text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSending}
          onClick={onSend}
          type="button"
        >
          {isSending ? t('walletTransfer.sending') : t('walletTransfer.withdrawSubmit')}
        </button>
      ) : (
        <a
          aria-disabled={!canOpenBridge || !bridgeUrl}
          className={`mt-5 block w-full rounded-md border border-transparent bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-accent)_78%,white)_0%,var(--app-accent)_55%,color-mix(in_oklab,var(--app-accent)_74%,black)_100%)] px-3 py-3 text-center text-sm font-black uppercase text-white transition ${canOpenBridge && bridgeUrl ? '' : 'pointer-events-none opacity-50'}`}
          href={bridgeUrl}
          rel="noreferrer"
          target="_blank"
        >
          {t('walletTransfer.bridgeWithdrawSubmit')}
        </a>
      )}

      <p className="ui-state-warning-surface ui-text-body mt-4 rounded-md border p-3 text-sm">
        {isPolygonWithdraw ? t('walletTransfer.withdrawNotice') : t('walletTransfer.bridgeWithdrawNotice')}
      </p>
    </section>
  )
}

function TokenNetworkPicker({
  chain,
  isChainPickerOpen,
  onChainChange,
  onChainPickerToggle,
}: {
  chain: TransferChain
  isChainPickerOpen: boolean
  onChainChange: (chain: TransferChain) => void
  onChainPickerToggle: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <AssetSelect label={t('walletTransfer.coin')} logoSrc="/tether-logo.svg" value="USDT" />
      <div className="grid gap-1.5">
        <span className="ui-text-muted text-sm font-semibold">{t('walletTransfer.chain')}</span>
        <div className="relative">
          <button
            aria-expanded={isChainPickerOpen}
            className="ui-surface ui-text-strong flex h-14 w-full items-center justify-between gap-2 rounded-md border px-3 text-left text-lg font-semibold"
            onClick={onChainPickerToggle}
            type="button"
          >
            <span className="truncate">{getTransferChainLabel(chain)}</span>
            <span aria-hidden="true" className="ui-text-muted text-sm">
              {isChainPickerOpen ? '^' : 'v'}
            </span>
          </button>
          {isChainPickerOpen && (
            <div className="ui-surface absolute left-0 right-0 top-[calc(100%+6px)] z-20 grid gap-1 rounded-md border p-1 shadow-xl">
              {(['polygon', 'bnb', 'solana'] as const).map((nextChain) => (
                <button
                  aria-pressed={chain === nextChain}
                  className={`${chain === nextChain ? 'ui-btn-primary' : 'ui-btn-secondary'} rounded px-3 py-2 text-left text-sm font-semibold transition`}
                  key={nextChain}
                  onClick={() => onChainChange(nextChain)}
                  type="button"
                >
                  {getTransferChainLabel(nextChain)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getTransferChainLabel(chain: TransferChain) {
  if (chain === 'bnb') return 'BNB'
  if (chain === 'solana') return 'Solana'
  return 'Polygon'
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
