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
  if (!Number.isFinite(parsedAmount)) return '베팅 금액은 숫자로 입력해 주세요.'
  if (!(parsedAmount > 0)) return '베팅 금액은 0보다 커야 합니다.'

  if (typeof minBet === 'number' && parsedAmount < minBet) {
    return `최소 베팅 금액은 ${minBet.toFixed(4)} 입니다.`
  }
  if (typeof maxBet === 'number' && parsedAmount > maxBet) {
    return `최대 베팅 금액은 ${maxBet.toFixed(4)} 입니다.`
  }
  if (isConnected && typeof balance === 'number' && Number.isFinite(balance) && balance > 0 && parsedAmount > balance) {
    return `잔액이 부족합니다. 현재 사용 가능 잔액은 ${balance.toFixed(4)} 입니다.`
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
  if (isProcessing) return '트랜잭션 처리 중입니다. 지갑에서 요청을 확인해 주세요.'
  if (!isConnected) return '지갑을 연결해 주세요.'
  if (selectionCount === 0) return '마켓에서 아웃컴을 선택해 주세요.'
  if (!(amountNum > 0)) return '베팅 금액을 입력해 주세요.'
  if (!isBetAllowed && !disableReason) return '현재 선택은 지금 베팅할 수 없습니다.'
  return undefined
}

export const getSubmitLabel = ({
  isProcessing,
  isConnected,
  selectionCount,
  amountNum,
  isApproveRequired,
}: SubmitLabelParams) => {
  if (isProcessing) return '처리 중'
  if (!isConnected) return '지갑 연결'
  if (selectionCount === 0) return '베팅'
  if (!(amountNum > 0)) return '금액 입력'
  if (isApproveRequired) return '승인'
  return '베팅'
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
      label: '승인',
      status: approvePending ? 'active' : betPending || betReceiptReady ? 'done' : 'pending',
    })
  }

  steps.push({
    id: 'bet',
    label: '베팅',
    status: betPending ? 'active' : betReceiptReady ? 'done' : 'pending',
  })

  return steps
}

export const getFriendlyTransactionErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  const lower = message.toLowerCase()

  if (!message) return '요청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.'
  if (lower.includes('user rejected') || lower.includes('rejected') || lower.includes('denied')) {
    return '지갑에서 요청이 취소되었습니다.'
  }
  if (lower.includes('insufficient')) {
    return '잔액 또는 가스비가 부족해 트랜잭션을 진행할 수 없습니다.'
  }
  if (lower.includes('network') || lower.includes('rpc')) {
    return '네트워크 상태가 불안정합니다. 잠시 후 다시 시도해 주세요.'
  }
  if (lower.includes('allowance') || lower.includes('approve')) {
    return '토큰 승인 단계에서 문제가 발생했습니다. 다시 시도해 주세요.'
  }

  return '트랜잭션 처리 중 오류가 발생했습니다. 다시 시도해 주세요.'
}
