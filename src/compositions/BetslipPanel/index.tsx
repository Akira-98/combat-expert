import { useState } from 'react'
import type { SelectionItem } from '../../types/ui'
import type { TransactionNotice, TransactionStep } from '../../helpers/betslipUi'
import { selectionKey } from '../../helpers/mappers'
import { DISABLE_REASON_LABEL } from './constants'
import { BetslipAmountSection } from './BetslipAmountSection'
import { BetslipSlippageSettings } from './BetslipSlippageSettings'
import { BetslipSummarySection } from './BetslipSummarySection'

export type BetslipPanelWalletState = {
  isConnected: boolean
  canConnectWallet: boolean
  isConnectingWallet: boolean
  chainId?: number
}

export type BetslipPanelBetState = {
  selections: SelectionItem[]
  betAmount: string
  slippage: number
  totalOdds: number
  possibleWin: number
  canBet: boolean
  isApproveRequired: boolean
  approvePending: boolean
  betPending: boolean
  disableReason?: string
  uiBlockHint?: string
  submitLabel: string
  minBet?: number
  maxBet?: number
  tokenBalance?: number
  isBalanceLoading?: boolean
  isLimitsLoading?: boolean
  amountValidationMessage?: string
  transactionSteps: TransactionStep[]
  transactionNotice?: TransactionNotice
}

export type BetslipPanelActions = {
  onConnectWallet: () => void
  onBetAmountChange: (value: string) => void
  onSlippageChange: (value: number) => void
  onSubmit: () => void
  onClear: () => void
  onDismissTransactionNotice: () => void
  onRemoveSelection: (item: Pick<SelectionItem, 'conditionId' | 'outcomeId'>) => void
}

export type BetslipPanelProps = {
  wallet: BetslipPanelWalletState
  bet: BetslipPanelBetState
  actions: BetslipPanelActions
}

export function BetslipPanel({
  wallet,
  bet,
  actions,
}: BetslipPanelProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const secondaryButtonClass =
    'ui-btn-secondary rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'
  const settingsButtonClass =
    'ui-btn-ghost rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'
  const clearButtonClass =
    'ui-btn-danger-soft rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'
  const disableReasonText = bet.disableReason ? (DISABLE_REASON_LABEL[bet.disableReason] ?? bet.disableReason) : undefined

  const selectionLabel = bet.selections.length <= 1 ? '싱글' : `콤보 (${bet.selections.length})`
  const formatOdds = (value: number) => (Number.isFinite(value) ? value.toFixed(3) : '0.000')
  const isPrimaryDisabled = wallet.isConnected
    ? !bet.canBet || bet.approvePending || bet.betPending
    : !wallet.canConnectWallet || wallet.isConnectingWallet
  const primaryButtonLabel = !wallet.isConnected && wallet.isConnectingWallet ? '지갑 연결 중...' : bet.submitLabel

  return (
    <section className="ui-surface rounded-xl border">
      <div className="ui-border flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="ui-text-strong m-0 text-base font-semibold">베팅슬립</h2>
          <p className="ui-text-muted mt-0.5 text-xs">{selectionLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className={settingsButtonClass} onClick={() => setIsSettingsOpen((open) => !open)} type="button">
            설정
          </button>
          <button className={clearButtonClass} onClick={actions.onClear} type="button">
            비우기
          </button>
        </div>
      </div>

      {bet.selections.length > 0 ? (
        <ul className="m-0 grid max-h-[260px] list-none gap-2 overflow-y-auto px-4 py-3">
          {bet.selections.map((selection) => (
            <li
              key={selectionKey(selection.conditionId, selection.outcomeId)}
              className="ui-surface-soft grid gap-2 rounded-lg border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <strong className="ui-text-strong block text-[13px]">{selection.label}</strong>
                  <p className="ui-text-muted m-0 text-xs">선택한 아웃컴</p>
                </div>
                <button className={secondaryButtonClass} onClick={() => actions.onRemoveSelection(selection)}>
                  x
                </button>
              </div>
              <div className="ui-surface flex items-center justify-between rounded-lg px-2 py-1.5">
                <span className="ui-text-muted text-xs">배당</span>
                <strong className="ui-text-strong text-sm">{formatOdds(selection.odds)}</strong>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="ui-text-muted px-4 py-6 text-center text-sm">
          마켓에서 아웃컴을 선택하면 여기 표시됩니다.
        </div>
      )}

      <div className="ui-surface-soft space-y-3 rounded-b-xl p-4">
        <BetslipAmountSection betAmount={bet.betAmount} onBetAmountChange={actions.onBetAmountChange} />

        <BetslipSlippageSettings
          isOpen={isSettingsOpen}
          slippage={bet.slippage}
          onSlippageChange={actions.onSlippageChange}
        />

        <BetslipSummarySection
          totalOdds={bet.totalOdds}
          possibleWin={bet.possibleWin}
          tokenBalance={bet.tokenBalance}
          minBet={bet.minBet}
          maxBet={bet.maxBet}
          isBalanceLoading={bet.isBalanceLoading}
          isLimitsLoading={bet.isLimitsLoading}
          amountValidationMessage={bet.amountValidationMessage}
          isApproveRequired={bet.isApproveRequired}
          approvePending={bet.approvePending}
          betPending={bet.betPending}
          transactionSteps={bet.transactionSteps}
          transactionNotice={bet.transactionNotice}
          chainId={wallet.chainId}
          onDismissTransactionNotice={actions.onDismissTransactionNotice}
          onRetryTransaction={actions.onSubmit}
        />

        {disableReasonText && (
          <p className="ui-state-warning-surface ui-text-body m-0 rounded-lg border p-2 text-sm">
            {disableReasonText}
          </p>
        )}
        {!disableReasonText && bet.uiBlockHint && (
          <p className="ui-surface ui-text-body m-0 rounded-lg border p-2 text-sm">
            {bet.uiBlockHint}
          </p>
        )}

        <button
          className="ui-btn-primary w-full rounded-lg border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPrimaryDisabled}
          onClick={wallet.isConnected ? actions.onSubmit : actions.onConnectWallet}
          type="button"
        >
          {primaryButtonLabel}
        </button>
      </div>
    </section>
  )
}
