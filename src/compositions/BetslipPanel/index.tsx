import type { SelectionItem } from '../../types/ui'
import type { TransactionNotice, TransactionStep } from '../../helpers/betslipUi'
import { useI18n } from '../../i18n'
import { selectionKey } from '../../helpers/mappers'
import { useBetslipPanelState } from '../../hooks/useBetslipPanelState'
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
  isEmbedded?: boolean
}

export function BetslipPanel({
  wallet,
  bet,
  actions,
  isEmbedded = false,
}: BetslipPanelProps) {
  const { t } = useI18n()
  const actionButtonBaseClass =
    'px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'
  const secondaryButtonClass = `ui-btn-secondary btn-shell md:btn-shell-lg ${actionButtonBaseClass}`
  const iconButtonClass =
    'ui-ghost-icon inline-flex h-8 w-8 items-center justify-center rounded-full text-sm transition disabled:cursor-not-allowed disabled:opacity-60'
  const dangerIconButtonClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-sm text-[color:var(--app-danger)] transition hover:bg-[color:color-mix(in_srgb,var(--app-danger)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-60'
  const noticeClass = 'm-0 rounded-md border p-2 text-sm md:rounded-lg'
  const primarySubmitButtonClass =
    'ui-btn-primary btn-shell md:btn-shell-lg w-full px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'
  const selectionLabel = bet.selections.length <= 1 ? t('betslip.single') : t('betslip.combo', { count: bet.selections.length })
  const panelState = useBetslipPanelState({
    wallet,
    bet,
    connectingWalletLabel: t('betslip.connectingWallet'),
  })
  const rootClassName = isEmbedded
    ? 'section-shell border-0 bg-transparent shadow-none'
    : 'panel section-shell desktop-surface-variant'
  const headerClassName = isEmbedded
    ? 'mb-3 flex items-center justify-between gap-3 px-1'
    : 'mb-3 flex items-center justify-between gap-3'
  const footerClassName = isEmbedded
    ? 'space-y-3 border-t border-[color:var(--app-border)] p-4 md:rounded-b-none'
    : 'ui-surface-soft space-y-3 p-4 md:rounded-b-xl'

  return (
    <div>
      <div className={headerClassName}>
        <div>
          <h2 className="ui-text-strong m-0 text-base font-semibold">{t('betslip.title')}</h2>
          <p className="ui-text-muted mt-0.5 text-xs">{selectionLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label={t('betslip.settings')} className={iconButtonClass} onClick={panelState.toggleSettingsOpen} type="button">
            <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M4 7h10" strokeLinecap="round" />
              <path d="M18 7h2" strokeLinecap="round" />
              <path d="M14 17H4" strokeLinecap="round" />
              <path d="M20 17h-2" strokeLinecap="round" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="16" cy="17" r="2" />
            </svg>
          </button>
          <button aria-label={t('betslip.clear')} className={dangerIconButtonClass} onClick={actions.onClear} type="button">
            <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 6h18" strokeLinecap="round" />
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" strokeLinecap="round" />
              <path d="M7 6l1 14a1 1 0 0 0 1 .93h6a1 1 0 0 0 1-.93l1-14" strokeLinecap="round" />
              <path d="M10 11v6M14 11v6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <section className={rootClassName}>
        {bet.selections.length > 0 ? (
          <ul className="m-0 grid max-h-[260px] list-none gap-2 overflow-y-auto px-4 py-3">
            {bet.selections.map((selection) => (
              <li
                key={selectionKey(selection.conditionId, selection.outcomeId)}
                className="card-surface-soft card-shell flex items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0 flex-1">
                  <strong className="ui-text-strong block truncate text-[13px] leading-5">{selection.gameTitle}</strong>
                  <p className="ui-text-muted mt-0.5 mb-0 truncate text-xs">{selection.label}</p>
                </div>
                <button className={secondaryButtonClass} onClick={() => actions.onRemoveSelection(selection)}>
                  x
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-3" />
        )}

        <div className={footerClassName}>
          <BetslipAmountSection betAmount={bet.betAmount} onBetAmountChange={actions.onBetAmountChange} />

          <BetslipSlippageSettings
            isOpen={panelState.isSettingsOpen}
            slippage={bet.slippage}
            onSlippageChange={actions.onSlippageChange}
          />

          <BetslipSummarySection
            totalOdds={bet.totalOdds}
            possibleWin={bet.possibleWin}
            minBet={bet.minBet}
            maxBet={bet.maxBet}
            isLimitsLoading={bet.isLimitsLoading}
            amountValidationMessage={bet.amountValidationMessage}
            transactionSteps={bet.transactionSteps}
            transactionNotice={bet.transactionNotice}
            chainId={wallet.chainId}
            onDismissTransactionNotice={actions.onDismissTransactionNotice}
            onRetryTransaction={actions.onSubmit}
          />

          {panelState.visibleDisableReasonText && (
            <p className={`ui-state-warning-surface ui-text-body ${noticeClass}`}>
              {panelState.visibleDisableReasonText}
            </p>
          )}

          <button
            className={primarySubmitButtonClass}
            disabled={panelState.isPrimaryDisabled}
            onClick={wallet.isConnected ? actions.onSubmit : actions.onConnectWallet}
            type="button"
          >
            {panelState.primaryButtonLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
