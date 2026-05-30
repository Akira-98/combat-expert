import { useEffect, useRef, useState } from 'react'
import type { Address } from 'viem'
import { useBaseBetslip, useDetailedBetslip } from '@azuro-org/sdk'
import type { GameItem, MarketSection, OutcomeItem } from '../types/ui'
import { buildBettingDerivedState, clampSlippage } from './useBetting.helpers'
import { useBetSubmission } from './useBetSubmission'
import { useBettingSelectionState } from './useBettingSelectionState'
import { useBettingTransactions } from './useBettingTransactions'
import { usePickShareAttribution } from './usePickShareAttribution'
import { useShareBetslip } from './useShareBetslip'

const DEFAULT_SLIPPAGE = 3

type UseBettingParams = {
  address?: Address
  isConnected: boolean
  isAAWallet?: boolean
  games: GameItem[]
  marketSections: MarketSection[]
  isBetHistoryPollingEnabled?: boolean
  refreshMarkets?: () => void
  onPickShareGameSelected?: (gameId: string) => void
  onBetPointsClaimed?: () => void
}

export function useBetting({
  address,
  isConnected,
  isAAWallet,
  games,
  marketSections,
  isBetHistoryPollingEnabled = false,
  refreshMarkets,
  onPickShareGameSelected,
  onBetPointsClaimed,
}: UseBettingParams) {
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const { items, addItem, clear, removeItem } = useBaseBetslip()
  const {
    betAmount,
    changeBetAmount,
    odds,
    totalOdds,
    disableReason,
    minBet,
    maxBet,
    freebets,
    selectedFreebet,
    selectFreebet,
    isFreebetsFetching,
    isMaxBetFetching,
  } = useDetailedBetslip()
  const selectionState = useBettingSelectionState({
    items,
    games,
    marketSections,
    disableReason,
    totalOdds,
  })
  const { activePickShareId, clearPickShareAttribution } = usePickShareAttribution({
    addItem,
    clear,
    rememberSharedSelectionMeta: selectionState.rememberSharedSelectionMeta,
    resetSelectionMeta: selectionState.resetSelectionMeta,
    onPickShareGameSelected,
  })
  const shareBetslipState = useShareBetslip({
    address,
    items,
    selectionItems: selectionState.selectionItems,
  })
  const transactions = useBettingTransactions({
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
    onBetPointsClaimed,
    onPickSharePointsAwarded: clearPickShareAttribution,
    onBetSuccess: () => {
      clear()
      selectionState.resetSelectionMeta()
    },
  })
  const mismatchHandledRef = useRef(false)

  useEffect(() => {
    if (!selectedFreebet || !Array.isArray(freebets)) return
    if (freebets.some((freebet) => freebet.id === selectedFreebet.id)) return
    selectFreebet(undefined)
  }, [freebets, selectFreebet, selectedFreebet])

  useEffect(() => {
    if (!selectionState.sdkConditionStateMismatch) {
      mismatchHandledRef.current = false
      return
    }
    if (mismatchHandledRef.current) return
    mismatchHandledRef.current = true
    refreshMarkets?.()
  }, [refreshMarkets, selectionState.sdkConditionStateMismatch])

  const approvePending = transactions.approveTx.isPending || transactions.approveTx.isProcessing
  const betPending = transactions.betTx.isPending || transactions.betTx.isProcessing
  const { tokenBalance, possibleWin, canBet, amountValidationMessage, uiBlockHint, submitLabel, transactionSteps } =
    buildBettingDerivedState({
      betAmount,
      totalOdds,
      selectedFreebet,
      tokenBalanceRaw: transactions.betTokenBalanceData?.balance,
      minBet,
      maxBet,
      isConnected,
      itemCount: items.length,
      isBetAllowed: selectionState.uiSelectionAllowed,
      disableReason: selectionState.displayDisableReason,
      isApproveRequired: transactions.isApproveRequired,
      approvePending,
      betPending,
      approveTxPending: transactions.approveTx.isPending,
      betTxPending: transactions.betTx.isPending,
      betReceiptReady: Boolean(transactions.betTx.receipt),
    })

  const selectOutcome = (outcome: OutcomeItem) => {
    selectionState.rememberSelectionMeta(outcome)
    addItem({
      conditionId: outcome.conditionId,
      outcomeId: outcome.outcomeId,
      gameId: outcome.gameId,
      isExpressForbidden: outcome.isExpressForbidden,
    })
  }

  const submitBet = useBetSubmission({
    items,
    currentOutcomeStateMap: selectionState.currentOutcomeStateMap,
    selectedOutcomePriceChanges: selectionState.selectedOutcomePriceChanges,
    sdkConditionStateMismatch: selectionState.sdkConditionStateMismatch,
    clearTransactionNotice: transactions.clearTransactionNotice,
    setErrorNotice: transactions.setErrorNotice,
    syncSelectionMeta: selectionState.syncSelectionMeta,
    submit: transactions.submit,
  })

  return {
    bets: transactions.bets,
    selectedOutcomes: selectionState.selectedOutcomes,
    selectedOutcomePriceChanges: selectionState.selectedOutcomePriceChanges,
    selectionItems: selectionState.selectionItems,
    betAmount,
    totalOdds,
    possibleWin,
    freebets,
    selectedFreebet,
    isFreebetsFetching,
    canBet,
    isApproveRequired: transactions.isApproveRequired,
    approvePending,
    betPending,
    disableReason: selectionState.displayDisableReason,
    minBet,
    maxBet,
    tokenBalance,
    isBalanceLoading: transactions.isBalanceLoading,
    isLimitsLoading: isMaxBetFetching,
    amountValidationMessage,
    slippage,
    uiBlockHint,
    submitLabel,
    sharePending: shareBetslipState.sharePending,
    shareMessage: shareBetslipState.shareMessage,
    selectOutcome,
    shareBetslip: shareBetslipState.shareBetslip,
    setBetAmount: changeBetAmount,
    selectFreebet,
    setSlippage: (value: number) => {
      const next = clampSlippage(value)
      if (next === undefined) return
      setSlippage(next)
    },
    transactionSteps,
    transactionNotice: transactions.transactionNotice,
    redeemingBetTokenId: transactions.redeemingBetTokenId,
    redeemPending: transactions.redeemPending,
    clearTransactionNotice: transactions.clearTransactionNotice,
    submitBet,
    betSettlementSyncStateByTokenId: transactions.betSettlementSyncStateByTokenId,
    clearBetslip: () => {
      clear()
      selectionState.resetSelectionMeta()
    },
    redeemBet: transactions.redeemBet,
    removeSelection: ({ conditionId, outcomeId }: { conditionId: string; outcomeId: string }) => {
      removeItem({ conditionId, outcomeId })
      selectionState.removeSelectionMeta(conditionId, outcomeId)
    },
  }
}
