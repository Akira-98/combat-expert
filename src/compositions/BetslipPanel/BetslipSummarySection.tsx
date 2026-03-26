import type { TransactionNotice, TransactionStep } from '../../helpers/betslipUi'
import { useI18n } from '../../i18n'
import { getTxExplorerUrl } from '../../helpers/walletUi'

type BetslipSummarySectionProps = {
  totalOdds: number
  possibleWin: number
  minBet?: number
  maxBet?: number
  isLimitsLoading?: boolean
  amountValidationMessage?: string
  transactionSteps: TransactionStep[]
  transactionNotice?: TransactionNotice
  chainId?: number
  onDismissTransactionNotice: () => void
  onRetryTransaction: () => void
}

const formatAmount = (value?: number, digits = 4) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '-'

export function BetslipSummarySection({
  totalOdds,
  possibleWin,
  minBet,
  maxBet,
  isLimitsLoading,
  amountValidationMessage,
  transactionSteps,
  transactionNotice,
  chainId,
  onDismissTransactionNotice,
  onRetryTransaction,
}: BetslipSummarySectionProps) {
  const { t } = useI18n()
  const txExplorerUrl = transactionNotice?.txHash ? getTxExplorerUrl(chainId, transactionNotice.txHash) : undefined

  return (
    <>
      <div className="card-surface card-shell grid grid-cols-2 gap-2 p-3">
        <div className="grid gap-1">
          <span className="ui-text-muted text-xs">{t('betslip.totalOdds')}</span>
          <strong className="ui-text-strong text-sm">{Number.isFinite(totalOdds) ? totalOdds.toFixed(3) : '0.000'}</strong>
        </div>
        <div className="grid gap-1">
          <span className="ui-text-muted text-xs">{t('betslip.possibleWin')}</span>
          <strong className="ui-text-strong text-sm">{Number.isFinite(possibleWin) ? possibleWin.toFixed(4) : '0.0000'}</strong>
        </div>
      </div>

      <div className="card-surface card-shell p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <span className="ui-text-muted text-xs">{t('betslip.minBet')}</span>
            <strong className="ui-text-strong text-sm">{isLimitsLoading ? t('betslip.checking') : formatAmount(minBet)}</strong>
          </div>
          <div className="grid gap-1">
            <span className="ui-text-muted text-xs">{t('betslip.maxBet')}</span>
            <strong className="ui-text-strong text-sm">{isLimitsLoading ? t('betslip.checking') : formatAmount(maxBet)}</strong>
          </div>
        </div>

        {amountValidationMessage && (
          <p className="ui-state-danger-surface ui-text-body m-0 mt-2 rounded-md border px-2 py-1.5 text-xs">
            {amountValidationMessage}
          </p>
        )}

        {transactionSteps.some((step) => step.status !== 'pending') && (
          <div className="mt-2 grid gap-1.5">
            {transactionSteps.filter((step) => step.status !== 'pending').map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-xs ${
                  step.status === 'active'
                    ? 'ui-state-warning'
                    : step.status === 'done'
                      ? 'ui-state-success'
                      : 'ui-surface ui-text-muted'
                }`}
              >
                <span>{step.label}</span>
                <span>
                  {step.status === 'active' ? t('betslip.step.active') : step.status === 'done' ? t('betslip.step.done') : t('betslip.step.pending')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {transactionNotice && (
        <div
          className={`rounded-md border p-3 md:rounded-lg ${
            transactionNotice.type === 'success'
              ? 'ui-state-success'
              : 'ui-state-danger'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="m-0 text-sm font-semibold">{transactionNotice.title}</p>
              <p className="mt-1 text-xs">{transactionNotice.message}</p>
              {transactionNotice.txHash && (
                <p className="ui-text-muted mt-1 text-[11px]">
                  TX: {transactionNotice.txHash.slice(0, 10)}...{transactionNotice.txHash.slice(-6)}
                </p>
              )}
              {txExplorerUrl && (
                <a
                  className="ui-text-body mt-1 inline-flex text-[11px] font-semibold underline underline-offset-2"
                  href={txExplorerUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t('betslip.viewExplorer')}
                </a>
              )}
              {transactionNotice.type === 'error' && (
                <button
                  className="ui-btn-danger-soft mt-2 rounded-md border px-2.5 py-1 text-xs font-semibold"
                  onClick={onRetryTransaction}
                  type="button"
                >
                  {t('common.retry')}
                </button>
              )}
            </div>
            <button
              className="ui-btn-secondary rounded-md border px-2 py-1 text-xs font-semibold"
              onClick={onDismissTransactionNotice}
              type="button"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
