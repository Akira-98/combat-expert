import { useMemo, useState } from 'react'
import type { Address } from 'viem'
import { type Bet, useBaseBetslip, useBet, useBets, useBetTokenBalance, useDetailedBetslip } from '@azuro-org/sdk'
import type { MarketSection, OutcomeItem } from '../types/ui'
import { buildSelectedOutcomes, mapBetslipToSelectionItems } from '../helpers/mappers'
import {
  getFriendlyTransactionErrorMessage,
  type TransactionNotice,
} from '../helpers/betslipUi'
import { buildBettingDerivedState, clampSlippage } from './useBetting.helpers'
import { useBetslipSelectionMeta } from './useBetslipSelectionMeta'
import { useAppConfig } from '../config/useAppConfig'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const DEFAULT_SLIPPAGE = 3

type UseBettingParams = {
  address?: Address
  isConnected: boolean
  marketSections: MarketSection[]
}

export function useBetting({ address, isConnected, marketSections }: UseBettingParams) {
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const [transactionNotice, setTransactionNotice] = useState<TransactionNotice | undefined>()
  const { affiliateAddress: affiliateAddressFromConfig } = useAppConfig()
  const { items, addItem, clear, removeItem } = useBaseBetslip()
  const {
    betAmount,
    changeBetAmount,
    odds,
    totalOdds,
    isBetAllowed,
    disableReason,
    minBet,
    maxBet,
    isMaxBetFetching,
  } = useDetailedBetslip()
  const { data: betTokenBalanceData, isLoading: isBalanceLoading } = useBetTokenBalance({
    query: { enabled: isConnected },
  })

  const affiliateAddress = (affiliateAddressFromConfig || ZERO_ADDRESS) as Address
  const bettorAddress = (address || ZERO_ADDRESS) as Address

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
      setTransactionNotice({
        type: 'success',
        title: '베팅 완료',
        message: '트랜잭션이 성공적으로 처리되었습니다.',
        txHash: receipt?.transactionHash,
      })
    },
    onError: (err) => {
      setTransactionNotice({
        type: 'error',
        title: '베팅 실패',
        message: getFriendlyTransactionErrorMessage(err),
      })
    },
  })

  const { data: betsPages } = useBets({
    filter: { bettor: bettorAddress },
    query: { enabled: Boolean(address) },
  })

  const bets = useMemo<Bet[]>(() => {
    if (!betsPages) return []
    return betsPages.pages.flatMap((page) => page.bets)
  }, [betsPages])

  const selectedOutcomes = useMemo(() => buildSelectedOutcomes(items), [items])
  const { mergedOutcomeMeta, selectedOutcomePriceChanges, rememberSelectionMeta, resetSelectionMeta, removeSelectionMeta } =
    useBetslipSelectionMeta({
      marketSections,
      selectedOutcomes,
    })
  const selectionItems = useMemo(() => mapBetslipToSelectionItems(items, mergedOutcomeMeta), [items, mergedOutcomeMeta])

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
      isBetAllowed,
      disableReason,
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
    disableReason,
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
    clearTransactionNotice: () => setTransactionNotice(undefined),
    submitBet: async () => {
      setTransactionNotice(undefined)
      try {
        await submit()
      } catch {
        // SDK onError callback sets the user-facing notice.
      }
    },
    clearBetslip: () => {
      clear()
      resetSelectionMeta()
    },
    removeSelection: ({ conditionId, outcomeId }: { conditionId: string; outcomeId: string }) => {
      removeItem({ conditionId, outcomeId })
      removeSelectionMeta(conditionId, outcomeId)
    },
  }
}
