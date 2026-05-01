import { useEffect, useRef, useState } from 'react'
import type { Address } from 'viem'
import { useBaseBetslip, useDetailedBetslip } from '@azuro-org/sdk'
import { createReferralShare, fetchReferralShare } from '../api/referrals'
import type { GameItem, MarketSection, OutcomeItem } from '../types/ui'
import { buildBettingDerivedState, clampSlippage } from './useBetting.helpers'
import { useBetSubmission } from './useBetSubmission'
import { useBettingSelectionState } from './useBettingSelectionState'
import { useBettingTransactions } from './useBettingTransactions'

const DEFAULT_SLIPPAGE = 3
const REFERRAL_SHARE_ROUTE_PREFIX = '/share/picks/'
const ACTIVE_REFERRAL_SHARE_STORAGE_KEY = 'combatexpert.activeReferralShareId'

type UseBettingParams = {
  address?: Address
  isConnected: boolean
  games: GameItem[]
  marketSections: MarketSection[]
  isBetHistoryPollingEnabled?: boolean
  refreshMarkets?: () => void
  onBetPointsClaimed?: () => void
}

export function useBetting({
  address,
  isConnected,
  games,
  marketSections,
  isBetHistoryPollingEnabled = false,
  refreshMarkets,
  onBetPointsClaimed,
}: UseBettingParams) {
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const [activeReferralShareId, setActiveReferralShareId] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    return window.localStorage.getItem(ACTIVE_REFERRAL_SHARE_STORAGE_KEY) || undefined
  })
  const [shareState, setShareState] = useState<{ isPending: boolean; message?: string }>({ isPending: false })
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
  const selectionState = useBettingSelectionState({
    items,
    games,
    marketSections,
    disableReason,
    totalOdds,
  })
  const transactions = useBettingTransactions({
    address,
    isConnected,
    isBetHistoryPollingEnabled,
    items,
    betAmount,
    odds,
    totalOdds,
    slippage,
    activeReferralShareId,
    onBetPointsClaimed,
    onReferralRewardRecorded: () => {
      setActiveReferralShareId(undefined)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACTIVE_REFERRAL_SHARE_STORAGE_KEY)
      }
    },
    onBetSuccess: () => {
      clear()
      selectionState.resetSelectionMeta()
    },
  })
  const mismatchHandledRef = useRef(false)

  useEffect(() => {
    if (!selectionState.sdkConditionStateMismatch) {
      mismatchHandledRef.current = false
      return
    }
    if (mismatchHandledRef.current) return
    mismatchHandledRef.current = true
    refreshMarkets?.()
  }, [refreshMarkets, selectionState.sdkConditionStateMismatch])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const pathname = window.location.pathname
    if (!pathname.startsWith(REFERRAL_SHARE_ROUTE_PREFIX)) return

    const encodedShareId = pathname.slice(REFERRAL_SHARE_ROUTE_PREFIX.length).split('/')[0]
    const shareId = encodedShareId ? decodeURIComponent(encodedShareId) : ''
    if (!shareId) return

    let isCanceled = false

    void fetchReferralShare(shareId)
      .then((share) => {
        if (isCanceled) return

        clear()
        selectionState.resetSelectionMeta()
        for (const selection of share.selections) {
          addItem({
            conditionId: selection.conditionId,
            outcomeId: selection.outcomeId,
            gameId: selection.gameId,
            isExpressForbidden: Boolean(selection.isExpressForbidden),
          })
        }

        setActiveReferralShareId(share.id)
        window.localStorage.setItem(ACTIVE_REFERRAL_SHARE_STORAGE_KEY, share.id)
        window.history.replaceState({}, '', '/')
      })
      .catch((error) => {
        console.warn('Failed to load referral share', error)
      })

    return () => {
      isCanceled = true
    }
  }, [addItem, clear, selectionState])

  const approvePending = transactions.approveTx.isPending || transactions.approveTx.isProcessing
  const betPending = transactions.betTx.isPending || transactions.betTx.isProcessing
  const { tokenBalance, possibleWin, canBet, amountValidationMessage, uiBlockHint, submitLabel, transactionSteps } =
    buildBettingDerivedState({
      betAmount,
      totalOdds,
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

  const shareBetslip = async () => {
    if (!address || items.length === 0) return

    setShareState({ isPending: true })

    try {
      const result = await createReferralShare({
        referrerWallet: address,
        selections: items,
      })

      await navigator.clipboard?.writeText(result.shareUrl)
      setShareState({ isPending: false, message: 'copied' })
    } catch (error) {
      console.warn('Failed to create referral share', error)
      setShareState({ isPending: false, message: 'failed' })
    }
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
    sharePending: shareState.isPending,
    shareMessage: shareState.message,
    selectOutcome,
    shareBetslip,
    setBetAmount: changeBetAmount,
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
