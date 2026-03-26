import { getTxExplorerUrl } from '../helpers/walletUi'
import type { TransactionNotice } from '../helpers/betslipUi'
import { useI18n } from '../i18n'

type WalletTransferPanelProps = {
  isConnected: boolean
  chainId?: number
  balance: number
  recipient: string
  amountInput: string
  isSending: boolean
  validationMessage?: string
  transactionNotice?: TransactionNotice
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
  onRecipientChange,
  onAmountChange,
  onSetMaxAmount,
  onSend,
}: WalletTransferPanelProps) {
  const { t } = useI18n()
  const txUrl = transactionNotice?.txHash ? getTxExplorerUrl(chainId, transactionNotice.txHash) : undefined

  return (
    <section className="panel section-shell desktop-surface-variant p-2.5 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="ui-text-strong m-0 text-base font-semibold">{t('walletTransfer.title')}</h2>
        <span className="ui-text-muted text-xs">Polygon</span>
      </div>

      <div className="mt-3 space-y-2.5">
        <label className="grid gap-1">
          <span className="ui-text-body text-xs font-semibold">{t('walletTransfer.recipient')}</span>
          <input
            className="ui-surface ui-text-body rounded-md border px-3 py-2 text-sm outline-none"
            disabled={!isConnected || isSending}
            onChange={(event) => onRecipientChange(event.target.value)}
            placeholder={t('walletTransfer.recipientPlaceholder')}
            value={recipient}
          />
        </label>

        <label className="grid gap-1">
          <span className="ui-text-body text-xs font-semibold">{t('walletTransfer.amount')}</span>
          <div className="flex items-center gap-2">
            <input
              className="ui-surface ui-text-body min-w-0 flex-1 rounded-md border px-3 py-2 text-sm outline-none"
              disabled={!isConnected || isSending}
              inputMode="decimal"
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder={t('walletTransfer.amountPlaceholder')}
              value={amountInput}
            />
            <button
              className="ui-btn-secondary rounded-md border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isConnected || isSending}
              onClick={onSetMaxAmount}
              type="button"
            >
              {t('common.max')}
            </button>
          </div>
        </label>
      </div>

      <p className="ui-text-muted mt-2 text-xs">{t('walletTransfer.balance', { balance: balance.toFixed(6) })}</p>

      {validationMessage && (
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

      <button
        className="ui-btn-primary mt-3 w-full rounded-md border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSending}
        onClick={onSend}
        type="button"
      >
        {isSending ? t('walletTransfer.sending') : t('walletTransfer.submit')}
      </button>
    </section>
  )
}
