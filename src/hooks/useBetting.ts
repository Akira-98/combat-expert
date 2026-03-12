import { useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'
import { useBaseBetslip, useBet, useBetTokenBalance, useDetailedBetslip } from '@azuro-org/sdk'
import type { MarketSection, OutcomeItem } from '../types/ui'
import { buildSelectedOutcomes, mapBetslipToSelectionItems } from '../helpers/mappers'
import { getFriendlyTransactionErrorMessage } from '../helpers/betslipUi'
import { buildBettingDerivedState, clampSlippage } from './useBetting.helpers'
import { useBetslipSelectionMeta } from './useBetslipSelectionMeta'
import { useAppConfig } from '../config/useAppConfig'
import { useBetHistory } from './useBetHistory'
import { useBetRedeem } from './useBetRedeem'
import { useTransactionNotice } from './useTransactionNotice'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const DEFAULT_SLIPPAGE = 3
const BETSLIP_SYNC_LOG_PREFIX = '[CombatExpert][betslip-sync]'

type UseBettingParams = {
  address?: Address
  isConnected: boolean
  marketSections: MarketSection[]
  isBetHistoryPollingEnabled?: boolean
}

export function useBetting({ address, isConnected, marketSections, isBetHistoryPollingEnabled = false }: UseBettingParams) {
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
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
  const { data: betTokenBalanceData, isLoading: isBalanceLoading } = useBetTokenBalance({
    query: { enabled: isConnected },
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
      setSuccessNotice({
        title: '베팅 완료',
        message: '트랜잭션이 성공적으로 처리되었습니다.',
        txHash: receipt?.transactionHash,
      })
    },
    onError: (err) => setErrorNotice({ title: '베팅 실패', error: err }),
  })
  const { bets } = useBetHistory({ address, isPollingEnabled: isBetHistoryPollingEnabled })
  const { redeemingBetTokenId, redeemPending, redeemBet } = useBetRedeem({
    onBeforeSubmit: clearTransactionNotice,
    onSuccess: (txHash) =>
      setSuccessNotice({
        title: '수익 수령 완료',
        message: '수익 수령 트랜잭션이 성공적으로 처리되었습니다.',
        txHash,
      }),
    onError: (err) => setErrorNotice({ title: '수익 수령 실패', error: err }),
  })

  const selectedOutcomes = useMemo(() => buildSelectedOutcomes(items), [items])
  const { mergedOutcomeMeta, selectedOutcomePriceChanges, rememberSelectionMeta, syncSelectionMeta, resetSelectionMeta, removeSelectionMeta } =
    useBetslipSelectionMeta({
      marketSections,
      selectedOutcomes,
    })
  const selectionItems = useMemo(() => mapBetslipToSelectionItems(items, mergedOutcomeMeta), [items, mergedOutcomeMeta])
  const currentOutcomeStateMap = useMemo(() => {
    const map = new Map<string, { conditionState: string; odds: number; marketTitle: string }>()

    mergedOutcomeMeta.forEach((meta, key) => {
      map.set(key, {
        conditionState: meta.conditionState,
        odds: meta.odds,
        marketTitle: meta.marketTitle,
      })
    })

    marketSections.forEach((section) => {
      section.outcomes.forEach((outcome) => {
        map.set(`${outcome.conditionId}-${outcome.outcomeId}`, {
          conditionState: outcome.conditionState,
          odds: outcome.odds,
          marketTitle: section.title,
        })
      })
    })

    return map
  }, [marketSections, mergedOutcomeMeta])
  const localDisableReason = useMemo(() => {
    if (items.length > 1) {
      const uniqueGameIds = new Set(items.map((item) => item.gameId))
      if (uniqueGameIds.size !== items.length) return 'ComboWithSameGame'
      if (items.some((item) => item.isExpressForbidden)) return 'ComboWithForbiddenItem'
    }

    for (const item of items) {
      const meta = currentOutcomeStateMap.get(`${item.conditionId}-${item.outcomeId}`)
      if (!meta) continue
      if (meta.conditionState !== 'Active') return 'ConditionState'
      if (!Number.isFinite(meta.odds) || meta.odds <= 1) return 'ConditionState'
    }

    return undefined
  }, [currentOutcomeStateMap, items])
  const localTotalOdds = useMemo(() => {
    if (items.length === 0) return 0

    let product = 1
    for (const item of items) {
      const meta = currentOutcomeStateMap.get(`${item.conditionId}-${item.outcomeId}`)
      if (!meta || !Number.isFinite(meta.odds) || meta.odds <= 1) {
        return 0
      }
      product *= meta.odds
    }

    return product
  }, [currentOutcomeStateMap, items])
  const sdkDisableReason = disableReason && disableReason !== 'ConditionState' ? disableReason : undefined
  const shouldIgnoreStaleTotalOddsTooLow =
    sdkDisableReason === 'TotalOddsTooLow' &&
    ((Number.isFinite(totalOdds) && totalOdds > 1) || (Number.isFinite(localTotalOdds) && localTotalOdds > 1))
  const displayDisableReason = localDisableReason
    ?? (shouldIgnoreStaleTotalOddsTooLow ? undefined : sdkDisableReason)
  const uiSelectionAllowed = !displayDisableReason
  const sdkConditionStateMismatch = disableReason === 'ConditionState' && !localDisableReason

  useEffect(() => {
    if (!sdkConditionStateMismatch) return

    console.warn(`${BETSLIP_SYNC_LOG_PREFIX} sdk_condition_state_mismatch`, {
      itemCount: items.length,
      items: items.map((item) => ({
        conditionId: item.conditionId,
        outcomeId: item.outcomeId,
        gameId: item.gameId,
      })),
    })
  }, [items, sdkConditionStateMismatch])

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
    submitBet: async () => {
      clearTransactionNotice()
      if (sdkConditionStateMismatch) {
        console.warn(`${BETSLIP_SYNC_LOG_PREFIX} blocked_submit_sdk_state_mismatch`, {
          itemCount: items.length,
        })
        setErrorNotice({
          title: '상태 재확인 필요',
          message: '선택한 마켓 상태가 방금 변경되었습니다. 목록을 다시 확인한 뒤 다시 시도해 주세요.',
        })
        return
      }

      for (const item of items) {
        const key = `${item.conditionId}-${item.outcomeId}`
        const meta = currentOutcomeStateMap.get(key)

        if (!meta) {
          console.warn(`${BETSLIP_SYNC_LOG_PREFIX} blocked_submit_missing_market`, {
            conditionId: item.conditionId,
            outcomeId: item.outcomeId,
            gameId: item.gameId,
          })
          setErrorNotice({
            title: '선택 재확인 필요',
            message: '선택한 마켓의 최신 정보를 확인하지 못했습니다. 목록을 다시 확인한 뒤 다시 시도해 주세요.',
          })
          return
        }

        if (meta.conditionState !== 'Active' || !Number.isFinite(meta.odds) || meta.odds <= 1) {
          console.warn(`${BETSLIP_SYNC_LOG_PREFIX} blocked_submit_inactive_market`, {
            conditionId: item.conditionId,
            outcomeId: item.outcomeId,
            gameId: item.gameId,
            conditionState: meta.conditionState,
            odds: meta.odds,
          })
          syncSelectionMeta(items)
          setErrorNotice({
            title: '배당 또는 상태 변경',
            message: '선택한 마켓의 상태 또는 배당이 변경되었습니다. 최신 값으로 갱신했으니 다시 확인해 주세요.',
          })
          return
        }
      }

      if (selectedOutcomePriceChanges.size > 0) {
        console.warn(`${BETSLIP_SYNC_LOG_PREFIX} blocked_submit_price_change`, {
          itemCount: items.length,
          priceChanges: Array.from(selectedOutcomePriceChanges.entries()).map(([key, value]) => ({
            selectionKey: key,
            previousOdds: value.previousOdds,
            currentOdds: value.currentOdds,
          })),
        })
        syncSelectionMeta(items)
        setErrorNotice({
          title: '배당 변경',
          message: '선택한 배당이 방금 변경되었습니다. 최신 값으로 갱신했으니 다시 한 번 확인해 주세요.',
        })
        return
      }

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
    redeemBet,
    removeSelection: ({ conditionId, outcomeId }: { conditionId: string; outcomeId: string }) => {
      removeItem({ conditionId, outcomeId })
      removeSelectionMeta(conditionId, outcomeId)
    },
  }
}
