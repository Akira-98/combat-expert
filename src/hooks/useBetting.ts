import { useEffect, useMemo, useRef, useState } from 'react'
import type { Address } from 'viem'
import { useBaseBetslip, useBet, useBetTokenBalance, useChain, useDetailedBetslip } from '@azuro-org/sdk'
import type { MarketSection, OutcomeItem, SelectionKey } from '../types/ui'
import type { MarketManagerCondition } from '../types/marketManager'
import { buildSelectedOutcomes, mapBetslipToSelectionItems, selectionKey } from '../helpers/mappers'
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
  const sdkBlockedSelectionKeys = useMemo<Set<SelectionKey>>(() => {
    if (disableReason !== 'ConditionState') return new Set()
    return new Set(items.map((item) => selectionKey(item.conditionId, item.outcomeId)))
  }, [disableReason, items])
  const effectiveMergedOutcomeMeta = useMemo(() => {
    if (sdkBlockedSelectionKeys.size === 0) return mergedOutcomeMeta

    const next = new Map(mergedOutcomeMeta)
    sdkBlockedSelectionKeys.forEach((key) => {
      const meta = next.get(key)
      if (!meta) return
      next.set(key, {
        ...meta,
        conditionState: 'Suspended',
      })
    })
    return next
  }, [mergedOutcomeMeta, sdkBlockedSelectionKeys])
  const selectionItems = useMemo(() => mapBetslipToSelectionItems(items, effectiveMergedOutcomeMeta), [effectiveMergedOutcomeMeta, items])
  const { currentOutcomeStateMap, displayDisableReason, sdkConditionStateMismatch, uiSelectionAllowed } = useBetslipValidation({
    items,
    marketSections,
    marketConditions,
    mergedOutcomeMeta: effectiveMergedOutcomeMeta,
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
    refreshMarkets?.()
  }, [refreshMarkets, sdkConditionStateMismatch])

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
    sdkBlockedSelectionKeys,
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
