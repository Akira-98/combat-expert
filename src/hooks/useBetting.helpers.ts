import {
  getAmountValidationMessage,
  getSubmitLabel,
  getTransactionSteps,
  getUiBlockHint,
} from '../helpers/betslipUi'

type BuildBettingDerivedStateParams = {
  betAmount: string
  totalOdds: number
  tokenBalanceRaw?: string
  minBet?: number
  maxBet?: number
  isConnected: boolean
  itemCount: number
  isBetAllowed: boolean
  disableReason?: string
  isApproveRequired: boolean
  approvePending: boolean
  betPending: boolean
  approveTxPending: boolean
  betTxPending: boolean
  betReceiptReady: boolean
}

export function clampSlippage(value: number) {
  if (!Number.isFinite(value)) return undefined
  return Math.min(50, Math.max(0.1, Number(value.toFixed(2))))
}

export function buildBettingDerivedState({
  betAmount,
  totalOdds,
  tokenBalanceRaw,
  minBet,
  maxBet,
  isConnected,
  itemCount,
  isBetAllowed,
  disableReason,
  isApproveRequired,
  approvePending,
  betPending,
  approveTxPending,
  betTxPending,
  betReceiptReady,
}: BuildBettingDerivedStateParams) {
  const amountNum = Number(betAmount || '0')
  const balance = Number(tokenBalanceRaw ?? '0')
  const tokenBalance = Number.isFinite(balance) ? balance : undefined
  const possibleWin = Number.isFinite(amountNum) && amountNum > 0 ? amountNum * totalOdds : 0

  const canBet =
    isConnected && itemCount > 0 && isBetAllowed && amountNum > 0 && !approveTxPending && !betTxPending

  const isProcessing = approvePending || betPending

  return {
    tokenBalance,
    possibleWin,
    canBet,
    amountValidationMessage: getAmountValidationMessage({
      betAmount,
      minBet,
      maxBet,
      balance: tokenBalance,
      isConnected,
    }),
    uiBlockHint: getUiBlockHint({
      isProcessing,
      isConnected,
      selectionCount: itemCount,
      amountNum,
      isBetAllowed,
      disableReason,
    }),
    submitLabel: getSubmitLabel({
      isProcessing,
      isConnected,
      selectionCount: itemCount,
      amountNum,
      isApproveRequired,
    }),
    transactionSteps: getTransactionSteps({
      isApproveRequired,
      approvePending,
      betPending,
      betReceiptReady,
    }),
  }
}
