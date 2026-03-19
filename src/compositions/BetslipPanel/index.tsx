import { useEffect, useRef, useState } from 'react'
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
  const TOTAL_ODDS_WARNING_DELAY_MS = 900
  const actionButtonBaseClass =
    'px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [revealedDisableReasonKey, setRevealedDisableReasonKey] = useState<string | undefined>(undefined)
  const secondaryButtonClass =
    `ui-btn-secondary btn-shell md:btn-shell-lg ${actionButtonBaseClass}`
  const settingsButtonClass =
    `ui-btn-ghost btn-shell md:btn-shell-lg ${actionButtonBaseClass}`
  const clearButtonClass =
    `ui-btn-danger-soft btn-shell md:btn-shell-lg ${actionButtonBaseClass}`
  const noticeClass = 'm-0 rounded-md border p-2 text-sm md:rounded-lg'
  const primarySubmitButtonClass =
    'ui-btn-primary btn-shell md:btn-shell-lg w-full px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'
  const disableReasonText = bet.disableReason ? (DISABLE_REASON_LABEL[bet.disableReason] ?? bet.disableReason) : undefined
  const shouldDelayDisableReason = bet.disableReason === 'TotalOddsTooLow'
  const delayedDisableReasonKey = shouldDelayDisableReason && disableReasonText ? `${bet.disableReason}:${bet.selections.length}` : undefined
  const scheduledDisableReasonKeyRef = useRef<string | undefined>(undefined)
  const visibleDisableReasonText = bet.selections.length === 0
    ? undefined
    : shouldDelayDisableReason
      ? revealedDisableReasonKey === delayedDisableReasonKey
        ? disableReasonText
        : undefined
      : disableReasonText

  useEffect(() => {
    if (!delayedDisableReasonKey) return

    scheduledDisableReasonKeyRef.current = delayedDisableReasonKey
    const timeoutId = window.setTimeout(() => {
      if (scheduledDisableReasonKeyRef.current !== delayedDisableReasonKey) return
      setRevealedDisableReasonKey(delayedDisableReasonKey)
    }, TOTAL_ODDS_WARNING_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [delayedDisableReasonKey, TOTAL_ODDS_WARNING_DELAY_MS])

  const selectionLabel = bet.selections.length <= 1 ? '싱글' : `콤보 (${bet.selections.length})`
  const formatOdds = (value: number) => (Number.isFinite(value) ? value.toFixed(3) : '0.000')
  const isPrimaryDisabled = wallet.isConnected
    ? !bet.canBet || bet.approvePending || bet.betPending
    : !wallet.canConnectWallet || wallet.isConnectingWallet
  const primaryButtonLabel = !wallet.isConnected && wallet.isConnectingWallet ? '지갑 연결 중...' : bet.submitLabel

  return (
    <section className="panel section-shell desktop-surface-variant">
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
              className="card-surface-soft card-shell grid gap-2 p-3"
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
              <div className="card-surface card-shell flex items-center justify-between px-2 py-1.5">
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

      <div className="ui-surface-soft space-y-3 p-4 md:rounded-b-xl">
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

        {visibleDisableReasonText && (
          <p className={`ui-state-warning-surface ui-text-body ${noticeClass}`}>
            {visibleDisableReasonText}
          </p>
        )}
        {!visibleDisableReasonText && bet.uiBlockHint && (
          <p className={`ui-surface ui-text-body ${noticeClass}`}>
            {bet.uiBlockHint}
          </p>
        )}

        <button
          className={primarySubmitButtonClass}
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
