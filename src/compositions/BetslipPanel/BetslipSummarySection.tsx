import type { TransactionNotice, TransactionStep } from '../../helpers/betslipUi'
import { getTxExplorerUrl } from '../../helpers/walletUi'

type BetslipSummarySectionProps = {
  totalOdds: number
  possibleWin: number
  tokenBalance?: number
  minBet?: number
  maxBet?: number
  isBalanceLoading?: boolean
  isLimitsLoading?: boolean
  amountValidationMessage?: string
  isApproveRequired: boolean
  approvePending: boolean
  betPending: boolean
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
  tokenBalance,
  minBet,
  maxBet,
  isBalanceLoading,
  isLimitsLoading,
  amountValidationMessage,
  isApproveRequired,
  approvePending,
  betPending,
  transactionSteps,
  transactionNotice,
  chainId,
  onDismissTransactionNotice,
  onRetryTransaction,
}: BetslipSummarySectionProps) {
  const txExplorerUrl = transactionNotice?.txHash ? getTxExplorerUrl(chainId, transactionNotice.txHash) : undefined

  return (
    <>
      <div className="ui-surface grid grid-cols-2 gap-2 rounded-md border p-3 md:rounded-lg">
        <div className="grid gap-1">
          <span className="ui-text-muted text-xs">총 배당</span>
          <strong className="ui-text-strong text-sm">{Number.isFinite(totalOdds) ? totalOdds.toFixed(3) : '0.000'}</strong>
        </div>
        <div className="grid gap-1">
          <span className="ui-text-muted text-xs">예상 수익</span>
          <strong className="ui-text-strong text-sm">{Number.isFinite(possibleWin) ? possibleWin.toFixed(4) : '0.0000'}</strong>
        </div>
      </div>

      <div className="ui-surface rounded-md border p-3 md:rounded-lg">
        <div className="grid grid-cols-3 gap-2">
          <div className="grid gap-1">
            <span className="ui-text-muted text-xs">잔액</span>
            <strong className="ui-text-strong text-sm">{isBalanceLoading ? '불러오는 중...' : formatAmount(tokenBalance)}</strong>
          </div>
          <div className="grid gap-1">
            <span className="ui-text-muted text-xs">최소 베팅</span>
            <strong className="ui-text-strong text-sm">{isLimitsLoading ? '확인 중...' : formatAmount(minBet)}</strong>
          </div>
          <div className="grid gap-1">
            <span className="ui-text-muted text-xs">최대 베팅</span>
            <strong className="ui-text-strong text-sm">{isLimitsLoading ? '확인 중...' : formatAmount(maxBet)}</strong>
          </div>
        </div>
        <p className="ui-text-muted mt-2 m-0 text-xs">
          다음 단계: {approvePending || betPending ? '트랜잭션 처리 중' : isApproveRequired ? '승인' : '베팅'}
        </p>

        {amountValidationMessage && (
          <p className="ui-state-danger-surface ui-text-body m-0 mt-2 rounded-md border px-2 py-1.5 text-xs">
            {amountValidationMessage}
          </p>
        )}

        {transactionSteps.length > 0 && (
          <div className="mt-2 grid gap-1.5">
            {transactionSteps.map((step) => (
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
                  {step.status === 'active' ? '진행 중' : step.status === 'done' ? '완료' : '대기'}
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
                  탐색기에서 보기
                </a>
              )}
              {transactionNotice.type === 'error' && (
                <button
                  className="ui-btn-danger-soft mt-2 rounded-md border px-2.5 py-1 text-xs font-semibold"
                  onClick={onRetryTransaction}
                  type="button"
                >
                  다시 시도
                </button>
              )}
            </div>
            <button
              className="ui-btn-secondary rounded-md border px-2 py-1 text-xs font-semibold"
              onClick={onDismissTransactionNotice}
              type="button"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  )
}
