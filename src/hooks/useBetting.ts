import { useEffect, useMemo, useRef, useState } from 'react'
import type { Address } from 'viem'
import { useBaseBetslip, useBet, useBetTokenBalance, useChain, useDetailedBetslip } from '@azuro-org/sdk'
import type { MarketSection, OutcomeItem } from '../types/ui'
import type { MarketManagerCondition } from '../types/marketManager'
import { buildSelectedOutcomes, mapBetslipToSelectionItems } from '../helpers/mappers'
import { getFriendlyTransactionErrorMessage } from '../helpers/betslipUi'
import { buildBettingDerivedState, clampSlippage } from './useBetting.helpers'
import { useBetslipSelectionMeta } from './useBetslipSelectionMeta'
import { useBetslipValidation } from './useBetslipValidation'
import { useBetSubmission } from './useBetSubmission'
import { useAppConfig } from '../config/useAppConfig'
import { useBetHistory } from './useBetHistory'
import { useBetRedeem } from './useBetRedeem'
import { useTransactionNotice } from './useTransactionNotice'
import { useBetSettlementSync } from './useBetSettlementSync'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const DEFAULT_SLIPPAGE = 3

type UseBettingParams = {
  address?: Address
  chainId?: number
  isConnected: boolean
  marketSections: MarketSection[]
  marketConditions: MarketManagerCondition[]
  isMarketsLoading?: boolean
  isBetHistoryPollingEnabled?: boolean
  refreshMarkets?: () => void
}

export function useBetting({
  address,
  chainId,
  isConnected,
  marketSections,
  marketConditions,
  isMarketsLoading = false,
  isBetHistoryPollingEnabled = false,
  refreshMarkets,
}: UseBettingParams) {
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const { environment } = useChain()
  const { transactionNotice, clearTransactionNotice, setSuccessNotice, setErrorNotice } = useTransactionNotice({
    mapErrorMessage: getFriendlyTransactionErrorMessage,
  })
  const { affiliateAddress: affiliateAddressFromConfig } = useAppConfig()
  const { items, addItem, clear, removeItem } = useBaseBetslip()
  const {
    betAmount,
    changeBetAmount,
    odds,
    totalOdds,
    disableReason,
    minBet,
    maxBet,
    isMaxBetFetching,
  } = useDetailedBetslip()
  const { data: betTokenBalanceData, isLoading: isBalanceLoading, refetch: refetchBetTokenBalance } = useBetTokenBalance({
    query: {
      enabled: isConnected,
      refetchOnWindowFocus: true,
    },
  })

  const affiliateAddress = (affiliateAddressFromConfig || ZERO_ADDRESS) as Address

  const { submit, isApproveRequired, approveTx, betTx } = useBet({
    betAmount: betAmount || '1',
    slippage,
    affiliate: affiliateAddress,
    selections: items,
    odds,
    totalOdds,
    onSuccess: (receipt) => {
      clear()
      resetSelectionMeta()
      void refetchBetTokenBalance()
      setSuccessNotice({
        title: '베팅 완료',
        message: '트랜잭션이 성공적으로 처리되었습니다.',
        txHash: receipt?.transactionHash,
      })
    },
    onError: (err) => setErrorNotice({ title: '베팅 실패', error: err }),
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
        title: '수익 수령 완료',
        message: '수익 수령 트랜잭션이 성공적으로 처리되었습니다.',
        txHash,
      })
    },
    onError: (err) => setErrorNotice({ title: '수익 수령 실패', error: err }),
  })

  const selectedOutcomes = useMemo(() => buildSelectedOutcomes(items), [items])
  const { mergedOutcomeMeta, selectedOutcomePriceChanges, rememberSelectionMeta, syncSelectionMeta, resetSelectionMeta, removeSelectionMeta } =
    useBetslipSelectionMeta({
      marketSections,
      selectedOutcomes,
    })
  const selectionItems = useMemo(() => mapBetslipToSelectionItems(items, mergedOutcomeMeta), [items, mergedOutcomeMeta])
  const { currentOutcomeStateMap, displayDisableReason, sdkConditionStateMismatch, uiSelectionAllowed } = useBetslipValidation({
    items,
    marketSections,
    marketConditions,
    mergedOutcomeMeta,
    disableReason,
    totalOdds,
    isMarketsLoading,
  })
  const mismatchHandledRef = useRef(false)

  useEffect(() => {
    if (!sdkConditionStateMismatch) {
      mismatchHandledRef.current = false
      return
    }
    if (mismatchHandledRef.current) return
    mismatchHandledRef.current = true
    console.warn('[CombatExpert][betslip-sync] sdk_betslip_state_snapshot', {
      chainId: chainId ?? null,
      environment,
      disableReason: disableReason ?? null,
      odds,
      totalOdds,
      betAmount,
      minBet: minBet ?? null,
      maxBet: maxBet ?? null,
      itemCount: items.length,
      selections: items.map((item) => ({
        conditionId: item.conditionId,
        outcomeId: item.outcomeId,
        gameId: item.gameId,
      })),
    })
    refreshMarkets?.()
  }, [betAmount, chainId, disableReason, environment, items, maxBet, minBet, odds, refreshMarkets, sdkConditionStateMismatch, totalOdds])

  const approvePending = approveTx.isPending || approveTx.isProcessing
  const betPending = betTx.isPending || betTx.isProcessing
  const { tokenBalance, possibleWin, canBet, amountValidationMessage, uiBlockHint, submitLabel, transactionSteps } =
    buildBettingDerivedState({
      betAmount,
      totalOdds,
      tokenBalanceRaw: betTokenBalanceData?.balance,
      minBet,
      maxBet,
      isConnected,
      itemCount: items.length,
      isBetAllowed: uiSelectionAllowed,
      disableReason: displayDisableReason,
      isApproveRequired,
      approvePending,
      betPending,
      approveTxPending: approveTx.isPending,
      betTxPending: betTx.isPending,
      betReceiptReady: Boolean(betTx.receipt),
    })

  const selectOutcome = (outcome: OutcomeItem) => {
    rememberSelectionMeta(outcome)
    addItem({
      conditionId: outcome.conditionId,
      outcomeId: outcome.outcomeId,
      gameId: outcome.gameId,
      isExpressForbidden: outcome.isExpressForbidden,
    })
  }
  const submitBet = useBetSubmission({
    items,
    currentOutcomeStateMap,
    selectedOutcomePriceChanges,
    sdkConditionStateMismatch,
    chainId,
    environment,
    clearTransactionNotice,
    setErrorNotice,
    syncSelectionMeta,
    submit,
  })

  return {
    bets,
    selectedOutcomes,
    selectedOutcomePriceChanges,
    selectionItems,
    betAmount,
    totalOdds,
    possibleWin,
    canBet,
    isApproveRequired,
    approvePending,
    betPending,
    disableReason: displayDisableReason,
    minBet,
    maxBet,
    tokenBalance,
    isBalanceLoading,
    isLimitsLoading: isMaxBetFetching,
    amountValidationMessage,
    slippage,
    uiBlockHint,
    submitLabel,
    selectOutcome,
    setBetAmount: changeBetAmount,
    setSlippage: (value: number) => {
      const next = clampSlippage(value)
      if (next === undefined) return
      setSlippage(next)
    },
    transactionSteps,
    transactionNotice,
    redeemingBetTokenId,
    redeemPending,
    clearTransactionNotice,
    submitBet,
    betSettlementSyncStateByTokenId,
    clearBetslip: () => {
      clear()
      resetSelectionMeta()
    },
    redeemBet,
    removeSelection: ({ conditionId, outcomeId }: { conditionId: string; outcomeId: string }) => {
      removeItem({ conditionId, outcomeId })
      removeSelectionMeta(conditionId, outcomeId)
    },
  }
}
