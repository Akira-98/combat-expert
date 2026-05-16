import { useBet, useBetTokenBalance } from '@azuro-org/sdk'
import type { Freebet } from '@azuro-org/toolkit'
import type { Address } from 'viem'
import { getFriendlyTransactionErrorMessage } from '../helpers/betslipUi'
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
const SDK_FALLBACK_BET_AMOUNT = '1'

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getSdkBetAmount(betAmount: string) {
  const parsedAmount = Number(betAmount)
  return Number.isFinite(parsedAmount) && parsedAmount > 0 ? betAmount : SDK_FALLBACK_BET_AMOUNT
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

type UseBettingTransactionsParams = {
  address?: Address
  isConnected: boolean
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

  const { submit, isApproveRequired, approveTx, betTx } = useBet({
    betAmount: getSdkBetAmount(betAmount),
    slippage,
    affiliate: affiliateAddress,
    selections: items,
    odds,
    totalOdds,
    freebet: selectedFreebet,
    onSuccess: (receipt) => {
      onBetSuccess(receipt?.transactionHash)
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
    onError: (error) => setErrorNotice({ title: translate('betting.betErrorTitle'), error }),
  })

  const { bets } = useBetHistory({ address, isPollingEnabled: isBetHistoryPollingEnabled })
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
