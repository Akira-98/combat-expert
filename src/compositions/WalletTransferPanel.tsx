import { getTxExplorerUrl } from '../helpers/walletUi'
import type { TransactionNotice } from '../helpers/betslipUi'

type WalletTransferPanelProps = {
  isConnected: boolean
  chainId?: number
  tokenAddress?: `0x${string}`
  balance: number
  recipient: string
  amountInput: string
  isSending: boolean
  validationMessage?: string
  canSend: boolean
  transactionNotice?: TransactionNotice
  onRecipientChange: (value: string) => void
  onAmountChange: (value: string) => void
  onSetMaxAmount: () => void
  onSend: () => void
}

export function WalletTransferPanel({
  isConnected,
  chainId,
  tokenAddress,
  balance,
  recipient,
  amountInput,
  isSending,
  validationMessage,
  canSend,
  transactionNotice,
  onRecipientChange,
  onAmountChange,
  onSetMaxAmount,
  onSend,
}: WalletTransferPanelProps) {
  const txUrl = transactionNotice?.txHash ? getTxExplorerUrl(chainId, transactionNotice.txHash) : undefined

  return (
    <section className="panel section-shell desktop-surface-variant p-2.5 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="ui-text-strong m-0 text-base font-semibold">USDT 송금</h2>
        <span className="ui-text-muted text-xs">Polygon</span>
      </div>

      <p className="ui-text-muted mt-1.5 text-xs">
        스마트월렛 USDT를 다른 주소(거래소/개인지갑)로 전송합니다.
      </p>

      {tokenAddress && (
        <p className="ui-text-muted mt-1 text-xs">
          USDT 컨트랙트: {tokenAddress}
        </p>
      )}

      <div className="mt-3 space-y-2.5">
        <label className="grid gap-1">
          <span className="ui-text-body text-xs font-semibold">수신 주소</span>
          <input
            className="ui-surface ui-text-body rounded-md border px-3 py-2 text-sm outline-none"
            disabled={!isConnected || isSending}
            onChange={(event) => onRecipientChange(event.target.value)}
            placeholder="0x..."
            value={recipient}
          />
        </label>

        <label className="grid gap-1">
          <span className="ui-text-body text-xs font-semibold">금액 (USDT)</span>
          <div className="flex items-center gap-2">
            <input
              className="ui-surface ui-text-body min-w-0 flex-1 rounded-md border px-3 py-2 text-sm outline-none"
              disabled={!isConnected || isSending}
              inputMode="decimal"
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="0.0"
              value={amountInput}
            />
            <button
              className="ui-btn-secondary rounded-md border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isConnected || isSending}
              onClick={onSetMaxAmount}
              type="button"
            >
              Max
            </button>
          </div>
        </label>
      </div>

      <p className="ui-text-muted mt-2 text-xs">보유 USDT: {balance.toFixed(6)}</p>

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
          트랜잭션 확인
        </a>
      )}

      <p className="ui-text-muted mt-3 text-[11px]">
        거래소 입금은 네트워크/주소 불일치 시 복구가 어렵습니다. 소액 테스트 전송 후 본전송을 권장합니다.
      </p>

      <button
        className="ui-btn-primary mt-3 w-full rounded-md border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canSend}
        onClick={onSend}
        type="button"
      >
        {isSending ? '송금 중...' : 'USDT 송금'}
      </button>
    </section>
  )
}
