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
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-3">
        <div className="grid gap-1">
          <span className="text-xs text-slate-500">총 배당</span>
          <strong className="text-sm">{Number.isFinite(totalOdds) ? totalOdds.toFixed(3) : '0.000'}</strong>
        </div>
        <div className="grid gap-1">
          <span className="text-xs text-slate-500">예상 수익</span>
          <strong className="text-sm">{Number.isFinite(possibleWin) ? possibleWin.toFixed(4) : '0.0000'}</strong>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="grid gap-1">
            <span className="text-xs text-slate-500">잔액</span>
            <strong className="text-sm text-slate-900">{isBalanceLoading ? '불러오는 중...' : formatAmount(tokenBalance)}</strong>
          </div>
          <div className="grid gap-1">
            <span className="text-xs text-slate-500">최소 베팅</span>
            <strong className="text-sm text-slate-900">{isLimitsLoading ? '확인 중...' : formatAmount(minBet)}</strong>
          </div>
          <div className="grid gap-1">
            <span className="text-xs text-slate-500">최대 베팅</span>
            <strong className="text-sm text-slate-900">{isLimitsLoading ? '확인 중...' : formatAmount(maxBet)}</strong>
          </div>
        </div>
        <p className="mt-2 m-0 text-xs text-slate-500">
          다음 단계: {approvePending || betPending ? '트랜잭션 처리 중' : isApproveRequired ? '승인' : '베팅'}
        </p>

        {amountValidationMessage && (
          <p className="m-0 mt-2 rounded-md border border-rose-300 bg-rose-50 px-2 py-1.5 text-xs text-rose-800">
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
                    ? 'border-blue-200 bg-blue-50 text-blue-800'
                    : step.status === 'done'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
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
          className={`rounded-lg border p-3 ${
            transactionNotice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-rose-200 bg-rose-50'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className={`m-0 text-sm font-semibold ${
                  transactionNotice.type === 'success' ? 'text-emerald-900' : 'text-rose-900'
                }`}
              >
                {transactionNotice.title}
              </p>
              <p
                className={`mt-1 text-xs ${
                  transactionNotice.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {transactionNotice.message}
              </p>
              {transactionNotice.txHash && (
                <p className="mt-1 text-[11px] text-slate-600">
                  TX: {transactionNotice.txHash.slice(0, 10)}...{transactionNotice.txHash.slice(-6)}
                </p>
              )}
              {txExplorerUrl && (
                <a
                  className="mt-1 inline-flex text-[11px] font-semibold text-blue-700 underline underline-offset-2"
                  href={txExplorerUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  탐색기에서 보기
                </a>
              )}
              {transactionNotice.type === 'error' && (
                <button
                  className="mt-2 rounded-md border border-rose-300 bg-white px-2.5 py-1 text-xs font-semibold text-rose-800"
                  onClick={onRetryTransaction}
                  type="button"
                >
                  다시 시도
                </button>
              )}
            </div>
            <button
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
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
