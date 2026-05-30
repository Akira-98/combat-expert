import { useBet, useBetTokenBalance } from '@azuro-org/sdk'
import type { Freebet } from '@azuro-org/toolkit'
import type { Address } from 'viem'
import { getFriendlyTransactionErrorMessage } from '../helpers/betslipUi'
import { getErrorCode, getErrorDetails, getErrorMessage, getErrorName, getErrorStack } from '../helpers/debugError'
import { trackBetDebugEvent } from '../api/betDebugEvents'
import { useAppConfig } from '../config/useAppConfig'
import { useBetSuccessEffects } from './useBetSuccessEffects'
import { useBetHistory } from './useBetHistory'
import { useBetRedeem } from './useBetRedeem'
import { useBetSettlementSync } from './useBetSettlementSync'
import { useTransactionNotice } from './useTransactionNotice'
import { translate } from '../i18n'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const SDK_FALLBACK_BET_AMOUNT = '1'
const BET_DEBUG_TIMEOUT_MS = 60_000

function getSdkBetAmount(betAmount: string) {
  const parsedAmount = Number(betAmount)
  return Number.isFinite(parsedAmount) && parsedAmount > 0 ? betAmount : SDK_FALLBACK_BET_AMOUNT
}

function getOrderValue(order: unknown, key: string) {
  if (!order || typeof order !== 'object' || !(key in order)) return undefined
  const value = (order as Record<string, unknown>)[key]
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
}

function getRecordValue(value: unknown, key: string) {
  if (!value || typeof value !== 'object' || !(key in value)) return undefined
  return (value as Record<string, unknown>)[key]
}

function getStringRecordValue(value: unknown, key: string) {
  const item = getRecordValue(value, key)
  return typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' ? String(item) : undefined
}

function getTxHash(tx: unknown, fallback?: string) {
  return getStringRecordValue(tx, 'hash')
    ?? getStringRecordValue(tx, 'txHash')
    ?? getStringRecordValue(tx, 'transactionHash')
    ?? getStringRecordValue(getRecordValue(tx, 'receipt'), 'transactionHash')
    ?? fallback
}

function getTxReceiptStatus(tx: unknown, fallbackReceipt?: unknown) {
  return getStringRecordValue(getRecordValue(tx, 'receipt'), 'status')
    ?? getStringRecordValue(fallbackReceipt, 'status')
}

function getTxErrorDetails(tx: unknown) {
  const error = getRecordValue(tx, 'error') ?? getRecordValue(tx, 'failureReason')
  return error === undefined ? undefined : getErrorDetails(error)
}

type UseBettingTransactionsParams = {
  address?: Address
  isConnected: boolean
  isAAWallet?: boolean
  isBetHistoryPollingEnabled: boolean
  items: {
    conditionId: string
    outcomeId: string
    gameId: string
  }[]
  betAmount: string
  odds: Record<string, number>
  totalOdds: number
  slippage: number
  selectedFreebet?: Freebet
  activePickShareId?: string
  onBetSuccess: (receiptHash?: `0x${string}`) => void
  onBetPointsClaimed?: () => void
  onPickSharePointsAwarded?: () => void
}

export function useBettingTransactions({
  address,
  isConnected,
  isAAWallet,
  isBetHistoryPollingEnabled,
  items,
  betAmount,
  odds,
  totalOdds,
  slippage,
  selectedFreebet,
  activePickShareId,
  onBetSuccess,
  onBetPointsClaimed,
  onPickSharePointsAwarded,
}: UseBettingTransactionsParams) {
  const { transactionNotice, clearTransactionNotice, setSuccessNotice, setErrorNotice } = useTransactionNotice({
    mapErrorMessage: getFriendlyTransactionErrorMessage,
  })
  const { affiliateAddress: affiliateAddressFromConfig } = useAppConfig()
  const affiliateAddress = (affiliateAddressFromConfig || ZERO_ADDRESS) as Address
  const { data: betTokenBalanceData, isLoading: isBalanceLoading, refetch: refetchBetTokenBalance } = useBetTokenBalance({
    query: {
      enabled: isConnected,
      refetchOnWindowFocus: true,
    },
  })

  const { bets, refetch: refetchBetHistory } = useBetHistory({ address, isPollingEnabled: isBetHistoryPollingEnabled })
  const { runBetSuccessEffects } = useBetSuccessEffects({
    address,
    activePickShareId,
    refetchBetHistory,
    refetchBetTokenBalance,
    onBetPointsClaimed,
    onPickSharePointsAwarded,
  })

  const betDebugBase = {
    walletAddress: address,
    isAAWallet: Boolean(isAAWallet),
    selectionCount: items.length,
    hasFreebet: Boolean(selectedFreebet),
    betAmount: getSdkBetAmount(betAmount),
    freebetId: getStringRecordValue(selectedFreebet, 'id'),
  }

  const { submit: sdkSubmit, isApproveRequired, approveTx, betTx } = useBet({
    betAmount: getSdkBetAmount(betAmount),
    slippage,
    affiliate: affiliateAddress,
    selections: items,
    odds,
    totalOdds,
    freebet: selectedFreebet,
    onBetOrderCreated: (order) => {
      void trackBetDebugEvent({
        ...betDebugBase,
        ...getBetDebugState(),
        event: 'order_created',
        orderId: getOrderValue(order, 'id'),
        orderState: getOrderValue(order, 'state'),
        errorCode: getOrderValue(order, 'error'),
        errorMessage: getOrderValue(order, 'errorMessage'),
      })
    },
    onSuccess: (receipt) => {
      void trackBetDebugEvent({
        ...betDebugBase,
        ...getBetDebugState(receipt),
        event: 'bet_success',
      })
      onBetSuccess(receipt?.transactionHash)
      runBetSuccessEffects(receipt?.transactionHash)
      setSuccessNotice({
        title: translate('betting.betSuccessTitle'),
        message: translate('betting.betSuccessMessage'),
        txHash: receipt?.transactionHash,
      })
    },
    onError: (error) => {
      void trackBetDebugEvent({
        ...betDebugBase,
        ...getBetDebugState(),
        event: 'bet_error',
        errorCode: getErrorCode(error),
        errorMessage: getErrorMessage(error),
        errorName: getErrorName(error),
        errorStack: getErrorStack(error),
        errorDetails: getErrorDetails(error),
      })
      setErrorNotice({ title: translate('betting.betErrorTitle'), error })
    },
  })

  function getBetDebugState(receipt?: unknown) {
    return {
      isApproveRequired,
      approveIsPending: approveTx.isPending,
      approveIsProcessing: approveTx.isProcessing,
      approveTxHash: getTxHash(approveTx),
      approveErrorDetails: getTxErrorDetails(approveTx),
      betIsPending: betTx.isPending,
      betIsProcessing: betTx.isProcessing,
      betTxHash: getTxHash(betTx, getStringRecordValue(receipt, 'transactionHash')),
      betReceiptStatus: getTxReceiptStatus(betTx, receipt),
    }
  }

  const submit = async () => {
    let isSettled = false

    void trackBetDebugEvent({
      ...betDebugBase,
      ...getBetDebugState(),
      event: 'submit_start',
    })

    const timeoutId = window.setTimeout(() => {
      if (isSettled) return
      void trackBetDebugEvent({
        ...betDebugBase,
        ...getBetDebugState(),
        event: 'submit_timeout',
      })
    }, BET_DEBUG_TIMEOUT_MS)

    try {
      await sdkSubmit()
    } finally {
      isSettled = true
      window.clearTimeout(timeoutId)
    }
  }

  const { betSettlementSyncStateByTokenId } = useBetSettlementSync({
    bets,
    enabled: Boolean(address),
  })
  const { redeemingBetTokenId, redeemPending, redeemBet } = useBetRedeem({
    onBeforeSubmit: clearTransactionNotice,
    onSuccess: (txHash) => {
      void refetchBetTokenBalance()
      setSuccessNotice({
        title: translate('betting.redeemSuccessTitle'),
        message: translate('betting.redeemSuccessMessage'),
        txHash,
      })
    },
    onError: (error) => setErrorNotice({ title: translate('betting.redeemErrorTitle'), error }),
  })

  return {
    bets,
    betTokenBalanceData,
    isBalanceLoading,
    transactionNotice,
    clearTransactionNotice,
    setErrorNotice,
    submit,
    isApproveRequired,
    approveTx,
    betTx,
    betSettlementSyncStateByTokenId,
    redeemingBetTokenId,
    redeemPending,
    redeemBet,
  }
}
