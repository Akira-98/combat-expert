type AmountValidationParams = {
  betAmount: string
  minBet?: number
  maxBet?: number
  balance?: number
  isConnected: boolean
}

type UiBlockHintParams = {
  isProcessing: boolean
  isConnected: boolean
  selectionCount: number
  amountNum: number
  isBetAllowed: boolean
  disableReason?: string
}

type SubmitLabelParams = {
  isProcessing: boolean
  isConnected: boolean
  selectionCount: number
  amountNum: number
  isApproveRequired: boolean
}

export type TransactionStepId = 'approve' | 'bet'

export type TransactionStepStatus = 'pending' | 'active' | 'done'

export type TransactionStep = {
  id: TransactionStepId
  label: string
  status: TransactionStepStatus
}

export type TransactionNotice = {
  type: 'success' | 'error'
  title: string
  message: string
  txHash?: `0x${string}`
}

export const getAmountValidationMessage = ({
  betAmount,
  minBet,
  maxBet,
  balance,
  isConnected,
}: AmountValidationParams) => {
  const hasAmountInput = betAmount.trim().length > 0
  if (!hasAmountInput) return undefined

  const parsedAmount = Number(betAmount)
  if (!Number.isFinite(parsedAmount)) return translate('betslip.error.amountNumber')
  if (!(parsedAmount > 0)) return translate('betslip.error.amountPositive')

  if (typeof minBet === 'number' && parsedAmount < minBet) {
    return translate('betslip.error.minBet', { amount: minBet.toFixed(4) })
  }
  if (typeof maxBet === 'number' && parsedAmount > maxBet) {
    return translate('betslip.error.maxBet', { amount: maxBet.toFixed(4) })
  }
  if (isConnected && typeof balance === 'number' && Number.isFinite(balance) && balance > 0 && parsedAmount > balance) {
    return translate('betslip.error.insufficientBalance', { amount: balance.toFixed(4) })
  }

  return undefined
}

export const getUiBlockHint = ({
  isProcessing,
  isConnected,
  selectionCount,
  amountNum,
  isBetAllowed,
  disableReason,
}: UiBlockHintParams) => {
  if (isProcessing) return translate('betslip.hint.processing')
  if (!isConnected) return translate('betslip.hint.connectWallet')
  if (selectionCount === 0) return translate('betslip.hint.selectOutcome')
  if (!(amountNum > 0)) return translate('betslip.hint.enterAmount')
  if (!isBetAllowed && !disableReason) return translate('betslip.hint.unavailable')
  return undefined
}

export const getSubmitLabel = ({
  isProcessing,
  isConnected,
  selectionCount,
  amountNum,
  isApproveRequired,
}: SubmitLabelParams) => {
  if (isProcessing) return translate('common.processing')
  if (!isConnected) return translate('header.connectWallet')
  if (selectionCount === 0) return translate('betslip.submit.bet')
  if (!(amountNum > 0)) return translate('betslip.submit.enterAmount')
  if (isApproveRequired) return translate('betslip.submit.approve')
  return translate('betslip.submit.bet')
}

export const getTransactionSteps = ({
  isApproveRequired,
  approvePending,
  betPending,
  betReceiptReady,
}: {
  isApproveRequired: boolean
  approvePending: boolean
  betPending: boolean
  betReceiptReady: boolean
}): TransactionStep[] => {
  const steps: TransactionStep[] = []

  if (isApproveRequired) {
    steps.push({
      id: 'approve',
      label: translate('betslip.transaction.approve'),
      status: approvePending ? 'active' : betPending || betReceiptReady ? 'done' : 'pending',
    })
  }

  steps.push({
    id: 'bet',
    label: translate('betslip.transaction.bet'),
    status: betPending ? 'active' : betReceiptReady ? 'done' : 'pending',
  })

  return steps
}

export const getFriendlyTransactionErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  const lower = message.toLowerCase()

  if (!message) return translate('betslip.txError.default')
  if (lower.includes('user rejected') || lower.includes('rejected') || lower.includes('denied')) {
    return translate('betslip.txError.rejected')
  }
  if (lower.includes('insufficient')) {
    return translate('betslip.txError.insufficient')
  }
  if (lower.includes('network') || lower.includes('rpc')) {
    return translate('betslip.txError.network')
  }
  if (lower.includes('allowance') || lower.includes('approve')) {
    return translate('betslip.txError.allowance')
  }

  return translate('betslip.txError.fallback')
}
import { translate } from '../i18n'
