import { useBet, useBetTokenBalance } from '@azuro-org/sdk'
import type { Freebet } from '@azuro-org/toolkit'
import type { Address } from 'viem'
import { getFriendlyTransactionErrorMessage } from '../helpers/betslipUi'
import { trackBetDebugEvent } from '../api/betDebugEvents'
import { claimBetParticipationPoints } from '../api/points'
import { awardPickSharePoints } from '../api/pickShares'
import { useAppConfig } from '../config/useAppConfig'
import { useBetHistory } from './useBetHistory'
import { useBetRedeem } from './useBetRedeem'
import { useBetSettlementSync } from './useBetSettlementSync'
import { useTransactionNotice } from './useTransactionNotice'
import { translate } from '../i18n'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const POINT_CLAIM_RETRY_DELAYS_MS = [0, 3_000, 10_000]
const PICK_SHARE_POINTS_RETRY_DELAYS_MS = [0, 3_000, 10_000]
const BET_HISTORY_REFETCH_RETRY_DELAYS_MS = [0, 3_000, 10_000]
const SDK_FALLBACK_BET_AMOUNT = '1'
const BET_DEBUG_TIMEOUT_MS = 60_000

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getSdkBetAmount(betAmount: string) {
  const parsedAmount = Number(betAmount)
  return Number.isFinite(parsedAmount) && parsedAmount > 0 ? betAmount : SDK_FALLBACK_BET_AMOUNT
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return String(error ?? '')
}

function getOrderValue(order: unknown, key: string) {
  if (!order || typeof order !== 'object' || !(key in order)) return undefined
  const value = (order as Record<string, unknown>)[key]
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
}

async function claimBetParticipationPointsWithRetry({ txHash, walletAddress }: { txHash: string; walletAddress: string }) {
  let lastResult

  for (const [index, delay] of POINT_CLAIM_RETRY_DELAYS_MS.entries()) {
    if (delay > 0) await wait(delay)

    lastResult = await claimBetParticipationPoints({ txHash, walletAddress })
    if (lastResult.status !== 'pending_indexing') return lastResult
    if (index === POINT_CLAIM_RETRY_DELAYS_MS.length - 1) return lastResult
  }

  return lastResult
}

async function awardPickSharePointsWithRetry({
  shareId,
  txHash,
  bettorWallet,
}: {
  shareId: string
  txHash: string
  bettorWallet: string
}) {
  let lastResult

  for (const [index, delay] of PICK_SHARE_POINTS_RETRY_DELAYS_MS.entries()) {
    if (delay > 0) await wait(delay)

    lastResult = await awardPickSharePoints({ shareId, txHash, bettorWallet })
    if (lastResult.status !== 'pending_indexing') return lastResult
    if (index === PICK_SHARE_POINTS_RETRY_DELAYS_MS.length - 1) return lastResult
  }

  return lastResult
}

async function refetchBetHistoryWithRetry(refetchBetHistory: () => Promise<unknown>) {
  for (const delay of BET_HISTORY_REFETCH_RETRY_DELAYS_MS) {
    if (delay > 0) await wait(delay)
    try {
      await refetchBetHistory()
    } catch (error) {
      console.warn('Failed to refetch bet history', error)
    }
  }
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

  const betDebugBase = {
    walletAddress: address,
    isAAWallet: Boolean(isAAWallet),
    selectionCount: items.length,
    hasFreebet: Boolean(selectedFreebet),
    betAmount: getSdkBetAmount(betAmount),
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
        event: 'bet_success',
      })
      onBetSuccess(receipt?.transactionHash)
      void refetchBetHistoryWithRetry(refetchBetHistory)
      if (address && receipt?.transactionHash) {
        void claimBetParticipationPointsWithRetry({
          txHash: receipt.transactionHash,
          walletAddress: address,
        })
          .then((result) => {
            if (result?.points) onBetPointsClaimed?.()
          })
          .catch((error) => {
            console.warn('Failed to claim bet participation points', error)
          })

        if (activePickShareId) {
          void awardPickSharePointsWithRetry({
            shareId: activePickShareId,
            bettorWallet: address,
            txHash: receipt.transactionHash,
          })
            .then((result) => {
              if (result?.ok) onPickSharePointsAwarded?.()
            })
            .catch((error) => {
              console.warn('Failed to award pick share points', error)
            })
        }
      }
      void refetchBetTokenBalance()
      setSuccessNotice({
        title: translate('betting.betSuccessTitle'),
        message: translate('betting.betSuccessMessage'),
        txHash: receipt?.transactionHash,
      })
    },
    onError: (error) => {
      void trackBetDebugEvent({
        ...betDebugBase,
        event: 'bet_error',
        errorMessage: getErrorMessage(error),
      })
      setErrorNotice({ title: translate('betting.betErrorTitle'), error })
    },
  })

  const submit = async () => {
    let isSettled = false

    void trackBetDebugEvent({
      ...betDebugBase,
      event: 'submit_start',
    })

    const timeoutId = window.setTimeout(() => {
      if (isSettled) return
      void trackBetDebugEvent({
        ...betDebugBase,
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
